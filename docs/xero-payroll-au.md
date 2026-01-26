# Xero Payroll AU Integration

Draft – obtain legal review before production.

This document describes the internal-only Xero Payroll AU integration for SiteReady Workforce.

## Required environment variables

Server-side only (Cloudflare secrets or local env):

- XERO_CLIENT_ID
- XERO_CLIENT_SECRET
- XERO_REDIRECT_URI
- XERO_TOKEN_ENCRYPTION_KEY
- APP_URL

## OAuth flow (high-level)

1) Admin clicks Connect in `/dashboard/admin/xero`
2) OAuth consent redirects to `/api/integrations/xero/callback`
3) Tokens are stored encrypted at rest
4) Xero tenant is stored for future API calls

## Security notes

- Never expose client secrets or tokens to the browser
- Always use `Xero-Tenant-Id` and `Idempotency-Key` headers for POST requests
- Mask TFN/bank fields in all UI screens and logs
