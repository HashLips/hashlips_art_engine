import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasD1Binding } from "@/lib/db/config";
import { ensureClientForUser } from "@/lib/db/clients";
import { insertRequest, listAllRequests, listRequestsForClient } from "@/lib/db/requests";
import { RequestRow } from "@/lib/db/types";

const optionalNumber = z.preprocess(
  (val) => {
    if (val === "" || val == null) return undefined;
    if (typeof val === "number" && Number.isNaN(val)) return undefined;
    return val;
  },
  z.number().nonnegative().optional(),
);

const requestSchema = z.object({
  role_id: z.string(),
  required_tickets: z.array(z.string()).optional().default([]),
  min_years_experience: z.number().int().nonnegative(),
  site_address: z.string().optional(),
  site_name: z.string().optional(),
  site_lat: z.number().optional(),
  site_lng: z.number().optional(),
  site_place_id: z.string().optional(),
  site_map_url: z.string().optional(),
  shift_start_time: z.string().optional(),
  shift_end_time: z.string().optional(),
  headcount: z.number().int().positive(),
  hours_per_day: z.number().int().positive().optional(),
  expected_duration_value: z.number().int().positive().optional(),
  expected_duration_unit: z.string().optional(),
  ot_options: z.array(z.string()).optional(),
  base_rate_offer: optionalNumber,
  travel_allowance: optionalNumber,
  attachment_list: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        key: z.string().optional(),
        size: z.number().optional(),
        type: z.string().optional(),
      }),
    )
    .optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  notes: z.string().optional(),
  urgency_level: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "client" && session.role !== "staff") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!hasD1Binding()) {
    return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  }
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });
  let clientId: string | null = null;
  if (session.role === "client") {
    const client = await ensureClientForUser(db, session.userId || session.email || "");
    clientId = client.client_id;
  }
  const rows = session.role === "staff" ? await listAllRequests(db) : await listRequestsForClient(db, clientId as string);
  const requestId = req.nextUrl.searchParams.get("id");
  const filtered = requestId ? rows.filter((row) => row.request_id === requestId) : rows;
  return NextResponse.json({ ok: true, requests: filtered });
}

export async function POST(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "client") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!hasD1Binding()) {
    return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  }
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const body = await req.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const client = await ensureClientForUser(db, session.userId || session.email || "");
  const request_id = crypto.randomUUID();
  const record: Omit<RequestRow, "created_at" | "updated_at"> = {
    request_id,
    client_id: client.client_id,
    status: "submitted",
    role_id: parsed.data.role_id,
    required_tickets: parsed.data.required_tickets,
    min_years_experience: parsed.data.min_years_experience,
    site_address: parsed.data.site_address,
    site_name: parsed.data.site_name,
    site_lat: parsed.data.site_lat ?? null,
    site_lng: parsed.data.site_lng ?? null,
    site_place_id: parsed.data.site_place_id,
    site_map_url: parsed.data.site_map_url,
    shift_start_time: parsed.data.shift_start_time,
    shift_end_time: parsed.data.shift_end_time,
    headcount: parsed.data.headcount,
    hours_per_day: parsed.data.hours_per_day,
    expected_duration_value: parsed.data.expected_duration_value,
    expected_duration_unit: parsed.data.expected_duration_unit,
    ot_options: parsed.data.ot_options ?? [],
    base_rate_offer: parsed.data.base_rate_offer,
    travel_allowance: parsed.data.travel_allowance,
    attachment_list: parsed.data.attachment_list ?? [],
    start_date: parsed.data.start_date,
    end_date: parsed.data.end_date,
    notes: parsed.data.notes,
    urgency_level: parsed.data.urgency_level,
    contract_signed: 0,
    release_to_client: 0,
    created_by: session.userId || session.email || null,
    updated_by: session.userId || session.email || null,
  };

  await insertRequest(db, record);
  return NextResponse.json({ ok: true, request_id });
}
