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

  const url = new URL(req.url);
  const type = url.searchParams.get("type") || "bills";
  if (type !== "bills") {
    return NextResponse.json({ ok: true, failures: [] });
  }

  const res = await db
    .prepare(
      `SELECT
         x.timesheet_id,
         x.attempts,
         x.last_synced_at,
         x.sync_error,
         t.worker_id,
         t.period_start,
         t.period_end,
         t.approved_at,
         w.first_name,
         w.last_name,
         SUM(l.hours_decimal) AS total_hours
       FROM xero_transaction_map x
       JOIN timesheets t ON t.timesheet_id = x.timesheet_id
       JOIN workers w ON w.worker_id = t.worker_id
       LEFT JOIN timesheet_lines l ON l.timesheet_id = t.timesheet_id
       WHERE x.sync_state = 'failed'
       GROUP BY x.timesheet_id
       ORDER BY x.last_synced_at ASC`,
    )
    .all();

  const failures = (res?.results as Array<Record<string, unknown>>) ?? [];
  return NextResponse.json({ ok: true, failures });
}
