import { D1_BINDING_NAME, getBinding } from "./config";

export type D1StatementLike = {
  bind: (...args: unknown[]) => D1StatementLike;
  first: () => Promise<unknown>;
  run: () => Promise<unknown>;
  all: () => Promise<{ results?: unknown[] }>;
};

export type D1DatabaseLike = {
  prepare: (query: string) => D1StatementLike;
};

export function getDb(): D1DatabaseLike | null {
  const db = getBinding(D1_BINDING_NAME);
  if (!db) return null;
  return db as D1DatabaseLike;
}
