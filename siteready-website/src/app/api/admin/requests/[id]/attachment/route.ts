import { NextRequest, NextResponse } from "next/server";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasD1Binding } from "@/lib/db/config";
import { getRequestById } from "@/lib/db/requests";
import { AttachmentMeta } from "@/lib/db/types";
import { getObject } from "@/lib/storage/r2";

function safeFilename(value: string) {
  return value.replace(/[\\/"']/g, "-");
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.adminLevel !== "admin" && session.adminLevel !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!hasD1Binding()) {
    return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  }
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const key = new URL(req.url).searchParams.get("key");
  if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 });

  const request = await getRequestById(db, id);
  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const list = Array.isArray(request.attachment_list) ? request.attachment_list : [];
  const meta = list.find((item) => typeof item === "object" && item && "key" in item && item.key === key) as
    | AttachmentMeta
    | undefined;
  if (!meta?.key) return NextResponse.json({ error: "Attachment not found" }, { status: 404 });

  const object = await getObject(meta.key);
  if (!object?.body) return NextResponse.json({ error: "Attachment not found" }, { status: 404 });

  const headers = new Headers();
  headers.set("Content-Type", meta.type || object.httpMetadata?.contentType || "application/octet-stream");
  headers.set("Content-Disposition", `attachment; filename="${safeFilename(meta.name || "attachment")}"`);
  if (object.size) headers.set("Content-Length", object.size.toString());

  return new NextResponse(object.body, { headers });
}
