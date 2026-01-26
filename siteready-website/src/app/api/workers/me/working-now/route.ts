import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasD1Binding } from "@/lib/db/config";
import { ensureWorkerForUser, getWorkerByUser, updateWorkerProfile } from "@/lib/db/workers";

const workingNowSchema = z.object({
  status: z.enum(["available_now", "working_until", "working_pause", "working_offers_on"]),
  end_date: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  availability_from_date: z.string().optional().or(z.literal("")),
  availability_until_date: z.string().optional().or(z.literal("")),
  holiday_start_date: z.string().optional().or(z.literal("")),
  holiday_end_date: z.string().optional().or(z.literal("")),
});

export async function GET(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "worker") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!hasD1Binding()) return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const worker = await ensureWorkerForUser(db, session.userId || session.email || "", session.email);
  const row = await getWorkerByUser(db, worker.user_id || "");
  return NextResponse.json({
    ok: true,
    data: {
      status: row?.working_now_status || "",
      end_date: row?.working_now_end_date || "",
      notes: row?.working_now_notes || "",
      availability_from_date: row?.availability_from_date || "",
      availability_until_date: row?.availability_until_date || "",
      holiday_start_date: row?.holiday_start_date || "",
      holiday_end_date: row?.holiday_end_date || "",
    },
  });
}

export async function PUT(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "worker") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!hasD1Binding()) return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const body = await req.json().catch(() => null);
  const parsed = workingNowSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const worker = await ensureWorkerForUser(db, session.userId || session.email || "", session.email);
  await updateWorkerProfile(db, worker.worker_id, {
    working_now_status: parsed.data.status,
    working_now_end_date: parsed.data.end_date || null,
    working_now_notes: parsed.data.notes || null,
    availability_from_date: parsed.data.availability_from_date || null,
    availability_until_date: parsed.data.availability_until_date || null,
    holiday_start_date: parsed.data.holiday_start_date || null,
    holiday_end_date: parsed.data.holiday_end_date || null,
  });

  return NextResponse.json({ ok: true });
}
