import { NextRequest, NextResponse } from "next/server";
import { sign, verify } from "./crypto";
import { fromBase64Url, toBase64Url } from "./base64";

const COOKIE_NAME = "sr_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type SessionData = {
  sessionId: string;
  role: "client" | "worker" | "staff";
  adminLevel?: "admin" | "super_admin";
  email?: string;
  userId?: string;
  issuedAt: number;
  expiresAt: number;
};

function encode(payload: SessionData): string {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  return toBase64Url(bytes);
}

function decode(token: string): SessionData | null {
  try {
    const bytes = fromBase64Url(token);
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json) as SessionData;
  } catch {
    return null;
  }
}

export async function createSessionCookie(data: Omit<SessionData, "sessionId" | "issuedAt" | "expiresAt">) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + COOKIE_MAX_AGE;
  const buf = new Uint8Array(16);
  crypto.getRandomValues(buf);
  const sessionId = Array.from(buf)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const session: SessionData = {
    sessionId,
    issuedAt,
    expiresAt,
    ...data,
  };
  const body = encode(session);
  const sig = await sign(body);
  const value = `${body}.${sig}`;
  return {
    name: COOKIE_NAME,
    value,
    maxAge: COOKIE_MAX_AGE,
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    path: "/",
  };
}

export async function parseSessionFromRequest(
  req: NextRequest,
  options?: { allowUnverified?: boolean },
): Promise<SessionData | null> {
  const raw = req.cookies.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  const [body, sig] = raw.split(".");
  if (!body || !sig) return null;
  const session = decode(body);
  if (!session) return null;
  const now = Math.floor(Date.now() / 1000);
  if (session.expiresAt < now) return null;
  const valid = await verify(body, sig);
  if (!valid && !options?.allowUnverified) return null;
  return session;
}

export function clearSessionCookie() {
  return {
    name: COOKIE_NAME,
    value: "",
    maxAge: 0,
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    path: "/",
  };
}

export function setSessionCookie(res: NextResponse, cookie: ReturnType<typeof createSessionCookie> extends Promise<infer T> ? T : never) {
  res.cookies.set(cookie);
  return res;
}
