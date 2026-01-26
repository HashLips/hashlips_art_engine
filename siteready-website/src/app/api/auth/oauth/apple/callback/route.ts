import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { hasD1Binding } from "@/lib/db/config";
import { updateUserAdminLevel, upsertOAuthUser } from "@/lib/db/user";
import { createSessionCookie, setSessionCookie } from "@/lib/auth/session";

function getEnv(key: string) {
  return process.env[key] || process.env[key.toUpperCase()] || "";
}

function base64url(input: ArrayBuffer | Uint8Array | string) {
  const buf = typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
  const str = Buffer.from(buf).toString("base64");
  return str.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function importApplePrivateKey(pem: string) {
  const clean = pem.replace(/-----BEGIN PRIVATE KEY-----/g, "").replace(/-----END PRIVATE KEY-----/g, "").replace(/\s+/g, "");
  const binary = Buffer.from(clean, "base64");
  return crypto.subtle.importKey("pkcs8", binary, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
}

async function createAppleClientSecret(clientId: string, teamId: string, keyId: string, privKey: string) {
  const header = { alg: "ES256", kid: keyId, typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = { iss: teamId, iat: now, exp: now + 300, aud: "https://appleid.apple.com", sub: clientId };
  const data = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;
  const key = await importApplePrivateKey(privKey);
  const signature = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, new TextEncoder().encode(data));
  const sigB64 = base64url(signature);
  return `${data}.${sigB64}`;
}

export async function POST(req: NextRequest) {
  const clientId = getEnv("APPLE_CLIENT_ID");
  const keyId = getEnv("APPLE_KEY_ID");
  const teamId = getEnv("APPLE_TEAM_ID");
  const privKey = getEnv("APPLE_PRIVATE_KEY");
  if (!clientId || !keyId || !teamId || !privKey) {
    return NextResponse.json({ error: "Apple SSO not configured" }, { status: 503 });
  }

  const form = await req.formData();
  const code = (form.get("code") || req.nextUrl.searchParams.get("code")) as string | null;
  const stateRaw = (form.get("state") || req.nextUrl.searchParams.get("state")) as string | null;
  if (!code || !stateRaw) {
    return NextResponse.json({ error: "Missing code/state" }, { status: 400 });
  }
  let state: { next?: string; role?: string } = {};
  try {
    state = JSON.parse(Buffer.from(stateRaw, "base64url").toString());
  } catch {
    // ignore
  }
  const next = state.next || "/dashboard";
  const role = (state.role as "client" | "worker" | "staff") || "client";
  const redirectUri = `${req.nextUrl.origin}/api/auth/oauth/apple/callback`;

  const clientSecret = await createAppleClientSecret(clientId, teamId, keyId, privKey);
  const tokenRes = await fetch("https://appleid.apple.com/auth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.json({ error: "Apple token exchange failed" }, { status: 400 });
  }
  const tokenJson = (await tokenRes.json()) as { id_token?: string };
  const idToken = tokenJson.id_token;
  if (!idToken) return NextResponse.json({ error: "Missing id_token" }, { status: 400 });

  const parts = idToken.split(".");
  if (parts.length < 2) return NextResponse.json({ error: "Invalid id_token" }, { status: 400 });
  let email: string | undefined;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
    email = payload.email;
  } catch {
    // ignore
  }
  if (!email) return NextResponse.json({ error: "Email not available" }, { status: 400 });

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
  const res = NextResponse.redirect(new URL(next, req.nextUrl.origin));
  setSessionCookie(res, cookie);
  return res;
}

