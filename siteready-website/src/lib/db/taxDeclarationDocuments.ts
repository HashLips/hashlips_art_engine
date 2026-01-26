import { D1DatabaseLike } from "./client";
import { WorkerTaxDeclarationDocumentRow } from "./types";

export async function getWorkerTaxDeclarationDocument(
  db: D1DatabaseLike,
  worker_id: string,
  doc_type: string,
): Promise<WorkerTaxDeclarationDocumentRow | null> {
  const row = await db
    .prepare("SELECT * FROM worker_tax_declaration_documents WHERE worker_id = ? AND doc_type = ? LIMIT 1")
    .bind(worker_id, doc_type)
    .first();
  return (row as WorkerTaxDeclarationDocumentRow | undefined) ?? null;
}

export async function upsertWorkerTaxDeclarationDocument(
  db: D1DatabaseLike,
  data: WorkerTaxDeclarationDocumentRow,
) {
  await db
    .prepare(
      `INSERT INTO worker_tax_declaration_documents (
        doc_id,
        worker_id,
        doc_type,
        file_key,
        file_name,
        file_type,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(worker_id, doc_type) DO UPDATE SET
        file_key = excluded.file_key,
        file_name = excluded.file_name,
        file_type = excluded.file_type,
        updated_at = excluded.updated_at`,
    )
    .bind(
      data.doc_id,
      data.worker_id,
      data.doc_type,
      data.file_key,
      data.file_name,
      data.file_type ?? null,
      data.created_at,
      data.updated_at,
    )
    .run();
}

export async function deleteWorkerTaxDeclarationDocument(
  db: D1DatabaseLike,
  worker_id: string,
  doc_type: string,
) {
  await db.prepare("DELETE FROM worker_tax_declaration_documents WHERE worker_id = ? AND doc_type = ?")
    .bind(worker_id, doc_type)
    .run();
}
