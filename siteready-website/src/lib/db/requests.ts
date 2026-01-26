import { D1DatabaseLike } from "./client";
import { RequestRow } from "./types";

async function ensureRequestColumns(db: D1DatabaseLike) {
  const columns = [
    "review_status TEXT",
    "status_reason TEXT",
    "site_name TEXT",
    "hours_per_day INTEGER",
    "expected_duration_value INTEGER",
    "expected_duration_unit TEXT",
    "ot_options TEXT",
    "base_rate_offer REAL",
    "travel_allowance REAL",
    "attachment_list TEXT",
  ];
  for (const col of columns) {
    try {
      await db.prepare(`ALTER TABLE requests ADD COLUMN ${col}`).run();
    } catch {
      // Column likely exists; ignore.
    }
  }
}

function normalizeTickets(t: unknown): string | null {
  if (Array.isArray(t)) return JSON.stringify(t);
  if (typeof t === "string") return t;
  return null;
}

function normalizeOptions(t: unknown): string | null {
  if (Array.isArray(t)) return JSON.stringify(t);
  if (typeof t === "string") return t;
  return null;
}

export async function insertRequest(db: D1DatabaseLike, data: Omit<RequestRow, "created_at" | "updated_at">) {
  await ensureRequestColumns(db);
  await db
    .prepare(
      `INSERT INTO requests (
        request_id, client_id, status, review_status, status_reason, role_id, required_tickets, min_years_experience,
        site_address, site_name, site_lat, site_lng, site_place_id, site_map_url,
        shift_start_time, shift_end_time, headcount, hours_per_day, expected_duration_value, expected_duration_unit, ot_options,
        base_rate_offer, travel_allowance,
        attachment_list, start_date, end_date,
        notes, urgency_level, contract_signed, release_to_client,
        created_by, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      data.request_id,
      data.client_id,
      data.status,
      data.review_status ?? "submitted",
      data.status_reason ?? null,
      data.role_id,
      normalizeTickets(data.required_tickets),
      data.min_years_experience,
      data.site_address ?? null,
      data.site_name ?? null,
      data.site_lat ?? null,
      data.site_lng ?? null,
      data.site_place_id ?? null,
      data.site_map_url ?? null,
      data.shift_start_time ?? null,
      data.shift_end_time ?? null,
      data.headcount,
      data.hours_per_day ?? null,
      data.expected_duration_value ?? null,
      data.expected_duration_unit ?? null,
      normalizeOptions(data.ot_options),
      data.base_rate_offer ?? null,
      data.travel_allowance ?? null,
      normalizeOptions(data.attachment_list),
      data.start_date ?? null,
      data.end_date ?? null,
      data.notes ?? null,
      data.urgency_level ?? null,
      data.contract_signed ?? 0,
      data.release_to_client ?? 0,
      data.created_by ?? null,
      data.updated_by ?? null,
    )
    .run();
}

export async function listRequestsForClient(db: D1DatabaseLike, client_id: string): Promise<RequestRow[]> {
  await ensureRequestColumns(db);
  const res = await db.prepare("SELECT * FROM requests WHERE client_id = ? ORDER BY created_at DESC").bind(client_id).all();
  const rows = (res?.results as RequestRow[]) ?? [];
  return rows.map((r) => ({
    ...r,
    required_tickets: typeof r.required_tickets === "string" ? JSON.parse(r.required_tickets) : r.required_tickets,
    ot_options: typeof r.ot_options === "string" ? JSON.parse(r.ot_options) : r.ot_options,
    attachment_list: typeof r.attachment_list === "string" ? JSON.parse(r.attachment_list) : r.attachment_list,
  }));
}

export async function listAllRequests(db: D1DatabaseLike): Promise<RequestRow[]> {
  await ensureRequestColumns(db);
  const res = await db.prepare("SELECT * FROM requests ORDER BY created_at DESC").all();
  const rows = (res?.results as RequestRow[]) ?? [];
  return rows.map((r) => ({
    ...r,
    required_tickets: typeof r.required_tickets === "string" ? JSON.parse(r.required_tickets) : r.required_tickets,
    ot_options: typeof r.ot_options === "string" ? JSON.parse(r.ot_options) : r.ot_options,
    attachment_list: typeof r.attachment_list === "string" ? JSON.parse(r.attachment_list) : r.attachment_list,
  }));
}

export async function getRequestById(
  db: D1DatabaseLike,
  request_id: string,
  client_id?: string | null,
): Promise<RequestRow | null> {
  await ensureRequestColumns(db);
  const query = client_id
    ? "SELECT * FROM requests WHERE request_id = ? AND client_id = ? LIMIT 1"
    : "SELECT * FROM requests WHERE request_id = ? LIMIT 1";
  const stmt = client_id ? db.prepare(query).bind(request_id, client_id) : db.prepare(query).bind(request_id);
  const res = await stmt.all();
  const row = (res?.results?.[0] as RequestRow | undefined) ?? null;
  if (!row) return null;
  return {
    ...row,
    required_tickets: typeof row.required_tickets === "string" ? JSON.parse(row.required_tickets) : row.required_tickets,
    ot_options: typeof row.ot_options === "string" ? JSON.parse(row.ot_options) : row.ot_options,
    attachment_list: typeof row.attachment_list === "string" ? JSON.parse(row.attachment_list) : row.attachment_list,
  };
}

export async function updateRequestReviewStatus(
  db: D1DatabaseLike,
  request_id: string,
  review_status: string,
  status_reason?: string | null,
) {
  await ensureRequestColumns(db);
  await db
    .prepare("UPDATE requests SET review_status = ?, status_reason = ?, updated_at = strftime('%s','now') WHERE request_id = ?")
    .bind(review_status, status_reason ?? null, request_id)
    .run();
}
