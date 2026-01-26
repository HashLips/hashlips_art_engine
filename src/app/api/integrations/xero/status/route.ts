import { NextRequest, NextResponse } from "next/server";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { getXeroConnection } from "@/lib/db/xero";

export async function GET(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session || (session.adminLevel !== "admin" && session.adminLevel !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  const connection = await getXeroConnection(db);
  if (!connection) {
    return NextResponse.json({ connected: false });
  }

  return NextResponse.json({
    connected: true,
    tenantId: connection.tenant_id,
    scope: connection.scope,
    expiresAt: connection.expires_at,
    updatedAt: connection.updated_at,
  });
}
