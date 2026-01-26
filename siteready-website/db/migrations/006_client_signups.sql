CREATE TABLE IF NOT EXISTS client_signups (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT NOT NULL,
  whatsapp TEXT,
  status TEXT NOT NULL DEFAULT 'email_sent',
  onboarding_token_hash TEXT NOT NULL,
  onboarding_token_expires_at INTEGER NOT NULL,
  email_sent_at INTEGER NOT NULL,
  email_clicked_at INTEGER,
  converted_user_id TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS client_signups_email_unique ON client_signups(email);
