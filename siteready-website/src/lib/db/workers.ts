import { D1DatabaseLike } from "./client";
import { AssignmentRow, WorkerRow, WorkerTicketRow } from "./types";
import { getUserByEmail } from "./user";

export type WorkerAvailabilityRow = {
  availability_id: string;
  worker_id: string;
  start_datetime: string;
  end_datetime: string;
  notes?: string | null;
  created_at: number;
};

const WORKER_COLUMNS = [
  "engagement_type TEXT",
  "first_name TEXT",
  "middle_name TEXT",
  "last_name TEXT",
  "title TEXT",
  "dob TEXT",
  "email TEXT",
  "phone TEXT",
  "whatsapp TEXT",
  "address_number TEXT",
  "address_floor TEXT",
  "address_unit TEXT",
  "address_building TEXT",
  "address_line1 TEXT",
  "address_line2 TEXT",
  "address_suburb TEXT",
  "address_street TEXT",
  "address_city TEXT",
  "address_state TEXT",
  "address_postcode TEXT",
  "address_country TEXT",
  "super_fund_name TEXT",
  "super_product_name TEXT",
  "super_choice TEXT",
  "super_status TEXT",
  "super_contribution_restrictions INTEGER",
  "super_fund_type TEXT",
  "super_abn TEXT",
  "super_usi TEXT",
  "smsf_abn TEXT",
  "smsf_bank_bsb TEXT",
  "smsf_bank_account TEXT",
  "smsf_bank_account_name TEXT",
  "smsf_esa TEXT",
  "super_member_number TEXT",
  "tfn TEXT",
  "australian_resident_for_tax INTEGER",
  "claim_tax_free_threshold INTEGER",
  "help_debt INTEGER",
  "sfss_debt INTEGER",
  "has_own_abn INTEGER",
  "company_name TEXT",
  "company_structure TEXT",
  "company_abn TEXT",
  "company_acn TEXT",
  "company_website TEXT",
  "company_address TEXT",
  "company_address_number TEXT",
  "company_address_floor TEXT",
  "company_address_unit TEXT",
  "company_address_building TEXT",
  "company_address_street TEXT",
  "company_address_postcode TEXT",
  "company_tfn TEXT",
  "company_address_same INTEGER",
  "privacy_agreed INTEGER",
  "indemnity_agreed INTEGER",
  "emergency_contact_title TEXT",
  "emergency_contact_first_name TEXT",
  "emergency_contact_family_name TEXT",
  "emergency_contact_mobile TEXT",
  "emergency_contact_email TEXT",
  "bank_account_name TEXT",
  "bank_name TEXT",
  "bank_bsb TEXT",
  "bank_account_number TEXT",
  "company_bank_account_name TEXT",
  "company_bank_bsb TEXT",
  "company_bank_account_number TEXT",
  "working_now_status TEXT",
  "working_now_end_date TEXT",
  "working_now_notes TEXT",
  "availability_from_date TEXT",
  "availability_until_date TEXT",
  "holiday_start_date TEXT",
  "holiday_end_date TEXT",
  "consent_at TEXT",
  "drivers_license_front_key TEXT",
  "drivers_license_back_key TEXT",
  "drivers_license_front_name TEXT",
  "drivers_license_back_name TEXT",
  "id_document_type TEXT",
  "id_document_front_key TEXT",
  "id_document_back_key TEXT",
  "id_document_front_name TEXT",
  "id_document_back_name TEXT",
  "id_verification_status TEXT",
  "id_verification_notes TEXT",
  "license_verification_status TEXT",
  "license_verification_notes TEXT",
  "work_experience_json TEXT",
  "work_media_json TEXT",
  "work_comments TEXT",
  "delete_requested INTEGER",
  "delete_requested_at TEXT",
  "delete_request_reason TEXT",
  "avatar_key TEXT",
];

const TICKET_COLUMNS = [
  "front_image_name TEXT",
  "back_image_name TEXT",
  "ticket_number TEXT",
  "years_experience INTEGER",
  "issue_date TEXT",
  "verification_status TEXT",
  "verification_notes TEXT",
  "expiry_date TEXT",
  "renewal_status TEXT",
  "reminder_30_sent_at TEXT",
  "reminder_7_sent_at TEXT",
];

async function ensureWorkerColumns(db: D1DatabaseLike) {
  for (const col of WORKER_COLUMNS) {
    try {
      await db.prepare(`ALTER TABLE workers ADD COLUMN ${col}`).run();
    } catch {
      // Column likely exists; ignore.
    }
  }
}

async function ensureTicketColumns(db: D1DatabaseLike) {
  for (const col of TICKET_COLUMNS) {
    try {
      await db.prepare(`ALTER TABLE worker_tickets ADD COLUMN ${col}`).run();
    } catch {
      // Column likely exists; ignore.
    }
  }
}

export async function getWorkerByUser(db: D1DatabaseLike, user_id: string): Promise<WorkerRow | null> {
  await ensureWorkerColumns(db);
  const row = (await db.prepare("SELECT * FROM workers WHERE user_id = ? LIMIT 1").bind(user_id).first()) as WorkerRow | undefined;
  return row ?? null;
}

export async function getWorkerByEmail(db: D1DatabaseLike, email: string): Promise<WorkerRow | null> {
  await ensureWorkerColumns(db);
  const row = (await db.prepare("SELECT * FROM workers WHERE email = ? LIMIT 1").bind(email).first()) as WorkerRow | undefined;
  return row ?? null;
}

export async function getWorkerById(db: D1DatabaseLike, worker_id: string): Promise<WorkerRow | null> {
  await ensureWorkerColumns(db);
  const row = (await db.prepare("SELECT * FROM workers WHERE worker_id = ? LIMIT 1").bind(worker_id).first()) as WorkerRow | undefined;
  return row ?? null;
}

function makeWorkerNumber() {
  const rand = Math.floor(Math.random() * 900000 + 100000);
  return `WKR-${rand}`;
}

export async function ensureWorkerForUser(
  db: D1DatabaseLike,
  user_id: string,
  email?: string | null,
): Promise<WorkerRow> {
  const resolvedEmail = (email || "").trim().toLowerCase();
  let resolvedUserId = user_id;
  if (!resolvedUserId && resolvedEmail) {
    const user = await getUserByEmail(db, resolvedEmail);
    resolvedUserId = user?.user_id ?? "";
  }
  if (resolvedUserId) {
    const existing = await getWorkerByUser(db, resolvedUserId);
    if (existing) return existing;
  }
  if (resolvedEmail) {
    const byEmail = await getWorkerByEmail(db, resolvedEmail);
    if (byEmail) {
      if (resolvedUserId && byEmail.user_id !== resolvedUserId) {
        await db.prepare("UPDATE workers SET user_id = ? WHERE worker_id = ?").bind(resolvedUserId, byEmail.worker_id).run();
        return { ...byEmail, user_id: resolvedUserId };
      }
      return byEmail;
    }
  }
  await ensureWorkerColumns(db);
  const worker_id = crypto.randomUUID();
  const company_number = makeWorkerNumber();
  const role_id = "General Labourer";
  await db
    .prepare(
      "INSERT INTO workers (worker_id, user_id, company_number, role_id, years_experience, verified_status, email) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(worker_id, resolvedUserId || user_id, company_number, role_id, 0, "unverified", resolvedEmail || null)
    .run();
  return {
    worker_id,
    user_id: resolvedUserId || user_id,
    company_number,
    role_id,
    years_experience: 0,
    verified_status: "unverified",
    created_at: Date.now(),
    updated_at: Date.now(),
    email: resolvedEmail || null,
  };
}

export async function updateWorkerProfile(db: D1DatabaseLike, worker_id: string, data: Partial<WorkerRow>) {
  await ensureWorkerColumns(db);
  const fields: Array<keyof WorkerRow> = [
    "engagement_type",
    "name",
    "first_name",
    "middle_name",
    "last_name",
    "verified_status",
    "title",
    "dob",
    "mobile",
    "email",
    "phone",
    "whatsapp",
    "address_number",
    "address_floor",
    "address_unit",
    "address_building",
    "address_line1",
    "address_line2",
    "address_suburb",
    "address_street",
    "address_city",
    "address_state",
    "address_postcode",
    "address_country",
    "super_fund_name",
    "super_product_name",
    "super_choice",
    "super_status",
    "super_contribution_restrictions",
    "super_fund_type",
    "super_abn",
    "super_usi",
    "smsf_abn",
    "smsf_bank_bsb",
    "smsf_bank_account",
    "smsf_bank_account_name",
    "smsf_esa",
    "super_member_number",
    "tfn",
    "australian_resident_for_tax",
    "claim_tax_free_threshold",
    "help_debt",
    "sfss_debt",
    "has_own_abn",
    "company_name",
    "company_structure",
    "company_abn",
    "company_acn",
    "company_website",
    "company_address",
    "company_address_number",
    "company_address_floor",
    "company_address_unit",
    "company_address_building",
    "company_address_street",
    "company_address_postcode",
    "company_tfn",
    "company_address_same",
    "privacy_agreed",
    "indemnity_agreed",
    "emergency_contact_title",
    "emergency_contact_first_name",
    "emergency_contact_family_name",
    "emergency_contact_mobile",
    "emergency_contact_email",
    "bank_account_name",
    "bank_name",
    "bank_bsb",
    "bank_account_number",
    "company_bank_account_name",
    "company_bank_bsb",
    "company_bank_account_number",
    "working_now_status",
    "working_now_end_date",
    "working_now_notes",
    "availability_from_date",
    "availability_until_date",
    "holiday_start_date",
    "holiday_end_date",
    "consent_at",
    "drivers_license_front_key",
    "drivers_license_back_key",
    "drivers_license_front_name",
    "drivers_license_back_name",
    "id_document_type",
    "id_document_front_key",
    "id_document_back_key",
    "id_document_front_name",
    "id_document_back_name",
    "id_verification_status",
    "id_verification_notes",
    "license_verification_status",
    "license_verification_notes",
    "work_experience_json",
    "work_media_json",
    "work_comments",
    "delete_requested",
    "delete_requested_at",
    "delete_request_reason",
    "avatar_key",
  ];
  const sets: string[] = [];
  const values: unknown[] = [];
  for (const field of fields) {
    if (field in data) {
      if (field === "verified_status") {
        const value = (data as Record<string, unknown>)[field];
        if (value === null || value === undefined) {
          continue;
        }
      }
      sets.push(`${field} = ?`);
      values.push((data as Record<string, unknown>)[field] ?? null);
    }
  }
  if (!sets.length) return;
  values.push(worker_id);
  await db.prepare(`UPDATE workers SET ${sets.join(", ")}, updated_at = strftime('%s','now') WHERE worker_id = ?`).bind(...values).run();
}

export async function listWorkers(db: D1DatabaseLike): Promise<WorkerRow[]> {
  await ensureWorkerColumns(db);
  const res = await db.prepare("SELECT * FROM workers ORDER BY created_at DESC").all();
  return (res?.results as WorkerRow[]) ?? [];
}

export async function listWorkerTickets(db: D1DatabaseLike, worker_id: string): Promise<WorkerTicketRow[]> {
  await ensureTicketColumns(db);
  const res = await db.prepare("SELECT * FROM worker_tickets WHERE worker_id = ? ORDER BY created_at DESC").bind(worker_id).all();
  return (res?.results as WorkerTicketRow[]) ?? [];
}

export async function upsertWorkerTicket(
  db: D1DatabaseLike,
  data: Omit<WorkerTicketRow, "created_at" | "updated_at">,
): Promise<WorkerTicketRow> {
  await ensureTicketColumns(db);
  const existing = await db.prepare("SELECT ticket_id FROM worker_tickets WHERE ticket_id = ? LIMIT 1").bind(data.ticket_id).first();
  if (existing) {
    await db
      .prepare(
        `UPDATE worker_tickets
         SET type = ?, front_image_key = ?, back_image_key = ?, front_image_name = ?, back_image_name = ?, ticket_number = ?, years_experience = ?, issue_date = ?,
             verification_status = ?, verification_notes = ?, expiry_date = ?, renewal_status = COALESCE(?, renewal_status),
             reminder_30_sent_at = COALESCE(?, reminder_30_sent_at), reminder_7_sent_at = COALESCE(?, reminder_7_sent_at),
             updated_at = strftime('%s','now')
         WHERE ticket_id = ?`,
      )
      .bind(
        data.type,
        data.front_image_key ?? null,
        data.back_image_key ?? null,
        data.front_image_name ?? null,
        data.back_image_name ?? null,
        data.ticket_number ?? null,
        data.years_experience ?? null,
        data.issue_date ?? null,
        data.verification_status ?? "pending",
        data.verification_notes ?? null,
        data.expiry_date ?? null,
        data.renewal_status ?? null,
        data.reminder_30_sent_at ?? null,
        data.reminder_7_sent_at ?? null,
        data.ticket_id,
      )
      .run();
  } else {
    await db
      .prepare(
        `INSERT INTO worker_tickets (
          ticket_id, worker_id, type, front_image_key, back_image_key, front_image_name, back_image_name, ticket_number, years_experience, issue_date,
          verification_status, verification_notes, expiry_date, renewal_status, reminder_30_sent_at, reminder_7_sent_at, verified, visible_to_clients
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        data.ticket_id,
        data.worker_id,
        data.type,
        data.front_image_key ?? null,
        data.back_image_key ?? null,
        data.front_image_name ?? null,
        data.back_image_name ?? null,
        data.ticket_number ?? null,
        data.years_experience ?? null,
        data.issue_date ?? null,
        data.verification_status ?? "pending",
        data.verification_notes ?? null,
        data.expiry_date ?? null,
        data.renewal_status ?? "active",
        data.reminder_30_sent_at ?? null,
        data.reminder_7_sent_at ?? null,
        data.verified ?? 0,
        data.visible_to_clients ?? 0,
      )
      .run();
  }
  const saved = await db.prepare("SELECT * FROM worker_tickets WHERE ticket_id = ? LIMIT 1").bind(data.ticket_id).first();
  return saved as WorkerTicketRow;
}

export async function updateWorkerTicketRenewal(
  db: D1DatabaseLike,
  worker_id: string,
  ticket_id: string,
  renewal_status: string,
) {
  await ensureTicketColumns(db);
  await db
    .prepare(
      "UPDATE worker_tickets SET renewal_status = ?, updated_at = strftime('%s','now') WHERE ticket_id = ? AND worker_id = ?",
    )
    .bind(renewal_status, ticket_id, worker_id)
    .run();
}

export async function deleteWorkerTicket(db: D1DatabaseLike, ticket_id: string) {
  await db.prepare("DELETE FROM worker_tickets WHERE ticket_id = ?").bind(ticket_id).run();
}

export async function updateWorkerTicketImages(
  db: D1DatabaseLike,
  ticket_id: string,
  fields: { front_image_key?: string | null; back_image_key?: string | null; front_image_name?: string | null; back_image_name?: string | null },
) {
  await ensureTicketColumns(db);
  const sets: string[] = [];
  const values: unknown[] = [];
  const fieldList: Array<keyof typeof fields> = ["front_image_key", "back_image_key", "front_image_name", "back_image_name"];
  for (const field of fieldList) {
    if (field in fields) {
      sets.push(`${field} = ?`);
      values.push(fields[field] ?? null);
    }
  }
  if (!sets.length) return;
  values.push(ticket_id);
  await db.prepare(`UPDATE worker_tickets SET ${sets.join(", ")}, updated_at = strftime('%s','now') WHERE ticket_id = ?`).bind(...values).run();
}

export async function listWorkerAvailability(db: D1DatabaseLike, worker_id: string): Promise<WorkerAvailabilityRow[]> {
  const res = await db
    .prepare("SELECT * FROM worker_availability WHERE worker_id = ? ORDER BY start_datetime ASC")
    .bind(worker_id)
    .all();
  return (res?.results as WorkerAvailabilityRow[]) ?? [];
}

export async function addWorkerAvailability(
  db: D1DatabaseLike,
  data: Omit<WorkerAvailabilityRow, "created_at">,
): Promise<void> {
  await db
    .prepare(
      "INSERT INTO worker_availability (availability_id, worker_id, start_datetime, end_datetime, notes) VALUES (?, ?, ?, ?, ?)",
    )
    .bind(data.availability_id, data.worker_id, data.start_datetime, data.end_datetime, data.notes ?? null)
    .run();
}

export async function deleteWorkerAvailability(db: D1DatabaseLike, availability_id: string) {
  await db.prepare("DELETE FROM worker_availability WHERE availability_id = ?").bind(availability_id).run();
}

export async function listAssignmentsForWorker(db: D1DatabaseLike, worker_id: string): Promise<AssignmentRow[]> {
  const res = await db.prepare("SELECT * FROM assignments WHERE worker_id = ? ORDER BY created_at DESC").bind(worker_id).all();
  return (res?.results as AssignmentRow[]) ?? [];
}
