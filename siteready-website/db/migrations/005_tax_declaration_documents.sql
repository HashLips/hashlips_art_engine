CREATE TABLE IF NOT EXISTS worker_tax_declaration_documents (
  doc_id TEXT PRIMARY KEY,
  worker_id TEXT NOT NULL,
  doc_type TEXT NOT NULL,
  file_key TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE(worker_id, doc_type)
);

CREATE INDEX IF NOT EXISTS idx_worker_tax_declaration_documents_worker
  ON worker_tax_declaration_documents (worker_id);
