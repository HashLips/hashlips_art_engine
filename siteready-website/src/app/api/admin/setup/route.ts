import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { hasD1Binding } from "@/lib/db/config";
import { createUserIfNotExists, getUserByEmail, updateUserAdminLevel, updateUserPassword, updateUserRole } from "@/lib/db/user";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export async function POST(req: NextRequest) {
  if (!hasD1Binding()) {
    return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  }
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues?.[0]?.message || "Invalid payload";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const superAdmins = (process.env.SUPER_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (!superAdmins.includes(parsed.data.email.toLowerCase())) {
    return NextResponse.json({ error: "Email not authorized for super admin setup." }, { status: 403 });
  }

  let user = await getUserByEmail(db, parsed.data.email);
  if (!user) {
    user = await createUserIfNotExists(db, parsed.data.email, "staff", parsed.data.password);
  } else {
    await updateUserPassword(db, user.user_id, parsed.data.password);
    if (user.role !== "staff") {
      await updateUserRole(db, user.user_id, "staff");
    }
  }
  await updateUserAdminLevel(db, parsed.data.email, "super_admin");

  return NextResponse.json({ ok: true });
}
