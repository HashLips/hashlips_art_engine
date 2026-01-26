import { D1DatabaseLike } from "@/lib/db/client";

const DEFAULT_SOURCE_URL = "https://superfundlookup.gov.au/Tools/DownloadUsiList?download=usi";

type ParsedFundRow = {
  abn: string;
  fundName: string;
  usi: string;
  productName: string;
  restriction: boolean;
  fromDate: string;
  toDate: string;
};

const sanitize = (value: string) =>
  value.replace(/\u0000/g, "").replace(/'/g, "''");

export const parseUsiFixedWidthLine = (line: string): ParsedFundRow | null => {
  if (!line || line.length < 234) return null;
  const abn = line.slice(0, 12).trim();
  const fundName = line.slice(12, 213).trim();
  const usi = line.slice(213, 234).trim();
  const productName = line.slice(234, 435).trim();
  const restrictionRaw = line.slice(435, 460).trim();
  const fromDate = line.slice(460, 471).trim();
  const toDate = line.slice(471, 482).trim();

  if (!/^\d{11}$/.test(abn)) return null;
  if (!usi) return null;
  return {
    abn,
    fundName,
    usi,
    productName,
    restriction: restrictionRaw.startsWith("Y"),
    fromDate,
    toDate,
  };
};

const upsertStatus = async (
  db: D1DatabaseLike,
  updates: Partial<{
    last_success_at: string;
    last_run_at: string;
    last_row_count: number;
    last_error: string | null;
    source_url: string;
    source_version: string | null;
  }>,
) => {
  const now = updates.last_run_at || new Date().toISOString();
  const lastSuccess = updates.last_success_at || null;
  const lastCount = typeof updates.last_row_count === "number" ? updates.last_row_count : null;
  const lastError = typeof updates.last_error === "string" ? updates.last_error : null;
  const sourceUrl = updates.source_url || DEFAULT_SOURCE_URL;
  const sourceVersion = updates.source_version ?? null;

  await db
    .prepare(
      `INSERT INTO super_fund_ingestion_status
       (id, last_success_at, last_run_at, last_row_count, last_error, source_url, source_version)
       VALUES (1, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         last_success_at=excluded.last_success_at,
         last_run_at=excluded.last_run_at,
         last_row_count=excluded.last_row_count,
         last_error=excluded.last_error,
         source_url=excluded.source_url,
         source_version=excluded.source_version`,
    )
    .bind(lastSuccess, now, lastCount, lastError, sourceUrl, sourceVersion)
    .run();
};

export const ingestUsiList = async (
  db: D1DatabaseLike,
  opts: { sourceUrl?: string } = {},
) => {
  const sourceUrl = opts.sourceUrl || DEFAULT_SOURCE_URL;
  const startedAt = Date.now();
  const runAt = new Date().toISOString();

  await upsertStatus(db, { last_run_at: runAt, source_url: sourceUrl });

  const response = await fetch(sourceUrl);
  if (!response.ok) {
    await upsertStatus(db, { last_run_at: runAt, last_error: `Download failed (${response.status})`, source_url: sourceUrl });
    throw new Error(`USI download failed (${response.status})`);
  }

  const text = await response.text();
  const lines = text.split(/\r?\n/);
  const rows: ParsedFundRow[] = [];
  for (const line of lines) {
    const parsed = parseUsiFixedWidthLine(line);
    if (parsed) rows.push(parsed);
  }

  const now = new Date().toISOString();
  let rowsUpserted = 0;
  const chunkSize = 350;

  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    if (!chunk.length) continue;
    const values = chunk
      .map((row) =>
        `('${sanitize(row.usi)}','${sanitize(row.abn)}','${sanitize(row.fundName)}','${sanitize(row.productName)}',${row.restriction ? 1 : 0},'${sanitize(row.fromDate)}','${sanitize(row.toDate)}','${now}','${now}')`,
      )
      .join(",");

    const sql = `
      INSERT INTO super_fund_products
        (usi, abn, fund_name, product_name, contribution_restrictions, from_date, to_date, created_at, updated_at)
      VALUES ${values}
      ON CONFLICT(usi) DO UPDATE SET
        abn=excluded.abn,
        fund_name=excluded.fund_name,
        product_name=excluded.product_name,
        contribution_restrictions=excluded.contribution_restrictions,
        from_date=excluded.from_date,
        to_date=excluded.to_date,
        updated_at=excluded.updated_at
    `;

    await db.prepare(sql).run();
    rowsUpserted += chunk.length;
  }

  await upsertStatus(db, {
    last_success_at: new Date().toISOString(),
    last_run_at: runAt,
    last_row_count: rowsUpserted,
    last_error: null,
    source_url: sourceUrl,
  });

  return {
    rowsParsed: rows.length,
    rowsUpserted,
    durationMs: Date.now() - startedAt,
  };
};

export const getSuperFundStatus = async (db: D1DatabaseLike) => {
  const row = await db.prepare("SELECT * FROM super_fund_ingestion_status WHERE id = 1").first();
  return row || null;
};

