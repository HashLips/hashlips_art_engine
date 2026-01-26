import { NextRequest, NextResponse } from "next/server";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasD1Binding } from "@/lib/db/config";
import { getWorkerById } from "@/lib/db/workers";
import { getWorkerTaxDeclaration } from "@/lib/db/taxDeclarations";
import { decryptString } from "@/lib/security/encryption";
import { getXeroConnection, getXeroEmployeeMap, upsertXeroConnection, upsertXeroEmployeeMap } from "@/lib/db/xero";
import { decryptXeroToken, encryptXeroToken } from "@/integrations/xero/xeroTokens";
import { refreshTokenIfNeeded } from "@/integrations/xero/xeroAuth";
import { xeroFetch } from "@/integrations/xero/xeroApi";
import { mapWorkerToXeroEmployee } from "@/integrations/xero/xeroMappings";
import { hasAccepted } from "@/lib/legal/acceptance";

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

  const worker = await getWorkerById(db, id);
  if (!worker) return NextResponse.json({ error: "Worker not found" }, { status: 404 });

  if (worker.user_id) {
    const accepted = await hasAccepted(db, worker.user_id, "XERO_DATA_SHARING_CONSENT");
    if (!accepted) {
      return NextResponse.json(
        { error: "Worker has not accepted Xero data sharing consent." },
        { status: 403 },
      );
    }
  }

  const connection = await getXeroConnection(db);
  if (!connection) {
    return NextResponse.json({ error: "Xero not connected" }, { status: 400 });
  }

  const refreshToken = await decryptXeroToken(connection.refresh_token_encrypted);
  if (!refreshToken) {
    return NextResponse.json({ error: "Xero refresh token missing" }, { status: 400 });
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

  const taxDeclaration = await getWorkerTaxDeclaration(db, worker.worker_id);
  if (!taxDeclaration || !taxDeclaration.tfn_declaration_signed) {
    return NextResponse.json({ error: "Worker tax declaration not signed." }, { status: 400 });
  }
  let decryptedTfn: string | null = null;
  if (taxDeclaration.tfn_encrypted) {
    decryptedTfn = await decryptString(taxDeclaration.tfn_encrypted);
  }
  const mapped = mapWorkerToXeroEmployee(worker, { ...taxDeclaration, tfnPlain: decryptedTfn });
  if (!mapped.FirstName || !mapped.LastName) {
    return NextResponse.json({ error: "Worker is missing first or last name" }, { status: 400 });
  }

  const existingMap = await getXeroEmployeeMap(db, worker.worker_id);
  const payload = existingMap?.xero_employee_id
    ? { Employees: [{ ...mapped, EmployeeID: existingMap.xero_employee_id }] }
    : { Employees: [mapped] };

  const response = await xeroFetch<{ Employees?: Array<{ EmployeeID?: string }> }>(
    "POST",
    "/payroll.xro/1.0/Employees",
    {
      accessToken: tokenSet.accessToken,
      tenantId: connection.tenant_id,
      idempotencyKey: crypto.randomUUID(),
    },
    payload,
  );

  const employeeId = response.Employees?.[0]?.EmployeeID;
  if (!employeeId) {
    return NextResponse.json({ error: "Xero employee sync failed" }, { status: 502 });
  }

  await upsertXeroEmployeeMap(db, {
    worker_id: worker.worker_id,
    xero_employee_id: employeeId,
    payroll_calendar_id: existingMap?.payroll_calendar_id ?? null,
    ordinary_earnings_rate_id: existingMap?.ordinary_earnings_rate_id ?? null,
    super_fund_id: existingMap?.super_fund_id ?? null,
    last_synced_at: new Date().toISOString(),
    sync_status: "synced",
    sync_error: null,
  });

  return NextResponse.json({ ok: true, employeeId });
}
