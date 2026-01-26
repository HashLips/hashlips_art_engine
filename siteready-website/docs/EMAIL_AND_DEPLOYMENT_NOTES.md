## Project Email Setup – Overview
- This project uses Nodemailer + SMTP (`src/lib/email.ts`) to send notifications when:
  - Clients submit labour bookings (`/api/bookings`)
  - Workers submit applications (`/api/applications`)
  - Visitors submit the contact form (`/api/contact`)
- SMTP details are read from `.env.local` and are **not** committed to Git.

## Current Stage – Name & Domain Not Final Yet
- “SiteReady Workforce Pty Ltd” is a working name only; it may change after ASIC checks and domain availability checks.
- The brand text lives in `src/config/siteConfig.ts` and can be changed later in one place.
- Domain and final email addresses will be chosen once you are confident there are no conflicts.

## Phase 1 – Development / Testing with a Temporary Gmail Account
Use a regular Gmail for low-volume dev/test email:
- Turn on 2‑Step Verification for that Google account.
- Create an App Password for “Mail”.
- Use `smtp.gmail.com` with port 587 (STARTTLS) or 465 (SSL) in `.env.local`.
- Example `.env.local` for dev:
  ```
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=yourtempaddress@gmail.com
  SMTP_PASS=<YOUR_GMAIL_APP_PASSWORD>
  SMTP_FROM="SiteReady Workforce (Dev) <yourtempaddress@gmail.com>"
  NOTIFY_TO="yourtempaddress@gmail.com"
  ```
Notes:
- Suitable only for development/testing, not high-volume production.
- Google enforces daily limits and may flag suspicious activity.

## Phase 2 – Production with Google Workspace (Recommended)
Once the name is final, the domain is purchased, and Workspace is set up (e.g. `info@yourfinalbrand.com.au`):
- Use the same Nodemailer setup with updated credentials:
  ```
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=info@yourfinalbrand.com.au
  SMTP_PASS=<YOUR_WORKSPACE_APP_PASSWORD>
  SMTP_FROM="Your Final Brand Name <info@yourfinalbrand.com.au>"
  NOTIFY_TO="bookings@yourfinalbrand.com.au"
  ```
- Update `siteConfig.ts` to the final company name and contact details.
- No code changes are needed for forms/API routes; only environment values change.

## How the Environment Variables Interact with `sendNotificationEmail`
- `src/lib/email.ts` reads `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `NOTIFY_TO`.
- Creates a Nodemailer transport.
- If `SMTP_FROM` or `NOTIFY_TO` is missing, it logs a warning and returns early (no email sent), allowing the site to run without SMTP during early development.
- Once `.env.local` is filled, live emails will be sent on form submission.
- Migrating dev → prod only requires updating `.env.local` (or host env vars).

## Deploying on Cloudflare – Static vs API Routes
### Static (next export)
- Great for marketing pages only.
- Does **not** support Next.js API routes (`/api/bookings`, `/api/applications`, `/api/contact`).
- Local dev can test APIs; production static deploy will serve only the pages.

### Next.js on Cloudflare Functions (Next on Pages)
- Runs the full Next.js app with API routes on the edge.
- Set the same SMTP env vars in Cloudflare project settings.
- Forms will send emails in production without code changes.

### Suggested path
- **Option A (now):** Stay static while pre-launch; marketing pages live, APIs only used locally.
- **Option B (later):** Switch to Functions mode when name/domain/email are final; configure env vars in Cloudflare; live forms will send emails.

## Checklist – What the Owner Needs to Do Later
- Decide final trading name (avoid conflicts).
- Confirm domain availability and purchase domain.
- Set up Google Workspace mailbox (e.g. `info@...`).
- Update `siteConfig.ts` with final name, email, phone.
- Update `.env.local` (and Cloudflare env) with Workspace SMTP details.
- Reconfigure Cloudflare deployment from static to Next.js/Functions mode when ready for live forms.
- Add Privacy/Terms pages before going fully live.
