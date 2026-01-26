// Simple smoke tester for the Dikpik backend.
// Usage: SESSION_TOKEN=... node worker/tools/smoke.js [baseUrl]

const BASE_URL = process.argv[2] || process.env.BASE_URL || "https://dikpik-backend.morning-voice-68dc.workers.dev";
const SESSION_TOKEN = process.env.SESSION_TOKEN;

if (!SESSION_TOKEN) {
  console.error("SESSION_TOKEN env var is required.");
  process.exit(1);
}

async function fetchJson(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers || {})
    }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

async function authedGet(path) {
  return fetchJson(path, {
    headers: { authorization: `Bearer ${SESSION_TOKEN}` }
  });
}

async function main() {
  console.log(`Running smoke tests against ${BASE_URL}`);

  const health = await fetchJson("/api/health");
  console.log("health:", health.ok ? "ok" : health);

  const listings = await fetchJson("/api/listings");
  console.log(`listings: ${listings.items?.length ?? 0}`);

  const wanted = await fetchJson("/api/wanted");
  console.log(`wanted: ${wanted.items?.length ?? 0}`);

  const me = await authedGet("/api/auth/me");
  console.log(`me: ${me.member?.email || "none"}`);

  const bids = await authedGet("/api/bids");
  console.log(`bids (current user): ${bids.items?.length ?? 0}`);
}

main().catch((err) => {
  console.error("Smoke test failed:", err.message);
  process.exit(1);
});
