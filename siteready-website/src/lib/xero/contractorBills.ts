import { D1DatabaseLike } from "@/lib/db/client";
import { getTimesheetHeader, getTimesheetLines, updateTimesheetStatus } from "@/lib/db/timesheets";
import { getXeroConnection, upsertXeroConnection } from "@/lib/db/xero";
import { getContractorCompany } from "@/lib/db/contractorCompany";
import { getXeroAccountingSettings, markBillFailed, markBillSynced, reserveBillSync } from "@/lib/db/xeroAccounting";
import { getWorkerById } from "@/lib/db/workers";
import { decryptXeroToken, encryptXeroToken } from "@/integrations/xero/xeroTokens";
import { refreshTokenIfNeeded } from "@/integrations/xero/xeroAuth";
import { upsertContractorContact } from "@/integrations/xero/accountingContacts";
import { xeroAccountingFetch } from "@/integrations/xero/accountingApi";

type SyncResult = {
  ok: boolean;
  status: "synced" | "sync_failed" | "in_progress";
  warning?: string;
};

function sanitizeError(value: string) {
  if (!value) return "";
  return value.replace(/\d{6,}/g, "***").slice(0, 300);
}

export async function syncContractorBillForTimesheet(
  db: D1DatabaseLike,
  timesheetId: string,
): Promise<SyncResult> {
  const header = await getTimesheetHeader(db, timesheetId);
  if (!header) return { ok: false, status: "sync_failed", warning: "Timesheet not found." };

  const worker = await getWorkerById(db, header.worker_id);
  if (!worker) {
    await updateTimesheetStatus(db, timesheetId, "sync_failed");
    return { ok: false, status: "sync_failed", warning: "Worker not found." };
  }

  const connection = await getXeroConnection(db);
  if (!connection) {
    await updateTimesheetStatus(db, timesheetId, "sync_failed");
    return { ok: false, status: "sync_failed", warning: "Missing Xero connection." };
  }

  const refreshToken = await decryptXeroToken(connection.refresh_token_encrypted);
  if (!refreshToken) {
    await updateTimesheetStatus(db, timesheetId, "sync_failed");
    return { ok: false, status: "sync_failed", warning: "Missing Xero refresh token." };
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

  const contractor = await getContractorCompany(db, header.worker_id);
  if (!contractor) {
    await updateTimesheetStatus(db, timesheetId, "sync_failed");
    return { ok: false, status: "sync_failed", warning: "Missing contractor company details." };
  }

  const accountingSettings = await getXeroAccountingSettings(db);
  if (
    !accountingSettings ||
    !accountingSettings.default_purchases_account_code ||
    accountingSettings.default_purchases_account_code === "000"
  ) {
    await updateTimesheetStatus(db, timesheetId, "sync_failed");
    return { ok: false, status: "sync_failed", warning: "Accounting settings not configured." };
  }

  const reservation = await reserveBillSync(db, timesheetId, connection.tenant_id);
  if (reservation.state === "synced") {
    await updateTimesheetStatus(db, timesheetId, "synced", { xero_synced_at: new Date().toISOString() });
    return { ok: true, status: "synced" };
  }
  if (reservation.state === "in_progress") {
    return { ok: true, status: "in_progress" };
  }

  const lines = await getTimesheetLines(db, timesheetId);
  const totalHours = lines.reduce((sum, line) => sum + (line.hours_decimal || 0), 0);
  if (!totalHours) {
    await markBillFailed(db, timesheetId, "No hours found to bill.");
    await updateTimesheetStatus(db, timesheetId, "sync_failed");
    return { ok: false, status: "sync_failed", warning: "No hours found to bill." };
  }
  if (!contractor.contractor_pay_rate_cents) {
    await markBillFailed(db, timesheetId, "Contractor pay rate not configured.");
    await updateTimesheetStatus(db, timesheetId, "sync_failed");
    return { ok: false, status: "sync_failed", warning: "Contractor pay rate not configured." };
  }

  const contactId = await upsertContractorContact({
    db,
    tenantId: connection.tenant_id,
    accessToken: tokenSet.accessToken,
    contractor,
  });

  const description = `Labour - ${worker.first_name || ""} ${worker.last_name || ""} - ${header.period_start} to ${header.period_end}`.trim();
  const billPayload = {
    Invoices: [
      {
        Type: "ACCPAY",
        Status: accountingSettings.bill_status_mode,
        Contact: { ContactID: contactId },
        Date: header.approved_at?.slice(0, 10) || header.period_end,
        LineItems: [
          {
            Description: description,
            Quantity: totalHours,
            UnitAmount: contractor.contractor_pay_rate_cents / 100,
            AccountCode: accountingSettings.default_purchases_account_code,
          },
        ],
      },
    ],
  };

  try {
    const response = await xeroAccountingFetch<{ Invoices?: Array<{ InvoiceID?: string }> }>(
      "POST",
      "/api.xro/2.0/Invoices",
      {
        tenantId: connection.tenant_id,
        accessToken: tokenSet.accessToken,
        idempotencyKey: reservation.bill_idempotency_key,
      },
      billPayload,
    );
    const billId = response.Invoices?.[0]?.InvoiceID;
    if (!billId) {
      await markBillFailed(db, timesheetId, "Bill creation failed.");
      await updateTimesheetStatus(db, timesheetId, "sync_failed");
      return { ok: false, status: "sync_failed", warning: "Bill creation failed." };
    }
    await markBillSynced(db, timesheetId, billId);
    await updateTimesheetStatus(db, timesheetId, "synced", { xero_synced_at: new Date().toISOString() });
    return { ok: true, status: "synced" };
  } catch (error) {
    const message = sanitizeError(error instanceof Error ? error.message : "Bill creation failed.");
    await markBillFailed(db, timesheetId, message);
    await updateTimesheetStatus(db, timesheetId, "sync_failed");
    return { ok: false, status: "sync_failed", warning: "Bill creation failed." };
  }
}
