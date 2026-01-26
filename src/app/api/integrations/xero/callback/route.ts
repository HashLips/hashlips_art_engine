import { NextRequest, NextResponse } from "next/server";
import { verify } from "@/lib/auth/crypto";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { exchangeCodeForTokenSet } from "@/integrations/xero/xeroAuth";
import { fetchConnections } from "@/integrations/xero/xeroApi";
import { encryptXeroToken } from "@/integrations/xero/xeroTokens";
import { getDb } from "@/lib/db/client";
import { upsertXeroConnection } from "@/lib/db/xero";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session || (session.adminLevel !== "admin" && session.adminLevel !== "super_admin")) {
    return unauthorized();
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) {
    return NextResponse.json({ error: "Missing code or state" }, { status: 400 });
  }

  const cookie = req.cookies.get("xero_oauth_state")?.value;
  if (!cookie) {
    return NextResponse.json({ error: "Missing state cookie" }, { status: 400 });
  }
  const [stateValue, signature] = cookie.split(".");
  if (!stateValue || !signature) {
    return NextResponse.json({ error: "Invalid state cookie" }, { status: 400 });
  }
  if (stateValue !== state) {
    return NextResponse.json({ error: "State mismatch" }, { status: 400 });
  }
  const valid = await verify(stateValue, signature);
  if (!valid) {
    return NextResponse.json({ error: "Invalid state signature" }, { status: 400 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  const tokenSet = await exchangeCodeForTokenSet(code);
  const connections = await fetchConnections(tokenSet.accessToken);
  const primary = connections[0];
  if (!primary?.tenantId) {
    return NextResponse.json({ error: "No Xero tenant available" }, { status: 400 });
  }

  const encryptedRefresh = await encryptXeroToken(tokenSet.refreshToken);
  await upsertXeroConnection(db, {
    connection_id: crypto.randomUUID(),
    tenant_id: primary.tenantId,
    access_token: tokenSet.accessToken,
    refresh_token_encrypted: encryptedRefresh,
    expires_at: tokenSet.expiresAt,
    scope: tokenSet.scope ?? "",
    created_at: Date.now(),
    updated_at: Date.now(),
  });

  const res = NextResponse.redirect(new URL("/dashboard/admin/xero", req.url));
  res.cookies.set({
    name: "xero_oauth_state",
    value: "",
    maxAge: 0,
    path: "/",
  });
  return res;
}
