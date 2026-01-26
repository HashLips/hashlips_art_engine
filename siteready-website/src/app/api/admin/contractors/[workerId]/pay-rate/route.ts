import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasD1Binding } from "@/lib/db/config";

const schema = z.object({
  contractor_pay_rate_cents: z.coerce.number().int().min(0),
});

function isAdmin(session: Awaited<ReturnType<typeof parseSessionFromRequest>>) {
  return (
    session?.adminLevel === "admin" ||
    session?.adminLevel === "super_admin" ||
    session?.adminLevel === "payroll_admin"
  );
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ workerId: string }> }) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!hasD1Binding()) return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const { workerId } = await params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const res = (await db
    .prepare(
      "UPDATE contractor_company SET contractor_pay_rate_cents = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE worker_id = ?",
    )
    .bind(parsed.data.contractor_pay_rate_cents, workerId)
    .run()) as { changes?: number };
  if (!res.changes) {
    return NextResponse.json({ error: "Contractor not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
