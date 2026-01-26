# Theme Coverage & Mapping Report

## 1) Theme sources & tokens
**Tailwind config**: `tailwind.config.js`
- Tokens: `srPrimary`, `srAccent`, `srTeal`, `srText`, `srMuted`, `srBg`, `srCard`, `srBorder`

**CSS variables**: `src/app/globals.css`
- `--color-srPrimary`, `--color-srAccent`, `--color-srTeal`, `--color-srText`, `--color-srMuted`, `--color-srBg`, `--color-srCard`, `--color-srBorder`
- Body applies `bg-srBg text-srText`

**Layout split**
- Marketing: `src/app/(marketing)/layout.tsx` -> `SiteLayout`
- Dashboard: `src/app/(dashboard)/layout.tsx` -> `DashboardLayout`

**Gap**
- Only one token palette exists. Dual theme requires theme-scoped token overrides (e.g. `data-theme` on layout root) so marketing vs dashboard can swap palettes without touching component styles.

## 2) UI element inventory (counts + components)
**Buttons**
- PrimaryButton usage: 21
- SecondaryButton usage: 137
- Legacy pillButton class (CSS): 15
- Shared CTA button: `src/components/shared/cta-button.tsx`

**Cards / containers**
- Marketing: `FeatureCard`, `RoleCard`, `StepCard`, `SectionWrapper`
- Dashboard: inline-styled cards in multiple pages (see non-token list below)

**Badges / status chips**
- Many inline status colors in dashboard pages (see non-token list below)

**Inputs**
- Marketing forms mostly tokenized, but dashboard forms still use non-token colors in `src/components/booking/BookLabourNowForm.module.css`.

## 3) Non-tokenized color usage (file + line)
These will not update when dual theme is applied. Replace with semantic tokens or status tokens.

See `non_token_colors.json` for the full list. Highest-impact areas:
- `src/app/(dashboard)/dashboard/admin/workers/page.tsx` (large block of inline status/card colors)
- `src/app/(dashboard)/dashboard/worker/page.tsx` (status chips + card colors)
- `src/components/booking/BookLabourNowForm.module.css` (many hard-coded colors)
- `src/components/header.tsx` and `src/components/footer.tsx` (non-token tailwind colors)

## 4) Proposed semantic token mapping (dual-theme)
**Marketing theme (Option A)**
- `--sr-primary`: `#111827` (Charcoal)
- `--sr-accent`: `#FBBF24` (Yellow)
- `--sr-bg`: `#F5F7FA`
- `--sr-text`: `#111827`
- `--sr-muted`: `#6B7280`
- `--sr-border`: `#E5E7EB`

**Dashboard theme (Option B)**
- `--sr-primary`: `#0B2A4A` (Navy)
- `--sr-accent`: `#38BDF8` (Sky)
- `--sr-bg`: `#F5F7FA` (or a slightly cooler `#F3F6FA`)
- `--sr-text`: `#0B2A4A`
- `--sr-muted`: `#64748B`
- `--sr-border`: `#E2E8F0`

**Status tokens (global)**
- `--sr-success`, `--sr-warning`, `--sr-danger`, `--sr-neutral`
- Map inline success/warn/error colors (e.g., `#16a34a`, `#f59e0b`, `#ef4444`, `#64748b`) to these tokens.

**Implementation recommendation**
- Add `data-theme="marketing"` and `data-theme="dashboard"` on layout root.
- Define theme overrides in `globals.css`:
  - `[data-theme="marketing"] { --color-srPrimary: ... }`
  - `[data-theme="dashboard"] { --color-srPrimary: ... }`
- Replace hard-coded hex and non-semantic Tailwind colors with CSS variables or `sr*` tokens.

## 5) Copy / CTA consistency (key routes)
**/**
- H1: “Construction labour & cleaning, without the chaos”
- CTAs: “Book labour” (primary), “Find site work” (secondary)

**/labour-hire**
- H1: “Construction labour hire – Sydney / NSW”
- Primary: “Submit request” (form submit)
- Secondary: “Log in / Create an account” (single block)

**/for-workers**
- H1: “Find steady construction work in Sydney / NSW”
- Primary: “Apply now”

**/safety-compliance**
- H1: “Safety & Compliance”
- CTAs: “Book labour” (primary), “For workers” (secondary)

**/contact**
- Primary: contact form submit

**/dashboard***
- Multiple equal-weight buttons on admin/worker pages. Recommend a single primary action per view.

## 6) Recommendations (KISS-aligned)
**Quick wins (1–2 days)**
- Replace inline hex colors in dashboard pages with status tokens and `sr*` tokens.
- Tokenize `BookLabourNowForm.module.css` with CSS variables.
- Remove or retokenize legacy `src/components/header.tsx` and `src/components/footer.tsx` if unused.

**Medium (3–7 days)**
- Introduce `data-theme` and dual token sets in `globals.css`.
- Create shared `StatusBadge` and `Card` components that consume tokens only.

**Deep refactor (1–3 weeks)**
- Centralize all color usage into tokens and eliminate inline styles in dashboard pages.
- Standardize buttons to `PrimaryButton` / `SecondaryButton` / `TextLink` and remove legacy CTA components.

## 7) Simplified navigation proposal
- Header: Hire, For Workers, Compliance, Contact
- CTA: Book labour
- Login as text link
- Admin login only in footer
