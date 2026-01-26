import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { hasD1Binding } from "@/lib/db/config";
import { createUserIfNotExists, getUserByEmail, updateUserAdminLevel, updateUserRole } from "@/lib/db/user";
import { createSessionCookie } from "@/lib/auth/session";
import { sendAutoReplyEmail } from "@/lib/email";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["client", "worker", "staff"]),
});

export async function POST(req: Request) {
  try {
    if (!hasD1Binding()) {
      return NextResponse.json({ error: "Platform not configured (no D1 binding)" }, { status: 503 });
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
      user = await createUserIfNotExists(db, parsed.data.email, parsed.data.role, parsed.data.password);
    }
    const superAdmins = (process.env.SUPER_ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const admins = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    let adminLevel = user.admin_level ?? undefined;
    const email = (parsed.data.email || "").toLowerCase();
    if (superAdmins.includes(email)) {
      const updated = await updateUserAdminLevel(db, parsed.data.email, "super_admin");
      adminLevel = updated?.admin_level ?? "super_admin";
    } else if (admins.includes(email)) {
      const updated = await updateUserAdminLevel(db, parsed.data.email, "admin");
      adminLevel = updated?.admin_level ?? "admin";
    }
    const cookie = await createSessionCookie({
      role: user.role,
      adminLevel,
      email: user.email ?? undefined,
      userId: user.user_id,
    });
    const siteUrl = "https://sitereadyworkforce.com";
    const nextPath = parsed.data.role === "worker" ? "/dashboard/worker" : "/dashboard/requests";
    const loginUrl = `${siteUrl}/login?next=${encodeURIComponent(nextPath)}`;
    try {
      await sendAutoReplyEmail({
        to: parsed.data.email,
        subject: "Welcome to SiteReady Workforce",
        text:
          "Thank you for signing up with SiteReady Workforce. We will get back to you with an offer as soon as we have placed a position for you to confirm if you would like to go to it.\n\n" +
          `Log in to your profile: ${loginUrl}\n\n` +
          "If you have any questions, reply to this email and our team will help.",
        html: `
          <div style="font-family: Arial, sans-serif; color: #0b1f3b; line-height: 1.6;">
            <h2 style="margin: 0 0 12px;">Welcome to SiteReady Workforce</h2>
            <p>Thank you for signing up with us. We will get back to you with an offer as soon as we have placed a position for you to confirm if you would like to go to it.</p>
            <p style="margin: 20px 0;">
              <a href="${loginUrl}" style="background: #0b1f3b; color: #fff; text-decoration: none; padding: 10px 18px; border-radius: 999px; display: inline-block;">
                Click here to log in
              </a>
            </p>
            <p>If you have any questions, reply to this email and our team will help.</p>
            <p style="color: #6b7280; font-size: 12px;">This email is for your account access and updates.</p>
          </div>
        `,
      });
    } catch (err) {
      console.warn("Registration auto-reply failed", err);
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set(cookie);
    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Registration failed", detail: message }, { status: 500 });
  }
}
