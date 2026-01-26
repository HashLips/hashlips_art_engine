import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasD1Binding } from "@/lib/db/config";
import { sendAutoReplyEmail } from "@/lib/email";

const assignSchema = z.object({
  worker_id: z.string().min(1),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
  const parsed = assignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const requestId = id;
  const assignmentId = crypto.randomUUID();

  const reqRow = await db
    .prepare("SELECT request_id, client_id FROM requests WHERE request_id = ? LIMIT 1")
    .bind(requestId)
    .first();
  const clientId = (reqRow as { client_id?: string | null })?.client_id;
  if (!clientId) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  await db
    .prepare(
      "INSERT INTO assignments (assignment_id, request_id, worker_id, client_id, status, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(
      assignmentId,
      requestId,
      parsed.data.worker_id,
      clientId,
      "proposed",
      session.userId || session.email || null,
      session.userId || session.email || null,
    )
    .run();

  await db
    .prepare("UPDATE requests SET review_status = ?, status_reason = ?, updated_at = strftime('%s','now') WHERE request_id = ?")
    .bind("assigned", null, requestId)
    .run();

  const meta = await db
    .prepare(
      `SELECT requests.request_id, clients.contact_email, clients.contact_name, clients.org_name
       FROM requests
       LEFT JOIN clients ON requests.client_id = clients.client_id
       WHERE requests.request_id = ? LIMIT 1`,
    )
    .bind(requestId)
    .first();

  const contactEmail = (meta as { contact_email?: string | null })?.contact_email ?? null;
  const contactName = (meta as { contact_name?: string | null })?.contact_name ?? "";
  const orgName = (meta as { org_name?: string | null })?.org_name ?? "";
  if (contactEmail) {
    const lines = [
      `Hello ${contactName || "there"},`,
      "",
      "Your request has moved to: assigned.",
      orgName ? `Company: ${orgName}` : "",
      `Request ID: ${requestId}`,
      "",
      "We will confirm the active start time shortly.",
    ].filter(Boolean);
    await sendAutoReplyEmail({
      to: contactEmail,
      subject: "Request update: assigned",
      text: lines.join("\n"),
    });
  }

  return NextResponse.json({ ok: true, assignment_id: assignmentId });
}
