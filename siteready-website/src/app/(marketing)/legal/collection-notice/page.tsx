import LegalPage from "@/components/legal/LegalPage";
import { LEGAL_DOCUMENTS } from "@/lib/legal/documents";

export default function CollectionNoticePage() {
  const doc = LEGAL_DOCUMENTS.APP5_COLLECTION_NOTICE;
  return <LegalPage title={doc.title} body={doc.body} />;
}
