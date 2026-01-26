import { NextRequest, NextResponse } from "next/server";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasD1Binding } from "@/lib/db/config";
import { getTimesheetHeader, getTimesheetLines } from "@/lib/db/timesheets";
import { ensureWorkerForUser, getWorkerById } from "@/lib/db/workers";
import { ensureClientForUser } from "@/lib/db/clients";
import { hasAccepted } from "@/lib/legal/acceptance";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasD1Binding()) return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const header = await getTimesheetHeader(db, id);
  if (!header) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (session.role === "worker") {
    const worker = await ensureWorkerForUser(db, session.userId || session.email || "", session.email);
    if (header.worker_id !== worker.worker_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }
  if (session.role === "client") {
    const client = await ensureClientForUser(db, session.userId || "", session.email);
    if (header.client_id !== client.client_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const userId = session.userId || session.email;
    if (userId) {
      const accepted = await hasAccepted(db, userId, "CLIENT_CONFIDENTIALITY_TERMS");
      if (!accepted) {
        return NextResponse.json(
          { error: "Legal acceptance required", code: "NEEDS_LEGAL_ACCEPTANCE", document: "CLIENT_CONFIDENTIALITY_TERMS" },
          { status: 403 },
        );
      }
    }
  }
  if (session.role !== "worker" && session.role !== "client") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const lines = await getTimesheetLines(db, id);
  const worker = await getWorkerById(db, header.worker_id);
  const workerSummary = worker
    ? {
        worker_id: worker.worker_id,
        name: worker.name,
        first_name: worker.first_name,
        last_name: worker.last_name,
        role_id: worker.role_id,
      }
    : null;

  return NextResponse.json({ ok: true, header, lines, worker: workerSummary });
}
