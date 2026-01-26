// Custom OpenNext worker entrypoint to add scheduled ingestion.
import { ingestUsiList } from "./src/lib/superfund/ingest";
import { retryFailedContractorBills } from "./src/lib/jobs/retryFailedBills";

type WorkerEnv = {
  DB?: unknown;
};
type ScheduledEventLike = { cron?: string };
type ExecutionContextLike = { waitUntil: (promise: Promise<unknown>) => void };

const loadOpenNextWorker = async () => {
  // @ts-expect-error: generated at build time
  const mod = await import("./.open-next/worker.js");
  return (mod.default ?? mod) as unknown as {
    fetch: (req: Request, env: WorkerEnv, ctx: ExecutionContextLike) => Promise<Response>;
    scheduled?: (event: ScheduledEventLike, env: WorkerEnv, ctx: ExecutionContextLike) => Promise<void>;
    DOQueueHandler?: (...args: unknown[]) => unknown;
    DOShardedTagCache?: (...args: unknown[]) => unknown;
    BucketCachePurge?: (...args: unknown[]) => unknown;
  };
};

export const DOQueueHandler = (...args: unknown[]) =>
  loadOpenNextWorker().then((worker) => worker.DOQueueHandler?.(...args));
export const DOShardedTagCache = (...args: unknown[]) =>
  loadOpenNextWorker().then((worker) => worker.DOShardedTagCache?.(...args));
export const BucketCachePurge = (...args: unknown[]) =>
  loadOpenNextWorker().then((worker) => worker.BucketCachePurge?.(...args));

const customWorker = {
  async fetch(req: Request, env: WorkerEnv, ctx: ExecutionContextLike) {
    const worker = await loadOpenNextWorker();
    return worker.fetch(req, env, ctx);
  },
  async scheduled(event: ScheduledEventLike, env: WorkerEnv, ctx: ExecutionContextLike) {
    const worker = await loadOpenNextWorker();
    if (worker.scheduled) {
      try {
        await worker.scheduled(event, env, ctx);
      } catch (error) {
        console.error("OpenNext scheduled failed", error instanceof Error ? error.message : error);
      }
    }
    if (!env.DB) return;
    ctx.waitUntil(
      (async () => {
        try {
          const result = await ingestUsiList(env.DB as never);
          console.log("Super fund ingest complete", {
            rowsParsed: result.rowsParsed,
            rowsUpserted: result.rowsUpserted,
            durationMs: result.durationMs,
          });
        } catch (error) {
          console.error("Super fund ingest failed", error instanceof Error ? error.message : error);
        }
      })(),
    );
    ctx.waitUntil(
      (async () => {
        try {
          const result = await retryFailedContractorBills({ db: env.DB as never, limit: 10 });
          console.log("Contractor bill retries complete", result);
        } catch (error) {
          console.error("Contractor bill retries failed", error instanceof Error ? error.message : error);
        }
      })(),
    );
  },
};

export default customWorker;
