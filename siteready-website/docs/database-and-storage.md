# Database & Storage (Platform Layer)

## Targets
- **Cloudflare D1 (SQLite)** for platform tables:
  - users, clients, requests, workers, worker_tickets, worker_availability, assignments, timesheets, incidents, praise, performance_metrics/history, audit_logs.
  - SQL migration: `db/migrations/000_init.sql`.
  - Binding name expected: `DB`.
- **Cloudflare R2** for ticket image storage.
  - Binding name expected: `TICKETS_BUCKET`.
  - Ticket images must only be revealed to clients when `contract_signed` AND `release_to_client` are true; staff can always view.

## Configuration
Set bindings in Cloudflare (Workers):
- D1 binding: `DB`
- R2 binding: `TICKETS_BUCKET`

Env vars:
- `APP_SECRET` – required for app session signing.
- Seeding (optional):
  - `SEED_STAFF_EMAIL`, `SEED_STAFF_PASSWORD`
  - `SEED_CLIENT_EMAIL`, `SEED_CLIENT_PASSWORD`
  - `SEED_WORKER_EMAIL`, `SEED_WORKER_PASSWORD`
- Existing SMTP vars for notifications remain unchanged.

## Migrations
- Migration SQL lives in `db/migrations/000_init.sql`.
- Apply to your D1 database before enabling the platform features.
- If D1 is not bound, protected platform pages will show a “Platform not configured” notice (see `src/app/platform-not-configured/page.tsx`).

## Graceful degradation
- Public pages remain available.
- Protected routes (labour-hire/dashboard/client/worker/staff) still require login; if D1 is missing, platform UI should render a clear “not configured” message instead of crashing.

## Next steps (not yet wired)
- Drizzle/D1 query helpers and R2 upload utilities will be added when wiring persistence and ticket uploads.
- Seed data (roles/tickets/demo users) will rely on env-provided credentials (no secrets in code).
