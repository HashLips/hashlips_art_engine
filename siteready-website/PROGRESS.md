# PROGRESS

## Done
- Staging-first workflow confirmed in config: `wrangler.jsonc` uses `env.staging.name = "siteready-website-staging"` and Workers Dev deployment.
- Last committed checkpoint identified:
  - `1a02fdf` (2026-02-15 12:32:35 +07:00) future-service interest intake + admin list.
  - `00d7224` (2026-02-15 12:26:16 +07:00) staging WIP checkpoint.
- Latest uncommitted work anchor identified (Bangkok time):
  - `2026-02-18 17:45:33` on `src/components/booking/WorkersGroupFields.tsx`.
  - Nearby edits around `2026-02-18 17:34:53` on `src/components/booking/BookLabourNowForm.tsx`.
- Requests-page credit validation UX now mirrors onboarding pattern:
  - Top missing-section summary in credit panel.
  - `Take me to highlighted area` pulse button.
  - Scroll/focus to first missing role field.
  - Per-field arrow hints for credit-estimate-required fields.
- Client policy flow update:
  - Added back button on `/dashboard/policies/client-terms`.
  - Added `I do not accept` flow with confirmation modal and return to requests.
  - Requests now support `Save and return later` (draft save) when policies are not yet accepted.
  - Draft requests are saved for admin visibility with pending policy acceptance status.
- Automated emails management (admin):
  - Added new admin page: `/dashboard/admin/automated-emails`.
  - Added search/filter by audience (`client`, `worker`, `admin`, `mixed`).
  - Added editable fields per template: subject/message/button label/button path/logo/footer toggles.
  - Added backend API: `GET/POST /api/admin/email-templates`.
  - Added D1-backed overrides table creation-on-demand: `email_template_overrides`.
  - Seeded registry with current automated email flows across client/worker/admin.
- Staging/production link correctness:
  - Replaced hardcoded production worker portal URLs with dynamic origin (`req.nextUrl.origin`) in:
    - `src/app/api/admin/workers/[id]/approve/route.ts`
    - `src/app/api/admin/workers/[id]/clarification-email/route.ts`
- Build status:
  - `npm run build` passes.
- Automated emails UX fine-tuning:
  - Added clickable resolved destination URL for each template button path.
  - Added email-style visual preview showing subject, body, CTA button, logo placement, and footer/legal content.
  - Added logo image endpoint for preview rendering: `/api/email/logo`.
- Live sender wiring (template overrides now applied):
  - Draft reminder email (`request_draft_resume`) now uses override subject/message/CTA path/CTA label.
  - Worker approved email (`worker_profile_approved`) now uses override subject/message/CTA path/CTA label.
  - Worker clarification email (`worker_clarification`) now applies template overrides (supports `{{message}}`, `{{subject}}`, `{{worker_name}}`, `{{cta_url}}`, `{{cta_label}}`).
  - Policy broadcast emails now use override templates:
    - `policy_worker_terms_updated`
    - `policy_client_terms_updated`
    - `policy_privacy_updated`
    - `policy_frontend_terms_updated`
- Policy recipients update:
  - Added `listClientPolicyRecipientEmails()` to include:
    - client contact email
    - timesheet approver primary email
    - timesheet approver backup email
    - client user email(s)
  - Policy sends now use this audience for:
    - client terms
    - privacy policy (plus workers)
    - website terms (plus workers)
  - Worker terms remains workers only.
- Website terms login-stage gating:
  - Added `/dashboard/policies/website-terms` acceptance page.
  - Middleware now redirects signed-in users to website terms page if latest `frontend_terms` is not accepted.
  - Acceptance panel now auto-returns to requested `next` path after website terms acceptance.
  - `frontend_terms` added to policy-required checks in `/api/policies/status` and request submit path.
- Admin clients policy panel cleanup:
  - Removed `Worker Terms` from client policy acceptance display.

## Next
- Continue from the 2026-02-18 booking/admin/worker WIP set and finish one vertical slice at a time.
- Wire selected high-traffic email senders to consume overrides at send time (subject/message/CTA), starting with:
  - draft/incomplete request reminder
  - worker approved
  - worker clarification
  - policy update broadcasts
- Make small checkpoint commits after each coherent change:
  - `git add -A`
  - `git commit -m "wip: <short scope>"`
- Keep this file current at each checkpoint.

## Blockers
- No hard blocker identified yet; main risk is large uncommitted surface area across UI + API + DB changes.
- Overrides are currently editable and stored, but not yet fully wired into every email sender template path.

## Session Handoff Rule
- When chat context gets long, create a short session summary with:
  - done
  - next
  - blockers
  - exact files touched
  - last command/error
