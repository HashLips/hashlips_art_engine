import { D1DatabaseLike } from "./client";
import { ContractorCompanyRow } from "./types";

async function ensureContractorCompanyTable(db: D1DatabaseLike) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS contractor_company (
        worker_id TEXT PRIMARY KEY,
        company_name TEXT NOT NULL,
        company_structure TEXT NOT NULL,
        abn TEXT NOT NULL,
        acn TEXT,
        website TEXT,
        company_tfn_encrypted TEXT,
        address_json TEXT NOT NULL,
        bank_account_name TEXT NOT NULL,
        bank_bsb TEXT NOT NULL,
        bank_account_number_encrypted TEXT NOT NULL,
        bank_account_last4 TEXT NOT NULL,
        contractor_pay_rate_cents INTEGER,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
      )`,
    )
    .run();
}

export async function getContractorCompany(db: D1DatabaseLike, workerId: string): Promise<ContractorCompanyRow | null> {
  await ensureContractorCompanyTable(db);
  const row = (await db
    .prepare("SELECT * FROM contractor_company WHERE worker_id = ? LIMIT 1")
    .bind(workerId)
    .first()) as ContractorCompanyRow | undefined;
  return row ?? null;
}

export async function upsertContractorCompany(db: D1DatabaseLike, row: ContractorCompanyRow) {
  await ensureContractorCompanyTable(db);
  await db
    .prepare(
      `INSERT INTO contractor_company (
        worker_id, company_name, company_structure, abn, acn, website, company_tfn_encrypted, address_json,
        bank_account_name, bank_bsb, bank_account_number_encrypted, bank_account_last4, contractor_pay_rate_cents, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(worker_id) DO UPDATE SET
        company_name=excluded.company_name,
        company_structure=excluded.company_structure,
        abn=excluded.abn,
        acn=excluded.acn,
        website=excluded.website,
        company_tfn_encrypted=excluded.company_tfn_encrypted,
        address_json=excluded.address_json,
        bank_account_name=excluded.bank_account_name,
        bank_bsb=excluded.bank_bsb,
        bank_account_number_encrypted=excluded.bank_account_number_encrypted,
        bank_account_last4=excluded.bank_account_last4,
        contractor_pay_rate_cents=COALESCE(excluded.contractor_pay_rate_cents, contractor_company.contractor_pay_rate_cents),
        updated_at=excluded.updated_at`,
    )
    .bind(
      row.worker_id,
      row.company_name,
      row.company_structure,
      row.abn,
      row.acn ?? null,
      row.website ?? null,
      row.company_tfn_encrypted ?? null,
      row.address_json,
      row.bank_account_name,
      row.bank_bsb,
      row.bank_account_number_encrypted,
      row.bank_account_last4,
      row.contractor_pay_rate_cents ?? null,
      row.created_at,
      row.updated_at,
    )
    .run();
}
