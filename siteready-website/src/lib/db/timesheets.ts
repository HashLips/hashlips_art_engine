import { D1DatabaseLike } from "./client";
import { TimesheetHeaderRow, TimesheetLineRow } from "./types";

async function ensureTimesheetTables(db: D1DatabaseLike) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS timesheets (
        timesheet_id TEXT PRIMARY KEY,
        worker_id TEXT NOT NULL,
        client_id TEXT NOT NULL,
        assignment_id TEXT,
        period_start TEXT NOT NULL,
        period_end TEXT NOT NULL,
        status TEXT NOT NULL,
        submitted_at TEXT,
        approved_at TEXT,
        approved_by TEXT,
        approval_comment TEXT,
        xero_timesheet_id TEXT,
        xero_synced_at TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )`,
    )
    .run();
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS timesheet_lines (
        line_id TEXT PRIMARY KEY,
        timesheet_id TEXT NOT NULL,
        work_date TEXT NOT NULL,
        hours_decimal REAL NOT NULL,
        earnings_code TEXT NOT NULL,
        site_id TEXT,
        job_id TEXT,
        shift_id TEXT,
        notes TEXT
      )`,
    )
    .run();
}

export async function createTimesheet(
  db: D1DatabaseLike,
  header: TimesheetHeaderRow,
  lines: TimesheetLineRow[],
) {
  await ensureTimesheetTables(db);
  await db
    .prepare(
      `INSERT INTO timesheets (timesheet_id, worker_id, client_id, assignment_id, period_start, period_end, status, submitted_at, approved_at, approved_by, approval_comment, xero_timesheet_id, xero_synced_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      header.timesheet_id,
      header.worker_id,
      header.client_id,
      header.assignment_id ?? null,
      header.period_start,
      header.period_end,
      header.status,
      header.submitted_at ?? null,
      header.approved_at ?? null,
      header.approved_by ?? null,
      header.approval_comment ?? null,
      header.xero_timesheet_id ?? null,
      header.xero_synced_at ?? null,
      header.created_at,
      header.updated_at,
    )
    .run();

  for (const line of lines) {
    await db
      .prepare(
        `INSERT INTO timesheet_lines (line_id, timesheet_id, work_date, hours_decimal, earnings_code, site_id, job_id, shift_id, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        line.line_id,
        line.timesheet_id,
        line.work_date,
        line.hours_decimal,
        line.earnings_code,
        line.site_id ?? null,
        line.job_id ?? null,
        line.shift_id ?? null,
        line.notes ?? null,
      )
      .run();
  }
}

export async function updateTimesheetStatus(
  db: D1DatabaseLike,
  timesheetId: string,
  status: TimesheetHeaderRow["status"],
  fields: Partial<TimesheetHeaderRow> = {},
) {
  await ensureTimesheetTables(db);
  const sets: string[] = ["status = ?"];
  const values: Array<unknown> = [status];
  const assign = (key: keyof TimesheetHeaderRow, value: unknown) => {
    sets.push(`${key} = ?`);
    values.push(value ?? null);
  };
  if ("submitted_at" in fields) assign("submitted_at", fields.submitted_at);
  if ("approved_at" in fields) assign("approved_at", fields.approved_at);
  if ("approved_by" in fields) assign("approved_by", fields.approved_by);
  if ("approval_comment" in fields) assign("approval_comment", fields.approval_comment);
  if ("xero_timesheet_id" in fields) assign("xero_timesheet_id", fields.xero_timesheet_id);
  if ("xero_synced_at" in fields) assign("xero_synced_at", fields.xero_synced_at);
  sets.push("updated_at = ?");
  values.push(Date.now());
  values.push(timesheetId);
  await db.prepare(`UPDATE timesheets SET ${sets.join(", ")} WHERE timesheet_id = ?`).bind(...values).run();
}

export async function listTimesheetsByWorker(db: D1DatabaseLike, workerId: string): Promise<TimesheetHeaderRow[]> {
  await ensureTimesheetTables(db);
  const res = await db.prepare("SELECT * FROM timesheets WHERE worker_id = ? ORDER BY created_at DESC").bind(workerId).all();
  return (res?.results as TimesheetHeaderRow[]) ?? [];
}

export async function listTimesheetsByClient(db: D1DatabaseLike, clientId: string): Promise<TimesheetHeaderRow[]> {
  await ensureTimesheetTables(db);
  const res = await db.prepare("SELECT * FROM timesheets WHERE client_id = ? ORDER BY created_at DESC").bind(clientId).all();
  return (res?.results as TimesheetHeaderRow[]) ?? [];
}

export async function getTimesheetLines(db: D1DatabaseLike, timesheetId: string): Promise<TimesheetLineRow[]> {
  await ensureTimesheetTables(db);
  const res = await db.prepare("SELECT * FROM timesheet_lines WHERE timesheet_id = ? ORDER BY work_date ASC").bind(timesheetId).all();
  return (res?.results as TimesheetLineRow[]) ?? [];
}

export async function getTimesheetHeader(db: D1DatabaseLike, timesheetId: string): Promise<TimesheetHeaderRow | null> {
  await ensureTimesheetTables(db);
  const row = (await db.prepare("SELECT * FROM timesheets WHERE timesheet_id = ? LIMIT 1").bind(timesheetId).first()) as
    | TimesheetHeaderRow
    | undefined;
  return row ?? null;
}
