import { D1DatabaseLike } from "./client";

export type ClientRecord = {
  client_id: string;
  user_id: string | null;
  org_name: string | null;
  structure: string | null;
  acn: string | null;
  abn: string | null;
  tfn: string | null;
  website: string | null;
  contact_name: string | null;
  contact_title: string | null;
  contact_job_title: string | null;
  contact_mobile: string | null;
  contact_landline: string | null;
  preferred_contact_time: string | null;
  contact_email: string | null;
  reg_street: string | null;
  reg_state: string | null;
  reg_postcode: string | null;
  profile_file_name: string | null;
  profile_file_type: string | null;
  profile_file_content: string | null;
};

export async function getClientByUser(db: D1DatabaseLike, user_id: string): Promise<ClientRecord | null> {
  const row = (await db.prepare("SELECT * FROM clients WHERE user_id = ? LIMIT 1").bind(user_id).first()) as ClientRecord | undefined;
  return row ?? null;
}

async function ensureClientColumns(db: D1DatabaseLike) {
  const columns = [
    "structure TEXT",
    "acn TEXT",
    "abn TEXT",
    "tfn TEXT",
    "website TEXT",
    "contact_title TEXT",
    "contact_job_title TEXT",
    "contact_landline TEXT",
    "preferred_contact_time TEXT",
    "reg_street TEXT",
    "reg_state TEXT",
    "reg_postcode TEXT",
    "profile_file_name TEXT",
    "profile_file_type TEXT",
    "profile_file_content TEXT",
  ];
  for (const col of columns) {
    try {
      await db.prepare(`ALTER TABLE clients ADD COLUMN ${col}`).run();
    } catch {
      // Column likely exists; ignore.
    }
  }
}

export async function ensureClientForUser(db: D1DatabaseLike, user_id: string, email?: string | null): Promise<ClientRecord> {
  const existing = await getClientByUser(db, user_id);
  if (existing) return existing;
  const client_id = crypto.randomUUID();
  await db
    .prepare("INSERT INTO clients (client_id, user_id, contact_email) VALUES (?, ?, ?)")
    .bind(client_id, user_id, email ?? null)
    .run();
  return {
    client_id,
    user_id,
    org_name: null,
    structure: null,
    acn: null,
    abn: null,
    tfn: null,
    website: null,
    contact_name: null,
    contact_title: null,
    contact_job_title: null,
    contact_mobile: null,
    contact_landline: null,
    preferred_contact_time: null,
    contact_email: email ?? null,
    reg_street: null,
    reg_state: null,
    reg_postcode: null,
    profile_file_name: null,
    profile_file_type: null,
    profile_file_content: null,
  };
}

export async function updateClientProfile(db: D1DatabaseLike, clientId: string, data: Partial<ClientRecord>) {
  await ensureClientColumns(db);
  const fields: Array<keyof ClientRecord> = [
    "org_name",
    "structure",
    "acn",
    "abn",
    "tfn",
    "website",
    "contact_name",
    "contact_title",
    "contact_job_title",
    "contact_mobile",
    "contact_landline",
    "preferred_contact_time",
    "contact_email",
    "reg_street",
    "reg_state",
    "reg_postcode",
    "profile_file_name",
    "profile_file_type",
    "profile_file_content",
  ];
  const sets: string[] = [];
  const values: unknown[] = [];
  for (const field of fields) {
    if (field in data) {
      sets.push(`${field} = ?`);
      values.push(data[field] ?? null);
    }
  }
  if (!sets.length) return;
  values.push(clientId);
  await db.prepare(`UPDATE clients SET ${sets.join(", ")} WHERE client_id = ?`).bind(...values).run();
}
