import express from "express";
import { google } from "googleapis";

/**
 * Minimal Express server to accept booking payloads and push to Google Sheets via Service Account.
 * Not used in production by default; provided as a template.
 *
 * Env vars:
 *  PORT=3001
 *  SHEETS_SPREADSHEET_ID=your_sheet_id
 *  SHEETS_SERVICE_ACCOUNT_EMAIL=service-account@project.iam.gserviceaccount.com
 *  SHEETS_SERVICE_ACCOUNT_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
 *  SHEETS_WEBHOOK_TOKEN=optional shared secret; if set, require header X-Webhook-Token
 */

const app = express();
app.use(express.json({ limit: "1mb" }));

function getSheetsClient() {
  const auth = new google.auth.JWT({
    email: process.env.SHEETS_SERVICE_ACCOUNT_EMAIL,
    key: process.env.SHEETS_SERVICE_ACCOUNT_KEY?.split(String.raw`\n`).join("\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

type BookingRole = {
  count?: number;
  role?: string;
  tickets?: string[];
  experience?: string;
  startDate?: string;
  startTime?: string;
  hoursPerDay?: number;
  expectedDurationValue?: number;
  expectedDurationUnit?: string;
  otOptions?: string[];
};

type BookingPayload = {
  company?: {
    structure?: string;
    acn?: string;
    abn?: string;
    website?: string;
  };
  registeredAddress?: {
    street?: string;
    state?: string;
    postcode?: string;
  };
  siteAddress?: {
    formattedAddress?: string;
    mapUrl?: string;
  };
  roles?: BookingRole[];
  notes?: string;
  submittedAt?: string;
  bookingId?: string;
};

function buildRows(payload: BookingPayload): string[][] {
  const rows: string[][] = [];
  (payload.roles || []).forEach((r: BookingRole, idx: number) => {
    rows.push([
      payload.company?.structure ?? "",
      payload.company?.acn ?? "",
      payload.company?.abn ?? "",
      payload.company?.website ?? "",
      payload.registeredAddress?.street ?? "",
      payload.registeredAddress?.state ?? "",
      payload.registeredAddress?.postcode ?? "",
      payload.siteAddress?.formattedAddress ?? "",
      payload.siteAddress?.mapUrl ?? "",
      String(idx + 1),
      String(r.count ?? ""),
      r.role ?? "",
      (r.tickets || []).join("; "),
      r.experience ?? "",
      r.startDate ?? "",
      r.startTime ?? "",
      String(r.hoursPerDay ?? ""),
      `${r.expectedDurationValue ?? ""} ${r.expectedDurationUnit ?? ""}`.trim(),
      (r.otOptions || []).join("; "),
      payload.notes ?? "",
      payload.submittedAt ?? "",
      payload.bookingId ?? "",
    ]);
  });
  return rows;
}

app.post("/webhook", async (req, res) => {
  try {
    if (process.env.SHEETS_WEBHOOK_TOKEN) {
      const token = req.header("X-Webhook-Token");
      if (token !== process.env.SHEETS_WEBHOOK_TOKEN) {
        return res.status(401).json({ ok: false, error: "Unauthorized" });
      }
    }

    const sheets = getSheetsClient();
    const spreadsheetId = process.env.SHEETS_SPREADSHEET_ID!;
    const rows = buildRows(req.body);

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Bookings!A1",
      valueInputOption: "RAW",
      requestBody: {
        values: rows,
      },
    });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Sheet append failed" });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Sheets webhook listening on ${port}`);
});
