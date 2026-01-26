const KEY_ENV = "DATA_ENCRYPTION_KEY";

function getKeyBytes(): Uint8Array {
  const key = process.env[KEY_ENV];
  if (!key) {
    throw new Error("Encryption key not configured");
  }
  const raw = key.trim();
  const binary =
    typeof Buffer !== "undefined"
      ? Buffer.from(raw, "base64")
      : Uint8Array.from(atob(raw), (c) => c.charCodeAt(0));
  if (binary.length !== 32) {
    throw new Error("Encryption key must be 32 bytes (base64 encoded)");
  }
  return binary instanceof Uint8Array ? binary : new Uint8Array(binary);
}

async function getCryptoKey() {
  const keyBytes = getKeyBytes();
  const rawKey = keyBytes.buffer.slice(keyBytes.byteOffset, keyBytes.byteOffset + keyBytes.byteLength) as ArrayBuffer;
  return crypto.subtle.importKey("raw", rawKey, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

function toBase64(data: Uint8Array) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(data).toString("base64");
  }
  let binary = "";
  data.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

function fromBase64(value: string) {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(value, "base64"));
  }
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function encryptString(value: string) {
  if (!value) return value;
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await getCryptoKey();
  const encoded = new TextEncoder().encode(value);
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded));
  return `${toBase64(iv)}.${toBase64(ciphertext)}`;
}

export async function decryptString(value: string | null | undefined) {
  if (!value) return null;
  const [ivEncoded, cipherEncoded] = value.split(".");
  if (!ivEncoded || !cipherEncoded) return null;
  const iv = fromBase64(ivEncoded);
  const cipher = fromBase64(cipherEncoded);
  const key = await getCryptoKey();
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipher);
  return new TextDecoder().decode(plain);
}
