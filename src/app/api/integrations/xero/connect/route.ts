import { NextRequest, NextResponse } from "next/server";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { sign } from "@/lib/auth/crypto";
import { buildConsentUrl } from "@/integrations/xero/xeroAuth";

function encodeState(payload: Record<string, unknown>) {
  const json = JSON.stringify(payload);
  return Buffer.from(json).toString("base64url");
}

export async function GET(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session || (session.adminLevel !== "admin" && session.adminLevel !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
