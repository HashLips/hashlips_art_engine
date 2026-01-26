import { decryptString, encryptString } from "@/lib/security/encryption";

const KEY_ENV = "XERO_TOKEN_ENCRYPTION_KEY";

function getKeyValue() {
  if (!process.env[KEY_ENV]) {
    throw new Error(`${KEY_ENV} not configured`);
  }
  return process.env[KEY_ENV] as string;
}

export async function encryptXeroToken(value: string) {
  getKeyValue();
  return encryptString(value);
}

export async function decryptXeroToken(value: string | null | undefined) {
  if (!value) return null;
  getKeyValue();
  return decryptString(value);
}
