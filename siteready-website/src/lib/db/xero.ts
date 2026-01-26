import { D1DatabaseLike } from "./client";
import { XeroConnectionRow, XeroEmployeeMapRow, XeroSettingsRow } from "./types";

async function ensureXeroTables(db: D1DatabaseLike) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS xero_connections (
        connection_id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        access_token TEXT NOT NULL,
        refresh_token_encrypted TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        scope TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )`,
    )
    .run();
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS xero_employee_map (
        worker_id TEXT PRIMARY KEY,
        xero_employee_id TEXT NOT NULL,
        payroll_calendar_id TEXT,
        ordinary_earnings_rate_id TEXT,
        super_fund_id TEXT,
        last_synced_at TEXT,
        sync_status TEXT,
        sync_error TEXT
      )`,
    )
    .run();
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS xero_settings (
        settings_id TEXT PRIMARY KEY,
        payroll_calendar_id TEXT,
        ordinary_earnings_rate_id TEXT,
        super_fund_id TEXT,
        updated_at INTEGER NOT NULL
      )`,
    )
    .run();
}

export async function upsertXeroConnection(db: D1DatabaseLike, row: XeroConnectionRow) {
  await ensureXeroTables(db);
  await db
    .prepare(
      `INSERT INTO xero_connections (connection_id, tenant_id, access_token, refresh_token_encrypted, expires_at, scope, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(connection_id) DO UPDATE SET
         tenant_id=excluded.tenant_id,
         access_token=excluded.access_token,
         refresh_token_encrypted=excluded.refresh_token_encrypted,
         expires_at=excluded.expires_at,
         scope=excluded.scope,
         updated_at=excluded.updated_at`,
    )
    .bind(
      row.connection_id,
      row.tenant_id,
      row.access_token,
      row.refresh_token_encrypted,
      row.expires_at,
      row.scope,
      row.created_at,
      row.updated_at,
    )
    .run();
}

export async function getXeroConnection(db: D1DatabaseLike): Promise<XeroConnectionRow | null> {
  await ensureXeroTables(db);
  const row = (await db.prepare("SELECT * FROM xero_connections ORDER BY updated_at DESC LIMIT 1").first()) as
    | XeroConnectionRow
    | undefined;
  return row ?? null;
}

export async function deleteXeroConnections(db: D1DatabaseLike) {
  await ensureXeroTables(db);
  await db.prepare("DELETE FROM xero_connections").run();
}

export async function upsertXeroEmployeeMap(db: D1DatabaseLike, row: XeroEmployeeMapRow) {
  await ensureXeroTables(db);
  await db
    .prepare(
      `INSERT INTO xero_employee_map (worker_id, xero_employee_id, payroll_calendar_id, ordinary_earnings_rate_id, super_fund_id, last_synced_at, sync_status, sync_error)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(worker_id) DO UPDATE SET
         xero_employee_id=excluded.xero_employee_id,
         payroll_calendar_id=excluded.payroll_calendar_id,
         ordinary_earnings_rate_id=excluded.ordinary_earnings_rate_id,
         super_fund_id=excluded.super_fund_id,
         last_synced_at=excluded.last_synced_at,
         sync_status=excluded.sync_status,
         sync_error=excluded.sync_error`,
    )
    .bind(
      row.worker_id,
      row.xero_employee_id,
      row.payroll_calendar_id ?? null,
      row.ordinary_earnings_rate_id ?? null,
      row.super_fund_id ?? null,
      row.last_synced_at ?? null,
      row.sync_status ?? null,
      row.sync_error ?? null,
    )
    .run();
}

export async function getXeroEmployeeMap(db: D1DatabaseLike, workerId: string): Promise<XeroEmployeeMapRow | null> {
  await ensureXeroTables(db);
  const row = (await db.prepare("SELECT * FROM xero_employee_map WHERE worker_id = ? LIMIT 1").bind(workerId).first()) as
    | XeroEmployeeMapRow
    | undefined;
  return row ?? null;
}

export async function getXeroSettings(db: D1DatabaseLike): Promise<XeroSettingsRow | null> {
  await ensureXeroTables(db);
  const row = (await db.prepare("SELECT * FROM xero_settings LIMIT 1").first()) as XeroSettingsRow | undefined;
  return row ?? null;
}

export async function upsertXeroSettings(db: D1DatabaseLike, row: XeroSettingsRow) {
  await ensureXeroTables(db);
  await db
    .prepare(
      `INSERT INTO xero_settings (settings_id, payroll_calendar_id, ordinary_earnings_rate_id, super_fund_id, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(settings_id) DO UPDATE SET
         payroll_calendar_id=excluded.payroll_calendar_id,
         ordinary_earnings_rate_id=excluded.ordinary_earnings_rate_id,
         super_fund_id=excluded.super_fund_id,
         updated_at=excluded.updated_at`,
    )
    .bind(
      row.settings_id,
      row.payroll_calendar_id ?? null,
      row.ordinary_earnings_rate_id ?? null,
      row.super_fund_id ?? null,
      row.updated_at,
    )
    .run();
}
