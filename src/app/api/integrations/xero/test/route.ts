import { NextRequest, NextResponse } from "next/server";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { getXeroConnection, upsertXeroConnection } from "@/lib/db/xero";
import { decryptXeroToken, encryptXeroToken } from "@/integrations/xero/xeroTokens";
import { refreshTokenIfNeeded } from "@/integrations/xero/xeroAuth";
import { fetchConnections } from "@/integrations/xero/xeroApi";

export async function POST(req: NextRequest) {
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
    return NextResponse.json({ error: "Not connected" }, { status: 400 });
  }

  const refreshToken = await decryptXeroToken(connection.refresh_token_encrypted);
  if (!refreshToken) {
    return NextResponse.json({ error: "Missing refresh token" }, { status: 400 });
  }

  const tokenSet = await refreshTokenIfNeeded({
    accessToken: connection.access_token,
    refreshToken,
    expiresAt: connection.expires_at,
    scope: connection.scope,
  });

  const connections = await fetchConnections(tokenSet.accessToken);
  const primary = connections[0];
  if (!primary?.tenantId) {
    return NextResponse.json({ error: "No Xero tenant available" }, { status: 400 });
  }

  const encryptedRefresh = await encryptXeroToken(tokenSet.refreshToken);
  await upsertXeroConnection(db, {
    connection_id: connection.connection_id,
    tenant_id: primary.tenantId,
    access_token: tokenSet.accessToken,
    refresh_token_encrypted: encryptedRefresh,
    expires_at: tokenSet.expiresAt,
    scope: tokenSet.scope ?? "",
    created_at: connection.created_at,
    updated_at: Date.now(),
  });

  return NextResponse.json({ ok: true, tenantId: primary.tenantId });
}
