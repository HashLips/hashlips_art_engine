-- Worker tax declaration (NAT 3092 aligned)
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS worker_tax_declarations (
  worker_id TEXT PRIMARY KEY REFERENCES workers(worker_id) ON DELETE CASCADE,
  tax_residency_status TEXT NOT NULL,
  employment_basis TEXT NOT NULL,
  claim_tax_free_threshold INTEGER NOT NULL,
  has_study_training_loan INTEGER NOT NULL,
  has_sfss_debt INTEGER NOT NULL,
  tfn_status TEXT NOT NULL,
  tfn_encrypted TEXT,
  tfn_last4 TEXT,
  tfn_updated_at TEXT,
  tfn_declaration_full_name TEXT,
  tfn_declaration_signed INTEGER NOT NULL DEFAULT 0,
  tfn_declaration_signed_at TEXT,
  tfn_declaration_signed_ip TEXT,
  tfn_declaration_signed_user_agent TEXT,
  changed_surname_since_ato INTEGER NOT NULL DEFAULT 0,
  previous_family_name TEXT,
  eligible_to_receive_leave_loading INTEGER NOT NULL DEFAULT 0,
  has_student_startup_loan INTEGER NOT NULL DEFAULT 0,
  has_trade_support_loan_debt INTEGER NOT NULL DEFAULT 0,
  withholding_additional_amount_cents INTEGER,
  withholding_variation_percent INTEGER
);

CREATE INDEX IF NOT EXISTS idx_worker_tax_declarations_worker ON worker_tax_declarations(worker_id);
