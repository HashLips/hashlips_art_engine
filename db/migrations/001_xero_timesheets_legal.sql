-- Xero connections and mappings
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

-- Timesheets
CREATE TABLE IF NOT EXISTS timesheets (
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
);

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
