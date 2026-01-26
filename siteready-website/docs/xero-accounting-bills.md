# Xero Accounting Bills (Contractor)

This integration creates **ACCPAY** bills in Xero Accounting for workers engaged as contractors (engagement type `CONTRACTOR_ABN`).

## Flow
1) Contractor completes company + bank details.
2) Admin sets a contractor pay rate (AUD/hr).
3) Client approves a timesheet.
4) System upserts a Xero contact for the contractor.
5) System creates an **ACCPAY** invoice (bill) in Xero.

## Required admin configuration
- **Purchases account code**  
  Set in `/dashboard/admin/xero/accounting`.  
  Bills will **not** sync while this is blank or `000`.

- **Contractor pay rate (AUD/hr)**  
  Set in `/dashboard/admin/contractors`.  
  Bills will **fail** if no pay rate is configured.

## Retry behavior
- Failed bill syncs are listed at `/dashboard/admin/xero/bill-failures`.
- Admin can retry manually.
- Automated retry runs on cron:
  - max 5 attempts
  - 15‑minute backoff between attempts
  - deterministic idempotency key per timesheet

## Idempotency and duplicate prevention
Bill creation uses a deterministic idempotency key:
```
bill:<tenantId>:<timesheetId>
```
This prevents duplicates when retries occur.

## Common issues
- **Missing purchases account code** → Configure `default_purchases_account_code`.
- **Missing contractor pay rate** → Set pay rate on contractor.
- **Xero not connected** → Reconnect in `/dashboard/admin/xero`.

## Security
- Bank account numbers are encrypted at rest.
- Sensitive values are never logged.
