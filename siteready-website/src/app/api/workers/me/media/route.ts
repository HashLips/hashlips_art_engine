import { NextRequest, NextResponse } from "next/server";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasD1Binding, hasR2Binding } from "@/lib/db/config";
import { getWorkerByUser } from "@/lib/db/workers";
import { deleteObject, getObject } from "@/lib/storage/r2";

export const runtime = "nodejs";

const collectKeys = (worker: { work_media_json?: string | null; work_experience_json?: string | null }) => {
  const keys = new Set<string>();
  const tryAdd = (items: Array<{ key?: string | null }> | null | undefined) => {
    items?.forEach((item) => {
      if (item?.key) keys.add(item.key);
    });
  };
  try {
    if (worker.work_media_json) {
      tryAdd(JSON.parse(worker.work_media_json));
    }
  } catch {
    // ignore parse errors
  }
  try {
    if (worker.work_experience_json) {
      const experiences = JSON.parse(worker.work_experience_json) as Array<{ work_media?: Array<{ key?: string | null }> }>;
      experiences?.forEach((exp) => tryAdd(exp.work_media));
    }
  } catch {
    // ignore parse errors
  }
  return keys;
};

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
  if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 });
  const allowed = collectKeys(worker);
  if (!allowed.has(key)) return NextResponse.json({ error: "Not found" }, { status: 404 });

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

  const key = req.nextUrl.searchParams.get("key") || "";
  if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 });
  const allowed = collectKeys(worker);
  if (!allowed.has(key)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteObject(key);
  return NextResponse.json({ ok: true });
}
