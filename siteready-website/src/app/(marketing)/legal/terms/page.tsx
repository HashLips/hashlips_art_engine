import LegalPage from "@/components/legal/LegalPage";
import { LEGAL_DOCUMENTS } from "@/lib/legal/documents";

export default function TermsPage() {
  const doc = LEGAL_DOCUMENTS.PLATFORM_TERMS;
  return <LegalPage title={doc.title} body={doc.body} />;
}
