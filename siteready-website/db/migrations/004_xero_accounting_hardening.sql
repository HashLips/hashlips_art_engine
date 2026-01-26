-- Harden Xero Accounting sync (idempotency + reservation state)
PRAGMA foreign_keys = ON;

ALTER TABLE xero_transaction_map ADD COLUMN bill_idempotency_key TEXT;
ALTER TABLE xero_transaction_map ADD COLUMN sync_state TEXT;
ALTER TABLE xero_transaction_map ADD COLUMN attempts INTEGER DEFAULT 0;
