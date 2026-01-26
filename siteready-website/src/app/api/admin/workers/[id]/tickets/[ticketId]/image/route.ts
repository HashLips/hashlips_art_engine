import { NextRequest, NextResponse } from "next/server";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasD1Binding, hasR2Binding } from "@/lib/db/config";
import { getWorkerById, listWorkerTickets } from "@/lib/db/workers";
import { getObject } from "@/lib/storage/r2";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string; ticketId: string }> }) {
  const { id, ticketId } = await params;
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.adminLevel !== "admin" && session.adminLevel !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!hasD1Binding() || !hasR2Binding()) return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const worker = await getWorkerById(db, id);
  if (!worker) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const tickets = await listWorkerTickets(db, id);
  const ticket = tickets.find((item) => item.ticket_id === ticketId);
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const side = req.nextUrl.searchParams.get("side") || "";
  const key = side === "front" ? ticket.front_image_key : side === "back" ? ticket.back_image_key : null;
  if (!key) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const obj = await getObject(key);
  if (!obj?.body) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return new NextResponse(obj.body, {
    status: 200,
    headers: {
      "Content-Type": obj.httpMetadata?.contentType || "application/octet-stream",
      "Cache-Control": "private, max-age=300",
    },
  });
}
