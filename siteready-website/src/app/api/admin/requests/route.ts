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
      `SELECT requests.*, clients.org_name, clients.contact_name, clients.contact_email
       FROM requests
       LEFT JOIN clients ON requests.client_id = clients.client_id
       ORDER BY requests.created_at DESC`,
    )
    .all();
  const rows = (res?.results as Array<Record<string, unknown>>) ?? [];
  const parsed = rows.map((r) => ({
    ...r,
    required_tickets: typeof r.required_tickets === "string" ? JSON.parse(r.required_tickets as string) : r.required_tickets,
    ot_options: typeof r.ot_options === "string" ? JSON.parse(r.ot_options as string) : r.ot_options,
    attachment_list: typeof r.attachment_list === "string" ? JSON.parse(r.attachment_list as string) : r.attachment_list,
  }));
  return NextResponse.json({ ok: true, requests: parsed });
}
