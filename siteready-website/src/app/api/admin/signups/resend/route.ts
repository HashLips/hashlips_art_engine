import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasD1Binding } from "@/lib/db/config";
import { sha256Hex } from "@/lib/security/hash";
import { getClientSignupById, refreshClientSignupToken } from "@/lib/db/clientSignups";
import { sendClientOnboardingEmail } from "@/lib/email";

const payloadSchema = z.object({
  id: z.string().min(1),
});

const TOKEN_TTL_SECONDS = 48 * 60 * 60;

function isAdmin(session: Awaited<ReturnType<typeof parseSessionFromRequest>>) {
  return (
    session?.adminLevel === "admin" ||
    session?.adminLevel === "super_admin" ||
    session?.adminLevel === "payroll_admin"
  );
}

function createToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function POST(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!hasD1Binding()) return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const body = await req.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const signup = await getClientSignupById(db, parsed.data.id);
  if (!signup) return NextResponse.json({ error: "Signup not found" }, { status: 404 });
  if (signup.status === "converted") {
    return NextResponse.json({ error: "Signup already converted" }, { status: 400 });
  }

  const now = Math.floor(Date.now() / 1000);
  const token = createToken();
  const tokenHash = await sha256Hex(token);
  const expiresAt = now + TOKEN_TTL_SECONDS;

  await refreshClientSignupToken(db, {
    id: signup.id,
    onboarding_token_hash: tokenHash,
    onboarding_token_expires_at: expiresAt,
    email_sent_at: now,
    updated_at: now,
  });

  const origin = req.headers.get("origin") || "https://sitereadyworkforce.com";
  const onboardingUrl = `${origin}/register?onboarding=${encodeURIComponent(token)}`;
  const subject = "SiteReady Workforce onboarding";
  const text = [
    "Thanks for signing up to book labour with SiteReady Workforce.",
    "",
    "Use your onboarding link below to create your login (Google, Apple, or email + password) and complete setup:",
    onboardingUrl,
    "",
    "This link expires in 48 hours.",
  ].join("\n");
  const html = `
    <p>Thanks for signing up to book labour with SiteReady Workforce.</p>
    <p>Use your onboarding link below to create your login (Google, Apple, or email + password) and complete setup:</p>
    <p>
      <a
        href="${onboardingUrl}"
        style="display:inline-block;background:#FBBF24;color:#111827;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:600;"
      >
        Click here to start onboarding
      </a>
    </p>
    <p>If the button does not work, copy and paste this link:</p>
    <p><a href="${onboardingUrl}">${onboardingUrl}</a></p>
    <p>This link expires in 48 hours.</p>
  `;
  await sendClientOnboardingEmail({
    to: signup.email,
    subject,
    text,
    html,
  });

  return NextResponse.json({ ok: true });
}
