export const D1_BINDING_NAME = "DB";
export const R2_BINDING_NAME = "TICKETS_BUCKET";

function getEnv() {
  // OpenNext passes env via AsyncLocalStorage on this symbol key
  // (see .open-next/cloudflare/init.js in the built output).
  const ctx = (globalThis as Record<PropertyKey, unknown>)[
    Symbol.for("__cloudflare-context__")
  ] as { env?: Record<string, unknown> } | undefined;
  return ctx?.env;
}

export function hasD1Binding() {
  const env = getEnv();
  return typeof env?.[D1_BINDING_NAME] !== "undefined";
}

export function hasR2Binding() {
  const env = getEnv();
  return typeof env?.[R2_BINDING_NAME] !== "undefined";
}

export function getBinding<T = unknown>(name: string): T | undefined {
  const env = getEnv();
  return env?.[name] as T | undefined;
}
