import { NextResponse } from "next/server";
import { hasD1Binding } from "@/lib/db/config";
import { getDb } from "@/lib/db/client";
import { createUserIfNotExists } from "@/lib/db/user";

export async function POST() {
  if (!hasD1Binding()) {
    return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  }
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const seeds = [
    { email: process.env.SEED_STAFF_EMAIL, password: process.env.SEED_STAFF_PASSWORD, role: "staff" as const },
    { email: process.env.SEED_CLIENT_EMAIL, password: process.env.SEED_CLIENT_PASSWORD, role: "client" as const },
    { email: process.env.SEED_WORKER_EMAIL, password: process.env.SEED_WORKER_PASSWORD, role: "worker" as const },
  ].filter((s) => s.email && s.password);

  if (!seeds.length) {
    return NextResponse.json({ ok: false, message: "No seed env vars provided. Set SEED_* envs to use this endpoint." }, { status: 400 });
  }

  const created: string[] = [];
  for (const s of seeds) {
    const user = await createUserIfNotExists(db, s.email!, s.role, s.password!);
    created.push(`${s.role}:${user.email}`);
  }

  return NextResponse.json({ ok: true, created });
}
