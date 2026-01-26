import { NextRequest, NextResponse } from "next/server";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasD1Binding, hasR2Binding } from "@/lib/db/config";
import { getWorkerById } from "@/lib/db/workers";
import { getObject } from "@/lib/storage/r2";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.adminLevel !== "admin" && session.adminLevel !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!hasD1Binding() || !hasR2Binding()) return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const worker = await getWorkerById(db, id);
  if (!worker) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const type = req.nextUrl.searchParams.get("type") || "";
  const keyMap: Record<string, string | null | undefined> = {
    drivers_license_front: worker.drivers_license_front_key,
    drivers_license_back: worker.drivers_license_back_key,
    id_document_front: worker.id_document_front_key,
    id_document_back: worker.id_document_back_key,
  };
  const key = keyMap[type];
  if (!key) return NextResponse.json({ error: "Not found" }, { status: 404 });

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
