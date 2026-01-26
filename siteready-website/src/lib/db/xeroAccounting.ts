import { D1DatabaseLike } from "./client";
import { XeroAccountingSettingsRow, XeroContactMapRow, XeroTransactionMapRow } from "./types";

async function ensureXeroAccountingTables(db: D1DatabaseLike) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS xero_contact_map (
        id TEXT PRIMARY KEY,
        entity_type TEXT NOT NULL,
        local_entity_id TEXT NOT NULL,
        xero_contact_id TEXT NOT NULL,
        abn TEXT,
        last_synced_at TEXT,
        sync_status TEXT,
        sync_error TEXT,
        UNIQUE(entity_type, local_entity_id)
      )`,
    )
    .run();
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS xero_transaction_map (
        id TEXT PRIMARY KEY,
        timesheet_id TEXT NOT NULL UNIQUE,
        xero_payroll_timesheet_id TEXT,
        xero_bill_invoice_id TEXT,
        bill_idempotency_key TEXT,
        sync_state TEXT,
        attempts INTEGER DEFAULT 0,
        last_synced_at TEXT,
        sync_status TEXT,
        sync_error TEXT
      )`,
    )
    .run();
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS xero_accounting_settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        default_purchases_account_code TEXT NOT NULL,
        bill_status_mode TEXT NOT NULL DEFAULT 'DRAFT'
      )`,
    )
    .run();
  await db
    .prepare(
      `INSERT INTO xero_accounting_settings (id, default_purchases_account_code, bill_status_mode)
       SELECT 1, '000', 'DRAFT'
       WHERE NOT EXISTS (SELECT 1 FROM xero_accounting_settings WHERE id = 1)`,
    )
    .run();
}

export async function getXeroAccountingSettings(db: D1DatabaseLike): Promise<XeroAccountingSettingsRow | null> {
  await ensureXeroAccountingTables(db);
  const row = (await db.prepare("SELECT * FROM xero_accounting_settings WHERE id = 1").first()) as
    | XeroAccountingSettingsRow
    | undefined;
  return row ?? null;
}

export async function upsertXeroContactMap(db: D1DatabaseLike, row: XeroContactMapRow) {
  await ensureXeroAccountingTables(db);
  await db
    .prepare(
      `INSERT INTO xero_contact_map (id, entity_type, local_entity_id, xero_contact_id, abn, last_synced_at, sync_status, sync_error)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(entity_type, local_entity_id) DO UPDATE SET
         xero_contact_id=excluded.xero_contact_id,
         abn=excluded.abn,
         last_synced_at=excluded.last_synced_at,
         sync_status=excluded.sync_status,
         sync_error=excluded.sync_error`,
    )
    .bind(
      row.id,
      row.entity_type,
      row.local_entity_id,
      row.xero_contact_id,
      row.abn ?? null,
      row.last_synced_at ?? null,
      row.sync_status ?? null,
      row.sync_error ?? null,
    )
    .run();
}

export async function getXeroContactMap(
  db: D1DatabaseLike,
  entityType: XeroContactMapRow["entity_type"],
  localEntityId: string,
): Promise<XeroContactMapRow | null> {
  await ensureXeroAccountingTables(db);
  const row = (await db
    .prepare("SELECT * FROM xero_contact_map WHERE entity_type = ? AND local_entity_id = ? LIMIT 1")
    .bind(entityType, localEntityId)
    .first()) as XeroContactMapRow | undefined;
  return row ?? null;
}

export async function upsertXeroTransactionMap(db: D1DatabaseLike, row: XeroTransactionMapRow) {
  await ensureXeroAccountingTables(db);
  await db
    .prepare(
      `INSERT INTO xero_transaction_map (
        id, timesheet_id, xero_payroll_timesheet_id, xero_bill_invoice_id, bill_idempotency_key, sync_state, attempts,
        last_synced_at, sync_status, sync_error
      )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(timesheet_id) DO UPDATE SET
         xero_payroll_timesheet_id=excluded.xero_payroll_timesheet_id,
         xero_bill_invoice_id=excluded.xero_bill_invoice_id,
         bill_idempotency_key=excluded.bill_idempotency_key,
         sync_state=excluded.sync_state,
         attempts=excluded.attempts,
         last_synced_at=excluded.last_synced_at,
         sync_status=excluded.sync_status,
         sync_error=excluded.sync_error`,
    )
    .bind(
      row.id,
      row.timesheet_id,
      row.xero_payroll_timesheet_id ?? null,
      row.xero_bill_invoice_id ?? null,
      row.bill_idempotency_key ?? null,
      row.sync_state ?? null,
      row.attempts ?? null,
      row.last_synced_at ?? null,
      row.sync_status ?? null,
      row.sync_error ?? null,
    )
    .run();
}

export async function getXeroTransactionMapByTimesheet(
  db: D1DatabaseLike,
  timesheetId: string,
): Promise<XeroTransactionMapRow | null> {
  await ensureXeroAccountingTables(db);
  const row = (await db
    .prepare("SELECT * FROM xero_transaction_map WHERE timesheet_id = ? LIMIT 1")
    .bind(timesheetId)
    .first()) as XeroTransactionMapRow | undefined;
  return row ?? null;
}

export async function reserveBillSync(
  db: D1DatabaseLike,
  timesheetId: string,
  tenantId: string,
): Promise<
  | { state: "creating"; bill_idempotency_key: string }
  | { state: "synced"; existingBillId: string }
  | { state: "in_progress" }
  | { state: "retry"; bill_idempotency_key: string }
> {
  await ensureXeroAccountingTables(db);
  const key = `bill:${tenantId}:${timesheetId}`;
  const now = new Date();
  const nowIso = now.toISOString();
  const staleCreatingMs = 15 * 60 * 1000;
  const insert = (await db
    .prepare(
      `INSERT INTO xero_transaction_map (
        id, timesheet_id, bill_idempotency_key, sync_state, sync_status, attempts, last_synced_at, sync_error
      ) VALUES (?, ?, ?, 'creating', 'creating', 1, ?, NULL)
      ON CONFLICT(timesheet_id) DO NOTHING`,
    )
    .bind(crypto.randomUUID(), timesheetId, key, nowIso)
    .run()) as { changes?: number };

  if (insert.changes && insert.changes > 0) {
    return { state: "creating", bill_idempotency_key: key };
  }

  const existing = await getXeroTransactionMapByTimesheet(db, timesheetId);
  if (existing?.xero_bill_invoice_id && existing.sync_state === "synced") {
    return { state: "synced", existingBillId: existing.xero_bill_invoice_id };
  }
  if (existing?.sync_state === "creating" && !existing.xero_bill_invoice_id) {
    const lastMs = existing.last_synced_at ? Date.parse(existing.last_synced_at) : 0;
    if (lastMs && now.getTime() - lastMs < staleCreatingMs) {
      return { state: "in_progress" };
    }
    const storedKey = existing.bill_idempotency_key || key;
    const prevLast = existing.last_synced_at ?? null;
    const claim = (await db
      .prepare(
        `UPDATE xero_transaction_map
         SET sync_state='creating',
             bill_idempotency_key=COALESCE(bill_idempotency_key, ?),
             attempts=COALESCE(attempts,0)+1,
             last_synced_at=?,
             sync_status='creating',
             sync_error=NULL
         WHERE timesheet_id = ? AND sync_state='creating' AND last_synced_at IS ?`,
      )
      .bind(storedKey, nowIso, timesheetId, prevLast)
      .run()) as { changes?: number };
    if (claim.changes && claim.changes > 0) {
      return { state: "retry", bill_idempotency_key: storedKey };
    }
    return { state: "in_progress" };
  }
  if (existing?.sync_state === "failed") {
    const storedKey = existing.bill_idempotency_key || key;
    const claim = (await db
      .prepare(
        `UPDATE xero_transaction_map
         SET sync_state='creating',
             bill_idempotency_key=COALESCE(bill_idempotency_key, ?),
             attempts=COALESCE(attempts,0)+1,
             last_synced_at=?,
             sync_status='creating',
             sync_error=NULL
         WHERE timesheet_id = ? AND sync_state='failed'`,
      )
      .bind(storedKey, nowIso, timesheetId)
      .run()) as { changes?: number };
    if (claim.changes && claim.changes > 0) {
      return { state: "retry", bill_idempotency_key: storedKey };
    }
    return { state: "in_progress" };
  }

  return { state: "retry", bill_idempotency_key: existing?.bill_idempotency_key || key };
}

export async function markBillSynced(db: D1DatabaseLike, timesheetId: string, billId: string) {
  await ensureXeroAccountingTables(db);
  await db
    .prepare(
      `UPDATE xero_transaction_map
       SET xero_bill_invoice_id = ?, sync_state = 'synced', sync_status = 'synced', sync_error = NULL, last_synced_at = ?
       WHERE timesheet_id = ?`,
    )
    .bind(billId, new Date().toISOString(), timesheetId)
    .run();
}

export async function markBillFailed(db: D1DatabaseLike, timesheetId: string, error: string | null) {
  await ensureXeroAccountingTables(db);
  await db
    .prepare(
      `UPDATE xero_transaction_map
       SET sync_state = 'failed', sync_status = 'failed', sync_error = ?, last_synced_at = ?
       WHERE timesheet_id = ?`,
    )
    .bind(error, new Date().toISOString(), timesheetId)
    .run();
}
