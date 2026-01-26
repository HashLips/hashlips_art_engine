-- Dual engagement (employee vs contractor) + Xero accounting mappings
PRAGMA foreign_keys = ON;

ALTER TABLE workers ADD COLUMN engagement_type TEXT NOT NULL DEFAULT 'EMPLOYEE_CASUAL';

ALTER TABLE worker_tax_declarations ADD COLUMN tfn_not_quoted_ack INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS contractor_company (
  worker_id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  company_structure TEXT NOT NULL,
  abn TEXT NOT NULL,
  acn TEXT,
  website TEXT,
  company_tfn_encrypted TEXT,
  address_json TEXT NOT NULL,
  bank_account_name TEXT NOT NULL,
  bank_bsb TEXT NOT NULL,
  bank_account_number_encrypted TEXT NOT NULL,
  bank_account_last4 TEXT NOT NULL,
  contractor_pay_rate_cents INTEGER,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS xero_contact_map (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  local_entity_id TEXT NOT NULL,
  xero_contact_id TEXT NOT NULL,
  abn TEXT,
  last_synced_at TEXT,
  sync_status TEXT,
  sync_error TEXT,
  UNIQUE(entity_type, local_entity_id)
);

CREATE TABLE IF NOT EXISTS xero_transaction_map (
  id TEXT PRIMARY KEY,
  timesheet_id TEXT NOT NULL UNIQUE,
  xero_payroll_timesheet_id TEXT,
  xero_bill_invoice_id TEXT,
  last_synced_at TEXT,
  sync_status TEXT,
  sync_error TEXT
);

CREATE TABLE IF NOT EXISTS xero_accounting_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  default_purchases_account_code TEXT NOT NULL,
  bill_status_mode TEXT NOT NULL DEFAULT 'DRAFT'
);

INSERT INTO xero_accounting_settings (id, default_purchases_account_code, bill_status_mode)
SELECT 1, '000', 'DRAFT'
WHERE NOT EXISTS (SELECT 1 FROM xero_accounting_settings WHERE id = 1);
