import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { hasD1Binding } from "@/lib/db/config";
import { getUserByEmail } from "@/lib/db/user";
import { insertPasswordReset } from "@/lib/db/password-resets";
import { sha256Hex } from "@/lib/security/hash";
import { sendAutoReplyEmail } from "@/lib/email";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  if (!hasD1Binding()) {
    return NextResponse.json({ ok: true });
  }
  const db = getDb();
  if (!db) return NextResponse.json({ ok: true });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: true });
  }

  const user = await getUserByEmail(db, parsed.data.email);
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  const token = crypto.randomUUID().replace(/-/g, "");
  const tokenHash = await sha256Hex(token);
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 30; // 30 minutes

  await insertPasswordReset(db, {
    token_hash: tokenHash,
    user_id: user.user_id,
    expires_at: expiresAt,
  });

  const resetUrl = new URL("/reset-password", req.nextUrl.origin);
  resetUrl.searchParams.set("token", token);

  await sendAutoReplyEmail({
    to: parsed.data.email,
    subject: "Reset your SiteReady Workforce password",
    text: [
      "We received a request to reset your password.",
      "",
      "Use the link below to set a new password:",
      resetUrl.toString(),
      "",
      "If you did not request this, you can ignore this email.",
    ].join("\n"),
  });

  return NextResponse.json({ ok: true });
}
