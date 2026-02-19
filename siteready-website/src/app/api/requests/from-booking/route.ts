import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasD1Binding, hasR2Binding } from "@/lib/db/config";
import { ensureClientForUser, updateClientProfile } from "@/lib/db/clients";
import { insertRequest } from "@/lib/db/requests";
import { createRequestBundle } from "@/lib/db/requestBundles";
import { AttachmentMeta, RequestRow } from "@/lib/db/types";
import { bookingSchema } from "@/lib/bookings/schema";
import { sendAutoReplyEmail, sendNotificationEmail } from "@/lib/email";
import { putBase64Object } from "@/lib/storage/r2";
import { getClientCreditLimit, getClientPaymentTerms, listClientApprovers } from "@/lib/db/creditLimits";
import { getCurrentRateForRole } from "@/lib/db/workerTypes";
import { listArInvoicesForClient, getArSyncState } from "@/lib/db/xeroAr";
import { syncXeroArInvoices } from "@/lib/credit/xeroArSync";
import { computeCreditEstimate } from "@/lib/credit/estimate";
import { normalizeEndDate, normalizeBillableMode } from "@/lib/credit/billableDays";
import { resolveRoleAndRate } from "@/lib/credit/rateLookup";
import { listCommittedFutureBuckets } from "@/lib/credit/commitments";
import { getCreditHoldStatus } from "@/lib/credit/creditHold";
import { computeOutstandingExGstCents } from "@/lib/credit/outstanding";
import { computeUnbilledWipCents } from "@/lib/credit/wip";
import { recordLegalAcceptance } from "@/lib/db/legal";
import { getPolicyOrDefault } from "@/lib/policies/getPolicy";
import { hasAcceptedLatestPolicies } from "@/lib/policies/acceptance";
import { addAdminClientEvent } from "@/lib/db/adminEvents";
import { extractStatePostcodeFromAddress, isBlockedSiteLocation } from "@/lib/coverage/auCoverage";
import { getEmailTemplateRecord } from "@/lib/db/emailTemplates";

function experienceToYears(value: string) {
  if (value === "Newly ticketed") return 0;
  const cleaned = value.replace("+", "");
  const num = Number.parseInt(cleaned, 10);
  return Number.isNaN(num) ? 0 : num;
}

function sanitizeKeyPart(value: string) {
  const cleaned = value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return cleaned.slice(0, 80) || "attachment";
}

function base64Size(value: string) {
  const cleaned = value.replace(/=+$/, "");
  return Math.floor((cleaned.length * 3) / 4);
}

function resolveCtaUrl(origin: string, pathOrUrl: string) {
  const raw = String(pathOrUrl || "").trim();
  if (!raw) return origin;
  if (/^https?:\/\//i.test(raw)) return raw;
  return `${origin}${raw.startsWith("/") ? raw : `/${raw}`}`;
}

function applyVars(template: string, vars: Record<string, string>) {
  let output = template;
  for (const [key, value] of Object.entries(vars)) {
    output = output.split(`{{${key}}}`).join(value);
  }
  return output;
}

function escapeHtml(value: string) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const BLOCK_MESSAGE =
  "You have exceeded your credit limit. Please adjust the number of labourers requested or select quicker payment terms. Any change to payment terms must be signed and approved by your company director or an authorised signatory, as designated during client onboarding.";

async function buildAttachmentList(
  attachments: Array<{ name: string; description?: string; type?: string; size?: number; content?: string }>,
  clientId: string,
  bookingId: string,
) {
  const list: AttachmentMeta[] = [];
  if (!attachments.length) return list;

  const canStore = hasR2Binding();
  for (let i = 0; i < attachments.length; i += 1) {
    const attachment = attachments[i];
    const entry: AttachmentMeta = {
      name: attachment.name,
      description: attachment.description,
    };
    if (attachment.content && canStore) {
      const key = [
        "clients",
        sanitizeKeyPart(clientId),
        "bookings",
        sanitizeKeyPart(bookingId),
        "attachments",
        `${i + 1}-${sanitizeKeyPart(attachment.name)}`,
      ].join("/");
      await putBase64Object({ key, base64: attachment.content, contentType: attachment.type });
      entry.key = key;
      entry.size = base64Size(attachment.content);
      entry.type = attachment.type;
    } else {
      entry.size = attachment.size;
      entry.type = attachment.type;
    }
    list.push(entry);
  }
  return list;
}

export async function POST(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "client") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!hasD1Binding()) {
    return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  }
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  try {
    const body = await req.json();
    const saveAsDraft = body?.save_as_draft === true || body?.save_as_draft === "true";
    const client = await ensureClientForUser(db, session.userId || session.email || "", session.email);
    if (saveAsDraft) {
      const raw = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
      const rawRoles = Array.isArray(raw.roles) ? raw.roles : [];
      const draftRoles = rawRoles.length ? rawRoles : [{}];
      const termsRow = await getClientPaymentTerms(db, client.client_id);
      const requestedTerms = Number(raw.paymentTermsDays);
      const termsDays =
        Number.isFinite(requestedTerms) && requestedTerms > 0
          ? requestedTerms
          : termsRow?.terms_days ?? 28;
      const rawSite = raw.siteAddress && typeof raw.siteAddress === "object"
        ? (raw.siteAddress as Record<string, unknown>)
        : {};
      const siteAddress = String(rawSite.formattedAddress || "").trim();
      const siteName = String(rawSite.siteName || "").trim() || null;
      const siteLat = Number(rawSite.lat);
      const siteLng = Number(rawSite.lng);
      const sitePlaceId = String(rawSite.placeId || "").trim() || null;
      const siteMapUrl = String(rawSite.mapUrl || "").trim() || null;
      const includeWeekends = raw.includeWeekends === true || raw.includeWeekends === "true";
      const notes = String(raw.notes || "").trim();

      const bundle_id = crypto.randomUUID();
      await createRequestBundle(db, {
        bundle_id,
        client_id: client.client_id,
        include_weekends: includeWeekends ? 1 : 0,
        terms_days: termsDays,
        po_number: null,
        start_date: null,
        end_date: null,
        estimated_total_cents: 0,
        created_by: session.userId || session.email || null,
      });

      const created: string[] = [];
      const allowedDurationUnits = new Set(["days", "weeks", "months", "years"]);
      for (const roleRaw of draftRoles) {
        const roleObj =
          roleRaw && typeof roleRaw === "object" ? (roleRaw as Record<string, unknown>) : {};
        const explicitRole = String(roleObj.role || "").trim();
        const otherRole = String(roleObj.otherTicketName || "").trim();
        const roleLabel = explicitRole || otherRole || "Draft - pending details";
        const request_id = crypto.randomUUID();
        const count = Number(roleObj.count);
        const headcount = Number.isFinite(count) && count > 0 ? Math.round(count) : 1;
        const experience = String(roleObj.experience || "").trim();
        const minYears = experienceToYears(experience);
        const startDate = String(roleObj.startDate || "").trim() || null;
        const startTime = String(roleObj.startTime || "").trim() || null;
        const hoursPerDayNum = Number(roleObj.hoursPerDay);
        const hoursPerDay =
          Number.isFinite(hoursPerDayNum) && hoursPerDayNum > 0 ? hoursPerDayNum : null;
        const durationValueNum = Number(roleObj.expectedDurationValue);
        const durationValue =
          Number.isFinite(durationValueNum) && durationValueNum > 0
            ? Math.round(durationValueNum)
            : null;
        const durationUnitRaw = String(roleObj.expectedDurationUnit || "").trim();
        const durationUnit = allowedDurationUnits.has(durationUnitRaw) ? durationUnitRaw : null;
        const endDate =
          startDate && durationValue && durationUnit
            ? normalizeEndDate(startDate, durationValue, durationUnit)
            : null;
        const tickets = Array.isArray(roleObj.tickets)
          ? roleObj.tickets.map((v) => String(v || "").trim()).filter(Boolean)
          : [];
        const requiredTickets = Array.from(new Set(["White Card (WHS)", roleLabel, ...tickets]));
        const otOptions = Array.isArray(roleObj.otOptions)
          ? roleObj.otOptions.map((v) => String(v || "").trim()).filter(Boolean)
          : [];
        const baseRateOfferNum = Number(roleObj.baseRateOffer);
        const baseRateOffer =
          Number.isFinite(baseRateOfferNum) && baseRateOfferNum >= 0 ? baseRateOfferNum : undefined;
        const travelAllowanceNum = Number(roleObj.travelAllowance);
        const travelAllowance =
          Number.isFinite(travelAllowanceNum) && travelAllowanceNum >= 0
            ? travelAllowanceNum
            : undefined;
        const travelEnabledRaw = roleObj.travelAllowanceEnabled;
        const travelEnabled =
          typeof travelEnabledRaw === "boolean"
            ? travelEnabledRaw
            : String(travelEnabledRaw || "").trim() === "false"
              ? false
              : undefined;

        const record: Omit<RequestRow, "created_at" | "updated_at"> = {
          request_id,
          client_id: client.client_id,
          status: "draft",
          review_status: "awaiting_client_policy_acceptance",
          status_reason: "Saved by client pending policy acceptance.",
          bundle_id,
          role_id: roleLabel,
          required_tickets: requiredTickets,
          min_years_experience: minYears,
          site_address: siteAddress || null,
          site_name: siteName,
          site_lat: Number.isFinite(siteLat) ? siteLat : null,
          site_lng: Number.isFinite(siteLng) ? siteLng : null,
          site_place_id: sitePlaceId,
          site_map_url: siteMapUrl,
          shift_start_time: startTime,
          shift_end_time: undefined,
          headcount,
          hours_per_day: hoursPerDay,
          rate_snapshot_cents: null,
          billable_days_mode: normalizeBillableMode(includeWeekends),
          terms_days: termsDays,
          expected_duration_value: durationValue,
          expected_duration_unit: durationUnit,
          ot_options: otOptions,
          base_rate_offer: baseRateOffer,
          travel_allowance: travelAllowance,
          travel_allowance_enabled:
            typeof travelEnabled === "boolean" ? (travelEnabled ? 1 : 0) : undefined,
          attachment_list: [],
          start_date: startDate,
          end_date: endDate,
          notes: notes || null,
          urgency_level: undefined,
          contract_signed: 0,
          release_to_client: 0,
          created_by: session.userId || session.email || null,
          updated_by: session.userId || session.email || null,
        };
        await insertRequest(db, record);
        created.push(request_id);
      }

      try {
        const companyName = String((raw.company as { name?: string } | undefined)?.name || "").trim() || "Client";
        await addAdminClientEvent(db, {
          client_id: client.client_id,
          event_type: "new_request",
          section: "request",
          summary: `Request draft saved by ${companyName} pending policy acceptance.`,
          meta_json: JSON.stringify({
            request_ids: created,
            company_name: companyName,
            payment_terms_days: termsDays,
            saved_as_draft: true,
          }),
        });
      } catch (draftEventErr) {
        console.error("Draft pending-policy event failed:", draftEventErr);
      }
      const draftReplyToCandidates = [
        String((raw.company as { contactEmail?: string } | undefined)?.contactEmail || "").trim(),
        String((raw as { email?: string }).email || "").trim(),
        String((raw as { contactEmail?: string }).contactEmail || "").trim(),
        String(client.contact_email || "").trim(),
        String(session.email || "").trim(),
      ].filter((v) => v && v.includes("@"));
      const draftReplyTo = draftReplyToCandidates[0];
      if (draftReplyTo) {
        try {
          const contactName = String((raw.company as { contactName?: string } | undefined)?.contactName || "").trim() || "Client";
          const template = await getEmailTemplateRecord(db, "request_draft_resume");
          const ctaLabel = template?.effective_cta_label || "Click here";
          const ctaUrl = resolveCtaUrl(
            req.nextUrl.origin,
            template?.effective_cta_path || "/login?next=/dashboard/requests",
          );
          const defaultMessage = [
            "Thank you for taking the time to start your application with us.",
            "We can see that you have not completed your sign up/request.",
            "",
            "If you do not have time to finish the process, click the link below to log back in to your portal at any time:",
            ctaUrl,
            "",
            "If you have not completed it for some other reason, please feel free to reply to this email and let us know what issue or problem you may have with our process.",
          ].join("\n");
          const bodyMessage = template?.effective_message
            ? applyVars(template.effective_message, {
                contact_name: contactName,
                cta_url: ctaUrl,
                cta_label: ctaLabel,
                cta_button: ctaLabel,
              })
            : defaultMessage;
          const subject = template?.effective_subject || "Complete your SiteReady signup/request";
          const text = [`Dear ${contactName},`, "", bodyMessage.replace(/\{\{cta_button\}\}/g, ctaLabel)].join("\n");
          const bodyHtml = bodyMessage
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0)
            .map((line) => {
              if (line === "{{cta_button}}" || line === ctaLabel) {
                return `<p style="margin:0 0 14px;"><a href="${ctaUrl}" style="display:inline-block;background:#f97316;color:#ffffff;text-decoration:none;padding:10px 14px;border-radius:8px;font-weight:700;">${escapeHtml(ctaLabel)}</a></p>`;
              }
              return `<p style="margin:0 0 10px;">${escapeHtml(line)}</p>`;
            })
            .join("");
          const html = `
            <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.45;color:#111827;">
              <p style="margin:0 0 12px;">Dear ${escapeHtml(contactName)},</p>
              ${bodyHtml}
            </div>
          `;
          await sendAutoReplyEmail({ to: draftReplyTo, subject, text, html });
        } catch (draftMailErr) {
          console.error("Draft follow-up auto-reply failed:", draftMailErr);
        }
      }

      return NextResponse.json({
        ok: true,
        request_ids: created,
        request_id: created[0],
        saved_as_draft: true,
        message: "Saved as draft. Accept policies later to submit.",
      });
    }
    const parsedResult = bookingSchema.safeParse(body);
    if (!parsedResult.success) {
      return NextResponse.json({ ok: false, error: parsedResult.error.issues }, { status: 400 });
    }
    const parsed = {
      ...parsedResult.data,
      submittedAt: new Date().toISOString(),
      bookingId: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
    };
    const parsedSite = extractStatePostcodeFromAddress(parsed.siteAddress.formattedAddress);
    const siteState = parsed.siteAddress.state || parsedSite.state;
    const sitePostcode = parsed.siteAddress.postcode || parsedSite.postcode;
    if (isBlockedSiteLocation({ state: siteState, postcode: sitePostcode })) {
      await updateClientProfile(db, client.client_id, { service_interest_mode: "notify_future" });
      await addAdminClientEvent(db, {
        client_id: client.client_id,
        event_type: "site_outside_coverage",
        section: "service coverage",
        summary: `Site outside coverage: ${siteState} ${sitePostcode}`.trim(),
        meta_json: JSON.stringify({ site_state: siteState, site_postcode: sitePostcode }),
      });
      return NextResponse.json(
        {
          ok: false,
          error:
            "Selected site location is outside current service coverage. You can still save company details and request to be notified when service is available in your area.",
          code: "SITE_OUTSIDE_COVERAGE",
          site_state: siteState || "",
          site_postcode: sitePostcode || "",
        },
        { status: 400 },
      );
    }
    if (!saveAsDraft) {
      const userId = session.userId || session.email || "";
      const policyCheck = await hasAcceptedLatestPolicies(db, userId, [
        "client_terms",
        "privacy_policy",
        "frontend_terms",
      ]);
      if (!policyCheck.ok && !parsed.accept_terms) {
        return NextResponse.json(
          {
            ok: false,
            error: "Client terms acceptance is required before submitting.",
            missing_policies: policyCheck.missing,
          },
          { status: 400 },
        );
      }
    }
    const credit = await getClientCreditLimit(db, client.client_id);
    const termsRow = await getClientPaymentTerms(db, client.client_id);
    const termsDays = parsed.paymentTermsDays ?? termsRow?.terms_days ?? 28;
    const defaultTerms = termsRow?.terms_days ?? 28;

    const state = await getArSyncState(db);
    const stale = !state?.last_synced_at || Date.now() / 1000 - Number(state.last_synced_at) > 900;
    if (stale) {
      await syncXeroArInvoices(db);
    }
    const invoices = await listArInvoicesForClient(db, client.client_id);
    const hold = await getCreditHoldStatus({ db, region: "NSW", invoices });
    const outstanding = computeOutstandingExGstCents(invoices);
    const wip = await computeUnbilledWipCents(db, client.client_id);
    if (!saveAsDraft && hold.credit_hold) {
      return NextResponse.json(
        {
          ok: false,
          error: "Your account is on credit hold due to an overdue invoice. Please pay the outstanding balance to resume labour allocation.",
          credit_hold: true,
          credit_hold_invoice: hold.invoice_number,
          credit_hold_enforced_due: hold.enforced_due_date,
          credit_hold_enforced_due_utc: hold.enforced_due_datetime_utc,
        },
        { status: 400 },
      );
    }
    const committedBuckets = await listCommittedFutureBuckets({
      db,
      clientId: client.client_id,
      defaultTermsDays: defaultTerms,
    });

    const estimateLines = [];
    const rateErrors: string[] = [];
    for (const role of parsed.roles) {
      const resolved = await resolveRoleAndRate({
        role: role.role,
        otherTicketName: role.otherTicketName,
        lookup: (name) => getCurrentRateForRole(db, name),
      });
      if (!resolved.ok) {
        rateErrors.push(resolved.error);
        continue;
      }
      const hourlyRateCents = resolved.hourlyRateCents;
      const explicitRateCents =
        typeof role.baseRateOffer === "number" && Number.isFinite(role.baseRateOffer) && role.baseRateOffer > 0
          ? Math.round(role.baseRateOffer * 100)
          : null;
      const effectiveHourlyRateCents = explicitRateCents ?? hourlyRateCents;
      const dailyAllowanceCents =
        role.travelAllowanceEnabled === false
          ? 0
          : typeof role.travelAllowance === "number" && Number.isFinite(role.travelAllowance) && role.travelAllowance > 0
            ? Math.round(role.travelAllowance * 100)
            : 0;
      const end = normalizeEndDate(role.startDate, role.expectedDurationValue, role.expectedDurationUnit);
      estimateLines.push({
        role_id: resolved.roleName,
        quantity: role.count,
        hours_per_day: role.hoursPerDay,
        hourly_rate_cents: effectiveHourlyRateCents,
        daily_allowance_cents: dailyAllowanceCents,
        start_date: role.startDate,
        end_date: end || role.startDate,
        expected_duration_value: role.expectedDurationValue,
        expected_duration_unit: role.expectedDurationUnit,
      });
    }
    if (rateErrors.length) {
      return NextResponse.json(
        { ok: false, error: "Missing hourly rate for selected ticket/position.", details: rateErrors },
        { status: 400 },
      );
    }

    const estimate = computeCreditEstimate({
      lines: estimateLines,
      include_weekends: parsed.includeWeekends ?? false,
      terms_days: termsDays,
      existing_outstanding_cents: outstanding + wip,
      committed_buckets: committedBuckets,
    });

    const insurerLimit = credit?.insurer_limit_cents ?? 0;
    const enforcedLimit = credit?.enforced_limit_cents ?? Math.floor(insurerLimit * 0.9);
    const noApprovedLimitYet = enforcedLimit <= 0 && outstanding + wip <= 0;
    if (!saveAsDraft && !noApprovedLimitYet && estimate.peak_exposure_cents > enforcedLimit) {
      const approvers = await listClientApprovers(db, client.client_id);
      return NextResponse.json(
        {
          ok: false,
          error: BLOCK_MESSAGE,
          over_limit: true,
          authorised_approvers: approvers,
        },
        { status: 400 },
      );
    }

    if (!saveAsDraft && parsed.accept_terms) {
      const ipAddress =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("cf-connecting-ip") ||
        null;
      const userAgent = req.headers.get("user-agent") || null;
      const clientTerms = await getPolicyOrDefault("client_terms");
      const privacyPolicy = await getPolicyOrDefault("privacy_policy");
      await recordLegalAcceptance(db, {
        acceptance_id: crypto.randomUUID(),
        user_id: session.userId || session.email || "",
        role: session.role,
        document_type: "client_terms",
        document_version: `${clientTerms.version}`,
        accepted_at: new Date().toISOString(),
        ip_address: ipAddress,
        user_agent: userAgent,
        client_id: client.client_id,
      });
      await recordLegalAcceptance(db, {
        acceptance_id: crypto.randomUUID(),
        user_id: session.userId || session.email || "",
        role: session.role,
        document_type: "privacy_policy",
        document_version: `${privacyPolicy.version}`,
        accepted_at: new Date().toISOString(),
        ip_address: ipAddress,
        user_agent: userAgent,
        client_id: client.client_id,
      });
    }

    const attachmentList = await buildAttachmentList(
      parsed.attachments ?? [],
      client.client_id,
      parsed.bookingId,
    );

    const bundle_id = crypto.randomUUID();
    const bundleStart = parsed.roles.map((r) => r.startDate).sort()[0] || null;
    const bundleEnd = parsed.roles
      .map((r) => normalizeEndDate(r.startDate, r.expectedDurationValue, r.expectedDurationUnit))
      .filter(Boolean)
      .sort()
      .slice(-1)[0];
    await createRequestBundle(db, {
      bundle_id,
      client_id: client.client_id,
      include_weekends: parsed.includeWeekends ? 1 : 0,
      terms_days: termsDays,
      po_number: null,
      start_date: bundleStart ?? null,
      end_date: bundleEnd ?? null,
      estimated_total_cents: estimate.total_requested_cents,
      created_by: session.userId || session.email || null,
    });

    const created: string[] = [];
    for (const role of parsed.roles) {
      const request_id = crypto.randomUUID();
      const resolved = await resolveRoleAndRate({
        role: role.role,
        otherTicketName: role.otherTicketName,
        lookup: (name) => getCurrentRateForRole(db, name),
      });
      if (!resolved.ok) {
        return NextResponse.json(
          { ok: false, error: "Missing hourly rate for selected ticket/position.", details: resolved.error },
          { status: 400 },
        );
      }
      const hourlyRateCents = resolved.hourlyRateCents;
      const explicitRateCents =
        typeof role.baseRateOffer === "number" && Number.isFinite(role.baseRateOffer) && role.baseRateOffer > 0
          ? Math.round(role.baseRateOffer * 100)
          : null;
      const effectiveHourlyRateCents = explicitRateCents ?? hourlyRateCents;
      const requiredTickets = Array.from(
        new Set(["White Card (WHS)", ...(role.tickets ?? []), resolved.roleName].filter(Boolean)),
      );
      const record: Omit<RequestRow, "created_at" | "updated_at"> = {
        request_id,
        client_id: client.client_id,
        status: saveAsDraft ? "draft" : "submitted",
        review_status: saveAsDraft ? "awaiting_client_policy_acceptance" : undefined,
        status_reason: saveAsDraft ? "Saved by client pending policy acceptance." : undefined,
        bundle_id,
        // Use the selected ticket/position as the primary role label so pricing and matching stay aligned.
        role_id: resolved.roleName,
        required_tickets: requiredTickets,
        min_years_experience: experienceToYears(role.experience),
        site_address: parsed.siteAddress.formattedAddress,
        site_name: parsed.siteAddress.siteName ?? undefined,
        site_lat: parsed.siteAddress.lat ?? null,
        site_lng: parsed.siteAddress.lng ?? null,
        site_place_id: parsed.siteAddress.placeId ?? undefined,
        site_map_url: parsed.siteAddress.mapUrl ?? undefined,
        shift_start_time: role.startTime,
        shift_end_time: undefined,
        headcount: role.count,
        hours_per_day: Number.isNaN(Number(role.hoursPerDay)) ? undefined : Number(role.hoursPerDay),
        rate_snapshot_cents: effectiveHourlyRateCents,
        billable_days_mode: normalizeBillableMode(parsed.includeWeekends ?? false),
        terms_days: termsDays,
        expected_duration_value: Number.isNaN(Number(role.expectedDurationValue))
          ? undefined
          : Number(role.expectedDurationValue),
        expected_duration_unit: role.expectedDurationUnit || undefined,
        ot_options: role.otOptions ?? [],
        base_rate_offer: typeof role.baseRateOffer === "number" ? role.baseRateOffer : undefined,
        travel_allowance: typeof role.travelAllowance === "number" ? role.travelAllowance : undefined,
        travel_allowance_enabled:
          typeof role.travelAllowanceEnabled === "boolean" ? (role.travelAllowanceEnabled ? 1 : 0) : undefined,
        attachment_list: attachmentList,
        start_date: role.startDate,
        end_date: undefined,
        notes: parsed.notes,
        urgency_level: undefined,
        contract_signed: 0,
        release_to_client: 0,
        created_by: session.userId || session.email || null,
        updated_by: session.userId || session.email || null,
      };
      await insertRequest(db, record);
      created.push(request_id);
    }

    if (!saveAsDraft) {
      const subject = `New labour booking - ${parsed.company.name} (${parsed.bookingId})`;
      const summary = parsed.roles
      .map((r, idx) => {
        const roleLabel = r.role === "Other" ? r.otherTicketName?.trim() || "Other" : r.role;
        const extras = [
          r.craneCapacity ? `Crane: ${r.craneCapacity}` : null,
          r.ewpHeight ? `EWP: ${r.ewpHeight}` : null,
          r.telehandlerAttachment && r.telehandlerAttachment.length
            ? `Telehandler: ${r.telehandlerAttachment.join(", ")}`
            : null,
          r.scaffoldingLevel ? `Scaffolding: ${r.scaffoldingLevel}` : null,
          r.riggingLevel ? `Rigging: ${r.riggingLevel}` : null,
        ]
          .filter(Boolean)
          .join("; ");
        return (
          `Role group ${idx + 1}: ${r.count}x ${roleLabel}, additional tickets: ${r.tickets?.join(", ") || "None"}, ` +
          `exp: ${r.experience}, start ${r.startDate} ${r.startTime}, hours/day ${r.hoursPerDay}, duration ${r.expectedDurationValue} ${r.expectedDurationUnit}, OT: ${r.otOptions?.join(", ") || "None"}` +
          `, base rate: ${r.baseRateOffer ?? "N/A"}, travel: ${r.travelAllowance ?? "N/A"}` +
          (extras ? ` | ${extras}` : "")
        );
      })
      .join("\n");

      const totalWorkersRequested = parsed.roles.reduce((sum, r) => sum + Number(r.count || 0), 0);
      const adminClientLink = `/admin-login?next=${encodeURIComponent(`/dashboard/admin/clients?clientId=${client.client_id}`)}`;
      const adminClientPortalUrl = `${req.nextUrl.origin}${adminClientLink}`;

      const text = [
      `Booking ID: ${parsed.bookingId}`,
      `Company: ${parsed.company.name} (${parsed.company.structure})`,
      `ACN: ${parsed.company.acn}`,
      `ABN: ${parsed.company.abn}`,
      `Website: ${parsed.company.website ?? "N/A"}`,
      "PO number: Auto-assigned at invoice stage",
      `Contact: ${parsed.company.contactTitle} ${parsed.company.contactName} (${parsed.company.contactJobTitle})`,
      `Contact email: ${parsed.company.contactEmail}`,
      `Mobile: ${parsed.company.contactMobile}`,
      `Landline: ${parsed.company.contactLandline || "N/A"}`,
      `Preferred contact time: ${parsed.company.preferredContactTime || "N/A"}`,
      `On behalf confirmed: ${parsed.company.contactOnBehalf ? "Yes" : "No"}`,
      `Attachments link: ${parsed.attachmentsLink || "N/A"}`,
      "",
      `Registered address: ${parsed.registeredAddress.street}, ${parsed.registeredAddress.state} ${parsed.registeredAddress.postcode}`,
      `Site: ${parsed.siteAddress.siteName ?? "N/A"}`,
      `Site address: ${parsed.siteAddress.formattedAddress}`,
      `Map: ${parsed.siteAddress.mapUrl ?? "N/A"}`,
      `Lat/Lng: ${parsed.siteAddress.lat ?? "N/A"}, ${parsed.siteAddress.lng ?? "N/A"}`,
      "",
      "Roles:",
      summary,
      "",
      `Notes: ${parsed.notes ?? "N/A"}`,
      `Submitted at: ${parsed.submittedAt}`,
    ].join("\n");

      const attachments =
      parsed.attachments?.length && parsed.attachments.some((a) => a.content)
        ? parsed.attachments.flatMap((a) =>
            a.content
              ? [
                  {
                    filename: a.name,
                    content: a.content,
                    encoding: "base64" as const,
                    contentType: a.type,
                  },
                ]
              : [],
          )
        : undefined;

      try {
        await sendNotificationEmail({ subject, text, attachments });
      } catch (emailError) {
        console.error("Notification email failed for booking:", emailError);
      }

      try {
        await addAdminClientEvent(db, {
          client_id: client.client_id,
          event_type: "new_request",
          section: "request",
          summary: `New labour request from ${parsed.company.name} (${totalWorkersRequested} workers requested).`,
          meta_json: JSON.stringify({
            request_ids: created,
            company_name: parsed.company.name,
            workers_requested: totalWorkersRequested,
            payment_terms_days: termsDays,
            site_name: parsed.siteAddress.siteName ?? null,
          }),
        });
        await sendNotificationEmail({
          subject: `Admin alert: New client request - ${parsed.company.name}`,
          text: [
            `Company: ${parsed.company.name}`,
            `Workers requested: ${totalWorkersRequested}`,
            `Payment terms: ${termsDays} days`,
            `Site: ${parsed.siteAddress.siteName ?? parsed.siteAddress.formattedAddress}`,
            "",
            `Open admin portal: ${adminClientPortalUrl}`,
          ].join("\n"),
          html: `
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.45;color:#111827;">
            <p style="margin:0 0 10px;"><strong>New client request received</strong></p>
            <p style="margin:0 0 6px;">Company: <strong>${parsed.company.name}</strong></p>
            <p style="margin:0 0 6px;">Workers requested: <strong>${totalWorkersRequested}</strong></p>
            <p style="margin:0 0 6px;">Payment terms: <strong>${termsDays} days</strong></p>
            <p style="margin:0 0 14px;">Site: <strong>${parsed.siteAddress.siteName ?? parsed.siteAddress.formattedAddress}</strong></p>
            <p style="margin:0 0 14px;">
              <a href="${adminClientPortalUrl}" style="display:inline-block;background:#f97316;color:#ffffff;text-decoration:none;padding:10px 14px;border-radius:8px;font-weight:700;">
                Click Here
              </a>
            </p>
          </div>
        `,
        });
      } catch (eventErr) {
        console.error("Admin event/email failed for booking request:", eventErr);
      }

      const replyTo = parsed.company.contactEmail || body?.email || body?.contactEmail;
      if (replyTo) {
        try {
        const contactName = String(parsed.company.contactName || "").trim() || "Client";
        const roleGroupText = parsed.roles
          .map((r, idx) => {
            const roleLabel = r.role === "Other" ? r.otherTicketName?.trim() || "Other" : r.role;
            const additionalTickets = Array.isArray(r.tickets) && r.tickets.length ? r.tickets.join(", ") : "None";
            return [
              `Role group ${idx + 1}:`,
              `  - Worker type/ticket: ${roleLabel}`,
              `  - Workers requested: ${r.count}`,
              `  - Requested start: ${r.startDate} ${r.startTime}`,
              `  - Hours/day: ${r.hoursPerDay}`,
              `  - Duration: ${r.expectedDurationValue} ${r.expectedDurationUnit}`,
              `  - Additional tickets: ${additionalTickets}`,
            ].join("\n");
          })
          .join("\n");
        const roleGroupHtml = parsed.roles
          .map((r, idx) => {
            const roleLabel = r.role === "Other" ? r.otherTicketName?.trim() || "Other" : r.role;
            const additionalTickets = Array.isArray(r.tickets) && r.tickets.length ? r.tickets.join(", ") : "None";
            return `
              <div style="margin:0 0 12px;padding:10px 12px;border:1px solid #e5e7eb;border-radius:8px;background:#f9fafb;">
                <div style="font-weight:700;margin:0 0 6px;">Role group ${idx + 1}</div>
                <div>- Worker type/ticket: ${roleLabel}</div>
                <div>- Workers requested: ${r.count}</div>
                <div>- Requested start: ${r.startDate} ${r.startTime}</div>
                <div>- Hours/day: ${r.hoursPerDay}</div>
                <div>- Duration: ${r.expectedDurationValue} ${r.expectedDurationUnit}</div>
                <div>- Additional tickets: ${additionalTickets}</div>
              </div>
            `;
          })
          .join("");
        const receivedAt = new Date().toLocaleString("en-AU", {
          timeZone: "Australia/Sydney",
          hour12: false,
        });
        const loginUrl = `${req.nextUrl.origin}/login`;
        const progressUrl = `${req.nextUrl.origin}/dashboard/requests`;
        const autoSubject = "Thanks, we've received your labour hire request - SiteReady Workforce";
        const autoText = [
          `Dear ${contactName},`,
          "",
          "Thanks for contacting SiteReady Workforce. We've received your labour hire request and will review it shortly.",
          "",
          `Received at: ${receivedAt} (Sydney time)`,
          "",
          "Summary of your request:",
          `- Company: ${parsed.company.name} (${parsed.company.structure})`,
          `- Site: ${parsed.siteAddress.formattedAddress}`,
          `- Map: ${parsed.siteAddress.mapUrl ?? "N/A"}`,
          `- Role groups requested: ${parsed.roles.length}`,
          "",
          roleGroupText,
          "",
          "We will automatically email you at each key stage of the review and update process, and we will review your request as soon as possible.",
          "",
          "Click here to view the progress of your request:",
          progressUrl,
          "",
          "If any of this is incorrect, just reply to this email with corrections, or log in and edit your request:",
          loginUrl,
          "",
          "SiteReady Workforce",
        ].join("\n");
        const autoHtml = `
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.45;color:#111827;">
            <p style="margin:0 0 12px;">Dear ${contactName},</p>
            <p style="margin:0 0 10px;">Thanks for contacting SiteReady Workforce. We've received your labour hire request and will review it shortly.</p>
            <p style="margin:0 0 10px;">Received at: <strong>${receivedAt}</strong> (Sydney time)</p>
            <p style="margin:0 0 8px;"><strong>Summary of your request:</strong></p>
            <div style="margin:0 0 4px;">- Company: ${parsed.company.name} (${parsed.company.structure})</div>
            <div style="margin:0 0 4px;">- Site: ${parsed.siteAddress.formattedAddress}</div>
            <div style="margin:0 0 4px;">- Map: ${parsed.siteAddress.mapUrl ?? "N/A"}</div>
            <div style="margin:0 0 10px;">- Role groups requested: ${parsed.roles.length}</div>
            ${roleGroupHtml}
            <p style="margin:0 0 12px;">We will automatically email you at each key stage of the review and update process, and we will review your request as soon as possible.</p>
            <p style="margin:0 0 14px;">
              <a href="${progressUrl}" style="display:inline-block;background:#f97316;color:#ffffff;text-decoration:none;padding:10px 14px;border-radius:8px;font-weight:700;">Click here to view the progress of your request</a>
            </p>
            <p style="margin:0 0 8px;">If any of this is incorrect, just reply to this email with corrections, or log in and edit your request:</p>
            <p style="margin:0 0 16px;">
              <a href="${loginUrl}" style="display:inline-block;background:#f97316;color:#ffffff;text-decoration:none;padding:10px 14px;border-radius:8px;font-weight:700;">Click here</a>
            </p>
          </div>
        `;

          await sendAutoReplyEmail({
          to: replyTo,
          subject: autoSubject,
          text: autoText,
          html: autoHtml,
          });
        } catch (autoReplyError) {
          console.error("Auto-reply send failed for booking:", autoReplyError);
        }
      }
    } else {
      try {
        await addAdminClientEvent(db, {
          client_id: client.client_id,
          event_type: "new_request",
          section: "request",
          summary: `Request draft saved by ${parsed.company.name} pending policy acceptance.`,
          meta_json: JSON.stringify({
            request_ids: created,
            company_name: parsed.company.name,
            payment_terms_days: termsDays,
            site_name: parsed.siteAddress.siteName ?? null,
          }),
        });
      } catch (draftEventErr) {
        console.error("Draft pending-policy event failed:", draftEventErr);
      }
    }

    if (process.env.SHEETS_WEBAPP_URL) {
      try {
        await fetch(process.env.SHEETS_WEBAPP_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(process.env.SHEETS_WEBAPP_TOKEN ? { "X-Webhook-Token": process.env.SHEETS_WEBAPP_TOKEN } : {}),
          },
          body: JSON.stringify(parsed),
        });
      } catch (err) {
        console.error("Sheets push failed (booking):", err);
      }
    }

    return NextResponse.json({
      ok: true,
      request_ids: created,
      request_id: created[0],
      saved_as_draft: saveAsDraft,
      message: saveAsDraft
        ? "Saved as draft. Accept policies later to submit."
        : "Request submitted.",
    });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json({ ok: false, error: error.issues }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Invalid request payload";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
