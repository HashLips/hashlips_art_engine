import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasD1Binding } from "@/lib/db/config";
import { sendAutoReplyEmail } from "@/lib/email";

const REVIEW_STATUSES = [
  "submitted",
  "under_review",
  "approved",
  "declined",
  "assigned",
  "active",
  "completed",
] as const;

const REQUEST_STATUSES = [
  "draft",
  "submitted",
  "candidates_proposed",
  "contract_signed",
  "released",
  "active",
  "completed",
] as const;

const updateSchema = z.object({
  review_status: z.enum(REVIEW_STATUSES),
  status_reason: z.string().optional().or(z.literal("")),
  status: z.enum(REQUEST_STATUSES).optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const requestId = id;
  const reviewStatus = parsed.data.review_status;
  const statusReason = parsed.data.status_reason?.trim() || null;
  const statusToApply =
    parsed.data.status ??
    (reviewStatus === "active" || reviewStatus === "completed" ? reviewStatus : "submitted");

  await db
    .prepare(
      "UPDATE requests SET review_status = ?, status_reason = ?, status = ?, updated_at = strftime('%s','now') WHERE request_id = ?",
    )
    .bind(reviewStatus, statusReason, statusToApply, requestId)
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
    const label = reviewStatus.replace("_", " ");
    const textLines = [
      `Hello ${contactName || "there"},`,
      "",
      `Your labour hire request has been updated to: ${label}.`,
      statusReason ? `Notes: ${statusReason}` : "",
      orgName ? `Company: ${orgName}` : "",
      `Request ID: ${requestId}`,
      "",
      "We will keep you updated as the request progresses.",
    ].filter(Boolean);
    await sendAutoReplyEmail({
      to: contactEmail,
      subject: `Request update: ${label}`,
      text: textLines.join("\n"),
    });
  }

  return NextResponse.json({ ok: true });
}
