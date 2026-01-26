import LegalPage from "@/components/legal/LegalPage";
import { LEGAL_DOCUMENTS } from "@/lib/legal/documents";

export default function XeroConsentPage() {
  const doc = LEGAL_DOCUMENTS.XERO_DATA_SHARING_CONSENT;
  return <LegalPage title={doc.title} body={doc.body} />;
}
