const XERO_AUTH_BASE = "https://login.xero.com/identity/connect/authorize";
const XERO_TOKEN_URL = "https://identity.xero.com/connect/token";

export type XeroTokenSet = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
};

export type XeroTokenState = {
  accessToken: string;
  refreshToken: string;
  scope: string;
  expiresAt: number;
};

function getEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} not configured`);
  return value;
}

export function buildConsentUrl(state: string, redirectUri?: string) {
  const clientId = getEnv("XERO_CLIENT_ID");
  const redirect = redirectUri || getEnv("XERO_REDIRECT_URI");
  const scope = [
    "openid",
    "profile",
    "email",
    "offline_access",
    "payroll.employees",
    "payroll.timesheets",
    "payroll.settings.read",
    "payroll.employees.read",
    "payroll.timesheets.read",
    "accounting.contacts",
    "accounting.transactions",
  ].join(" ");
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirect,
    scope,
    state,
  });
  return `${XERO_AUTH_BASE}?${params.toString()}`;
}

function basicAuthHeader() {
  const clientId = getEnv("XERO_CLIENT_ID");
  const clientSecret = getEnv("XERO_CLIENT_SECRET");
  const encoded =
    typeof Buffer !== "undefined"
      ? Buffer.from(`${clientId}:${clientSecret}`).toString("base64")
      : btoa(`${clientId}:${clientSecret}`);
  return `Basic ${encoded}`;
}

export async function exchangeCodeForTokenSet(code: string, redirectUri?: string) {
  const redirect = redirectUri || getEnv("XERO_REDIRECT_URI");
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirect,
  });
  const res = await fetch(XERO_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Xero token exchange failed (${res.status}): ${text}`);
  }
  const json = (await res.json()) as XeroTokenSet;
  return json;
}

export async function refreshToken(refreshToken: string) {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  const res = await fetch(XERO_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Xero token refresh failed (${res.status}): ${text}`);
  }
  const json = (await res.json()) as XeroTokenSet;
  return json;
}

export function normalizeTokenSet(tokenSet: XeroTokenSet): XeroTokenState {
  const now = Math.floor(Date.now() / 1000);
  return {
    accessToken: tokenSet.access_token,
    refreshToken: tokenSet.refresh_token,
    scope: tokenSet.scope,
    expiresAt: now + tokenSet.expires_in - 60,
  };
}

export async function refreshTokenIfNeeded(state: XeroTokenState) {
  const now = Math.floor(Date.now() / 1000);
  if (state.expiresAt > now) return state;
  const refreshed = await refreshToken(state.refreshToken);
  return normalizeTokenSet(refreshed);
}
