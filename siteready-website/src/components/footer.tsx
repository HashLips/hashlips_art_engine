import Link from "next/link";

const footerLinks = [
  { href: "/labour-hire", label: "Labour Hire" },
  { href: "/for-workers", label: "For Workers" },
  { href: "/technology", label: "Technology" },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[1.2fr_1fr_1fr] lg:px-8">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-amber-600">
            SiteReady Workforce Pty Ltd
          </p>
          <h3 className="font-display text-2xl font-semibold text-slate-900">
            Sydney construction labour hire & construction cleaning.
          </h3>
          <p className="text-sm text-slate-600">
            Ready for builders, site managers, and skilled workers. Portals
            launch February 2026 with Xero-ready timesheets, payroll, and
            compliance.
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-slate-700">
            <span className="rounded-full bg-slate-900 px-3 py-1 text-amber-100">
              Fully insured
            </span>
            <span className="rounded-full border border-slate-300 px-3 py-1">
              Sydney & Greater NSW
            </span>
            <span className="rounded-full border border-amber-300/80 bg-amber-50 px-3 py-1 text-amber-800">
              Xero-ready payroll
            </span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-700">
            Navigation
          </h4>
          <div className="mt-4 flex flex-col gap-3 text-sm font-semibold text-slate-900">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition hover:text-amber-600"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-700">
            Contact
          </h4>
          <div className="text-sm text-slate-700">
            <p>Phone: <a className="font-semibold text-slate-900" href="tel:+61280000000">+61 2 8000 0000</a></p>
            <p>Email: <a className="font-semibold text-slate-900" href="mailto:hello@siteready.com.au">hello@siteready.com.au</a></p>
            <p>HQ: Sydney CBD, servicing Greater Sydney & NSW.</p>
          </div>
          <div className="space-y-1 text-xs text-slate-500">
            <p>ABN placeholder • Labour hire licence pending.</p>
            <p>Portals: client, worker, internal ops (beta).</p>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-200/70 bg-white/90">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} SiteReady Workforce Pty Ltd. All rights reserved.</p>
          <p className="text-slate-500">
            Built on Next.js • Deployed via Cloudflare Pages • Xero data hooks
            noted for future integration.
          </p>
        </div>
      </div>
    </footer>
  );
}
