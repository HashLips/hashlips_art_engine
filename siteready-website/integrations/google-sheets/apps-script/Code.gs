/**
 * Google Apps Script Web App for receiving booking payloads.
 * Deploy as: New Deployment -> Web App -> Execute as: Me, Who has access: Anyone with the link (or restricted).
 * Set SHEETS_WEBAPP_TOKEN in your Next.js env and match it here.
 */

const SHEET_NAME = "Bookings";
const HEADER = [
  "Company Structure",
  "ACN",
  "ABN",
  "Website",
  "Registered Street",
  "Registered State",
  "Registered Postcode",
  "Site Address",
  "Site Map Link",
  "Role Group #",
  "Number of Workers",
  "Role",
  "Tickets",
  "Experience",
  "Start Date",
  "Start Time",
  "Hours/Day",
  "Expected Duration",
  "OT Options",
  "Notes",
  "Submitted At",
  "Booking ID",
];

function doPost(e) {
  try {
    const token = e?.postData?.contents ? JSON.parse(e.postData.contents)?.token : e.parameter.token;
    const body = e?.postData?.contents ? JSON.parse(e.postData.contents) : {};
    const headerToken = e?.parameter?.token || e?.postData?.type === "application/json" ? e?.postData?.token : null;
    const requestToken = e?.postData?.contents ? e.postData.contents["X-Webhook-Token"] : null;
    const suppliedToken = e?.postData?.headers?.["X-Webhook-Token"] || body?.["X-Webhook-Token"] || requestToken || token || headerToken;
    const expectedToken = PropertiesService.getScriptProperties().getProperty("WEBHOOK_TOKEN");
    if (expectedToken && suppliedToken !== expectedToken) {
      return ContentService.createTextOutput("Unauthorized").setMimeType(ContentService.MimeType.TEXT);
    }

    const sheet = getSheet();
    ensureHeader(sheet);

    const payload = body;
    if (!payload || !payload.roles) {
      return ContentService.createTextOutput("Bad request").setMimeType(ContentService.MimeType.TEXT);
    }

    const rows = buildRows(payload);
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, HEADER.length).setValues(rows);
    return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService.createTextOutput("Error").setMimeType(ContentService.MimeType.TEXT);
  }
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  return sheet;
}

function ensureHeader(sheet) {
  const firstRow = sheet.getRange(1, 1, 1, HEADER.length).getValues()[0];
  if (firstRow.join("") === "") {
    sheet.getRange(1, 1, 1, HEADER.length).setValues([HEADER]);
  }
}

function buildRows(payload) {
  const rows = [];
  const roles = payload.roles || [];
  roles.forEach(function (r, idx) {
    rows.push([
      payload.company.structure,
      payload.company.acn,
      payload.company.abn,
      payload.company.website || "",
      payload.registeredAddress.street,
      payload.registeredAddress.state,
      payload.registeredAddress.postcode,
      payload.siteAddress.formattedAddress,
      payload.siteAddress.mapUrl || "",
      idx + 1,
      r.count,
      r.role,
      (r.tickets || []).join("; "),
      r.experience,
      r.startDate,
      r.startTime,
      r.hoursPerDay,
      r.expectedDurationValue + " " + r.expectedDurationUnit,
      (r.otOptions || []).join("; "),
      payload.notes || "",
      payload.submittedAt || "",
      payload.bookingId || "",
    ]);
  });
  return rows;
}
