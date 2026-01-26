import { encryptString as encrypt, decryptString as decrypt } from "@/lib/security/encryption";

export async function encryptString(value: string) {
  return encrypt(value);
}

export async function decryptString(value: string | null | undefined) {
  return decrypt(value);
}

