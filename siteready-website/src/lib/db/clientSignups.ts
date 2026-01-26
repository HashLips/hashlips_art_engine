import { D1DatabaseLike } from "./client";

export type ClientSignupRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  whatsapp: string | null;
  status: "email_sent" | "email_clicked" | "converted" | "expired";
  onboarding_token_hash: string;
  onboarding_token_expires_at: number;
  email_sent_at: number;
  email_clicked_at: number | null;
  converted_user_id: string | null;
  created_at: number;
  updated_at: number;
};

async function ensureTable(db: D1DatabaseLike) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS client_signups (
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
      )`,
    )
    .run();
  await db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS client_signups_email_unique ON client_signups(email)").run();
}

export async function upsertClientSignup(
  db: D1DatabaseLike,
  data: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    mobile: string;
    whatsapp: string | null;
    onboarding_token_hash: string;
    onboarding_token_expires_at: number;
    email_sent_at: number;
    created_at: number;
    updated_at: number;
  },
) {
  await ensureTable(db);
  await db
    .prepare(
      `INSERT INTO client_signups (
        id,
        first_name,
        last_name,
        email,
        mobile,
        whatsapp,
        status,
        onboarding_token_hash,
        onboarding_token_expires_at,
        email_sent_at,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'email_sent', ?, ?, ?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET
        first_name = excluded.first_name,
        last_name = excluded.last_name,
        mobile = excluded.mobile,
        whatsapp = excluded.whatsapp,
        status = 'email_sent',
        onboarding_token_hash = excluded.onboarding_token_hash,
        onboarding_token_expires_at = excluded.onboarding_token_expires_at,
        email_sent_at = excluded.email_sent_at,
        email_clicked_at = NULL,
        converted_user_id = NULL,
        updated_at = excluded.updated_at`,
    )
    .bind(
      data.id,
      data.first_name,
      data.last_name,
      data.email,
      data.mobile,
      data.whatsapp,
      data.onboarding_token_hash,
      data.onboarding_token_expires_at,
      data.email_sent_at,
      data.created_at,
      data.updated_at,
    )
    .run();
}

export async function getClientSignupById(db: D1DatabaseLike, id: string) {
  await ensureTable(db);
  return (await db
    .prepare("SELECT * FROM client_signups WHERE id = ? LIMIT 1")
    .bind(id)
    .first()) as ClientSignupRow | undefined;
}

export async function getClientSignupByTokenHash(db: D1DatabaseLike, tokenHash: string) {
  await ensureTable(db);
  return (await db
    .prepare(
      `SELECT * FROM client_signups WHERE onboarding_token_hash = ? LIMIT 1`,
    )
    .bind(tokenHash)
    .first()) as ClientSignupRow | undefined;
}

export async function getClientSignupByEmail(db: D1DatabaseLike, email: string) {
  await ensureTable(db);
  return (await db
    .prepare("SELECT * FROM client_signups WHERE email = ? LIMIT 1")
    .bind(email)
    .first()) as ClientSignupRow | undefined;
}

export async function listClientSignups(db: D1DatabaseLike) {
  await ensureTable(db);
  const res = await db
    .prepare("SELECT * FROM client_signups ORDER BY updated_at DESC")
    .all();
  return (res.results as ClientSignupRow[]) || [];
}

export async function markClientSignupClicked(db: D1DatabaseLike, id: string, clickedAt: number) {
  await ensureTable(db);
  await db
    .prepare(
      "UPDATE client_signups SET status = CASE WHEN status = 'email_sent' THEN 'email_clicked' ELSE status END, email_clicked_at = COALESCE(email_clicked_at, ?), updated_at = ? WHERE id = ?",
    )
    .bind(clickedAt, clickedAt, id)
    .run();
}

export async function markClientSignupConverted(db: D1DatabaseLike, id: string, userId: string, now: number) {
  await ensureTable(db);
  await db
    .prepare(
      "UPDATE client_signups SET status = 'converted', converted_user_id = ?, updated_at = ? WHERE id = ?",
    )
    .bind(userId, now, id)
    .run();
}

export async function markClientSignupExpired(db: D1DatabaseLike, id: string, now: number) {
  await ensureTable(db);
  await db
    .prepare(
      "UPDATE client_signups SET status = 'expired', updated_at = ? WHERE id = ?",
    )
    .bind(now, id)
    .run();
}

export async function refreshClientSignupToken(
  db: D1DatabaseLike,
  data: {
    id: string;
    onboarding_token_hash: string;
    onboarding_token_expires_at: number;
    email_sent_at: number;
    updated_at: number;
  },
) {
  await ensureTable(db);
  await db
    .prepare(
      `UPDATE client_signups
       SET status = 'email_sent',
           onboarding_token_hash = ?,
           onboarding_token_expires_at = ?,
           email_sent_at = ?,
           email_clicked_at = NULL,
           converted_user_id = NULL,
           updated_at = ?
       WHERE id = ?`,
    )
    .bind(
      data.onboarding_token_hash,
      data.onboarding_token_expires_at,
      data.email_sent_at,
      data.updated_at,
      data.id,
    )
    .run();
}
