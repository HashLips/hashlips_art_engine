import { D1DatabaseLike } from "./client";
import { LegalAcceptanceRow } from "./types";

async function ensureLegalTables(db: D1DatabaseLike) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS legal_acceptances (
        acceptance_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        role TEXT NOT NULL,
        document_type TEXT NOT NULL,
        document_version TEXT NOT NULL,
        accepted_at TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT
      )`,
    )
    .run();
}

export async function recordLegalAcceptance(db: D1DatabaseLike, row: LegalAcceptanceRow) {
  await ensureLegalTables(db);
  await db
    .prepare(
      `INSERT INTO legal_acceptances (acceptance_id, user_id, role, document_type, document_version, accepted_at, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      row.acceptance_id,
      row.user_id,
      row.role,
      row.document_type,
      row.document_version,
      row.accepted_at,
      row.ip_address ?? null,
      row.user_agent ?? null,
    )
    .run();
}

export async function listLegalAcceptances(
  db: D1DatabaseLike,
  userId: string,
): Promise<LegalAcceptanceRow[]> {
  await ensureLegalTables(db);
  const res = await db
    .prepare("SELECT * FROM legal_acceptances WHERE user_id = ? ORDER BY accepted_at DESC")
    .bind(userId)
    .all();
  return (res?.results as LegalAcceptanceRow[]) ?? [];
}
