import { NextRequest, NextResponse } from "next/server";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasD1Binding, hasR2Binding } from "@/lib/db/config";
import { ensureWorkerForUser, getWorkerById } from "@/lib/db/workers";
import {
  deleteWorkerTaxDeclarationDocument,
  getWorkerTaxDeclarationDocument,
  upsertWorkerTaxDeclarationDocument,
} from "@/lib/db/taxDeclarationDocuments";
import { deleteObject, getObject, putBase64Object } from "@/lib/storage/r2";

export const runtime = "nodejs";

const DOC_TYPE = "WITHHOLDING_VARIATION_NOTICE";
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);

const estimateBytes = (base64: string) => Math.floor((base64.length * 3) / 4);

export async function GET(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "worker") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!hasD1Binding() || !hasR2Binding()) return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const worker = await ensureWorkerForUser(db, session.userId || session.email || "", session.email);
  const workerRow = await getWorkerById(db, worker.worker_id);
  if (!workerRow) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if ((workerRow.engagement_type || "EMPLOYEE_CASUAL") !== "EMPLOYEE_CASUAL") {
    return NextResponse.json({ error: "Not available for contractors" }, { status: 400 });
  }

  const record = await getWorkerTaxDeclarationDocument(db, worker.worker_id, DOC_TYPE);
  const key = req.nextUrl.searchParams.get("key") || "";
  if (key) {
    if (!record?.file_key || record.file_key !== key) {
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
    document: record
      ? {
          file_key: record.file_key,
          file_name: record.file_name,
          file_type: record.file_type,
        }
      : null,
  });
}

export async function POST(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "worker") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!hasD1Binding() || !hasR2Binding()) return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const worker = await ensureWorkerForUser(db, session.userId || session.email || "", session.email);
  const workerRow = await getWorkerById(db, worker.worker_id);
  if (!workerRow) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if ((workerRow.engagement_type || "EMPLOYEE_CASUAL") !== "EMPLOYEE_CASUAL") {
    return NextResponse.json({ error: "Not available for contractors" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const base64 = typeof body?.file_base64 === "string" ? body.file_base64 : "";
  const fileName = typeof body?.file_name === "string" ? body.file_name : "";
  const fileType = typeof body?.file_type === "string" ? body.file_type : "";
  if (!base64 || !fileName || !fileType) {
    return NextResponse.json({ error: "Missing file data." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(fileType)) {
    return NextResponse.json({ error: "Only PDF, JPG, or PNG files are allowed." }, { status: 400 });
  }
  if (estimateBytes(base64) > MAX_BYTES) {
    return NextResponse.json({ error: "File exceeds 10MB." }, { status: 413 });
  }

  const existing = await getWorkerTaxDeclarationDocument(db, worker.worker_id, DOC_TYPE);
  if (existing?.file_key) {
    await deleteObject(existing.file_key);
  }

  const sanitizedName = fileName.replace(/[^\w.\-]+/g, "_");
  const key = `workers/${worker.worker_id}/tax-declaration/withholding-variation-${Date.now()}-${sanitizedName}`;
  await putBase64Object({ key, base64, contentType: fileType });

  const now = new Date().toISOString();
  await upsertWorkerTaxDeclarationDocument(db, {
    doc_id: existing?.doc_id || crypto.randomUUID(),
    worker_id: worker.worker_id,
    doc_type: DOC_TYPE,
    file_key: key,
    file_name: fileName,
    file_type: fileType,
    created_at: existing?.created_at || now,
    updated_at: now,
  });

  return NextResponse.json({
    ok: true,
    document: { file_key: key, file_name: fileName, file_type: fileType },
  });
}

export async function DELETE(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "worker") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!hasD1Binding() || !hasR2Binding()) return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const worker = await ensureWorkerForUser(db, session.userId || session.email || "", session.email);
  const record = await getWorkerTaxDeclarationDocument(db, worker.worker_id, DOC_TYPE);
  if (!record?.file_key) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteObject(record.file_key);
  await deleteWorkerTaxDeclarationDocument(db, worker.worker_id, DOC_TYPE);
  return NextResponse.json({ ok: true });
}
