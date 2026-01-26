-- Safe, idempotent migration for new tables/columns.
-- Uses IF NOT EXISTS to avoid failures on repeated runs.

PRAGMA foreign_keys = ON;

-- Legal acceptances
CREATE TABLE IF NOT EXISTS legal_acceptances (
  acceptance_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL,
  document_type TEXT NOT NULL,
  document_version TEXT NOT NULL,
  accepted_at TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT
);

-- Xero integration
CREATE TABLE IF NOT EXISTS xero_connections (
  connection_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token_encrypted TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  scope TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS xero_employee_map (
  worker_id TEXT PRIMARY KEY,
  xero_employee_id TEXT NOT NULL,
  payroll_calendar_id TEXT,
  ordinary_earnings_rate_id TEXT,
  super_fund_id TEXT,
  last_synced_at TEXT,
  sync_status TEXT,
  sync_error TEXT
);

CREATE TABLE IF NOT EXISTS xero_settings (
  settings_id TEXT PRIMARY KEY,
  payroll_calendar_id TEXT,
  ordinary_earnings_rate_id TEXT,
  super_fund_id TEXT,
  updated_at INTEGER NOT NULL
);

-- Timesheet lines (new table)
CREATE TABLE IF NOT EXISTS timesheet_lines (
  line_id TEXT PRIMARY KEY,
  timesheet_id TEXT NOT NULL,
  work_date TEXT NOT NULL,
  hours_decimal REAL NOT NULL,
  earnings_code TEXT NOT NULL,
  site_id TEXT,
  job_id TEXT,
  shift_id TEXT,
  notes TEXT
);

-- Super fund products (USI extract)
CREATE TABLE IF NOT EXISTS super_fund_products (
  usi TEXT PRIMARY KEY,
  abn TEXT NOT NULL,
  fund_name TEXT NOT NULL,
  product_name TEXT NOT NULL,
  contribution_restrictions INTEGER NOT NULL DEFAULT 0,
  from_date TEXT,
  to_date TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_super_fund_products_fund_name ON super_fund_products(fund_name);
CREATE INDEX IF NOT EXISTS idx_super_fund_products_abn ON super_fund_products(abn);

-- Super fund ingestion status (single row)
CREATE TABLE IF NOT EXISTS super_fund_ingestion_status (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  last_success_at TEXT,
  last_run_at TEXT,
  last_row_count INTEGER,
  last_error TEXT,
  source_url TEXT,
  source_version TEXT
);
-- Note: existing tables (timesheets/workers/worker_tickets) are evolved at runtime
-- via application-level ALTER TABLE calls to avoid D1 syntax limitations here.
