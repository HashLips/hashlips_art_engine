import { NextRequest, NextResponse } from "next/server";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasD1Binding } from "@/lib/db/config";
import { ensureClientForUser } from "@/lib/db/clients";

export async function GET(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "client") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!hasD1Binding()) return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const client = await ensureClientForUser(db, session.userId || session.email || "");
  const res = await db
    .prepare(
      `SELECT a.assignment_id, a.request_id, a.status as assignment_status,
              r.role_id, r.headcount, r.review_status,
              w.worker_id, w.company_number, w.years_experience,
              w.working_now_status, w.availability_from_date, w.availability_until_date,
              w.holiday_start_date, w.holiday_end_date
         FROM assignments a
         JOIN requests r ON r.request_id = a.request_id
         JOIN workers w ON w.worker_id = a.worker_id
        WHERE a.client_id = ? AND a.status = 'proposed'
        ORDER BY a.created_at DESC`,
    )
    .bind(client.client_id)
    .all();

  const rows = (res?.results as Array<Record<string, unknown>>) ?? [];
  const workerIds = Array.from(new Set(rows.map((row) => row.worker_id as string).filter(Boolean)));
  const ticketsByWorker = new Map<string, Array<Record<string, unknown>>>();
  if (workerIds.length) {
    const placeholders = workerIds.map(() => "?").join(", ");
    const ticketRes = await db
      .prepare(`SELECT worker_id, type, verification_status FROM worker_tickets WHERE worker_id IN (${placeholders})`)
      .bind(...workerIds)
      .all();
    const tickets = (ticketRes?.results as Array<Record<string, unknown>>) ?? [];
    for (const t of tickets) {
      const workerId = t.worker_id as string;
      if (!ticketsByWorker.has(workerId)) ticketsByWorker.set(workerId, []);
      ticketsByWorker.get(workerId)!.push(t);
    }
  }

  const grouped = new Map<string, { request_id: string; role_id: string; headcount: number; review_status?: string | null; candidates: Array<Record<string, unknown>> }>();
  for (const row of rows) {
    const requestId = row.request_id as string;
    if (!grouped.has(requestId)) {
      grouped.set(requestId, {
        request_id: requestId,
        role_id: (row.role_id as string) || "",
        headcount: Number(row.headcount ?? 0),
        review_status: (row.review_status as string) || null,
      candidates: [],
      });
    }
    grouped.get(requestId)!.candidates.push({
      assignment_id: row.assignment_id,
      worker_id: row.worker_id,
      company_number: row.company_number,
      years_experience: row.years_experience ?? 0,
      working_now_status: row.working_now_status ?? null,
      availability_from_date: row.availability_from_date ?? null,
      availability_until_date: row.availability_until_date ?? null,
      holiday_start_date: row.holiday_start_date ?? null,
      holiday_end_date: row.holiday_end_date ?? null,
      tickets: (ticketsByWorker.get(row.worker_id as string) || []).map((t) => ({
        type: t.type,
        verification_status: t.verification_status ?? "pending",
      })),
    });
  }

  return NextResponse.json({ ok: true, requests: Array.from(grouped.values()) });
}
