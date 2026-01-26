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
  if (!hasD1Binding()) {
    return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  }
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const res = await db
    .prepare(
      `SELECT clients.*, users.email AS user_email,
        COALESCE(rc.request_count, 0) AS request_count,
        ls.latest_status AS latest_status
       FROM clients
       LEFT JOIN users ON clients.user_id = users.user_id
       LEFT JOIN (
         SELECT client_id, COUNT(*) AS request_count
         FROM requests
         GROUP BY client_id
       ) rc ON rc.client_id = clients.client_id
       LEFT JOIN (
         SELECT r.client_id, COALESCE(r.review_status, r.status) AS latest_status
         FROM requests r
         INNER JOIN (
           SELECT client_id, MAX(created_at) AS max_created
           FROM requests
           GROUP BY client_id
         ) lm ON lm.client_id = r.client_id AND lm.max_created = r.created_at
       ) ls ON ls.client_id = clients.client_id
       ORDER BY clients.created_at DESC`,
    )
    .all();
  const rows = (res?.results as Array<Record<string, unknown>>) ?? [];
  return NextResponse.json({ ok: true, clients: rows });
}
