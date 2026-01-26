import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasD1Binding } from "@/lib/db/config";

const updateSchema = z.object({
  verification_status: z.enum(["pending", "verified", "rejected", "needs_clearer", "out_of_date"]),
  verification_notes: z.string().optional().or(z.literal("")),
  visible_to_clients: z.coerce.number().optional(),
  renewal_status: z.enum(["active", "will_not_renew"]).optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string; ticketId: string }> }) {
  const { id, ticketId } = await params;
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
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  await db
    .prepare(
      `UPDATE worker_tickets
       SET verification_status = ?, verification_notes = ?, visible_to_clients = ?, verified = ?, renewal_status = COALESCE(?, renewal_status),
           updated_at = strftime('%s','now')
       WHERE ticket_id = ? AND worker_id = ?`,
    )
    .bind(
      parsed.data.verification_status,
      parsed.data.verification_notes || null,
      parsed.data.visible_to_clients ?? 0,
      parsed.data.verification_status === "verified" ? 1 : 0,
      parsed.data.renewal_status ?? null,
      ticketId,
      id,
    )
    .run();

  return NextResponse.json({ ok: true });
}
