import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { hasD1Binding } from "@/lib/db/config";
import { sha256Hex } from "@/lib/security/hash";
import { getClientSignupByTokenHash, markClientSignupClicked } from "@/lib/db/clientSignups";

const COOKIE_NAME = "sr_onboarding_token";
const COOKIE_MAX_AGE = 2 * 60 * 60;

export async function POST(req: NextRequest) {
  if (!hasD1Binding()) {
    return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  }
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const body = await req.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }
  const tokenHash = await sha256Hex(token);
  const signup = await getClientSignupByTokenHash(db, tokenHash);
  if (!signup) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }
  const now = Math.floor(Date.now() / 1000);
  if (signup.onboarding_token_expires_at < now) {
    return NextResponse.json({ error: "Token expired" }, { status: 400 });
  }

  await markClientSignupClicked(db, signup.id, now);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return res;
}
