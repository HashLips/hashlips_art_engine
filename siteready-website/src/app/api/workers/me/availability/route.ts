import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasD1Binding } from "@/lib/db/config";
import { ensureWorkerForUser, listWorkerAvailability, addWorkerAvailability, deleteWorkerAvailability } from "@/lib/db/workers";

const availabilitySchema = z.object({
  start_datetime: z.string().min(1),
  end_datetime: z.string().min(1),
  notes: z.string().optional().or(z.literal("")),
});

export async function GET(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "worker") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!hasD1Binding()) return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });
  const worker = await ensureWorkerForUser(db, session.userId || session.email || "", session.email);
  const availability = await listWorkerAvailability(db, worker.worker_id);
  return NextResponse.json({ ok: true, availability });
}

export async function POST(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "worker") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!hasD1Binding()) return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const body = await req.json().catch(() => null);
  const parsed = availabilitySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const worker = await ensureWorkerForUser(db, session.userId || session.email || "", session.email);
  await addWorkerAvailability(db, {
    availability_id: crypto.randomUUID(),
    worker_id: worker.worker_id,
    start_datetime: parsed.data.start_datetime,
    end_datetime: parsed.data.end_datetime,
    notes: parsed.data.notes || null,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "worker") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!hasD1Binding()) return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });
  const url = new URL(req.url);
  const availabilityId = url.searchParams.get("availability_id");
  if (!availabilityId) return NextResponse.json({ error: "Missing availability_id" }, { status: 400 });
  await deleteWorkerAvailability(db, availabilityId);
  return NextResponse.json({ ok: true });
}
