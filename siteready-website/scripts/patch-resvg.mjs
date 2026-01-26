// Post-build patch to neutralize @vercel/og resvg.wasm imports in OpenNext output.
// Cloudflare Workers on Windows-built bundles pick up absolute paths that break at runtime.
// This script rewrites those imports to a local stub module.

import fs from "fs";
import path from "path";

const handlerPath = path.join(".open-next", "server-functions", "default", "handler.mjs");
const metaPath = `${handlerPath}.meta.json`;
const stubPath = path.join(".open-next", "server-functions", "default", "resvg-stub.js");
const replacementSpecifier = "./resvg-stub.js";

function normalizeResvgImports(contents) {
  let output = contents;

  // Replace direct specifiers for resvg + yoga (both are wasm pulled in by @vercel/og)
  output = output.split("@vercel/og/resvg.wasm?module").join(replacementSpecifier);
  output = output.split("@vercel/og/yoga.wasm?module").join(replacementSpecifier);

  // Replace any absolute Windows paths that point to resvg/yoga wasm or patched stub.
  const windowsPathRegexes = [
    /["']?[A-Za-z]:[^"'\\n]*resvg(?:-stub)?\\.js["']?/gi,
    /["']?[A-Za-z]:[^"'\\n]*@vercel[^"'\\n]*resvg\\.wasm\\?module["']?/gi,
    /["']?[A-Za-z]:[^"'\\n]*@vercel[^"'\\n]*yoga\\.wasm\\?module["']?/gi,
  ];
  for (const re of windowsPathRegexes) {
    output = output.replace(re, replacementSpecifier);
  }

  // Bruteforce replace any remaining Windows paths pointing to these modules
  output = output.replace(/C:[^"'\\n]*resvg(?:-stub)?\\.js/gi, replacementSpecifier);
  output = output.replace(/C:[^"'\\n]*resvg\\.wasm\\?module/gi, replacementSpecifier);
  output = output.replace(/C:[^"'\\n]*yoga\\.wasm\\?module/gi, replacementSpecifier);
  // Backslash variants
  output = output.replace(/C:\\\\[^"'\\n]*resvg(?:-stub)?\\.js/gi, replacementSpecifier);
  output = output.replace(/C:\\\\[^"'\\n]*resvg\\.wasm\\?module/gi, replacementSpecifier);
  output = output.replace(/C:\\\\[^"'\\n]*yoga\\.wasm\\?module/gi, replacementSpecifier);

  // Normalize JSON "path" entries that still point to local disk
  output = output.replace(/"path"\\s*:\\s*"[^"]*resvg[^"]*"/gi, `"path": "${replacementSpecifier}"`);
  output = output.replace(/"path"\\s*:\\s*"[^"]*yoga\\.wasm\\?module[^"]*"/gi, `"path": "${replacementSpecifier}"`);

  // Explicitly squash the common Windows absolute path emitted by OpenNext
  const windowsStubPath =
    "C:/Users/info/Documents/GitHub/hashlips_art_engine/siteready-website/node_modules/next/dist/compiled/./resvg-stub.js";
  if (output.includes(windowsStubPath)) {
    output = output.split(windowsStubPath).join(replacementSpecifier);
  }

  return output;
}

function patchFile(filePath) {
  if (!fs.existsSync(filePath)) return false;
  const contents = fs.readFileSync(filePath, "utf8");
  const next = normalizeResvgImports(contents);
  if (next === contents) return false;
  fs.writeFileSync(filePath, next, "utf8");
  return true;
}

function writeStub(filePath) {
  if (fs.existsSync(filePath)) return;
  fs.writeFileSync(
    filePath,
    [
      "// Stubbed resvg module for Cloudflare Workers.",
      "export const defaultWasm = {};",
      "export default {};",
    ].join("\n"),
    "utf8",
  );
}

const patchedHandler = patchFile(handlerPath);
const patchedMeta = patchFile(metaPath);

if (patchedHandler || patchedMeta) {
  writeStub(stubPath);
  console.log("Patched resvg.wasm imports to stub:", {
    handler: patchedHandler,
    meta: patchedMeta,
    stub: stubPath,
  });
} else {
  console.log("No resvg.wasm imports found to patch.");
}
