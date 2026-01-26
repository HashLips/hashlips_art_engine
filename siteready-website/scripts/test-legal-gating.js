const fs = require("fs");
const path = require("path");

const routes = [
  "src/app/api/workers/me/route.ts",
  "src/app/api/timesheets/route.ts",
  "src/app/api/timesheets/[id]/route.ts",
  "src/app/api/timesheets/[id]/status/route.ts",
  "src/app/api/integrations/xero/connect/route.ts",
];

const missing = [];
for (const route of routes) {
  const filePath = path.join(__dirname, "..", route);
  const contents = fs.readFileSync(filePath, "utf8");
  if (!contents.includes("NEEDS_LEGAL_ACCEPTANCE")) {
    missing.push(route);
  }
}

if (missing.length) {
  // eslint-disable-next-line no-console
  console.error("Missing legal gating marker in:", missing.join(", "));
  process.exit(1);
}

// eslint-disable-next-line no-console
console.log("Legal gating checks passed.");
