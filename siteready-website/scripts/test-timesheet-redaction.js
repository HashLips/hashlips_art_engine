const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "src", "app", "api", "timesheets", "route.ts");
const contents = fs.readFileSync(filePath, "utf8");

const forbidden = ["tfn", "bank_", "super_member_number"];
const hits = forbidden.filter((term) => contents.includes(term));

if (hits.length) {
  // eslint-disable-next-line no-console
  console.error("Timesheet API references sensitive fields:", hits.join(", "));
  process.exit(1);
}

// eslint-disable-next-line no-console
console.log("Timesheet redaction checks passed.");
