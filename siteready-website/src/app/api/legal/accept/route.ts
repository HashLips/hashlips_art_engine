import { NextRequest, NextResponse } from "next/server";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { recordLegalAcceptance } from "@/lib/db/legal";
import { LEGAL_DOCUMENTS, LegalDocumentType } from "@/lib/legal/documents";

export async function POST(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  const body = await req.json().catch(() => null);
  const documentType = body?.document_type as LegalDocumentType | undefined;
  const doc = documentType ? LEGAL_DOCUMENTS[documentType] : undefined;
  if (!doc) return NextResponse.json({ error: "Invalid document type" }, { status: 400 });

  const userId = session.userId || session.email;
  if (!userId) return NextResponse.json({ error: "Missing user id" }, { status: 400 });

  const ipAddress =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    null;
  const userAgent = req.headers.get("user-agent") || null;

  await recordLegalAcceptance(db, {
    acceptance_id: crypto.randomUUID(),
    user_id: userId,
    role: session.role,
    document_type: doc.type,
    document_version: doc.version,
    accepted_at: new Date().toISOString(),
    ip_address: ipAddress,
    user_agent: userAgent,
  });

  return NextResponse.json({ ok: true });
}
