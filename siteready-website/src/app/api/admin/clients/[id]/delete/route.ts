import { NextRequest, NextResponse } from "next/server";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasD1Binding } from "@/lib/db/config";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

  const client = await db.prepare("SELECT client_id, user_id FROM clients WHERE client_id = ? LIMIT 1").bind(id).first();
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.prepare("DELETE FROM clients WHERE client_id = ?").bind(id).run();
  const userId = (client as { user_id?: string | null })?.user_id ?? null;
  if (userId) {
    await db.prepare("DELETE FROM users WHERE user_id = ?").bind(userId).run();
  }
  return NextResponse.json({ ok: true });
}
