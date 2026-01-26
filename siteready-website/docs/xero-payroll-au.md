# Xero Payroll AU Integration (Internal)

This integration connects SiteReady Workforce to Xero Payroll AU for employee and timesheet sync.

## Required environment variables

Server-side only (Cloudflare secrets / vars):
- `XERO_CLIENT_ID`
- `XERO_CLIENT_SECRET`
- `XERO_REDIRECT_URI`
- `XERO_TOKEN_ENCRYPTION_KEY` (base64 32-byte key)
- `APP_URL` (used for building redirect URLs)

## OAuth flow

1) Admin visits `/api/integrations/xero/connect`
2) User completes Xero OAuth
3) Callback hits `/api/integrations/xero/callback`
4) Tokens + tenant ID are stored encrypted

## Notes

- Tokens must be stored encrypted at rest.
- Client secrets must never be exposed to the browser.
- All Xero requests include `Xero-Tenant-Id` + `Authorization` headers.
