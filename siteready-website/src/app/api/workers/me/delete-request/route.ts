import { NextRequest, NextResponse } from "next/server";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasD1Binding } from "@/lib/db/config";
import { ensureWorkerForUser, updateWorkerProfile } from "@/lib/db/workers";

export async function POST(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "worker") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!hasD1Binding()) return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const body = await req.json().catch(() => ({} as { reason?: string }));
  const reason = typeof body?.reason === "string" ? body.reason.trim() : "";

  const worker = await ensureWorkerForUser(db, session.userId || session.email || "", session.email);
  await updateWorkerProfile(db, worker.worker_id, {
    delete_requested: 1,
    delete_requested_at: new Date().toISOString(),
    delete_request_reason: reason || null,
  });

  return NextResponse.json({ ok: true });
}
