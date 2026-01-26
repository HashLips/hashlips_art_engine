import { NextRequest, NextResponse } from "next/server";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasD1Binding } from "@/lib/db/config";
import { sha256Hex } from "@/lib/security/hash";
import { getClientSignupByTokenHash, markClientSignupConverted } from "@/lib/db/clientSignups";
import { updateUserRole } from "@/lib/db/user";

const COOKIE_NAME = "sr_onboarding_token";

export async function POST(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session || !session.userId || !session.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasD1Binding()) {
    return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  }
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const token = req.cookies.get(COOKIE_NAME)?.value || "";
  if (!token) {
    return NextResponse.json({ error: "Missing onboarding token" }, { status: 400 });
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
  if (signup.email.toLowerCase() !== session.email.toLowerCase()) {
    return NextResponse.json({ error: "Email mismatch" }, { status: 400 });
  }

  await markClientSignupConverted(db, signup.id, session.userId, now);
  if (session.role !== "client") {
    await updateUserRole(db, session.userId, "client");
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return res;
}
