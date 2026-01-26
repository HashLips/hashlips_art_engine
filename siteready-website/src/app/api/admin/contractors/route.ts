import { NextRequest, NextResponse } from "next/server";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasD1Binding } from "@/lib/db/config";

function isAdmin(session: Awaited<ReturnType<typeof parseSessionFromRequest>>) {
  return (
    session?.adminLevel === "admin" ||
    session?.adminLevel === "super_admin" ||
    session?.adminLevel === "payroll_admin"
  );
}

export async function GET(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!hasD1Binding()) return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const res = await db
    .prepare(
      `SELECT
         w.worker_id,
         w.first_name,
         w.last_name,
         w.email,
         c.company_name,
         c.abn,
         c.contractor_pay_rate_cents,
         c.updated_at
       FROM workers w
       LEFT JOIN contractor_company c ON c.worker_id = w.worker_id
       WHERE w.engagement_type = 'CONTRACTOR_ABN'
       ORDER BY w.updated_at DESC`,
    )
    .all();

  const rows = (res?.results as Array<Record<string, unknown>>) ?? [];
  const contractors = rows.map((row) => {
    const missingPayRate = row.contractor_pay_rate_cents == null;
    const missingDetails = !row.company_name || !row.abn;
    return {
      worker_id: row.worker_id,
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email,
      company_name: row.company_name,
      abn: row.abn,
      contractor_pay_rate_cents: row.contractor_pay_rate_cents,
      updated_at: row.updated_at,
      missing_pay_rate: missingPayRate,
      missing_company_details: missingDetails,
    };
  });

  return NextResponse.json({ ok: true, contractors });
}
