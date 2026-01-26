import { NextRequest, NextResponse } from "next/server";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasD1Binding } from "@/lib/db/config";
import { ensureClientForUser } from "@/lib/db/clients";
import { getRequestById } from "@/lib/db/requests";

type ParamsContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: ParamsContext) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "client" && session.role !== "staff") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!hasD1Binding()) {
    return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  }
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  let clientId: string | null = null;
  if (session.role === "client") {
    const client = await ensureClientForUser(db, session.userId || session.email || "");
    clientId = client.client_id;
  }

  const resolvedParams = await params;
  const request = await getRequestById(db, resolvedParams.id, clientId);
  if (!request) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, request });
}
