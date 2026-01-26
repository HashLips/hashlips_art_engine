import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasD1Binding } from "@/lib/db/config";
import { ensureWorkerForUser, updateWorkerTicketRenewal } from "@/lib/db/workers";

const renewalSchema = z.object({
  ticket_id: z.string().min(1),
  renewal_status: z.enum(["active", "will_not_renew"]),
});

export async function POST(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "worker") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!hasD1Binding()) return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const body = await req.json().catch(() => null);
  const parsed = renewalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const worker = await ensureWorkerForUser(db, session.userId || session.email || "", session.email);
  await updateWorkerTicketRenewal(db, worker.worker_id, parsed.data.ticket_id, parsed.data.renewal_status);

  return NextResponse.json({ ok: true });
}
