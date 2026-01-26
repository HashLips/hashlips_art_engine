"use client";

import clsx from "clsx";
import Link from "next/link";
import React, { useState } from "react";
import { siteConfig } from "@/config/siteConfig";
import PrimaryButton from "./PrimaryButton";

const navLinks = [
  { href: "/labour-hire", label: "Hire" },
  { href: "/for-workers", label: "For Workers" },
  { href: "/safety-compliance", label: "Compliance" },
  { href: "/contact", label: "Contact" },
];

const SiteHeader: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-srBorder">
      <div className="container max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="text-lg font-semibold text-srPrimary">
          {siteConfig.shortName}
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-srPrimary">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-srAccent transition">
              {link.label}
            </Link>
          ))}
          <Link href="/login" className="text-srMuted hover:text-srPrimary transition">
            Login
          </Link>
          <PrimaryButton href="/labour-hire">Book labour</PrimaryButton>
        </nav>
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-md border border-srBorder text-srPrimary"
          aria-label="Toggle navigation"
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className="sr-only">Toggle navigation</span>
          <span className="h-0.5 w-5 bg-srPrimary block mb-1" />
          <span className="h-0.5 w-5 bg-srPrimary block mb-1" />
          <span className="h-0.5 w-5 bg-srPrimary block" />
        </button>
      </div>
      <div
        className={clsx(
          "md:hidden border-t border-srBorder bg-white/95 backdrop-blur transition-all",
          open ? "max-h-screen" : "max-h-0 overflow-hidden",
        )}
      >
        <div className="container max-w-6xl mx-auto px-4 flex flex-col gap-3 py-4 text-sm font-medium text-srPrimary">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-srAccent transition"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/login" className="text-srMuted hover:text-srPrimary transition" onClick={() => setOpen(false)}>
            Login
          </Link>
          <PrimaryButton href="/labour-hire">Book labour</PrimaryButton>
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
