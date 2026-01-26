import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasD1Binding } from "@/lib/db/config";
import { getWorkerById, listWorkerTickets, updateWorkerProfile } from "@/lib/db/workers";
import { decryptString } from "@/lib/security/encryption";

const updateSchema = z.object({
  verified_status: z.enum(["unverified", "pending", "verified"]).optional(),
  id_verification_status: z.enum(["pending", "verified", "rejected", "needs_clearer", "out_of_date"]).optional(),
  id_verification_notes: z.string().optional().or(z.literal("")),
  license_verification_status: z.enum(["pending", "verified", "rejected", "needs_clearer", "out_of_date"]).optional(),
  license_verification_notes: z.string().optional().or(z.literal("")),
  super_choice: z.string().optional(),
  super_status: z.string().optional(),
  super_fund_name: z.string().optional(),
  super_product_name: z.string().optional(),
  super_fund_type: z.string().optional(),
  super_abn: z.string().optional(),
  super_usi: z.string().optional(),
  super_member_number: z.string().optional(),
  super_contribution_restrictions: z.coerce.number().int().optional(),
  smsf_abn: z.string().optional(),
  smsf_bank_bsb: z.string().optional(),
  smsf_bank_account: z.string().optional(),
  smsf_bank_account_name: z.string().optional(),
  smsf_esa: z.string().optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.adminLevel !== "admin" && session.adminLevel !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!hasD1Binding()) {
    return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  }
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const worker = await getWorkerById(db, id);
  if (!worker) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const tickets = await listWorkerTickets(db, id);
  let decryptedSuper = null;
  let encryptionAvailable = true;
  try {
    decryptedSuper = await decryptString(worker.super_member_number ?? null);
  } catch {
    encryptionAvailable = false;
  }
  const payload = {
    ...worker,
    super_member_number: decryptedSuper,
    work_experience: typeof worker.work_experience_json === "string" ? JSON.parse(worker.work_experience_json) : [],
    work_media: typeof worker.work_media_json === "string" ? JSON.parse(worker.work_media_json) : [],
    encryptionAvailable,
  };
  return NextResponse.json({ ok: true, worker: payload, tickets });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.adminLevel !== "admin" && session.adminLevel !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!hasD1Binding()) {
    return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  }
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }
  await updateWorkerProfile(db, id, parsed.data);
  return NextResponse.json({ ok: true });
}
