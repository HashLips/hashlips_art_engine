import { NextRequest, NextResponse } from "next/server";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasD1Binding } from "@/lib/db/config";

export async function GET(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.adminLevel !== "admin" && session.adminLevel !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!hasD1Binding()) return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const res = await db
    .prepare(
      `SELECT w.worker_id, w.name, w.email,
              t.tax_residency_status, t.claim_tax_free_threshold, t.tfn_declaration_signed
       FROM workers w
       LEFT JOIN worker_tax_declarations t ON t.worker_id = w.worker_id
       ORDER BY w.created_at DESC`,
    )
    .all();

  const rows = (res?.results as Array<Record<string, unknown>>) || [];
  const summaries = rows.map((row) => {
    const signed = row.tfn_declaration_signed === 1;
    const residency = (row.tax_residency_status as string | null) || null;
    const threshold = row.claim_tax_free_threshold === 1;
    const whmThreshold = residency === "WORKING_HOLIDAY_MAKER" && threshold;
    return {
      worker_id: row.worker_id,
      name: row.name,
      email: row.email,
      signed,
      whmThreshold,
      missing: !residency || !signed,
    };
  });

  return NextResponse.json({ ok: true, summaries });
}
