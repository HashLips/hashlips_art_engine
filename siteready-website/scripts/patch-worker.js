const fs = require("node:fs");
const path = require("node:path");

const workerPath = path.join(".open-next", "worker.js");

if (!fs.existsSync(workerPath)) {
  console.log("worker.js not found, skipping worker patch.");
  process.exit(0);
}

const contents = fs.readFileSync(workerPath, "utf8");
if (contents.includes("BASIC_AUTH_USER") && contents.includes("WWW-Authenticate")) {
  console.log("worker.js already patched for basic auth.");
}
const middlewareNeedle = "const reqOrResp = await middlewareHandler(request, env, ctx);";
const middlewareReplacement = "const reqOrResp = request;";
const handlerNeedle =
  "const { handler } = await import(\"./server-functions/default/handler.mjs\");\n" +
  "            return handler(reqOrResp, env, ctx, request.signal);";
const handlerReplacement = [
  "const handlerModule = await import(\"./server-functions/default/handler.mjs\");",
  "            const handlerFn = typeof handlerModule.handler === \"function\"",
  "              ? handlerModule.handler",
  "              : handlerModule.default;",
  "            if (typeof handlerFn !== \"function\") {",
  "              console.error(\"Invalid server handler export\", Object.keys(handlerModule));",
  "              return new Response(\"Internal Server Error\", { status: 500 });",
  "            }",
  "            try {",
  "              return await handlerFn(reqOrResp, env, ctx, request.signal);",
  "            } catch (error) {",
  "              console.error(\"Server handler error\", error);",
  "              return new Response(\"Internal Server Error\", { status: 500 });",
  "            }",
].join("\n");

let next = contents;
let didPatch = false;
const scheduledNeedle = "export default {\n    async fetch";
const scheduledReplacement = [
  "export default {",
  "    async scheduled(event, env, ctx) {",
  "        try {",
  "          const cronKey = env.CRON_KEY || \"\";",
  "          if (!cronKey) return;",
  "          const user = env.BASIC_AUTH_USER || env.BASIC_AUTH_USERNAME || env.BASIC_AUTH_LOGIN || \"\";",
  "          const pass = env.BASIC_AUTH_PASS || env.BASIC_AUTH_PASSWORD || env.BASIC_AUTH_SECRET || \"\";",
  "          let authHeader = \"\";",
  "          if (user && pass && typeof globalThis.btoa === \"function\") {",
  "            authHeader = `Basic ${globalThis.btoa(`${user}:${pass}`)}`;",
  "          }",
  "          const baseUrl = env.APP_URL || \"https://sitereadyworkforce.com\";",
  "          const url = `${baseUrl}/api/cron/ticket-expiry`;",
  "          const headers = {",
  "            \"x-cron-key\": cronKey,",
  "          };",
  "          if (authHeader) headers.Authorization = authHeader;",
  "          const req = new Request(url, { method: \"POST\", headers });",
  "          const client = env.WORKER_SELF_REFERENCE;",
  "          if (client && typeof client.fetch === \"function\") {",
  "            await client.fetch(req);",
  "          } else {",
  "            await fetch(req);",
  "          }",
  "        } catch (error) {",
  "          console.error(\"Scheduled ticket expiry check failed\", error);",
  "        }",
  "    },",
  "    async fetch",
].join("\n");

const authNeedle = "return runWithCloudflareRequestContext(request, env, ctx, async () => {";
if (next.includes(authNeedle) && !next.includes("BASIC_AUTH_USER")) {
  const authBlock = [
    "return runWithCloudflareRequestContext(request, env, ctx, async () => {",
    "            const user = env.BASIC_AUTH_USER || env.BASIC_AUTH_USERNAME || env.BASIC_AUTH_LOGIN || \"\";",
    "            const pass = env.BASIC_AUTH_PASS || env.BASIC_AUTH_PASSWORD || env.BASIC_AUTH_SECRET || \"\";",
    "            const basicAuthEnabledExplicit =",
    "              (env.BASIC_AUTH_ENABLED || \"\").toLowerCase() === \"true\" ||",
    "              (env.BASIC_AUTH_ENABLE || \"\").toLowerCase() === \"true\";",
    "            const basicAuthEnabled = basicAuthEnabledExplicit || (user && pass);",
    "            if (basicAuthEnabled) {",
    "              if (!user || !pass) {",
    "                return new Response(\"Unauthorized\", {",
    "                  status: 401,",
    "                  headers: { \"WWW-Authenticate\": 'Basic realm=\"SiteReady\"' },",
    "                });",
    "              }",
    "              const authHeader = request.headers.get(\"authorization\") || \"\";",
    "              if (!authHeader.startsWith(\"Basic \")) {",
    "                return new Response(\"Unauthorized\", {",
    "                  status: 401,",
    "                  headers: { \"WWW-Authenticate\": 'Basic realm=\"SiteReady\"' },",
    "                });",
    "              }",
    "              let decoded = \"\";",
    "              try {",
    "                if (typeof globalThis.atob === \"function\") {",
    "                  decoded = globalThis.atob(authHeader.replace(\"Basic \", \"\"));",
    "                }",
    "              } catch {",
    "                decoded = \"\";",
    "              }",
    "              const [providedUser, providedPass] = decoded.split(\":\");",
    "              if (providedUser !== user || providedPass !== pass) {",
    "                return new Response(\"Unauthorized\", {",
    "                  status: 401,",
    "                  headers: { \"WWW-Authenticate\": 'Basic realm=\"SiteReady\"' },",
    "                });",
    "              }",
    "            }",
  ].join("\n");
  next = next.replace(authNeedle, authBlock);
  didPatch = true;
}

if (next.includes(middlewareNeedle)) {
  next = next.replace(middlewareNeedle, middlewareReplacement);
  didPatch = true;
}

if (next.includes(handlerNeedle)) {
  next = next.replace(handlerNeedle, handlerReplacement);
  didPatch = true;
}

if (next.includes(scheduledNeedle) && !next.includes("async scheduled(")) {
  next = next.replace(scheduledNeedle, scheduledReplacement);
  didPatch = true;
}

if (!didPatch) {
  console.log("worker.js already patched or no targets found.");
  process.exit(0);
}

fs.writeFileSync(workerPath, next, "utf8");
console.log("Patched worker.js to guard middleware and server handler.");
