import { fromBase64Url, toBase64Url } from "./base64";

const subtle = crypto.subtle;

function getRuntimeEnv(name: string): string | undefined {
  const ctx = (globalThis as Record<PropertyKey, unknown>)[
    Symbol.for("__cloudflare-context__")
  ] as { env?: Record<string, unknown> } | undefined;
  const value = ctx?.env?.[name];
  if (typeof value === "string") return value;
  return process.env?.[name];
}

function getSecret(): ArrayBuffer {
  const raw =
    getRuntimeEnv("APP_SECRET") ||
    getRuntimeEnv("AUTH_SECRET") ||
    getRuntimeEnv("AUTH0_SECRET") ||
    getRuntimeEnv("BASIC_AUTH_PASS") ||
    getRuntimeEnv("BASIC_AUTH_PASSWORD") ||
    getRuntimeEnv("BASIC_AUTH_SECRET") ||
    "dev-insecure-secret-change-me";
  return new TextEncoder().encode(raw).buffer;
}

async function getKey() {
  return subtle.importKey("raw", getSecret(), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function sign(value: string): Promise<string> {
  const key = await getKey();
  const sig = await subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return toBase64Url(new Uint8Array(sig));
}

export async function verify(value: string, signature: string): Promise<boolean> {
  const key = await getKey();
  return subtle.verify("HMAC", key, new TextEncoder().encode(value), fromBase64Url(signature));
}
