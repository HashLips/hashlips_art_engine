# Legal and Privacy Consent Flows

Draft – obtain legal review before production.

## Where consents appear

- Worker dashboard: consent modal appears before saving sensitive profile data and before submitting the first timesheet.
- Client timesheets: consent modal appears before viewing or approving timesheets.
- Admin Xero connection: consent modal appears before connecting Xero.

## Updating versions

Legal documents live in `src/lib/legal/documents.ts`.

When a legal document changes:

1) Update the `version` string.
2) Update the document `body` text.
3) Communicate changes to users (existing acceptances are version-specific).

## API enforcement

- `/api/workers/me` blocks sensitive profile updates without `APP5_COLLECTION_NOTICE`.
- `/api/timesheets` blocks submissions without `PLATFORM_TERMS`.
- `/api/timesheets` and `/api/timesheets/[id]` block client access without `CLIENT_CONFIDENTIALITY_TERMS`.
- `/api/integrations/xero/connect` blocks without `ADMIN_XERO_ACK`.
- Xero sync checks for `XERO_DATA_SHARING_CONSENT` on the worker.

## Stored fields

Acceptances are stored in `legal_acceptances` with:

- document_type
- document_version
- user_id
- role
- accepted_at
- ip_address
- user_agent
