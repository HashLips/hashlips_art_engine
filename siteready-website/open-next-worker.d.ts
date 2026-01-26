declare module "./.open-next/worker.js" {
  const worker: {
    fetch: (req: Request, env: unknown, ctx: unknown) => Promise<Response>;
    scheduled?: (event: unknown, env: unknown, ctx: unknown) => Promise<void>;
    DOQueueHandler?: (...args: unknown[]) => unknown;
    DOShardedTagCache?: (...args: unknown[]) => unknown;
    BucketCachePurge?: (...args: unknown[]) => unknown;
  };
  export default worker;
  export const DOQueueHandler: (...args: unknown[]) => unknown;
  export const DOShardedTagCache: (...args: unknown[]) => unknown;
  export const BucketCachePurge: (...args: unknown[]) => unknown;
}
