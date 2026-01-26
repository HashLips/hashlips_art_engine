import { NextRequest, NextResponse } from "next/server";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasD1Binding, hasR2Binding } from "@/lib/db/config";
import { getWorkerTaxDeclarationDocument } from "@/lib/db/taxDeclarationDocuments";
import { getObject } from "@/lib/storage/r2";

export const runtime = "nodejs";

const DOC_TYPE = "WITHHOLDING_VARIATION_NOTICE";

function isAdmin(session: Awaited<ReturnType<typeof parseSessionFromRequest>>) {
  return session?.role === "staff" && (session.adminLevel === "admin" || session.adminLevel === "super_admin" || session.adminLevel === "payroll_admin");
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!hasD1Binding() || !hasR2Binding()) return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const { id } = await params;
  const workerId = id;
  const record = await getWorkerTaxDeclarationDocument(db, workerId, DOC_TYPE);
  if (!record) return NextResponse.json({ ok: true, document: null });

  const key = req.nextUrl.searchParams.get("key") || "";
  if (key) {
    if (record.file_key !== key) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const obj = await getObject(key);
    if (!obj?.body) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return new NextResponse(obj.body, {
      status: 200,
      headers: {
        "Content-Type": obj.httpMetadata?.contentType || "application/octet-stream",
        "Cache-Control": "private, max-age=300",
      },
    });
  }

  return NextResponse.json({
    ok: true,
    document: {
      file_key: record.file_key,
      file_name: record.file_name,
      file_type: record.file_type,
    },
  });
}
