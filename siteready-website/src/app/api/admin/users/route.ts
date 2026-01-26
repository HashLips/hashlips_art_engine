import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasD1Binding } from "@/lib/db/config";
import { createUserIfNotExists, getUserByEmail, updateUserRole } from "@/lib/db/user";
import { insertPasswordReset } from "@/lib/db/password-resets";
import { sha256Hex } from "@/lib/security/hash";
import { sendAutoReplyEmail } from "@/lib/email";

const schema = z.object({
  email: z.string().email(),
  role: z.enum(["client", "worker", "staff"]),
});

export async function POST(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.adminLevel !== "admin" && session.adminLevel !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!hasD1Binding()) {
    return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  }
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  let user = await getUserByEmail(db, parsed.data.email);
  if (user) {
    if (user.role !== parsed.data.role && user.role !== "staff") {
      await updateUserRole(db, user.user_id, parsed.data.role);
      user = { ...user, role: parsed.data.role };
    }
  } else {
    user = await createUserIfNotExists(db, parsed.data.email, parsed.data.role);
  }

  const token = crypto.randomUUID().replace(/-/g, "");
  const tokenHash = await sha256Hex(token);
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60; // 60 minutes

  await insertPasswordReset(db, {
    token_hash: tokenHash,
    user_id: user.user_id,
    expires_at: expiresAt,
  });

  const resetUrl = new URL("/reset-password", req.nextUrl.origin);
  resetUrl.searchParams.set("token", token);

  await sendAutoReplyEmail({
    to: parsed.data.email,
    subject: "Set your SiteReady Workforce password",
    text: [
      "You've been invited to SiteReady Workforce.",
      "",
      "Use the link below to set your password:",
      resetUrl.toString(),
      "",
      "If you did not expect this email, you can ignore it.",
    ].join("\n"),
  });

  return NextResponse.json({ ok: true });
}
