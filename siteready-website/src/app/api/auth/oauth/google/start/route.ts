import { NextRequest, NextResponse } from "next/server";

function getEnv(key: string) {
  return process.env[key] || process.env[key.toUpperCase()] || "";
}

export async function GET(req: NextRequest) {
  const clientId = getEnv("GOOGLE_CLIENT_ID");
  const clientSecret = getEnv("GOOGLE_CLIENT_SECRET");
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Google SSO not configured" }, { status: 503 });
  }

  const url = new URL(req.url);
  const next = url.searchParams.get("next") || "/dashboard";
  const role = url.searchParams.get("role") || "client";
  const redirectUri = `${url.origin}/api/auth/oauth/google/callback`;
  const state = Buffer.from(JSON.stringify({ next, role })).toString("base64url");

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent");

  return NextResponse.redirect(authUrl.toString());
}
