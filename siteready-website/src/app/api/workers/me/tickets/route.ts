import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasD1Binding, hasR2Binding } from "@/lib/db/config";
import { ensureWorkerForUser, listWorkerTickets, upsertWorkerTicket, deleteWorkerTicket } from "@/lib/db/workers";
import { putBase64Object } from "@/lib/storage/r2";
import { TICKETS } from "@/lib/bookings/datasets";

const ticketTypeOptions = [...TICKETS, "Other"] as [string, ...string[]];
const ticketSchema = z.object({
  ticket_id: z.string().optional(),
  type: z.enum(ticketTypeOptions),
  other_type: z.string().optional().or(z.literal("")),
  years_experience: z.coerce.number().int().nonnegative().optional(),
  ticket_number: z.string().min(1, "Ticket / Card number is required"),
  issue_date: z.string().min(1, "Ticket issue / training date is required"),
  expiry_date: z.string().min(1, "Expiry date is required"),
  front_image: z.string().optional().or(z.literal("")),
  front_image_type: z.string().optional().or(z.literal("")),
  front_image_name: z.string().optional().or(z.literal("")),
  back_image: z.string().optional().or(z.literal("")),
  back_image_type: z.string().optional().or(z.literal("")),
  back_image_name: z.string().optional().or(z.literal("")),
}).refine((data) => data.type !== "Other" || !!data.other_type?.trim(), {
  message: "Other ticket type is required",
  path: ["other_type"],
});

export async function GET(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "worker") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!hasD1Binding()) return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });
  const worker = await ensureWorkerForUser(db, session.userId || session.email || "", session.email);
  const tickets = await listWorkerTickets(db, worker.worker_id);
  return NextResponse.json({ ok: true, tickets });
}

export async function POST(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "worker") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!hasD1Binding()) return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const body = await req.json().catch(() => null);
  const parsed = ticketSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }
  const hasImages = !!parsed.data.front_image || !!parsed.data.back_image;
  if (hasImages && !hasR2Binding()) {
    return NextResponse.json({ error: "Ticket storage not configured" }, { status: 503 });
  }

  const worker = await ensureWorkerForUser(db, session.userId || session.email || "", session.email);
  const ticketId = parsed.data.ticket_id ?? crypto.randomUUID();
  let frontKey: string | null = null;
  let backKey: string | null = null;

  if (parsed.data.front_image) {
    const key = `workers/${worker.worker_id}/tickets/${ticketId}/front-${Date.now()}`;
    frontKey = await putBase64Object({
      key,
      base64: parsed.data.front_image,
      contentType: parsed.data.front_image_type || "image/jpeg",
    });
  }
  if (parsed.data.back_image) {
    const key = `workers/${worker.worker_id}/tickets/${ticketId}/back-${Date.now()}`;
    backKey = await putBase64Object({
      key,
      base64: parsed.data.back_image,
      contentType: parsed.data.back_image_type || "image/jpeg",
    });
  }

  const resolvedType = parsed.data.type === "Other" ? (parsed.data.other_type ?? "").trim() : parsed.data.type;
  const saved = await upsertWorkerTicket(db, {
    ticket_id: ticketId,
    worker_id: worker.worker_id,
    type: resolvedType,
    front_image_key: frontKey,
    back_image_key: backKey,
    front_image_name: parsed.data.front_image_name || null,
    back_image_name: parsed.data.back_image_name || null,
    ticket_number: parsed.data.ticket_number || null,
    years_experience: parsed.data.years_experience ?? null,
    issue_date: parsed.data.issue_date || null,
    verification_status: "pending",
    verification_notes: null,
    expiry_date: parsed.data.expiry_date || null,
    verified: 0,
    visible_to_clients: 0,
  });

  return NextResponse.json({ ok: true, ticket: saved });
}

export async function DELETE(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "worker") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!hasD1Binding()) return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const url = new URL(req.url);
  const ticketId = url.searchParams.get("ticket_id");
  if (!ticketId) return NextResponse.json({ error: "Missing ticket_id" }, { status: 400 });
  await deleteWorkerTicket(db, ticketId);
  return NextResponse.json({ ok: true });
}
