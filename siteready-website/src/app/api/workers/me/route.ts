import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasD1Binding, hasR2Binding } from "@/lib/db/config";
import { ensureWorkerForUser, getWorkerByUser, updateWorkerProfile } from "@/lib/db/workers";
import { getContractorCompany, upsertContractorCompany } from "@/lib/db/contractorCompany";
import { encryptString, decryptString } from "@/lib/crypto";
import { putBase64Object } from "@/lib/storage/r2";
import { hasAccepted } from "@/lib/legal/acceptance";

const workMediaSchema = z.object({
  name: z.string(),
  type: z.string().optional().or(z.literal("")),
  size: z.number().optional(),
  content: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  key: z.string().optional().or(z.literal("")),
  verification_status: z.string().optional().or(z.literal("")),
  verification_notes: z.string().optional().or(z.literal("")),
});

const workExperienceSchema = z.object({
  site_name: z.string().min(1, "Site name is required"),
  position: z.string().min(1, "Position is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional().or(z.literal("")),
  reason: z.string().min(1, "Reason is required"),
  reason_other: z.string().optional().or(z.literal("")),
  reference_name: z.string().optional().or(z.literal("")),
  reference_position: z.string().optional().or(z.literal("")),
  reference_position_other: z.string().optional().or(z.literal("")),
  reference_mobile: z.string().optional().or(z.literal("")),
  reference_phone: z.string().optional().or(z.literal("")),
  reference_email: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  work_media: z.array(workMediaSchema).optional().default([]),
});

const optionalString = z.string().optional().nullable().or(z.literal(""));
const optionalBoolean = z.coerce.boolean().optional();

const workExperienceDraftSchema = z.object({
  site_name: optionalString,
  position: optionalString,
  start_date: optionalString,
  end_date: optionalString,
  reason: optionalString,
  reason_other: optionalString,
  reference_name: optionalString,
  reference_position: optionalString,
  reference_position_other: optionalString,
  reference_mobile: optionalString,
  reference_phone: optionalString,
  reference_email: optionalString,
  notes: optionalString,
  work_media: z.array(workMediaSchema).optional().default([]),
});

const profileSchema = z.object({
  engagement_type: z.enum(["EMPLOYEE_CASUAL", "CONTRACTOR_ABN"]).optional(),
  title: z.string().min(1, "Title is required"),
  name: optionalString,
  first_name: z.string().min(1, "First name is required"),
  middle_name: optionalString,
  last_name: z.string().min(1, "Last name is required"),
  dob: z.string().min(1, "Date of birth is required"),
  mobile: z.string().min(1, "Mobile is required"),
  whatsapp: optionalString,
  phone: optionalString,
  address_number: z.string().min(1, "Address number is required"),
  address_floor: optionalString,
  address_unit: optionalString,
  address_building: optionalString,
  address_line1: optionalString,
  address_line2: optionalString,
  address_suburb: optionalString,
  address_street: z.string().min(1, "Street is required"),
  address_city: optionalString,
  address_state: optionalString,
  address_postcode: z.string().min(4, "Postcode is required"),
    address_country: optionalString,
    super_fund_name: optionalString,
    super_product_name: optionalString,
    super_choice: optionalString,
    super_status: optionalString,
    super_contribution_restrictions: z.coerce.number().int().optional(),
    super_fund_type: optionalString,
  super_abn: optionalString,
  super_usi: optionalString,
  smsf_abn: optionalString,
  smsf_bank_bsb: optionalString,
  smsf_bank_account: optionalString,
  smsf_bank_account_name: optionalString,
  smsf_esa: optionalString,
  super_member_number: optionalString,
  tfn: optionalString,
  australian_resident_for_tax: z.coerce.boolean().optional(),
  claim_tax_free_threshold: z.coerce.boolean().optional(),
  help_debt: z.coerce.boolean().optional(),
  sfss_debt: z.coerce.boolean().optional(),
  has_own_abn: z.coerce.boolean().optional(),
  company_name: optionalString,
  company_structure: optionalString,
  company_abn: optionalString,
  company_acn: optionalString,
  company_website: optionalString,
  company_address: optionalString,
  company_address_number: optionalString,
  company_address_floor: optionalString,
  company_address_unit: optionalString,
  company_address_building: optionalString,
  company_address_street: optionalString,
  company_address_postcode: optionalString,
  company_tfn: optionalString,
  company_address_same: z.coerce.boolean().optional(),
  privacy_agreed: z.coerce.boolean(),
  indemnity_agreed: z.coerce.boolean(),
  emergency_contact_title: optionalString,
  emergency_contact_first_name: optionalString,
  emergency_contact_family_name: optionalString,
  emergency_contact_mobile: optionalString,
  emergency_contact_email: optionalString,
  drivers_license_front: optionalString,
  drivers_license_front_type: optionalString,
  drivers_license_back: optionalString,
  drivers_license_back_type: optionalString,
  drivers_license_front_name: optionalString,
  drivers_license_back_name: optionalString,
  id_document_type: optionalString,
  id_document_front: optionalString,
  id_document_front_type: optionalString,
  id_document_back: optionalString,
  id_document_back_type: optionalString,
  id_document_front_name: optionalString,
  id_document_back_name: optionalString,
  bank_account_name: optionalString,
  bank_name: optionalString,
  bank_bsb: optionalString,
  bank_account_number: optionalString,
  company_bank_account_name: optionalString,
  company_bank_bsb: optionalString,
  company_bank_account_number: optionalString,
  work_experience: z.array(workExperienceSchema).optional().default([]),
  work_media: z.array(workMediaSchema).optional().default([]),
  work_comments: optionalString,
});

const submitProfileSchema = profileSchema.extend({
  submit_for_approval: z.coerce.boolean().optional(),
});

const draftProfileSchema = z.object({
  engagement_type: z.enum(["EMPLOYEE_CASUAL", "CONTRACTOR_ABN"]).optional(),
  title: optionalString,
  name: optionalString,
  first_name: optionalString,
  middle_name: optionalString,
  last_name: optionalString,
  dob: optionalString,
  mobile: optionalString,
  whatsapp: optionalString,
  phone: optionalString,
  address_number: optionalString,
  address_floor: optionalString,
  address_unit: optionalString,
  address_building: optionalString,
  address_line1: optionalString,
  address_line2: optionalString,
  address_suburb: optionalString,
  address_street: optionalString,
  address_city: optionalString,
  address_state: optionalString,
  address_postcode: optionalString,
    address_country: optionalString,
    super_fund_name: optionalString,
    super_product_name: optionalString,
    super_choice: optionalString,
    super_status: optionalString,
    super_contribution_restrictions: z.coerce.number().int().optional(),
    super_fund_type: optionalString,
  super_abn: optionalString,
  super_usi: optionalString,
  smsf_abn: optionalString,
  smsf_bank_bsb: optionalString,
  smsf_bank_account: optionalString,
  smsf_bank_account_name: optionalString,
  smsf_esa: optionalString,
  super_member_number: optionalString,
  tfn: optionalString,
  australian_resident_for_tax: optionalBoolean,
  claim_tax_free_threshold: optionalBoolean,
  help_debt: optionalBoolean,
  sfss_debt: optionalBoolean,
  has_own_abn: optionalBoolean,
  company_name: optionalString,
  company_structure: optionalString,
  company_abn: optionalString,
  company_acn: optionalString,
  company_website: optionalString,
  company_address: optionalString,
  company_address_number: optionalString,
  company_address_floor: optionalString,
  company_address_unit: optionalString,
  company_address_building: optionalString,
  company_address_street: optionalString,
  company_address_postcode: optionalString,
  company_tfn: optionalString,
  company_address_same: optionalBoolean,
  privacy_agreed: optionalBoolean,
  indemnity_agreed: optionalBoolean,
  emergency_contact_title: optionalString,
  emergency_contact_first_name: optionalString,
  emergency_contact_family_name: optionalString,
  emergency_contact_mobile: optionalString,
  emergency_contact_email: optionalString,
  drivers_license_front: optionalString,
  drivers_license_front_type: optionalString,
  drivers_license_back: optionalString,
  drivers_license_back_type: optionalString,
  drivers_license_front_name: optionalString,
  drivers_license_back_name: optionalString,
  id_document_type: optionalString,
  id_document_front: optionalString,
  id_document_front_type: optionalString,
  id_document_back: optionalString,
  id_document_back_type: optionalString,
  id_document_front_name: optionalString,
  id_document_back_name: optionalString,
  bank_account_name: optionalString,
  bank_name: optionalString,
  bank_bsb: optionalString,
  bank_account_number: optionalString,
  company_bank_account_name: optionalString,
  company_bank_bsb: optionalString,
  company_bank_account_number: optionalString,
  work_experience: z.array(workExperienceDraftSchema).optional().default([]),
  work_media: z.array(workMediaSchema).optional().default([]),
  work_comments: optionalString,
  submit_for_approval: optionalBoolean,
});

export async function GET(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "worker") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!hasD1Binding()) return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const worker = await ensureWorkerForUser(db, session.userId || session.email || "", session.email);
  const fresh = await getWorkerByUser(db, worker.user_id || session.userId || "");
  const result = fresh ?? worker;
  const contractor = await getContractorCompany(db, result.worker_id);
  let decryptedSuper = null;
  let decryptedCompanyTfn: string | null = null;
  let decryptedCompanyAccount: string | null = null;
  let encryptionAvailable = true;
  try {
    decryptedSuper = await decryptString(result.super_member_number ?? null);
    if (contractor?.company_tfn_encrypted) {
      decryptedCompanyTfn = await decryptString(contractor.company_tfn_encrypted);
    }
    if (contractor?.bank_account_number_encrypted) {
      decryptedCompanyAccount = await decryptString(contractor.bank_account_number_encrypted);
    }
  } catch {
    encryptionAvailable = false;
  }
  let contractorAddress: Record<string, string> = {};
  if (contractor?.address_json) {
    try {
      contractorAddress = JSON.parse(contractor.address_json) as Record<string, string>;
    } catch {
      contractorAddress = {};
    }
  }
  const decrypted = {
    ...result,
    engagement_type: result.engagement_type || "EMPLOYEE_CASUAL",
    super_member_number: decryptedSuper,
    company_name: contractor?.company_name ?? null,
    company_structure: contractor?.company_structure ?? null,
    company_abn: contractor?.abn ?? null,
    company_acn: contractor?.acn ?? null,
    company_website: contractor?.website ?? null,
    company_tfn: decryptedCompanyTfn,
    company_address: contractorAddress.company_address ?? null,
    company_address_number: contractorAddress.company_address_number ?? null,
    company_address_floor: contractorAddress.company_address_floor ?? null,
    company_address_unit: contractorAddress.company_address_unit ?? null,
    company_address_building: contractorAddress.company_address_building ?? null,
    company_address_street: contractorAddress.company_address_street ?? null,
    company_address_postcode: contractorAddress.company_address_postcode ?? null,
    company_address_same: contractorAddress.company_address_same ? Number(contractorAddress.company_address_same) : null,
    company_bank_account_name: contractor?.bank_account_name ?? null,
    company_bank_bsb: contractor?.bank_bsb ?? null,
    company_bank_account_number: decryptedCompanyAccount,
    work_experience: typeof result.work_experience_json === "string" ? JSON.parse(result.work_experience_json) : [],
    work_media: typeof result.work_media_json === "string" ? JSON.parse(result.work_media_json) : [],
    work_comments: result.work_comments ?? "",
    encryptionAvailable,
  };
  return NextResponse.json({ ok: true, profile: decrypted });
}

export async function PUT(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "worker") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!hasD1Binding()) return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const body = await req.json().catch(() => null);
  const submitForApproval = !!body?.submit_for_approval;
  const parsed = (submitForApproval ? submitProfileSchema : draftProfileSchema).safeParse(body);
  if (!parsed.success && submitForApproval) {
    const issues = parsed.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
    return NextResponse.json(
      { error: "Invalid payload", details: { ...parsed.error.flatten(), issues } },
      { status: 400 },
    );
  }

  const data =
    parsed.success && typeof parsed.data === "object"
      ? parsed.data
      : typeof body === "object" && body
        ? body
        : {};
  const normalized = {
    ...data,
    work_experience: Array.isArray(data?.work_experience) ? data.work_experience : [],
    work_media: Array.isArray(data?.work_media) ? data.work_media : [],
  };
  const derivedAddressLine1 = normalized.address_line1 || `${normalized.address_number || ""} ${normalized.address_street || ""}`.trim();
  const derivedSuburb = normalized.address_suburb || normalized.address_city || "";
  const derivedCountry = normalized.address_country || "Australia";

  const userId = session.userId || session.email;
  if (userId) {
    const sensitiveFields = [
      normalized.dob,
      normalized.address_number,
      normalized.address_street,
      normalized.address_postcode,
      normalized.address_line1,
      normalized.address_line2,
      normalized.address_suburb,
      normalized.address_city,
      normalized.address_state,
      normalized.address_country,
      normalized.bank_account_name,
      normalized.bank_bsb,
      normalized.bank_account_number,
      normalized.super_fund_name,
      normalized.super_product_name,
      normalized.super_choice,
      normalized.super_status,
      normalized.super_contribution_restrictions,
      normalized.super_member_number,
      normalized.super_fund_type,
      normalized.super_abn,
      normalized.super_usi,
      normalized.smsf_abn,
      normalized.smsf_bank_bsb,
      normalized.smsf_bank_account,
      normalized.smsf_bank_account_name,
      normalized.smsf_esa,
    ];
    const needsCollectionNotice = sensitiveFields.some((value) => (value || "").toString().trim().length > 0);
    if (needsCollectionNotice) {
      const accepted = await hasAccepted(db, userId, "APP5_COLLECTION_NOTICE");
      if (!accepted) {
        return NextResponse.json(
          { error: "Legal acceptance required", code: "NEEDS_LEGAL_ACCEPTANCE", document: "APP5_COLLECTION_NOTICE" },
          { status: 403 },
        );
      }
    }
  }
  if (!submitForApproval && "verified_status" in normalized) {
    delete (normalized as Record<string, unknown>).verified_status;
  }

  if (submitForApproval && (!normalized.privacy_agreed || !normalized.indemnity_agreed)) {
    return NextResponse.json({ error: "You must agree to the privacy and indemnity statements." }, { status: 400 });
  }

  if (submitForApproval) {
    const abnDigits = String(normalized.company_abn || "").replace(/\D/g, "");
    const acnDigits = String(normalized.company_acn || "").replace(/\D/g, "");
    if (abnDigits && abnDigits.length !== 11) {
      return NextResponse.json({ error: "ABN must be 11 digits." }, { status: 400 });
    }
    if (acnDigits && acnDigits.length !== 9) {
      return NextResponse.json({ error: "ACN must be 9 digits." }, { status: 400 });
    }
    if (abnDigits && acnDigits && abnDigits.slice(2) !== acnDigits) {
      return NextResponse.json({ error: "ABN last 9 digits must match the ACN." }, { status: 400 });
    }
  }

  const hasDocs =
    !!normalized.drivers_license_front ||
    !!normalized.drivers_license_back ||
    !!normalized.id_document_front ||
    !!normalized.id_document_back;
  const hasWorkMedia = normalized.work_media?.some((item: { content?: string }) => item.content);
  const hasExperienceMedia = normalized.work_experience?.some((exp: { work_media?: Array<{ content?: string }> }) =>
    exp.work_media?.some((item) => item.content),
  );
  if (hasDocs && !hasR2Binding()) {
    return NextResponse.json({ error: "Document storage not configured" }, { status: 503 });
  }
  if ((hasWorkMedia || hasExperienceMedia) && !hasR2Binding()) {
    return NextResponse.json({ error: "Work media storage not configured" }, { status: 503 });
  }

  const worker = await ensureWorkerForUser(db, session.userId || session.email || "", session.email);
  const existingWorker = await getWorkerByUser(db, worker.user_id || session.userId || "");
  const engagementType =
    (normalized.engagement_type as "EMPLOYEE_CASUAL" | "CONTRACTOR_ABN" | undefined) ||
    (existingWorker?.engagement_type as "EMPLOYEE_CASUAL" | "CONTRACTOR_ABN" | undefined) ||
    "EMPLOYEE_CASUAL";
  if (engagementType === "CONTRACTOR_ABN") {
    const abnDigits = String(normalized.company_abn || "").replace(/\D/g, "");
    const bankAccount = String(normalized.company_bank_account_number || "").replace(/\s+/g, "");
    if (!normalized.company_name?.trim()) {
      return NextResponse.json({ error: "Company name is required." }, { status: 400 });
    }
    if (!normalized.company_structure?.trim()) {
      return NextResponse.json({ error: "Company structure is required." }, { status: 400 });
    }
    if (!abnDigits || abnDigits.length !== 11) {
      return NextResponse.json({ error: "ABN must be 11 digits." }, { status: 400 });
    }
    if (!normalized.company_bank_account_name?.trim()) {
      return NextResponse.json({ error: "Company bank account name is required." }, { status: 400 });
    }
    if (!normalized.company_bank_bsb?.trim()) {
      return NextResponse.json({ error: "Company BSB is required." }, { status: 400 });
    }
    if (!bankAccount) {
      return NextResponse.json({ error: "Company account number is required." }, { status: 400 });
    }
    let encryptedAccount: string;
    let encryptedCompanyTfn: string | null = null;
    try {
      encryptedAccount = await encryptString(bankAccount);
      if (normalized.company_tfn) {
        encryptedCompanyTfn = await encryptString(normalized.company_tfn);
      }
    } catch {
      return NextResponse.json({ error: "Encryption not configured" }, { status: 503 });
    }
    const addressPayload = {
      company_address: normalized.company_address || "",
      company_address_number: normalized.company_address_number || "",
      company_address_floor: normalized.company_address_floor || "",
      company_address_unit: normalized.company_address_unit || "",
      company_address_building: normalized.company_address_building || "",
      company_address_street: normalized.company_address_street || "",
      company_address_postcode: normalized.company_address_postcode || "",
      company_address_same: normalized.company_address_same ? "1" : "0",
    };
    await upsertContractorCompany(db, {
      worker_id: worker.worker_id,
      company_name: normalized.company_name,
      company_structure: normalized.company_structure,
      abn: abnDigits,
      acn: normalized.company_acn || null,
      website: normalized.company_website || null,
      company_tfn_encrypted: encryptedCompanyTfn,
      address_json: JSON.stringify(addressPayload),
      bank_account_name: normalized.company_bank_account_name,
      bank_bsb: normalized.company_bank_bsb,
      bank_account_number_encrypted: encryptedAccount,
      bank_account_last4: bankAccount.slice(-4),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  const existingMediaStatus = new Map<string, { status?: string; notes?: string }>();
  const collectMediaStatus = (
    list: Array<{ key?: string | null; verification_status?: string | null; verification_notes?: string | null }>,
  ) => {
    list.forEach((item) => {
      if (item?.key) {
        existingMediaStatus.set(item.key, {
          status: item.verification_status || undefined,
          notes: item.verification_notes || undefined,
        });
      }
    });
  };
  if (existingWorker?.work_media_json) {
    try {
      collectMediaStatus(JSON.parse(existingWorker.work_media_json));
    } catch {}
  }
  if (existingWorker?.work_experience_json) {
    try {
      const experiences = JSON.parse(existingWorker.work_experience_json) as Array<{
        work_media?: Array<{ key?: string | null; verification_status?: string | null; verification_notes?: string | null }>;
      }>;
      experiences.forEach((exp) => collectMediaStatus(exp.work_media || []));
    } catch {}
  }
  let encryptedSuper: string | null = null;
  let encryptionWarning: string | null = null;
  try {
    encryptedSuper = await encryptString(normalized.super_member_number || "");
  } catch {
    if (submitForApproval) {
      return NextResponse.json({ error: "Encryption not configured" }, { status: 503 });
    }
    encryptionWarning = "Encryption not configured. Super not saved yet.";
  }

  const hasAbn = engagementType === "CONTRACTOR_ABN" ? 1 : 0;
  const consentAt = submitForApproval ? new Date().toISOString() : undefined;
  let licenseFrontKey: string | null = null;
  let licenseBackKey: string | null = null;
  let idFrontKey: string | null = null;
  let idBackKey: string | null = null;
  const workMedia: Array<{ name: string; description?: string; key?: string; type?: string; size?: number }> = [];
  const workExperiences: Array<Record<string, unknown>> = [];

  const sanitizeKeyPart = (value: string) =>
    value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "media";
  const base64Size = (value: string) => {
    const cleaned = value.replace(/=+$/, "");
    return Math.floor((cleaned.length * 3) / 4);
  };

  const docPayloads = [
    normalized.drivers_license_front,
    normalized.drivers_license_back,
    normalized.id_document_front,
    normalized.id_document_back,
  ].filter(Boolean) as string[];
  if (docPayloads.length) {
    const docTotal = docPayloads.reduce((sum, value) => sum + base64Size(value), 0);
    if (docTotal > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Identity documents exceed 10MB total." }, { status: 413 });
    }
  }

  try {
    if (normalized.drivers_license_front) {
      const key = `workers/${worker.worker_id}/identity/license-front-${Date.now()}`;
      licenseFrontKey = await putBase64Object({
        key,
        base64: normalized.drivers_license_front,
        contentType: normalized.drivers_license_front_type || "image/jpeg",
      });
    }
    if (normalized.drivers_license_back) {
      const key = `workers/${worker.worker_id}/identity/license-back-${Date.now()}`;
      licenseBackKey = await putBase64Object({
        key,
        base64: normalized.drivers_license_back,
        contentType: normalized.drivers_license_back_type || "image/jpeg",
      });
    }
    if (normalized.id_document_front) {
      const key = `workers/${worker.worker_id}/identity/id-front-${Date.now()}`;
      idFrontKey = await putBase64Object({
        key,
        base64: normalized.id_document_front,
        contentType: normalized.id_document_front_type || "image/jpeg",
      });
    }
    if (normalized.id_document_back) {
      const key = `workers/${worker.worker_id}/identity/id-back-${Date.now()}`;
      idBackKey = await putBase64Object({
        key,
        base64: normalized.id_document_back,
        contentType: normalized.id_document_back_type || "image/jpeg",
      });
    }

    if (normalized.work_media?.length) {
      for (let i = 0; i < normalized.work_media.length; i += 1) {
        const media = normalized.work_media[i];
        const existing = media.key ? existingMediaStatus.get(media.key) : undefined;
        const entry: { name: string; description?: string; key?: string; type?: string; size?: number; verification_status?: string; verification_notes?: string } = {
          name: media.name,
          description: media.description || "",
          verification_status: media.verification_status || existing?.status || "pending",
          verification_notes: media.verification_notes || existing?.notes || "",
        };
        if (media.content) {
          const key = `workers/${worker.worker_id}/media/${Date.now()}-${i}-${sanitizeKeyPart(media.name)}`;
          await putBase64Object({
            key,
            base64: media.content,
            contentType: media.type || "application/octet-stream",
          });
          entry.key = key;
          entry.type = media.type || undefined;
          entry.size = base64Size(media.content);
        } else {
          entry.type = media.type || undefined;
          entry.size = media.size;
          if (media.key) entry.key = media.key;
        }
        workMedia.push(entry);
      }
    }

    if (normalized.work_experience?.length) {
      for (const exp of normalized.work_experience) {
        const mediaList: Array<{ name: string; description?: string; key?: string; type?: string; size?: number; verification_status?: string; verification_notes?: string }> = [];
        if (exp.work_media?.length) {
          for (let i = 0; i < exp.work_media.length; i += 1) {
            const media = exp.work_media[i];
            const existing = media.key ? existingMediaStatus.get(media.key) : undefined;
            const entry: { name: string; description?: string; key?: string; type?: string; size?: number; verification_status?: string; verification_notes?: string } = {
              name: media.name,
              description: media.description || "",
              verification_status: media.verification_status || existing?.status || "pending",
              verification_notes: media.verification_notes || existing?.notes || "",
            };
            if (media.content) {
              const key = `workers/${worker.worker_id}/experience/${Date.now()}-${i}-${sanitizeKeyPart(media.name)}`;
              await putBase64Object({
                key,
                base64: media.content,
                contentType: media.type || "application/octet-stream",
              });
              entry.key = key;
              entry.type = media.type || undefined;
              entry.size = base64Size(media.content);
            } else {
              entry.type = media.type || undefined;
              entry.size = media.size;
              if (media.key) entry.key = media.key;
            }
            mediaList.push(entry);
          }
        }
        workExperiences.push({
          ...exp,
          work_media: mediaList,
        });
      }
    }
  } catch {
    return NextResponse.json({ error: "Unable to store uploaded documents." }, { status: 503 });
  }

  const fullName = [normalized.first_name, normalized.middle_name, normalized.last_name]
    .filter((value) => value && value.trim())
    .join(" ")
    .trim();

  const updatePayload: Record<string, unknown> = {
    engagement_type: engagementType,
    title: normalized.title || null,
    name: fullName || normalized.name || null,
    first_name: normalized.first_name || null,
    middle_name: normalized.middle_name || null,
    last_name: normalized.last_name || null,
    dob: normalized.dob || null,
    mobile: normalized.mobile || null,
    whatsapp: normalized.whatsapp || null,
    phone: normalized.phone || null,
    address_number: normalized.address_number || null,
    address_floor: normalized.address_floor || null,
    address_unit: normalized.address_unit || null,
    address_building: normalized.address_building || null,
    address_line1: derivedAddressLine1 || null,
    address_line2: normalized.address_line2 || null,
    address_suburb: derivedSuburb || null,
    address_street: normalized.address_street || null,
    address_city: normalized.address_city || null,
    address_state: normalized.address_state || null,
    address_postcode: normalized.address_postcode || null,
    address_country: derivedCountry || null,
    super_fund_name: normalized.super_fund_name || null,
    super_product_name: normalized.super_product_name || null,
    super_choice: normalized.super_choice || null,
    super_status: normalized.super_status || null,
    super_contribution_restrictions:
      normalized.super_contribution_restrictions === undefined
        ? null
        : normalized.super_contribution_restrictions,
    super_fund_type: normalized.super_fund_type || null,
    super_abn: normalized.super_abn || null,
    super_usi: normalized.super_usi || null,
    smsf_abn: normalized.smsf_abn || null,
    smsf_bank_bsb: normalized.smsf_bank_bsb || null,
    smsf_bank_account: normalized.smsf_bank_account || null,
    smsf_bank_account_name: normalized.smsf_bank_account_name || null,
    smsf_esa: normalized.smsf_esa || null,
    has_own_abn: hasAbn,
    company_name: engagementType === "CONTRACTOR_ABN" ? normalized.company_name || null : null,
    company_structure: engagementType === "CONTRACTOR_ABN" ? normalized.company_structure || null : null,
    company_abn: engagementType === "CONTRACTOR_ABN" ? normalized.company_abn || null : null,
    company_acn: engagementType === "CONTRACTOR_ABN" ? normalized.company_acn || null : null,
    company_website: engagementType === "CONTRACTOR_ABN" ? normalized.company_website || null : null,
    company_address: engagementType === "CONTRACTOR_ABN" ? normalized.company_address || null : null,
    company_address_number: engagementType === "CONTRACTOR_ABN" ? normalized.company_address_number || null : null,
    company_address_floor: engagementType === "CONTRACTOR_ABN" ? normalized.company_address_floor || null : null,
    company_address_unit: engagementType === "CONTRACTOR_ABN" ? normalized.company_address_unit || null : null,
    company_address_building: engagementType === "CONTRACTOR_ABN" ? normalized.company_address_building || null : null,
    company_address_street: engagementType === "CONTRACTOR_ABN" ? normalized.company_address_street || null : null,
    company_address_postcode: engagementType === "CONTRACTOR_ABN" ? normalized.company_address_postcode || null : null,
    company_tfn: null,
    company_address_same: engagementType === "CONTRACTOR_ABN" ? (normalized.company_address_same ? 1 : 0) : null,
    privacy_agreed: normalized.privacy_agreed ? 1 : 0,
    indemnity_agreed: normalized.indemnity_agreed ? 1 : 0,
    emergency_contact_title: normalized.emergency_contact_title || null,
    emergency_contact_first_name: normalized.emergency_contact_first_name || null,
    emergency_contact_family_name: normalized.emergency_contact_family_name || null,
    emergency_contact_mobile: normalized.emergency_contact_mobile || null,
    emergency_contact_email: normalized.emergency_contact_email || null,
    bank_account_name: normalized.bank_account_name || null,
    bank_name: normalized.bank_name || null,
    bank_bsb: normalized.bank_bsb || null,
    bank_account_number: normalized.bank_account_number || null,
    company_bank_account_name: null,
    company_bank_bsb: null,
    company_bank_account_number: null,
    consent_at: consentAt,
    verified_status: submitForApproval ? "pending" : undefined,
    id_document_type: normalized.id_document_type || null,
    work_experience_json: JSON.stringify(workExperiences.length ? workExperiences : normalized.work_experience || []),
    work_media_json: JSON.stringify(workMedia),
    work_comments: normalized.work_comments || null,
  };
  if (licenseFrontKey) {
    updatePayload.drivers_license_front_key = licenseFrontKey;
    updatePayload.drivers_license_front_name = normalized.drivers_license_front_name || null;
    updatePayload.license_verification_status = "pending";
  }
  if (licenseBackKey) {
    updatePayload.drivers_license_back_key = licenseBackKey;
    updatePayload.drivers_license_back_name = normalized.drivers_license_back_name || null;
    updatePayload.license_verification_status = "pending";
  }
  if (idFrontKey) {
    updatePayload.id_document_front_key = idFrontKey;
    updatePayload.id_document_front_name = normalized.id_document_front_name || null;
    updatePayload.id_verification_status = "pending";
  }
  if (idBackKey) {
    updatePayload.id_document_back_key = idBackKey;
    updatePayload.id_document_back_name = normalized.id_document_back_name || null;
    updatePayload.id_verification_status = "pending";
  }
  if (encryptedSuper !== null) updatePayload.super_member_number = encryptedSuper;
  if (submitForApproval) {
    updatePayload.verified_status = "pending";
  }

  await updateWorkerProfile(db, worker.worker_id, updatePayload);

  return NextResponse.json({ ok: true, warning: encryptionWarning });
}
