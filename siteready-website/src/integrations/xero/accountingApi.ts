const XERO_API_BASE = "https://api.xero.com";

type XeroAccountingOptions = {
  tenantId: string;
  accessToken: string;
  idempotencyKey?: string;
};

function redact(value: string) {
  if (!value) return "";
  return `${value.slice(0, 4)}.${value.slice(-4)}`;
}

function sanitizeXeroError(text: string) {
  if (!text) return "";
  const redactedDigits = text.replace(/\d{6,}/g, "***");
  return redactedDigits.slice(0, 500);
}

export async function xeroAccountingFetch<T>(
  method: "GET" | "POST" | "PUT",
  path: string,
  options: XeroAccountingOptions,
  body?: unknown,
) {
  const url = `${XERO_API_BASE}${path}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${options.accessToken}`,
    "Xero-Tenant-Id": options.tenantId,
    Accept: "application/json",
  };
  if (options.idempotencyKey) headers["Idempotency-Key"] = options.idempotencyKey;
  if (body) headers["Content-Type"] = "application/json";

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = sanitizeXeroError(await res.text());
    const safeToken = redact(options.accessToken);
    const detail = text ? ` detail=${text}` : "";
    throw new Error(`Xero Accounting ${method} ${path} failed (${res.status}) token=${safeToken}.${detail}`);
  }

  return (await res.json()) as T;
}
