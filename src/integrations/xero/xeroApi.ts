export type XeroFetchOptions = {
  accessToken: string;
  tenantId: string;
  idempotencyKey?: string;
  body?: unknown;
};

const XERO_API_BASE = "https://api.xero.com";

export async function xeroFetch<T = unknown>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  options: XeroFetchOptions,
): Promise<T> {
  const url = path.startsWith("http") ? path : `${XERO_API_BASE}${path}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${options.accessToken}`,
    "Xero-Tenant-Id": options.tenantId,
    Accept: "application/json",
  };
  if (options.idempotencyKey) {
    headers["Idempotency-Key"] = options.idempotencyKey;
  }
  const body =
    typeof options.body === "undefined"
      ? undefined
      : JSON.stringify(options.body);
  if (body) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(url, { method, headers, body });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Xero API ${method} ${path} failed: ${res.status} ${text}`);
  }
  return (await res.json()) as T;
}

export async function fetchConnections(accessToken: string) {
  const res = await fetch(`${XERO_API_BASE}/connections`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Xero connections failed: ${res.status} ${text}`);
  }
  return (await res.json()) as Array<{ tenantId: string; tenantName?: string }>;
}
