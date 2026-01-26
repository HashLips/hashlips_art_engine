import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasD1Binding } from "@/lib/db/config";
import { getTimesheetHeader, getTimesheetLines, updateTimesheetStatus } from "@/lib/db/timesheets";
import { getXeroConnection, getXeroEmployeeMap, getXeroSettings, upsertXeroConnection } from "@/lib/db/xero";
import { syncContractorBillForTimesheet } from "@/lib/xero/contractorBills";
import { decryptXeroToken, encryptXeroToken } from "@/integrations/xero/xeroTokens";
import { refreshTokenIfNeeded } from "@/integrations/xero/xeroAuth";
import { xeroFetch } from "@/integrations/xero/xeroApi";
import { ensureClientForUser } from "@/lib/db/clients";
import { hasAccepted } from "@/lib/legal/acceptance";
import { getWorkerById } from "@/lib/db/workers";

const schema = z.object({
  status: z.enum(["approved", "rejected"]),
  comment: z.string().optional().or(z.literal("")),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "client") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!hasD1Binding()) return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const header = await getTimesheetHeader(db, id);
  if (!header) return NextResponse.json({ error: "Not found" }, { status: 404 });
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

  const approvedAt = new Date().toISOString();
  if (parsed.data.status === "rejected") {
    await updateTimesheetStatus(db, id, "rejected", {
      approved_at: approvedAt,
      approved_by: session.userId || "",
      approval_comment: parsed.data.comment || null,
    });
    return NextResponse.json({ ok: true });
  }

  await updateTimesheetStatus(db, id, "approved", {
    approved_at: approvedAt,
    approved_by: session.userId || "",
    approval_comment: parsed.data.comment || null,
  });

  const connection = await getXeroConnection(db);
  const settings = await getXeroSettings(db);
  const employeeMap = await getXeroEmployeeMap(db, header.worker_id);
  const lines = await getTimesheetLines(db, id);
  const worker = await getWorkerById(db, header.worker_id);
  const engagementType = worker?.engagement_type || "EMPLOYEE_CASUAL";

  if (worker?.user_id) {
    const accepted = await hasAccepted(db, worker.user_id, "XERO_DATA_SHARING_CONSENT");
    if (!accepted) {
      await updateTimesheetStatus(db, id, "sync_failed");
      return NextResponse.json({ ok: true, warning: "Worker has not accepted Xero data sharing consent." });
    }
  }

  if (!connection) {
    await updateTimesheetStatus(db, id, "sync_failed");
    return NextResponse.json({ ok: true, warning: "Missing Xero connection." });
  }
  if (engagementType !== "CONTRACTOR_ABN" && (!settings || !employeeMap?.xero_employee_id)) {
    await updateTimesheetStatus(db, id, "sync_failed");
    return NextResponse.json({ ok: true, warning: "Missing Xero settings or employee mapping." });
  }

  const refreshToken = await decryptXeroToken(connection.refresh_token_encrypted);
  if (!refreshToken) {
    await updateTimesheetStatus(db, id, "sync_failed");
    return NextResponse.json({ ok: true, warning: "Missing Xero refresh token." });
  }

  const tokenSet = await refreshTokenIfNeeded({
    accessToken: connection.access_token,
    refreshToken,
    expiresAt: connection.expires_at,
    scope: connection.scope,
  });

  if (tokenSet.accessToken !== connection.access_token || tokenSet.refreshToken !== refreshToken) {
    await upsertXeroConnection(db, {
      connection_id: connection.connection_id,
      tenant_id: connection.tenant_id,
      access_token: tokenSet.accessToken,
      refresh_token_encrypted: await encryptXeroToken(tokenSet.refreshToken),
      expires_at: tokenSet.expiresAt,
      scope: tokenSet.scope ?? "",
      created_at: connection.created_at,
      updated_at: Date.now(),
    });
  }

  if (engagementType === "CONTRACTOR_ABN") {
    const result = await syncContractorBillForTimesheet(db, id);
    if (!result.ok && result.warning) {
      return NextResponse.json({ ok: true, warning: result.warning });
    }
    return NextResponse.json({ ok: true });
  }

  if (!settings) {
    await updateTimesheetStatus(db, id, "sync_failed");
    return NextResponse.json({ ok: true, warning: "Missing Xero payroll settings." });
  }
  if (!employeeMap) {
    await updateTimesheetStatus(db, id, "sync_failed");
    return NextResponse.json({ ok: true, warning: "Missing Xero employee mapping." });
  }

  const earningsRateId = employeeMap.ordinary_earnings_rate_id || settings.ordinary_earnings_rate_id;
  const payrollCalendarId = employeeMap.payroll_calendar_id || settings.payroll_calendar_id;
  if (!earningsRateId || !payrollCalendarId) {
    await updateTimesheetStatus(db, id, "sync_failed");
    return NextResponse.json({ ok: true, warning: "Missing earnings rate or payroll calendar." });
  }

  const payload = {
    Timesheets: [
      {
        EmployeeID: employeeMap.xero_employee_id,
        PayrollCalendarID: payrollCalendarId,
        StartDate: header.period_start,
        EndDate: header.period_end,
        TimesheetLines: lines.map((line) => ({
          EarningsRateID: earningsRateId,
          NumberOfUnits: line.hours_decimal,
          Date: line.work_date,
        })),
      },
    ],
  };

  try {
    const response = await xeroFetch<{ Timesheets?: Array<{ TimesheetID?: string }> }>(
      "POST",
      "/payroll.xro/1.0/Timesheets",
      {
        accessToken: tokenSet.accessToken,
        tenantId: connection.tenant_id,
        idempotencyKey: crypto.randomUUID(),
      },
      payload,
    );
    const xeroId = response.Timesheets?.[0]?.TimesheetID;
    await updateTimesheetStatus(db, id, xeroId ? "synced" : "sync_failed", {
      xero_timesheet_id: xeroId,
      xero_synced_at: xeroId ? new Date().toISOString() : undefined,
    });
  } catch {
    await updateTimesheetStatus(db, id, "sync_failed");
  }

  return NextResponse.json({ ok: true });
}
