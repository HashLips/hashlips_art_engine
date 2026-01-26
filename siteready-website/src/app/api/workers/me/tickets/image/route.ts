import { NextRequest, NextResponse } from "next/server";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasD1Binding, hasR2Binding } from "@/lib/db/config";
import { ensureWorkerForUser, listWorkerTickets, updateWorkerTicketImages } from "@/lib/db/workers";
import { deleteObject, getObject } from "@/lib/storage/r2";

export const runtime = "nodejs";

const resolveTicketImage = async (req: NextRequest) => {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (session.role !== "worker") return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  if (!hasD1Binding() || !hasR2Binding()) {
    return { error: NextResponse.json({ error: "Platform not configured" }, { status: 503 }) };
  }
  const db = getDb();
  if (!db) return { error: NextResponse.json({ error: "DB unavailable" }, { status: 503 }) };

  const url = new URL(req.url);
  const ticketId = url.searchParams.get("ticket_id") || "";
  const side = url.searchParams.get("side") || "";
  if (!ticketId || (side !== "front" && side !== "back")) {
    return { error: NextResponse.json({ error: "Missing ticket_id or side" }, { status: 400 }) };
  }

  const worker = await ensureWorkerForUser(db, session.userId || session.email || "", session.email);
  const tickets = await listWorkerTickets(db, worker.worker_id);
  const ticket = tickets.find((item) => item.ticket_id === ticketId);
  if (!ticket) return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };

  const key = side === "front" ? ticket.front_image_key : ticket.back_image_key;
  if (!key) return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };

  return { db, ticket, key, side };
};

export async function GET(req: NextRequest) {
  const resolved = await resolveTicketImage(req);
  if ("error" in resolved) return resolved.error;

  const obj = await getObject(resolved.key);
  if (!obj?.body) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return new NextResponse(obj.body, {
    status: 200,
    headers: {
      "Content-Type": obj.httpMetadata?.contentType || "application/octet-stream",
      "Cache-Control": "private, max-age=300",
    },
  });
}

export async function DELETE(req: NextRequest) {
  const resolved = await resolveTicketImage(req);
  if ("error" in resolved) return resolved.error;

  await deleteObject(resolved.key);
  await updateWorkerTicketImages(resolved.db, resolved.ticket.ticket_id, {
    ...(resolved.side === "front"
      ? { front_image_key: null, front_image_name: null }
      : { back_image_key: null, back_image_name: null }),
  });

  return NextResponse.json({ ok: true });
}
