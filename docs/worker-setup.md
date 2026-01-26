## Cloudflare Worker Setup

This repository now includes the scaffolding for the Dikpik Bazaar backend Worker.

### 1. Requirements

- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) v4+
- Cloudflare account with access to the `dikpik-bazaar` D1 database
- Postmark server/API token

### 2. Configure Secrets

After pulling the latest code, store the Postmark token inside Cloudflare:

```bash
wrangler secret put POSTMARK_API_TOKEN --name dikpik-backend
```

Paste the token when prompted. Wrangler stores it securely and the Worker can reference it via `env.POSTMARK_API_TOKEN`.

### 3. Initialize the D1 schema

Run the schema file once to bootstrap tables:

```bash
wrangler d1 execute dikpik-bazaar --file=worker/schema.sql
```

This creates `members`, `wallets`, `deposits`, `listings`, `bids`, and `sessions`.

If you ran the schema previously, rerun the command to ensure the new `sessions` table exists (the statements are idempotent).

### 4. Deploy / Test locally

```bash
# local dev (uses wrangler dev, requires --remote for D1 access)
wrangler dev --name dikpik-backend --remote

# deploy to Cloudflare
wrangler deploy
```

The Worker currently exposes a `/api/health` endpoint which returns wallet configuration and confirms bindings. Additional routes (auth, deposits, listings) will be layered on top of this foundation.
