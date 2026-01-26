// Simple guard script to fail CI if the OpenNext bundle contains
// Windows-style absolute paths or references to @vercel/og/resvg.wasm.
// Run after opennextjs-cloudflare build (and patch-resvg) when verifying a build.

import fs from 'fs';
import path from 'path';

const targets = [
  path.join('.open-next', 'worker.js'),
  path.join('.open-next', 'server-functions', 'default', 'handler.mjs'),
];

const disallowedPatterns = [
  /@vercel\/og/i,
  /resvg\.wasm/i,
  /[A-Z]:[\\/]/, // Windows drive paths
];

let hadError = false;

for (const target of targets) {
  if (!fs.existsSync(target)) {
    console.warn(`[verify-bundle] Skipping missing file: ${target}`);
    continue;
  }
  const content = fs.readFileSync(target, 'utf8');
  for (const pat of disallowedPatterns) {
    if (pat.test(content)) {
      console.error(`[verify-bundle] Disallowed pattern ${pat} found in ${target}`);
      hadError = true;
    }
  }
}

if (hadError) {
  process.exit(1);
} else {
  console.log('[verify-bundle] Bundle check passed (no og/resvg/Windows paths).');
}
