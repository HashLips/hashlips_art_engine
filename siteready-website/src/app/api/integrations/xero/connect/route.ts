import { NextRequest, NextResponse } from "next/server";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { buildConsentUrl } from "@/integrations/xero/xeroAuth";
import { sign } from "@/lib/auth/crypto";
import { hasAccepted } from "@/lib/legal/acceptance";
import { getDb } from "@/lib/db/client";

function encodeState(payload: Record<string, unknown>) {
  const json = JSON.stringify(payload);
  return Buffer.from(json).toString("base64url");
}

export async function GET(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.adminLevel !== "admin" && session.adminLevel !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  const userId = session.userId || session.email;
  if (userId) {
    const accepted = await hasAccepted(db, userId, "ADMIN_XERO_ACK");
    if (!accepted) {
      return NextResponse.json(
        { error: "Legal acceptance required", code: "NEEDS_LEGAL_ACCEPTANCE", document: "ADMIN_XERO_ACK" },
        { status: 403 },
      );
    }
  }

  const nonce = crypto.randomUUID();
  const issuedAt = Date.now();
  const state = encodeState({ nonce, issuedAt });
  const signature = await sign(state);
  const cookieValue = `${state}.${signature}`;
  const res = NextResponse.redirect(buildConsentUrl(state));
  res.cookies.set({
    name: "xero_oauth_state",
    value: cookieValue,
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 10,
  });
  return res;
}
