import { NextRequest, NextResponse } from "next/server";

function getEnv(key: string) {
  return process.env[key] || process.env[key.toUpperCase()] || "";
}

export async function GET(req: NextRequest) {
  const clientId = getEnv("APPLE_CLIENT_ID");
  const keyId = getEnv("APPLE_KEY_ID");
  const teamId = getEnv("APPLE_TEAM_ID");
  const privKey = getEnv("APPLE_PRIVATE_KEY");
  if (!clientId || !keyId || !teamId || !privKey) {
    return NextResponse.json({ error: "Apple SSO not configured" }, { status: 503 });
  }

  const url = new URL(req.url);
  const next = url.searchParams.get("next") || "/dashboard";
  const role = url.searchParams.get("role") || "client";
  const redirectUri = `${url.origin}/api/auth/oauth/apple/callback`;
  const state = Buffer.from(JSON.stringify({ next, role })).toString("base64url");

  const authUrl = new URL("https://appleid.apple.com/auth/authorize");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("response_mode", "form_post");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", "name email");
  authUrl.searchParams.set("state", state);

  return NextResponse.redirect(authUrl.toString());
}
