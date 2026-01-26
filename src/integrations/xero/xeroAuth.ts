type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope?: string;
};

export type XeroTokenSet = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  scope?: string;
};

const XERO_IDENTITY_BASE = "https://identity.xero.com";
const DEFAULT_SCOPES = [
  "offline_access",
  "payroll.employees",
  "payroll.timesheets",
  "payroll.settings",
];

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

export function buildConsentUrl(state: string, scopes: string[] = DEFAULT_SCOPES) {
  const clientId = requiredEnv("XERO_CLIENT_ID");
  const redirectUri = requiredEnv("XERO_REDIRECT_URI");
  const url = new URL(`${XERO_IDENTITY_BASE}/connect/authorize`);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", scopes.join(" "));
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeCodeForTokenSet(code: string): Promise<XeroTokenSet> {
  const clientId = requiredEnv("XERO_CLIENT_ID");
  const clientSecret = requiredEnv("XERO_CLIENT_SECRET");
  const redirectUri = requiredEnv("XERO_REDIRECT_URI");
  const body = new URLSearchParams();
  body.set("grant_type", "authorization_code");
  body.set("code", code);
  body.set("redirect_uri", redirectUri);

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(`${XERO_IDENTITY_BASE}/connect/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Xero token exchange failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as TokenResponse;
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Math.floor(Date.now() / 1000) + data.expires_in,
    scope: data.scope,
  };
}

export async function refreshTokenIfNeeded(token: XeroTokenSet, skewSeconds = 60): Promise<XeroTokenSet> {
  const now = Math.floor(Date.now() / 1000);
  if (token.expiresAt - skewSeconds > now) return token;

  const clientId = requiredEnv("XERO_CLIENT_ID");
  const clientSecret = requiredEnv("XERO_CLIENT_SECRET");
  const body = new URLSearchParams();
  body.set("grant_type", "refresh_token");
  body.set("refresh_token", token.refreshToken);
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(`${XERO_IDENTITY_BASE}/connect/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Xero token refresh failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as TokenResponse;
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Math.floor(Date.now() / 1000) + data.expires_in,
    scope: data.scope ?? token.scope,
  };
}
