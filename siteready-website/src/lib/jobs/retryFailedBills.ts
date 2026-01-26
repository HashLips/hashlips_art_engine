import { D1DatabaseLike } from "@/lib/db/client";
import { syncContractorBillForTimesheet } from "@/lib/xero/contractorBills";

type RetryResult = {
  attempted: number;
  skipped: number;
  succeeded: number;
  failed: number;
};

export async function retryFailedContractorBills({
  db,
  limit = 10,
}: {
  db: D1DatabaseLike;
  limit?: number;
}): Promise<RetryResult> {
  const now = Date.now();
  const fifteenMinutesAgo = new Date(now - 15 * 60 * 1000).toISOString();

  const res = await db
    .prepare(
      `SELECT timesheet_id, attempts, last_synced_at
       FROM xero_transaction_map
       WHERE sync_state = 'failed'
         AND (attempts IS NULL OR attempts < 5)
         AND (last_synced_at IS NULL OR last_synced_at < ?)
       ORDER BY last_synced_at ASC
       LIMIT ?`,
    )
    .bind(fifteenMinutesAgo, limit)
    .all();

  const rows = (res?.results as Array<Record<string, unknown>>) ?? [];
  const result: RetryResult = { attempted: 0, skipped: 0, succeeded: 0, failed: 0 };

  for (const row of rows) {
    const timesheetId = String(row.timesheet_id || "");
    if (!timesheetId) {
      result.skipped += 1;
      continue;
    }
    result.attempted += 1;
    const sync = await syncContractorBillForTimesheet(db, timesheetId);
    if (sync.ok && sync.status === "synced") {
      result.succeeded += 1;
    } else {
      result.failed += 1;
    }
  }

  return result;
}
