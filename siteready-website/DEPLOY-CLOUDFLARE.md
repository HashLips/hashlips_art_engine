# Cloudflare Workers Deploy (OpenNext)

This project deploys Next.js to Cloudflare Workers using OpenNext (`@opennextjs/cloudflare`).

## One-time setup (this machine)
1. Install deps
   - `npm install`
2. Login to the correct Cloudflare account
   - `npm run cf:whoami`
   - If not logged in or wrong account: `npm run cf:login`
   - Then re-check: `npm run cf:whoami`

## Local Workers-runtime preview (recommended before deploying)
1. Ensure `.dev.vars` exists:
   - `.dev.vars` should contain:
     - `NEXTJS_ENV=development`
2. Keep local secrets in `.env.local` (NOT committed). Example keys used by the app:
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASS` (local only)
   - `SMTP_FROM`
   - `NOTIFY_TO`
3. Run preview:
   - `npm run cf:preview`
4. Test:
   - Visit the local preview URL
   - Submit forms: /labour-hire, /for-workers, /contact
5. Stop preview with Ctrl+C.

## First deploy (staging *.workers.dev)
1. Deploy:
   - `npm run cf:deploy`
2. Set the SMTP password as a Cloudflare Secret (interactive prompt):
   - `npm run cf:secret:smtp-pass`
   - Paste the Google Workspace App Password when prompted (never commit it).
3. Tail logs (optional):
   - `npm run cf:tail`

## Deploy “from now on”
After code changes:
- `npm run cf:deploy:keep-vars`

Notes:
- Non-secret runtime vars are in `wrangler.jsonc` under `vars`.
- Secrets like `SMTP_PASS` must be set via `wrangler secret put` (or dashboard secrets).

---

## Windows deploy workaround (no-bundle)

If `cf:deploy` fails on Windows with a Wrangler bundling error involving `resvg.wasm?module`, use:

- `npm run cf:deploy:no-bundle`

If you already set vars/secrets in the Cloudflare dashboard and want to preserve them across deploys:

- `npm run cf:deploy:keep-vars:no-bundle`

## Recommended “from now on”: GitHub Actions deploy (avoids Windows bundling issues)

This repo includes a workflow: `.github/workflows/cloudflare-workers-deploy.yml`.

### One-time GitHub setup
In your GitHub repo → Settings → Secrets and variables → Actions → New repository secret:

- `CLOUDFLARE_API_TOKEN` = (create in Cloudflare dashboard; token with Workers deploy permissions)
- `CLOUDFLARE_ACCOUNT_ID` = `e78998f06cca1c169ce8aa6975355767`

After that, every push to `main` will deploy from a Linux runner.
