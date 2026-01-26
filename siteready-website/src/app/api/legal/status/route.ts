import { NextRequest, NextResponse } from "next/server";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { listLegalAcceptances } from "@/lib/db/legal";
import { LEGAL_DOCUMENTS, LegalDocumentType } from "@/lib/legal/documents";

const ROLE_REQUIREMENTS: Record<string, LegalDocumentType[]> = {
  worker: ["APP5_COLLECTION_NOTICE", "PLATFORM_TERMS", "XERO_DATA_SHARING_CONSENT"],
  client: ["CLIENT_CONFIDENTIALITY_TERMS"],
  staff: ["ADMIN_XERO_ACK"],
};

export async function GET(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  const userId = session.userId || session.email;
  if (!userId) return NextResponse.json({ error: "Missing user id" }, { status: 400 });

  const acceptances = await listLegalAcceptances(db, userId);
  const accepted = new Set(acceptances.map((a) => `${a.document_type}:${a.document_version}`));
  const requiredDocs = ROLE_REQUIREMENTS[session.role] || [];
  const required = requiredDocs.map((type) => {
    const doc = LEGAL_DOCUMENTS[type];
    return {
      type: doc.type,
      version: doc.version,
      title: doc.title,
      accepted: accepted.has(`${doc.type}:${doc.version}`),
    };
  });

  return NextResponse.json({ ok: true, required });
}
