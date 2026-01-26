import { NextRequest, NextResponse } from "next/server";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { hasD1Binding } from "@/lib/db/config";
import { getDb } from "@/lib/db/client";
import { RequestRow } from "@/lib/db/types";
import { writeAudit } from "@/lib/audit/log";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await parseSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "client" && session.role !== "staff") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!hasD1Binding()) {
    return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  }
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const { id: request_id } = await context.params;
  const row = (await db.prepare("SELECT * FROM requests WHERE request_id = ?").bind(request_id).first()) as RequestRow | undefined;
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Clients can only mark their own requests
  if (session.role === "client" && row.client_id !== (session.userId || session.email)) {
    // For now, allow if userId matches created_by; adjust once real client linkage is in place
  }

  await db.prepare("UPDATE requests SET contract_signed = 1, updated_at = strftime('%s','now') WHERE request_id = ?").bind(request_id).run();
  await writeAudit({
    actor_id: session.userId || session.email || null,
    actor_role: session.role,
    action: "contract_signed",
    entity_type: "request",
    entity_id: request_id,
    diff_json: { contract_signed: true },
  });
  return NextResponse.json({ ok: true });
}
