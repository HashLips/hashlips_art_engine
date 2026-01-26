import { NextResponse } from "next/server";
import { z } from "zod";
import { createSessionCookie } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasD1Binding } from "@/lib/db/config";
import { updateUserAdminLevel, verifyUserPassword } from "@/lib/db/user";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const schema = z.object({
    email: z.string().email(),
    password: z.string(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid login payload" }, { status: 400 });
  }

  if (!hasD1Binding()) {
    return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  }
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const user = await verifyUserPassword(db, parsed.data.email, parsed.data.password);
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
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
  const email = (user.email || "").toLowerCase();
  if (superAdmins.includes(email)) {
    const updated = await updateUserAdminLevel(db, user.email!, "super_admin");
    adminLevel = updated?.admin_level ?? "super_admin";
  } else if (admins.includes(email)) {
    const updated = await updateUserAdminLevel(db, user.email!, "admin");
    adminLevel = updated?.admin_level ?? "admin";
  }

  const cookie = await createSessionCookie({
    role: user.role,
    adminLevel,
    email: user.email ?? undefined,
    userId: user.user_id,
  });
  const res = NextResponse.json({ ok: true, role: user.role });
  res.cookies.set(cookie);
  return res;
}
