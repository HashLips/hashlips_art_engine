const hasBuffer = typeof Buffer !== "undefined";

function toBinaryString(bytes: Uint8Array) {
  let result = "";
  for (let i = 0; i < bytes.length; i++) {
    result += String.fromCharCode(bytes[i]);
  }
  return result;
}

function fromBinaryString(binary: string) {
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

export function toBase64(bytes: Uint8Array) {
  if (hasBuffer) {
    return Buffer.from(bytes).toString("base64");
  }
  return btoa(toBinaryString(bytes));
}

export function fromBase64(b64: string) {
  if (hasBuffer) {
    return Uint8Array.from(Buffer.from(b64, "base64"));
  }
  return fromBinaryString(atob(b64));
}

export function toBase64Url(bytes: Uint8Array) {
  return toBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function fromBase64Url(b64: string) {
  const padded = b64.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(b64.length / 4) * 4, "=");
  return fromBase64(padded);
}

export function timingSafeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}
