import { getBinding, hasR2Binding, R2_BINDING_NAME } from "@/lib/db/config";

type R2BucketLike = {
  put: (
    key: string,
    value: ArrayBuffer | ArrayBufferView | Blob | string,
    options?: { httpMetadata?: { contentType?: string } },
  ) => Promise<unknown>;
  get: (key: string) => Promise<R2ObjectLike | null>;
  delete?: (key: string) => Promise<unknown>;
};

type R2ObjectLike = {
  body?: ReadableStream<Uint8Array> | null;
  httpMetadata?: { contentType?: string };
  size?: number;
};

function decodeBase64(value: string) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value, "base64");
  }
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function putBase64Object(params: { key: string; base64: string; contentType?: string }) {
  if (!hasR2Binding()) {
    throw new Error("R2 not configured");
  }
  const bucket = getBinding<R2BucketLike>(R2_BINDING_NAME);
  if (!bucket?.put) {
    throw new Error("R2 not configured");
  }
  const payload = decodeBase64(params.base64);
  await bucket.put(params.key, payload, {
    httpMetadata: params.contentType ? { contentType: params.contentType } : undefined,
  });
  return params.key;
}

export async function getObject(key: string) {
  if (!hasR2Binding()) {
    throw new Error("R2 not configured");
  }
  const bucket = getBinding<R2BucketLike>(R2_BINDING_NAME);
  if (!bucket?.get) {
    throw new Error("R2 not configured");
  }
  return bucket.get(key);
}

export async function deleteObject(key: string) {
  if (!hasR2Binding()) {
    throw new Error("R2 not configured");
  }
  const bucket = getBinding<R2BucketLike>(R2_BINDING_NAME);
  if (!bucket?.delete) {
    throw new Error("R2 not configured");
  }
  await bucket.delete(key);
}
