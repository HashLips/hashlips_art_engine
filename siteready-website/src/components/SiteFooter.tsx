import Link from "next/link";
import React from "react";
import { siteConfig } from "@/config/siteConfig";
import { COMPANY } from "@/config/company";

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Labour Hire", href: "/labour-hire" },
  { label: "For Workers", href: "/for-workers" },
  { label: "Technology", href: "/technology" },
  { label: "Safety & Compliance", href: "/safety-compliance" },
  { label: "Accessibility", href: "/accessibility-statement" },
  { label: "Privacy", href: "/legal/privacy" },
  { label: "Cookies", href: "/legal/cookies" },
  { label: "Terms", href: "/legal/terms" },
];

const SiteFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="text-white"
      style={{
        backgroundColor: "var(--color-srPrimary, #111827)",
        color: "var(--sr-onPrimary, #ffffff)",
      }}
    >
      <div className="container max-w-6xl mx-auto px-4 py-10 grid gap-8 md:grid-cols-3">
        <div className="space-y-3">
          <h3 className="text-xl font-semibold">About</h3>
          <p className="text-sm text-white/80">
            {siteConfig.companyName} is a Sydney-based construction labour hire and construction
            cleaning agency supplying vetted, site-ready workers across NSW.
          </p>
          <p className="text-sm text-white/80">{siteConfig.location}</p>
        </div>
        <div className="space-y-3">
          <h3 className="text-xl font-semibold">Quick links</h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-white/90">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-xl font-semibold">Contact</h3>
          <div className="space-y-1 text-sm text-white/80">
            <p>{COMPANY.legalName}</p>
            <p>ABN {COMPANY.abn}</p>
            <p>Registered office</p>
            <p>{COMPANY.address}</p>
            <p>Email: {COMPANY.email}</p>
            <p>WhatsApp: {COMPANY.whatsapp}</p>
          </div>
          <div className="pt-3">
            <p className="text-sm font-semibold text-white">WhatsApp</p>
            <img
              src="/whatsapp-qr.png?v=2"
              alt="SiteReady Workforce WhatsApp QR code"
              className="mt-2 h-24 w-24 rounded-lg border border-white/20 bg-white"
            />
            <p className="mt-2 text-xs text-white/70">Scan to chat on WhatsApp.</p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4">
        <div className="container max-w-6xl mx-auto px-4 flex flex-col gap-2 text-sm text-white/70 md:flex-row md:items-center md:justify-between">
          <span>
            © {currentYear} {siteConfig.companyName}. All rights reserved.
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <span>Sydney & Greater NSW</span>
            <Link href="/admin-login?next=/dashboard/admin" className="text-white/70 hover:text-white">
              Admin login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
