import { NextRequest, NextResponse } from "next/server";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { getXeroSettings, upsertXeroSettings } from "@/lib/db/xero";

export async function GET(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session || (session.adminLevel !== "admin" && session.adminLevel !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  const settings = await getXeroSettings(db);
  return NextResponse.json({ ok: true, settings });
}

export async function POST(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session || (session.adminLevel !== "admin" && session.adminLevel !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  const body = await req.json().catch(() => null);
  const payrollCalendarId = typeof body?.payroll_calendar_id === "string" ? body.payroll_calendar_id.trim() : "";
  const ordinaryEarningsRateId =
    typeof body?.ordinary_earnings_rate_id === "string" ? body.ordinary_earnings_rate_id.trim() : "";
  const superFundId = typeof body?.super_fund_id === "string" ? body.super_fund_id.trim() : "";

  await upsertXeroSettings(db, {
    settings_id: "default",
    payroll_calendar_id: payrollCalendarId || null,
    ordinary_earnings_rate_id: ordinaryEarningsRateId || null,
    super_fund_id: superFundId || null,
    updated_at: Date.now(),
  });

  return NextResponse.json({ ok: true });
}
