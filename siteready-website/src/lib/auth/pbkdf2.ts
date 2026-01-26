import { fromBase64, timingSafeEqual, toBase64 } from "./base64";

const ITERATIONS = 100000;
const KEY_LENGTH = 32;
const DIGEST = "SHA-256";

export async function hashPassword(password: string) {
  const enc = new TextEncoder();
  const saltArr = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveBits"]);
  const derived = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: saltArr,
      iterations: ITERATIONS,
      hash: DIGEST,
    },
    keyMaterial,
    KEY_LENGTH * 8,
  );
  const hashB64 = toBase64(new Uint8Array(derived));
  const saltB64 = toBase64(saltArr);
  return `${ITERATIONS}:${saltB64}:${hashB64}`;
}

export async function verifyPassword(stored: string, password: string) {
  const parts = stored.split(":");
  if (parts.length !== 3) return false;
  const [iterStr, saltB64, hashB64] = parts;
  const iterations = parseInt(iterStr, 10);
  if (!iterations || !saltB64 || !hashB64) return false;

  const salt = fromBase64(saltB64);
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveBits"]);
  const derived = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: DIGEST,
    },
    keyMaterial,
    KEY_LENGTH * 8,
  );
  const derivedB64 = toBase64(new Uint8Array(derived));
  return timingSafeEqual(fromBase64(derivedB64), fromBase64(hashB64));
}
