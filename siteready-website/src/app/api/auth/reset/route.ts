import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { hasD1Binding } from "@/lib/db/config";
import { getPasswordReset, deletePasswordReset } from "@/lib/db/password-resets";
import { updateUserPassword } from "@/lib/db/user";
import { sha256Hex } from "@/lib/security/hash";

const schema = z.object({
  token: z.string().min(10),
  password: z.string().min(6),
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
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const tokenHash = await sha256Hex(parsed.data.token);
  const record = await getPasswordReset(db, tokenHash);
  if (!record) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }
  const now = Math.floor(Date.now() / 1000);
  if (record.expires_at < now) {
    await deletePasswordReset(db, tokenHash);
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  await updateUserPassword(db, record.user_id, parsed.data.password);
  await deletePasswordReset(db, tokenHash);
  return NextResponse.json({ ok: true });
}
