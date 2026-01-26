const XERO_API_BASE = "https://api.xero.com";

type XeroFetchOptions = {
  tenantId: string;
  accessToken: string;
  idempotencyKey?: string;
};

function redact(value: string) {
  if (!value) return "";
  return `${value.slice(0, 4)}…${value.slice(-4)}`;
}

export async function xeroFetch<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  options: XeroFetchOptions,
  body?: unknown,
) {
  const url = `${XERO_API_BASE}${path}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${options.accessToken}`,
    "Xero-Tenant-Id": options.tenantId,
    Accept: "application/json",
  };
  if (options.idempotencyKey) {
    headers["Idempotency-Key"] = options.idempotencyKey;
  }
  if (body) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    const safeToken = redact(options.accessToken);
    throw new Error(`Xero API ${method} ${path} failed (${res.status}) token=${safeToken}: ${text}`);
  }

  return (await res.json()) as T;
}

export async function fetchConnections(accessToken: string) {
  const url = `${XERO_API_BASE}/connections`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    const text = await res.text();
    const safeToken = redact(accessToken);
    throw new Error(`Xero API GET /connections failed (${res.status}) token=${safeToken}: ${text}`);
  }
  return (await res.json()) as Array<{ tenantId?: string }>;
}
