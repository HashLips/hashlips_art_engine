import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasD1Binding } from "@/lib/db/config";
import { getXeroAccountingSettings } from "@/lib/db/xeroAccounting";

const settingsSchema = z.object({
  default_purchases_account_code: z.string().min(1, "Account code is required"),
  bill_status_mode: z.enum(["DRAFT", "AUTHORISED"]),
});

function isAdmin(session: Awaited<ReturnType<typeof parseSessionFromRequest>>) {
  return (
    session?.adminLevel === "admin" ||
    session?.adminLevel === "super_admin" ||
    session?.adminLevel === "payroll_admin"
  );
}

export async function GET(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!hasD1Binding()) return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const settings = await getXeroAccountingSettings(db);
  return NextResponse.json({ ok: true, settings });
}

export async function PUT(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!hasD1Binding()) return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const body = await req.json().catch(() => null);
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }
  const code = parsed.data.default_purchases_account_code.trim();
  if (!/^[A-Za-z0-9-]+$/.test(code)) {
    return NextResponse.json({ error: "Account code is invalid." }, { status: 400 });
  }
  if (code === "000") {
    return NextResponse.json({ error: "Account code must be configured." }, { status: 400 });
  }

  await db
    .prepare("UPDATE xero_accounting_settings SET default_purchases_account_code = ?, bill_status_mode = ? WHERE id = 1")
    .bind(code, parsed.data.bill_status_mode)
    .run();
  const settings = await getXeroAccountingSettings(db);
  return NextResponse.json({ ok: true, settings });
}
