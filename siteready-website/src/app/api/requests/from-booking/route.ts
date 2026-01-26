import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasD1Binding, hasR2Binding } from "@/lib/db/config";
import { ensureClientForUser } from "@/lib/db/clients";
import { insertRequest } from "@/lib/db/requests";
import { AttachmentMeta, RequestRow } from "@/lib/db/types";
import { bookingSchema } from "@/lib/bookings/schema";
import { sendAutoReplyEmail, sendNotificationEmail } from "@/lib/email";
import { putBase64Object } from "@/lib/storage/r2";

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
    const parsedResult = bookingSchema.safeParse(body);
    if (!parsedResult.success) {
      return NextResponse.json({ ok: false, error: parsedResult.error.issues }, { status: 400 });
    }
    const parsed = {
      ...parsedResult.data,
      submittedAt: new Date().toISOString(),
      bookingId: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
    };
    const client = await ensureClientForUser(db, session.userId || session.email || "", session.email);
    const attachmentList = await buildAttachmentList(
      parsed.attachments ?? [],
      client.client_id,
      parsed.bookingId,
    );

    const created: string[] = [];
    for (const role of parsed.roles) {
      const request_id = crypto.randomUUID();
      const record: Omit<RequestRow, "created_at" | "updated_at"> = {
        request_id,
        client_id: client.client_id,
        status: "submitted",
        role_id: role.role,
        required_tickets: role.tickets ?? [],
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
        expected_duration_value: Number.isNaN(Number(role.expectedDurationValue))
          ? undefined
          : Number(role.expectedDurationValue),
        expected_duration_unit: role.expectedDurationUnit || undefined,
        ot_options: role.otOptions ?? [],
        base_rate_offer: typeof role.baseRateOffer === "number" ? role.baseRateOffer : undefined,
        travel_allowance: typeof role.travelAllowance === "number" ? role.travelAllowance : undefined,
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

    const subject = `New labour booking - ${parsed.company.name} (${parsed.bookingId})`;
    const summary = parsed.roles
      .map((r, idx) => {
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
          `Role group ${idx + 1}: ${r.count}x ${r.role}, tickets: ${r.tickets?.join(", ") || "None"}, ` +
          `exp: ${r.experience}, start ${r.startDate} ${r.startTime}, hours/day ${r.hoursPerDay}, duration ${r.expectedDurationValue} ${r.expectedDurationUnit}, OT: ${r.otOptions?.join(", ") || "None"}` +
          `, base rate: ${r.baseRateOffer ?? "N/A"}, travel: ${r.travelAllowance ?? "N/A"}` +
          (extras ? ` | ${extras}` : "")
        );
      })
      .join("\n");

    const text = [
      `Booking ID: ${parsed.bookingId}`,
      `Company: ${parsed.company.name} (${parsed.company.structure})`,
      `ACN: ${parsed.company.acn}`,
      `ABN: ${parsed.company.abn}`,
      `Website: ${parsed.company.website ?? "N/A"}`,
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

    const replyTo = parsed.company.contactEmail || body?.email || body?.contactEmail;
    if (replyTo) {
      try {
        const receivedAt = new Date().toLocaleString("en-AU", {
          timeZone: "Australia/Sydney",
          hour12: false,
        });
        const autoSubject = "Thanks, we've received your labour hire request - SiteReady Workforce";
        const autoText = [
          "Hi,",
          "",
          "Thanks for contacting SiteReady Workforce. We've received your labour hire request and will review it shortly.",
          "",
          `Received at: ${receivedAt} (Sydney time)`,
          "",
          "Summary of your request:",
          `- Company: ${parsed.company.name} (${parsed.company.structure})`,
          `- Site: ${parsed.siteAddress.formattedAddress}`,
          `- Map: ${parsed.siteAddress.mapUrl ?? "N/A"}`,
          `- Role groups: ${parsed.roles.length}`,
          "",
          "If any of this is incorrect, just reply to this email with corrections.",
          "",
          "SiteReady Workforce",
        ].join("\n");

        await sendAutoReplyEmail({
          to: replyTo,
          subject: autoSubject,
          text: autoText,
        });
      } catch (autoReplyError) {
        console.error("Auto-reply send failed for booking:", autoReplyError);
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

    return NextResponse.json({ ok: true, request_ids: created, request_id: created[0] });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json({ ok: false, error: error.issues }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Invalid request payload";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
