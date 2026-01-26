import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasD1Binding } from "@/lib/db/config";

const payloadSchema = z.object({
  withholding_variation_percent: z.number().int().min(0).max(100).nullable(),
});

function isAdmin(session: Awaited<ReturnType<typeof parseSessionFromRequest>>) {
  return (
    session?.adminLevel === "admin" ||
    session?.adminLevel === "super_admin" ||
    session?.adminLevel === "payroll_admin"
  );
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!hasD1Binding()) return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const body = await req.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const { id } = await params;
  const workerId = id;
  const existing = await db
    .prepare("SELECT worker_id FROM worker_tax_declarations WHERE worker_id = ? LIMIT 1")
    .bind(workerId)
    .first();
  if (!existing) {
    return NextResponse.json({ error: "Tax declaration not found" }, { status: 404 });
  }

  await db
    .prepare("UPDATE worker_tax_declarations SET withholding_variation_percent = ? WHERE worker_id = ?")
    .bind(parsed.data.withholding_variation_percent, workerId)
    .run();

  return NextResponse.json({ ok: true });
}
