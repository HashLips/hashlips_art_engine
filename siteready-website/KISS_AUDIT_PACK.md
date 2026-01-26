# KISS Audit Pack — SiteReady Workforce (Staging)

## Step 1 — Stack + Structure
- **Framework**: Next.js App Router (source at `src/app/*/page.tsx`).
- **Styling**: Tailwind (via `@import "tailwindcss";` in `src/app/globals.css`).
- **Layout**: Global site shell in `src/components/SiteLayout.tsx` with `SiteHeader` + `SiteFooter`.
- **Deploy target**: Cloudflare Workers via OpenNext (`wrangler.jsonc`, `open-next.config.ts`, `custom-worker.ts`).
- **DB**: Cloudflare D1 (SQLite) bound as `env.DB` (see `wrangler.jsonc`).

**Local commands (from `package.json`):**
- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run lint` — lint
- `npm run cf:deploy:keep-all` — OpenNext build + deploy

## Step 2 — Sitemap + Templates + CTA
Routes are derived from `src/app/**/page.tsx` (dynamic routes included).

**Sitemap (full):**
- `/` (Home)
- `/labour-hire`
- `/for-workers`
- `/technology`
- `/safety-compliance`
- `/contact`
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/logout`
- `/admin-login`
- `/admin-setup`
- `/platform-not-configured`
- `/privacy`
- `/terms`
- `/legal/privacy`
- `/legal/collection-notice`
- `/legal/terms`
- `/legal/xero-consent`
- `/dashboard`
- `/dashboard/requests`
- `/dashboard/requests/status`
- `/dashboard/requests/proposed`
- `/dashboard/requests/[id]`
- `/dashboard/timesheets`
- `/dashboard/worker`
- `/dashboard/worker/assignments`
- `/dashboard/worker/proposed`
- `/dashboard/worker/timesheets`
- `/dashboard/worker/working-now`
- `/dashboard/admin`
- `/dashboard/admin/requests`
- `/dashboard/admin/clients`
- `/dashboard/admin/contractors`
- `/dashboard/admin/workers`
- `/dashboard/admin/access`
- `/dashboard/admin/xero`
- `/dashboard/admin/xero/accounting`
- `/dashboard/admin/xero/bill-failures`

**Templates/components + primary CTA (selected examples):**
- `/` — `SectionWrapper`, `SectionHeading`, `FeatureCard`, `StepCard`, `PrimaryButton`, `SecondaryButton`.  
  **Primary CTA**: “Book labour” → `/labour-hire`.  
  **Secondary CTA**: “Find site work” → `/for-workers`.  
  **Competing CTAs**: Yes (book labour + find work + request workers).
- `/labour-hire` — `RoleCard`, `BookLabourNowForm`, `StepCard`.  
  **Primary CTA**: “Log in to request workers” → `/login?next=/dashboard/requests`.  
  **Competing CTAs**: Yes (log in + create account + form).
- `/for-workers` — `FeatureCard`, `RoleCard`, `StepCard` + Application form.  
  **Primary CTA**: “Apply now” (anchor to form).
- `/contact` — Contact form.  
  **Primary CTA**: “Send message”.
- `/technology` — Info only.  
  **Primary CTA**: None.
- `/safety-compliance` — Info + 2 CTAs.  
  **Primary CTA**: “Book labour” → `/labour-hire`.  
  **Competing CTAs**: Yes (“For workers”).
- `/dashboard` — role-based action buttons (admin/worker/client).  
  **Primary CTA**: role-dependent.
- `/dashboard/worker` — worker profile + availability + submit profile.  
  **Primary CTA**: “Submit profile”.

## Step 3 — Navigation + Funnel
**Header nav (`src/components/SiteHeader.tsx`):**
- Home, Labour Hire, For Workers, Technology, Safety & Compliance, Contact
- Admin login, Login, Create account (CTA)

**Footer nav (`src/components/SiteFooter.tsx`):**
- Home, Labour Hire, For Workers, Technology, Safety & Compliance, Privacy (`#`), Terms (`#`)

**Navigation issues:**
- Privacy/Terms in footer link to `#`, while `/privacy`, `/terms`, and `/legal/*` exist.
- Admin login is in primary header; may compete with employer/worker flows.

**Primary journeys inferred:**
- **Employer (Hire)**: Home → Labour Hire → Log in/Create account → Dashboard → Requests.
- **Worker (Apply)**: Home → For Workers → Apply form → Login/Register → Worker dashboard.
- **Contact**: Home → Contact → Submit form.

## Step 4 — Homepage + Key Pages Content Inventory
**Home (`/`)**
- H1: “Construction labour & cleaning, without the chaos”
- Sections: Problems we solve, What we supply, How it works, Tech & reporting, Who we’re for, CTA strip
- CTAs: Book labour, Find site work, Request workers
- Notes: CTA density is high; repeated “portal mockup” blocks.

**Labour Hire (`/labour-hire`)**
- H1: “Construction labour hire – Sydney / NSW”
- Sections: Why hosts use us, Roles we supply, How bookings work, Compliance & insurance, Book labour
- CTAs: Log in to request workers, Create account, Log in (repeat), Create account (repeat)
- Form: `BookLabourNowForm` (multi-step booking flow)

**For Workers (`/for-workers`)**
- H1: “Find steady construction work in Sydney / NSW”
- Sections: Benefits, Types of work, Requirements, How it works, Apply form
- Form fields: name, mobile, email, suburb, travel radius, right to work, visa type, roles, tickets, experience years
- CTA: Apply now (anchor)

**Safety & Compliance (`/safety-compliance`)**
- H1: “Safety & Compliance”
- Sections: Employment model, WHS duties, Vetting, Operations, Insurance, Portal support, Risks
- CTAs: Book labour, For workers
- Notes: Very long page; could be condensed to essentials.

**Contact (`/contact`)**
- H1: “Talk to SiteReady Workforce”
- Form: name, company, email, phone, message
- CTA: Send message

## Step 5 — UI Consistency Audit (KISS)
**Typography**
- System UI stack in `globals.css`
- Headings use Tailwind classes: `text-4xl`, `text-5xl`, `font-bold`
- Body text varies (`text-lg`, `text-sm`, `text-xs`)

**Spacing**
- Frequent `gap-6`, `py-6`, `py-10`, `mt-4`, `space-y-6`
- No explicit spacing scale defined; relies on Tailwind defaults

**Colors (CSS variables)**
- `--color-srPrimary #0b1f3b`
- `--color-srAccent #ff7a1a`
- `--color-srTeal #11b6a8`
- `--color-srText #212529`
- `--color-srMuted #6b7280`
- `--color-srBg #f5f7fa`
- `--color-srCard #ffffff`
- `--color-srBorder #e5e7eb`

**Buttons / cards**
- Button variants: `PrimaryButton`, `SecondaryButton`, dashboard `pillButton`
- Card variants: `FeatureCard`, `RoleCard`, `StepCard`, plus “portal mockup” panels
- Inconsistency: button styles and card styles vary between marketing and dashboard

## Step 6 — Performance + Clutter Triggers
- No heavy media assets found in main pages; “portal mockup” is text-only.
- Multiple CTAs on key pages create visual competition.
- Safety & Compliance page is long and dense → high cognitive load.

## Step 7 — KISS Recommendations
### Quick wins (1–2 days)
1) **Reduce CTA duplication on `/labour-hire`**
   - Keep one primary CTA (Log in) + one secondary (Create account) and remove repeated CTA block.
   - Why: reduce decision fatigue.
2) **Fix footer legal links**
   - Replace `#` with real pages (`/legal/privacy`, `/legal/terms`).
   - Why: trust/clarity.
3) **Merge CTA messaging on `/`**
   - Use one main CTA (Book labour) and one secondary (Find site work); remove “Request workers” strip or make it consistent.

### Medium (3–7 days)
1) **Condense Safety & Compliance**
   - Convert multiple sections into 2–3 grouped sections with short bullets.
   - Why: reduce scroll and repetition.
2) **Unify button styles**
   - Align dashboard “pillButton” styling with Primary/Secondary buttons or create a single shared pattern.
3) **Clarify For Workers vs Register**
   - Add a single CTA on `/for-workers` to create account or apply, not both.

### Deep refactor (1–3 weeks)
1) **Simplify top-level nav**
   - Reduce to 5 items + 1 CTA (see below).
2) **Consolidate legal pages**
   - Keep `/legal/*` and remove `/privacy` + `/terms` duplicates, or vice versa.
3) **Create a unified “How it works”**
   - Replace separate steps across Home/Labour Hire/For Workers with a shared component + shorter copy.

**Suggested simplified navigation (max 5 + 1 CTA)**
- Home
- Hire
- For Workers
- Technology (or Safety & Compliance, not both)
- Contact
- CTA: Book labour

## Step 8 — Files Created
- `KISS_AUDIT_PACK.md`
- `SITE_STRUCTURE.json`

