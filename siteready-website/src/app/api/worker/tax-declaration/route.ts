import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasD1Binding } from "@/lib/db/config";
import { ensureWorkerForUser, getWorkerById } from "@/lib/db/workers";
import { getWorkerTaxDeclaration, upsertWorkerTaxDeclaration } from "@/lib/db/taxDeclarations";
import { encryptString, decryptString } from "@/lib/security/encryption";

const residencyEnum = z.enum(["AUSTRALIAN_RESIDENT", "FOREIGN_RESIDENT", "WORKING_HOLIDAY_MAKER"]);
const employmentEnum = z.enum(["FULL_TIME", "PART_TIME", "CASUAL", "LABOUR_HIRE", "SUPER_INCOME_STREAM"]);
const tfnStatusEnum = z.enum(["PROVIDED", "APPLIED_OR_ENQUIRED", "EXEMPT_UNDER18", "EXEMPT_PENSION", "NOT_QUOTED"]);

const declarationSchema = z.object({
  tax_residency_status: residencyEnum,
  employment_basis: employmentEnum,
  claim_tax_free_threshold: z.coerce.boolean(),
  has_study_training_loan: z.coerce.boolean(),
  has_sfss_debt: z.coerce.boolean(),
  tfn_status: tfnStatusEnum,
  tfn: z.string().optional().or(z.literal("")),
  tfn_not_quoted_ack: z.coerce.boolean().optional(),
  changed_surname_since_ato: z.coerce.boolean().optional(),
  previous_family_name: z.string().optional().or(z.literal("")),
  eligible_to_receive_leave_loading: z.coerce.boolean().optional(),
  has_student_startup_loan: z.coerce.boolean().optional(),
  has_trade_support_loan_debt: z.coerce.boolean().optional(),
  withholding_additional_amount_cents: z.coerce.number().int().optional(),
  withholding_variation_percent: z.coerce.number().int().optional(),
  tfn_declaration_full_name: z.string().optional().or(z.literal("")),
  tfn_declaration_signed: z.coerce.boolean().optional(),
});

function isAdmin(session: Awaited<ReturnType<typeof parseSessionFromRequest>>) {
  return session?.role === "staff" && (session.adminLevel === "admin" || session.adminLevel === "super_admin");
}

export async function GET(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasD1Binding()) return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const url = new URL(req.url);
  const targetWorkerId = url.searchParams.get("worker_id");
  if (targetWorkerId) {
    if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const row = await getWorkerTaxDeclaration(db, targetWorkerId);
    if (!row) return NextResponse.json({ ok: true, declaration: null });
    return NextResponse.json({ ok: true, declaration: { ...row, tfn_encrypted: null } });
  }

  if (session.role !== "worker") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const worker = await ensureWorkerForUser(db, session.userId || session.email || "", session.email);
  const row = await getWorkerTaxDeclaration(db, worker.worker_id);
  if (!row) return NextResponse.json({ ok: true, declaration: null });
  return NextResponse.json({ ok: true, declaration: { ...row, tfn_encrypted: null } });
}

export async function POST(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "worker") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!hasD1Binding()) return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const body = await req.json().catch(() => null);
  const parsed = declarationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const worker = await ensureWorkerForUser(db, session.userId || session.email || "", session.email);
  const workerRow = await getWorkerById(db, worker.worker_id);
  const engagementType = workerRow?.engagement_type || "EMPLOYEE_CASUAL";
  const data = parsed.data;

  if (engagementType !== "EMPLOYEE_CASUAL") {
    return NextResponse.json(
      { error: "Tax declaration is only available for Employee engagements." },
      { status: 400 },
    );
  }

  if (data.tax_residency_status === "WORKING_HOLIDAY_MAKER" && data.claim_tax_free_threshold) {
    return NextResponse.json(
      {
        error:
          "Working holiday makers generally do not claim the tax-free threshold. Please check with payroll if unsure.",
      },
      { status: 400 },
    );
  }

  let tfnEncrypted: string | null = null;
  let tfnLast4: string | null = null;
  const tfnRaw = (data.tfn || "").replace(/\s+/g, "");
  if (data.tfn_status === "PROVIDED") {
    if (!/^\d{8,9}$/.test(tfnRaw)) {
      return NextResponse.json({ error: "TFN must be 8 or 9 digits." }, { status: 400 });
    }
    try {
      tfnEncrypted = await encryptString(tfnRaw);
      tfnLast4 = tfnRaw.slice(-4);
    } catch {
      return NextResponse.json({ error: "Encryption not configured" }, { status: 503 });
    }
  }
  if (data.tfn_status === "NOT_QUOTED" && !data.tfn_not_quoted_ack) {
    return NextResponse.json({ error: "You must acknowledge the TFN not provided notice." }, { status: 400 });
  }
  if (
    typeof data.withholding_additional_amount_cents === "number" &&
    (data.withholding_additional_amount_cents < 0 || data.withholding_additional_amount_cents > 1_000_000)
  ) {
    return NextResponse.json(
      { error: "Additional withholding amount is out of range." },
      { status: 400 },
    );
  }

  const signed = !!data.tfn_declaration_signed;
  const nowIso = new Date().toISOString();
  const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || null;
  const userAgent = req.headers.get("user-agent") || null;

  await upsertWorkerTaxDeclaration(db, {
    worker_id: worker.worker_id,
    tax_residency_status: data.tax_residency_status,
    employment_basis: "LABOUR_HIRE",
    claim_tax_free_threshold: data.claim_tax_free_threshold ? 1 : 0,
    has_study_training_loan: data.has_study_training_loan ? 1 : 0,
    has_sfss_debt: data.has_sfss_debt ? 1 : 0,
    tfn_status: data.tfn_status,
    tfn_not_quoted_ack: data.tfn_not_quoted_ack ? 1 : 0,
    tfn_encrypted: tfnEncrypted,
    tfn_last4: tfnLast4,
    tfn_updated_at: tfnEncrypted ? nowIso : null,
    tfn_declaration_full_name: data.tfn_declaration_full_name || null,
    tfn_declaration_signed: signed ? 1 : 0,
    tfn_declaration_signed_at: signed ? nowIso : null,
    tfn_declaration_signed_ip: signed ? ip : null,
    tfn_declaration_signed_user_agent: signed ? userAgent : null,
    changed_surname_since_ato: data.changed_surname_since_ato ? 1 : 0,
    previous_family_name: data.previous_family_name || null,
    eligible_to_receive_leave_loading:
      engagementType === "EMPLOYEE_CASUAL" ? 0 : data.eligible_to_receive_leave_loading ? 1 : 0,
    has_student_startup_loan: data.has_student_startup_loan ? 1 : 0,
    has_trade_support_loan_debt: data.has_trade_support_loan_debt ? 1 : 0,
    withholding_additional_amount_cents:
      data.withholding_additional_amount_cents === undefined ? null : data.withholding_additional_amount_cents,
    withholding_variation_percent: null,
  });

  const saved = await getWorkerTaxDeclaration(db, worker.worker_id);
  const decrypted = saved?.tfn_encrypted ? await decryptString(saved.tfn_encrypted).catch(() => null) : null;
  return NextResponse.json({
    ok: true,
    declaration: {
      ...saved,
      tfn: decrypted ? `***${saved?.tfn_last4 || ""}` : null,
      tfn_encrypted: null,
    },
  });
}
