# Platform Auth & Permissions (MVP Layer)

## Overview
- Site still wrapped by Cloudflare Worker Basic Auth and www→apex redirect.
- App-level auth (sessions) added on top:
  - Protected routes: `/labour-hire`, `/dashboard`, `/client*`, `/worker*`, `/staff*` (via middleware).
  - Unauthenticated users are redirected to `/login?next=...`.
- Sessions use an HTTP-only cookie (`sr_session`) signed with `APP_SECRET`.
- Auth roles: `client`, `worker`, `staff`. Current login is a lightweight demo form; real user provisioning will be added alongside the DB layer.
- Credential login (PBKDF2) via `/api/auth/login`. Registration seed endpoint `/api/auth/register` exists for bootstrapping; requires D1 binding.
- Seed helper `/api/seed` (POST) will create users if env vars are present:
  - `SEED_STAFF_EMAIL/SEED_STAFF_PASSWORD`
  - `SEED_CLIENT_EMAIL/SEED_CLIENT_PASSWORD`
  - `SEED_WORKER_EMAIL/SEED_WORKER_PASSWORD`

## Session details
- Cookie contains a signed payload: `{ sessionId, role, email?, userId?, issuedAt, expiresAt }`.
- Signed with HMAC SHA-256 using `APP_SECRET`.
- 7-day expiry. If invalid/expired, user is redirected to `/login`.

## Routes
- `/login`: simple form to pick a role (client/worker/staff) and optional email. On submit -> `/api/auth/login` -> sets cookie -> redirects to `next` param or `/dashboard`.
- `/logout`: clears session and redirects home.
- `/api/auth/login`: accepts `{ email?, role }`, sets session cookie.
- `/api/auth/logout`: clears session cookie.
- `/api/auth/session`: returns current session JSON or 401.
- `/api/auth/register`: accepts `{ email, password, role }` (PBKDF2) to seed users in D1. Skip if seeding externally.
- Protected routes: middleware checks session; if missing, redirects to `/login`.

## Basic Auth
- Existing Cloudflare Worker Basic Auth remains unchanged. If enabled, it wraps the entire site before the app-level auth.

## Next steps (planned)
- Replace demo login with real user records in D1 (clients/workers/staff).
- Add password hashing (PBKDF2) and registration/seed paths (staff-provisioned).
- Role-based dashboards and PII redaction per spec.
- Matching, timesheets, incidents, praise, audit logging, and DB schema will follow in subsequent steps.

## Env vars (auth-related)
- `APP_SECRET` – required to sign app-level session cookies.
- (Optional legacy) `AUTH0_*` – currently unused; app auth uses `APP_SECRET`.
- Basic Auth envs remain as before (`BASIC_AUTH_*`) for outer gate.
