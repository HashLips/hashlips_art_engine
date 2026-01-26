import { NextRequest, NextResponse } from "next/server";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasD1Binding, hasR2Binding } from "@/lib/db/config";
import { getWorkerByUser, updateWorkerProfile } from "@/lib/db/workers";
import { deleteObject, getObject } from "@/lib/storage/r2";

// Force Node runtime to avoid edge bundling issues on Cloudflare.
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "worker") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!hasD1Binding() || !hasR2Binding()) return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const worker = await getWorkerByUser(db, session.userId || "");
  if (!worker) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const key = req.nextUrl.searchParams.get("key") || "";
  const allowedKeys = new Set([
    worker.drivers_license_front_key,
    worker.drivers_license_back_key,
    worker.id_document_front_key,
    worker.id_document_back_key,
  ].filter(Boolean) as string[]);

  if (!key || !allowedKeys.has(key)) {
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

export async function DELETE(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "worker") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!hasD1Binding() || !hasR2Binding()) return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const worker = await getWorkerByUser(db, session.userId || "");
  if (!worker) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const type = req.nextUrl.searchParams.get("type") || "";
  const fields: Record<string, { keyField: keyof typeof worker; nameField: keyof typeof worker }> = {
    drivers_license_front: { keyField: "drivers_license_front_key", nameField: "drivers_license_front_name" },
    drivers_license_back: { keyField: "drivers_license_back_key", nameField: "drivers_license_back_name" },
    id_document_front: { keyField: "id_document_front_key", nameField: "id_document_front_name" },
    id_document_back: { keyField: "id_document_back_key", nameField: "id_document_back_name" },
  };
  const mapping = fields[type];
  if (!mapping) return NextResponse.json({ error: "Invalid type" }, { status: 400 });

  const key = worker[mapping.keyField] as string | null;
  if (!key) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteObject(key);

  const updatePayload: Record<string, unknown> = {
    [mapping.keyField]: null,
    [mapping.nameField]: null,
  };
  const nextLicenseHasKey =
    (mapping.keyField !== "drivers_license_front_key" && worker.drivers_license_front_key) ||
    (mapping.keyField !== "drivers_license_back_key" && worker.drivers_license_back_key);
  if (!nextLicenseHasKey) {
    updatePayload.license_verification_status = null;
  }
  const nextIdHasKey =
    (mapping.keyField !== "id_document_front_key" && worker.id_document_front_key) ||
    (mapping.keyField !== "id_document_back_key" && worker.id_document_back_key);
  if (!nextIdHasKey) {
    updatePayload.id_verification_status = null;
  }

  await updateWorkerProfile(db, worker.worker_id, updatePayload);

  return NextResponse.json({ ok: true });
}
