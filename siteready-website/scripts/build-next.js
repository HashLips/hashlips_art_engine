const { spawnSync } = require("node:child_process");

process.env.NEXT_DISABLE_TURBOPACK = "1";
process.env.NEXT_USE_TURBOPACK = "0";
process.env.NEXT_TELEMETRY_DISABLED = "1";
delete process.env.TURBOPACK;
delete process.env.TURBOPACK_BUILD;

const cmd = process.execPath;
const nextBin = "node_modules/next/dist/bin/next";
const result = spawnSync(cmd, [nextBin, "build"], {
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
