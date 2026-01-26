import { NextRequest, NextResponse } from "next/server";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasD1Binding } from "@/lib/db/config";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

  const request = await db.prepare("SELECT * FROM requests WHERE request_id = ? LIMIT 1").bind(id).first();
  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const requiredTicketsRaw = (request as { required_tickets?: string | null }).required_tickets;
  let required: string[] = [];
  if (typeof requiredTicketsRaw === "string") {
    try {
      required = JSON.parse(requiredTicketsRaw) as string[];
    } catch {
      required = [];
    }
  } else {
    required = ((request as { required_tickets?: string[] | null }).required_tickets ?? []) as string[];
  }
  const minYears = (request as { min_years_experience?: number | null }).min_years_experience ?? 0;

  const workerRes = await db.prepare("SELECT * FROM workers ORDER BY created_at DESC").all();
  const ticketRes = await db.prepare("SELECT * FROM worker_tickets WHERE verification_status = 'verified'").all();
  const workers = (workerRes?.results as Array<Record<string, unknown>>) ?? [];
  const tickets = (ticketRes?.results as Array<Record<string, unknown>>) ?? [];
  const byWorker = new Map<string, Array<Record<string, unknown>>>();
  for (const t of tickets) {
    const workerId = t.worker_id as string;
    if (!byWorker.has(workerId)) byWorker.set(workerId, []);
    byWorker.get(workerId)!.push(t);
  }

  const sortWeight = (status: string) => {
    if (status === "working_offers_on") return 1;
    if (status === "working_until") return 2;
    if (status === "working_pause") return 3;
    return 0;
  };

  const matches = workers
    .map((w) => {
      const workerTickets = byWorker.get(w.worker_id as string) ?? [];
      const types = workerTickets.map((t) => t.type);
      const ticketYears = workerTickets.map((t) => Number(t.years_experience ?? 0));
      const maxTicketYears = ticketYears.length ? Math.max(...ticketYears) : 0;
      const baseYears = Number(w.years_experience ?? 0);
      const yearsOk = Math.max(baseYears, maxTicketYears) >= minYears;
      const ticketsOk = required.length === 0 || required.every((reqTicket: string) => types.includes(reqTicket));
      const workingStatus = (w.working_now_status as string) || "";
      return {
        worker_id: w.worker_id,
        company_number: w.company_number,
        role_id: w.role_id,
        years_experience: baseYears,
        working_now_status: workingStatus,
        availability_from_date: w.availability_from_date || null,
        availability_until_date: w.availability_until_date || null,
        holiday_start_date: w.holiday_start_date || null,
        holiday_end_date: w.holiday_end_date || null,
        tickets: workerTickets.map((t) => ({
          type: t.type,
          verification_status: t.verification_status ?? "pending",
        })),
        matches: yearsOk && ticketsOk,
      };
    })
    .filter((w) => w.matches)
    .filter((w) => w.working_now_status !== "working_pause")
    .sort((a, b) => sortWeight(a.working_now_status) - sortWeight(b.working_now_status));

  return NextResponse.json({ ok: true, candidates: matches });
}
