import Link from "next/link";
import CtaButton from "./shared/cta-button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/labour-hire", label: "Labour Hire" },
  { href: "/for-workers", label: "For Workers" },
  { href: "/technology", label: "Technology" },
];

const portalLinks = [
  { href: "#client-portal", label: "Client Portal" },
  { href: "#worker-portal", label: "Worker Portal" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="bg-slate-900 text-xs font-semibold uppercase tracking-[0.12em] text-slate-100">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2">
            <span className="h-1 w-6 rounded-full bg-amber-400" />
            Sydney construction labour hire & cleaning
          </span>
          <span className="flex flex-wrap items-center gap-3 text-slate-200">
            <span className="rounded-full border border-slate-700/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-200">
              Launching Feb 2026
            </span>
            <span className="text-slate-400">
              Fully insured • Xero-ready payroll & timesheets
            </span>
          </span>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-400 text-base font-black text-slate-900 shadow-md shadow-amber-300/40">
            SR
          </div>
          <div className="leading-tight">
            <p className="font-display text-lg font-semibold text-slate-900">
              SiteReady Workforce
            </p>
            <p className="text-sm text-slate-600">
              Construction labour hire • Sydney
            </p>
          </div>
        </Link>

        <nav className="ml-auto hidden items-center gap-6 text-sm font-semibold text-slate-800 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-amber-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {portalLinks.map((portal) => (
            <Link
              key={portal.href}
              href={portal.href}
              className="rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-900 transition hover:border-amber-400 hover:bg-amber-50"
            >
              {portal.label}
            </Link>
          ))}
          <CtaButton href="/labour-hire" label="Book labour" />
        </div>
      </div>
    </header>
  );
}
