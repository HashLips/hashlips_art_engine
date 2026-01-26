import { NextRequest, NextResponse } from "next/server";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasD1Binding } from "@/lib/db/config";
import { getXeroConnection, upsertXeroConnection } from "@/lib/db/xero";
import { decryptXeroToken, encryptXeroToken } from "@/integrations/xero/xeroTokens";
import { refreshTokenIfNeeded } from "@/integrations/xero/xeroAuth";

export async function GET(req: NextRequest) {
  const session = await parseSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.adminLevel !== "admin" && session.adminLevel !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!hasD1Binding()) return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const connection = await getXeroConnection(db);
  if (!connection) return NextResponse.json({ connected: false });

  const refreshToken = await decryptXeroToken(connection.refresh_token_encrypted);
  if (!refreshToken) {
    return NextResponse.json({ connected: false, error: "Missing refresh token" }, { status: 500 });
  }

  const refreshed = await refreshTokenIfNeeded({
    accessToken: connection.access_token,
    refreshToken,
    expiresAt: connection.expires_at,
    scope: connection.scope,
  });

  if (refreshed.accessToken !== connection.access_token) {
    await upsertXeroConnection(db, {
      ...connection,
      access_token: refreshed.accessToken,
      refresh_token_encrypted: await encryptXeroToken(refreshed.refreshToken),
      expires_at: refreshed.expiresAt,
      updated_at: Date.now(),
    });
  }

  return NextResponse.json({
    connected: true,
    tenantId: connection.tenant_id,
    scope: connection.scope,
    expiresAt: refreshed.expiresAt,
  });
}
