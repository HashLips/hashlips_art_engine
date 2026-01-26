# Tax Declaration (Worker)

This feature implements the ATO TFN Declaration (NAT 3092 style) flow for workers and maps the data into Xero Payroll AU employee TaxDeclaration payloads.

## Storage
- Table: `worker_tax_declarations`
- Key: `worker_id`
- TFN is encrypted at rest using `DATA_ENCRYPTION_KEY`.
- Only `tfn_last4` is stored in clear text for UI display.

## API
- `GET /api/worker/tax-declaration`
  - Worker reads their own declaration.
  - Admin may pass `?worker_id=...` to view summary.
- `POST /api/worker/tax-declaration`
  - Saves/updates the declaration.
  - Requires required fields; enforces TFN rules and WHM threshold guardrail.
  - When signed, stores IP and user agent.

## Required fields
- `tax_residency_status` (AUSTRALIAN_RESIDENT | FOREIGN_RESIDENT | WORKING_HOLIDAY_MAKER)
- `employment_basis` (FULL_TIME | PART_TIME | CASUAL | LABOUR_HIRE | SUPER_INCOME_STREAM)
- `claim_tax_free_threshold` (yes/no)
- `has_study_training_loan` (yes/no)
- `has_sfss_debt` (yes/no)
- `tfn_status` (PROVIDED | APPLIED_OR_ENQUIRED | EXEMPT_UNDER18 | EXEMPT_PENSION | NOT_QUOTED)
- If `tfn_status=PROVIDED`, TFN must be 8 or 9 digits and is encrypted at rest.

## Signature
- Worker signs using a checkbox.
- Once signed, the declaration is locked on the worker UI.
- Admin can still view the summary; Xero sync requires signature.

## Xero mapping
- `TaxDeclaration.ResidencyStatus` maps from `tax_residency_status`.
- `TaxFreeThresholdClaimed`, `HasHELPDebt`, `HasSFSSDebt`, `EligibleToReceiveLeaveLoading`
- TFN is sent only if `tfn_status=PROVIDED` and declaration is signed.

## RBAC
- Clients cannot access the tax declaration endpoints.
- Admin can view summaries only.
