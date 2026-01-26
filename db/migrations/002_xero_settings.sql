CREATE TABLE IF NOT EXISTS xero_settings (
  settings_id TEXT PRIMARY KEY,
  payroll_calendar_id TEXT,
  ordinary_earnings_rate_id TEXT,
  super_fund_id TEXT,
  updated_at INTEGER NOT NULL
);
