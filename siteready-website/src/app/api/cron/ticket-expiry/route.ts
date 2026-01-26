import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { hasD1Binding } from "@/lib/db/config";
import { sendWorkerReminderEmail } from "@/lib/email";

export const runtime = "nodejs";

const DAY_MS = 1000 * 60 * 60 * 24;

type TicketReminderRow = {
  ticket_id: string;
  worker_id: string;
  type: string;
  expiry_date: string | null;
  renewal_status: string | null;
  reminder_30_sent_at: string | null;
  reminder_7_sent_at: string | null;
  email: string | null;
  company_number: string | null;
  first_name: string | null;
  last_name: string | null;
  delete_requested: number | null;
};

export async function POST(req: NextRequest) {
  const cronKey = process.env.CRON_KEY || "";
  const provided = req.headers.get("x-cron-key") || "";
  if (!cronKey || provided !== cronKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasD1Binding()) return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const res = await db
    .prepare(
      `SELECT wt.ticket_id, wt.worker_id, wt.type, wt.expiry_date, wt.renewal_status, wt.reminder_30_sent_at, wt.reminder_7_sent_at,
              w.email, w.company_number, w.first_name, w.last_name, w.delete_requested
       FROM worker_tickets wt
       JOIN workers w ON w.worker_id = wt.worker_id
       WHERE wt.expiry_date IS NOT NULL AND wt.expiry_date != ""`,
    )
    .all();

  const rows = (res?.results as TicketReminderRow[]) ?? [];
  const now = Date.now();
  let sent = 0;
  let skipped = 0;

  for (const row of rows) {
    if (!row.expiry_date) {
      skipped += 1;
      continue;
    }
    if (row.delete_requested) {
      skipped += 1;
      continue;
    }
    if (row.renewal_status === "will_not_renew") {
      skipped += 1;
      continue;
    }
    const expiry = new Date(row.expiry_date);
    if (Number.isNaN(expiry.getTime())) {
      skipped += 1;
      continue;
    }
    const days = Math.ceil((expiry.getTime() - now) / DAY_MS);
    if (days < 0) {
      skipped += 1;
      continue;
    }

    const shouldSend30 = days === 30 && !row.reminder_30_sent_at;
    const shouldSend7 = days === 7 && !row.reminder_7_sent_at;
    if (!shouldSend30 && !shouldSend7) {
      skipped += 1;
      continue;
    }

    const workerLabel = [
      row.first_name || "",
      row.last_name || "",
    ]
      .join(" ")
      .trim() || row.worker_id;
    const workerId = row.company_number ? `${workerLabel} (${row.company_number})` : workerLabel;
    const reminderDays = shouldSend30 ? 30 : 7;
    const subject = `Ticket expiring in ${reminderDays} days: ${row.type}`;
    const text = [
      `Hi ${workerLabel || "there"},`,
      "",
      `Your ${row.type} ticket is due to expire on ${row.expiry_date}.`,
      `This is a ${reminderDays}-day reminder. Please renew and upload the updated ticket to stay eligible for site work.`,
      "",
      `Worker ID: ${workerId}`,
      "If you do not plan to renew this ticket, please update it in your worker portal.",
    ].join("\n");

    await sendWorkerReminderEmail({
      to: row.email || "",
      subject,
      text,
    });

    if (shouldSend30) {
      await db
        .prepare("UPDATE worker_tickets SET reminder_30_sent_at = ?, updated_at = strftime('%s','now') WHERE ticket_id = ?")
        .bind(new Date().toISOString(), row.ticket_id)
        .run();
    }
    if (shouldSend7) {
      await db
        .prepare("UPDATE worker_tickets SET reminder_7_sent_at = ?, updated_at = strftime('%s','now') WHERE ticket_id = ?")
        .bind(new Date().toISOString(), row.ticket_id)
        .run();
    }
    sent += 1;
  }

  return NextResponse.json({ ok: true, sent, skipped });
}
