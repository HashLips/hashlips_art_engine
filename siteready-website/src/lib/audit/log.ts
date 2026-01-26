import { getDb } from "../db/client";
import { hasD1Binding } from "../db/config";

type AuditLogInput = {
  actor_id?: string | null;
  actor_role?: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  diff_json?: unknown;
};

export async function writeAudit(entry: AuditLogInput) {
  if (!hasD1Binding()) return;
  const db = getDb();
  if (!db) return;
  const audit_id = crypto.randomUUID();
  const timestamp = Math.floor(Date.now() / 1000);
  const diff = typeof entry.diff_json === "string" ? entry.diff_json : JSON.stringify(entry.diff_json ?? {});
  await db
    .prepare(
      "INSERT INTO audit_logs (audit_id, actor_id, actor_role, action, entity_type, entity_id, timestamp, diff_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(audit_id, entry.actor_id ?? null, entry.actor_role ?? null, entry.action, entry.entity_type, entry.entity_id, timestamp, diff)
    .run();
}
