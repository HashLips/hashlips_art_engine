import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { hasD1Binding } from "@/lib/db/config";
import { updateUserAdminLevel, upsertOAuthUser } from "@/lib/db/user";
import { createSessionCookie, setSessionCookie } from "@/lib/auth/session";
import { fromBase64Url } from "@/lib/auth/base64";

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
  const code = url.searchParams.get("code");
  const stateRaw = url.searchParams.get("state");
  if (!code || !stateRaw) {
    return NextResponse.json({ error: "Missing code/state" }, { status: 400 });
  }

  let state: { next?: string; role?: string } = {};
  try {
    const bytes = fromBase64Url(stateRaw);
    const json = new TextDecoder().decode(bytes);
    state = JSON.parse(json);
  } catch {
    // ignore
  }
  const role = (state.role as "client" | "worker" | "staff") || "client";
  const next =
    state.next ||
    (role === "worker" ? "/dashboard/worker" : "/dashboard/requests");
  const redirectUri = `${url.origin}/api/auth/oauth/google/callback`;

  let tokenRes: Response;
  try {
    tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
  } catch {
    return NextResponse.json({ error: "Token exchange failed" }, { status: 502 });
  }

  if (!tokenRes.ok) {
    return NextResponse.json({ error: "Token exchange failed" }, { status: 400 });
  }

  const tokenJson = (await tokenRes.json()) as { access_token?: string };
  const accessToken = tokenJson.access_token;
  if (!accessToken) {
    return NextResponse.json({ error: "Missing access token" }, { status: 400 });
  }

  let userInfoRes: Response;
  try {
    userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch user info" }, { status: 502 });
  }
  if (!userInfoRes.ok) {
    return NextResponse.json({ error: "Failed to fetch user info" }, { status: 400 });
  }
  const userInfo = (await userInfoRes.json()) as { email?: string };
  const email = userInfo.email;
  if (!email) {
    return NextResponse.json({ error: "Email not available" }, { status: 400 });
  }

  if (!hasD1Binding()) {
    return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  }
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const user = await upsertOAuthUser(db, email, role === "staff" ? "client" : role);
  const superAdmins = (process.env.SUPER_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const admins = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  let adminLevel = user.admin_level ?? undefined;
  const normalizedEmail = email.toLowerCase();
  if (superAdmins.includes(normalizedEmail)) {
    const updated = await updateUserAdminLevel(db, email, "super_admin");
    adminLevel = updated?.admin_level ?? "super_admin";
  } else if (admins.includes(normalizedEmail)) {
    const updated = await updateUserAdminLevel(db, email, "admin");
    adminLevel = updated?.admin_level ?? "admin";
  }
  const cookie = await createSessionCookie({
    role: user.role,
    adminLevel,
    email: user.email ?? undefined,
    userId: user.user_id,
  });
  const res = NextResponse.redirect(new URL(next, url.origin));
  setSessionCookie(res, cookie);
  return res;
}
