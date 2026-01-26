import { D1DatabaseLike } from "./client";

type ResetRow = {
  token_hash: string;
  user_id: string;
  expires_at: number;
  created_at: number;
};

async function ensureTable(db: D1DatabaseLike) {
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS password_resets (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    )`,
  ).run();
}

export async function insertPasswordReset(db: D1DatabaseLike, row: Omit<ResetRow, "created_at">) {
  await ensureTable(db);
  await db.prepare("DELETE FROM password_resets WHERE user_id = ?").bind(row.user_id).run();
  await db
    .prepare("INSERT INTO password_resets (token_hash, user_id, expires_at) VALUES (?, ?, ?)")
    .bind(row.token_hash, row.user_id, row.expires_at)
    .run();
}

export async function getPasswordReset(db: D1DatabaseLike, token_hash: string): Promise<ResetRow | null> {
  await ensureTable(db);
  const row = (await db
    .prepare("SELECT token_hash, user_id, expires_at, created_at FROM password_resets WHERE token_hash = ? LIMIT 1")
    .bind(token_hash)
    .first()) as ResetRow | undefined;
  return row ?? null;
}

export async function deletePasswordReset(db: D1DatabaseLike, token_hash: string) {
  await ensureTable(db);
  await db.prepare("DELETE FROM password_resets WHERE token_hash = ?").bind(token_hash).run();
}
