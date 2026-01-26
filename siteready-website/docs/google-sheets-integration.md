# Google Sheets Integration Options

This project ships two optional patterns for pushing booking data to Google Sheets. Neither runs by default; wire them only if you need them.

## 1) Apps Script Web App (simplest)
Files: `integrations/google-sheets/apps-script/Code.gs`

Steps:
1. Create a Google Sheet; note its ID.
2. Open Extensions → Apps Script; paste `Code.gs`.
3. Set Script Property `WEBHOOK_TOKEN` (optional shared secret).
4. Deploy → New deployment → Web app → Execute as: Me; Who has access: Anyone with the link (or restricted if you add auth). Copy the Web App URL.
5. In `.env` for Next.js (Cloudflare Worker):
   - `SHEETS_WEBAPP_URL=<your web app URL>`
   - `SHEETS_WEBAPP_TOKEN=<same token as WEBHOOK_TOKEN>` (optional)
6. The Web App appends one row per role group with the schema below.

## 2) Node/Express Service Account Webhook
Files: `integrations/google-sheets/node-express/server.ts`

Steps:
1. Create a Google Cloud project; enable Sheets API.
2. Create a Service Account; generate a JSON key.
3. Share the target Sheet with the Service Account email.
4. Env vars for the Node service:
   - `PORT=3001`
   - `SHEETS_SPREADSHEET_ID=<sheet id>`
   - `SHEETS_SERVICE_ACCOUNT_EMAIL=<service account email>`
   - `SHEETS_SERVICE_ACCOUNT_KEY=<private key contents>` (use `\n` escapes)
   - `SHEETS_WEBHOOK_TOKEN=<shared secret>` (optional)
5. Run `npm install express googleapis` in that folder; deploy where you like.
6. Set your Next.js env to call this webhook URL instead of Apps Script.

## Next.js optional push
In `/api/bookings`, after validation/email, if `SHEETS_WEBAPP_URL` exists it POSTs the full booking payload plus `bookingId`/`submittedAt`. If `SHEETS_WEBAPP_TOKEN` is set, it’s sent as `X-Webhook-Token`. Sheets push failures do **not** block the booking.

## Spreadsheet columns (one row per role group)
```
Company Structure, ACN, ABN, Website, Registered Street, Registered State, Registered Postcode,
Site Address, Site Map Link, Role Group #, Number of Workers, Role, Tickets (semicolon),
Experience, Start Date, Start Time, Hours/Day, Expected Duration (value + unit),
OT Options (semicolon), Notes, Submitted At, Booking ID
```

## Maps API key
Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` with Maps JavaScript API + Places API enabled. Restrict the key to your domains in production.
