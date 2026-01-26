

---

## Custom domain setup (automated via wrangler.jsonc)

This project uses Workers Custom Domains configured in wrangler.jsonc under outes with custom_domain: true.

Required:
- The domain must be an **active Cloudflare zone** in the same account.
- You **cannot** create a Custom Domain on a hostname with an existing CNAME record (remove/replace it first).

If CI deploy fails with a domain/zone error, fix the Cloudflare zone/DNS and re-run the workflow.

## Google Workspace email safety (manual)

If you move DNS/nameservers to Cloudflare, ensure these records are present in Cloudflare DNS first:
- MX records for Google Workspace
- SPF TXT
- DKIM TXT (from Google Admin)
- DMARC TXT

This prevents email breakage for info@sitereadyworkforce.com.

