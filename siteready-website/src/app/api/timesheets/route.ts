import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasD1Binding } from "@/lib/db/config";
import { createTimesheet, listTimesheetsByClient, listTimesheetsByWorker } from "@/lib/db/timesheets";
import { ensureWorkerForUser, getWorkerById } from "@/lib/db/workers";
import { ensureClientForUser } from "@/lib/db/clients";
import { hasAccepted } from "@/lib/legal/acceptance";

const lineSchema = z.object({
  work_date: z.string().min(1),
  hours_decimal: z.number().nonnegative(),
  earnings_code: z.string().min(1).default("ORDINARY"),
  notes: z.string().optional().or(z.literal("")),
});

const timesheetSchema = z.object({
  client_id: z.string().min(1),
  assignment_id: z.string().optional().or(z.literal("")),
  period_start: z.string().min(1),
  period_end: z.string().min(1),
  submit: z.boolean().optional(),
  lines: z.array(lineSchema).min(1),
});

export async function GET(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasD1Binding()) return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  if (session.role === "worker") {
    const worker = await ensureWorkerForUser(db, session.userId || session.email || "", session.email);
    const rows = await listTimesheetsByWorker(db, worker.worker_id);
    return NextResponse.json({ ok: true, timesheets: rows });
  }
  if (session.role === "client") {
    const client = await ensureClientForUser(db, session.userId || "", session.email);
    const userId = session.userId || session.email;
    if (userId) {
      const accepted = await hasAccepted(db, userId, "CLIENT_CONFIDENTIALITY_TERMS");
      if (!accepted) {
        return NextResponse.json(
          { error: "Legal acceptance required", code: "NEEDS_LEGAL_ACCEPTANCE", document: "CLIENT_CONFIDENTIALITY_TERMS" },
          { status: 403 },
        );
      }
    }
    const rows = await listTimesheetsByClient(db, client.client_id);
    const workerIds = Array.from(new Set(rows.map((row) => row.worker_id)));
    const workers = await Promise.all(workerIds.map((id) => getWorkerById(db, id)));
    const workerMap = new Map(
      workers
        .filter(Boolean)
        .map((worker) => [
          (worker as { worker_id: string }).worker_id,
          {
            worker_id: (worker as { worker_id: string }).worker_id,
            name: (worker as { name?: string | null }).name,
            first_name: (worker as { first_name?: string | null }).first_name,
            last_name: (worker as { last_name?: string | null }).last_name,
            role_id: (worker as { role_id?: string | null }).role_id,
          },
        ]),
    );
    return NextResponse.json({
      ok: true,
      timesheets: rows,
      workers: Object.fromEntries(workerMap),
    });
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "worker") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!hasD1Binding()) return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const body = await req.json().catch(() => null);
  const parsed = timesheetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const worker = await ensureWorkerForUser(db, session.userId || session.email || "", session.email);
  if (parsed.data.submit) {
    const userId = session.userId || session.email;
    if (userId) {
      const accepted = await hasAccepted(db, userId, "PLATFORM_TERMS");
      if (!accepted) {
        return NextResponse.json(
          { error: "Legal acceptance required", code: "NEEDS_LEGAL_ACCEPTANCE", document: "PLATFORM_TERMS" },
          { status: 403 },
        );
      }
    }
  }
  const timesheetId = crypto.randomUUID();
  const now = Date.now();
  const status = parsed.data.submit ? "submitted" : "draft";
  await createTimesheet(
    db,
    {
      timesheet_id: timesheetId,
      worker_id: worker.worker_id,
      client_id: parsed.data.client_id,
      assignment_id: parsed.data.assignment_id || null,
      period_start: parsed.data.period_start,
      period_end: parsed.data.period_end,
      status,
      submitted_at: parsed.data.submit ? new Date().toISOString() : undefined,
      approved_at: undefined,
      approved_by: undefined,
      approval_comment: undefined,
      xero_timesheet_id: undefined,
      xero_synced_at: undefined,
      created_at: now,
      updated_at: now,
    },
    parsed.data.lines.map((line) => ({
      line_id: crypto.randomUUID(),
      timesheet_id: timesheetId,
      work_date: line.work_date,
      hours_decimal: line.hours_decimal,
      earnings_code: line.earnings_code || "ORDINARY",
      site_id: null,
      job_id: null,
      shift_id: null,
      notes: line.notes || null,
    })),
  );

  return NextResponse.json({ ok: true, timesheet_id: timesheetId });
}
