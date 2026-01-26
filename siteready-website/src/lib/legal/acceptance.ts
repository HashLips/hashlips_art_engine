import { listLegalAcceptances } from "@/lib/db/legal";
import { LEGAL_DOCUMENTS, LegalDocumentType } from "@/lib/legal/documents";
import { D1DatabaseLike } from "@/lib/db/client";

export async function hasAccepted(db: D1DatabaseLike, userId: string, docType: LegalDocumentType) {
  const doc = LEGAL_DOCUMENTS[docType];
  const acceptances = await listLegalAcceptances(db, userId);
  return acceptances.some(
    (entry) => entry.document_type === doc.type && entry.document_version === doc.version,
  );
}
