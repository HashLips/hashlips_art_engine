"use client";

import Link from "next/link";
import React from "react";
import { usePathname, useRouter } from "next/navigation";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    const checkOnboarding = async () => {
      if (!pathname?.startsWith("/dashboard")) return;
      if (pathname.startsWith("/dashboard/onboarding")) return;
      const sessionRes = await fetch("/api/auth/session");
      if (!sessionRes.ok) return;
      const sessionJson = await sessionRes.json().catch(() => null);
      const role = sessionJson?.session?.role;
      if (role !== "client") return;
      const profileRes = await fetch("/api/clients/me");
      if (!profileRes.ok) return;
      const profileJson = await profileRes.json().catch(() => null);
      const profile = profileJson?.profile;
      if (!profile) return;
      const abnMismatch =
        (profile.acn || "").length === 9 &&
        (profile.abn || "").length === 11 &&
        !(profile.abn || "").endsWith(profile.acn || "");
      const profileComplete =
        !!profile.org_name &&
        !!profile.structure &&
        /^\d{9}$/.test(profile.acn || "") &&
        /^\d{11}$/.test(profile.abn || "") &&
        !abnMismatch &&
        !!profile.contact_title &&
        !!profile.contact_name &&
        !!profile.contact_job_title &&
        !!profile.contact_mobile &&
        !!profile.contact_email &&
        !!profile.reg_street &&
        !!profile.reg_state &&
        /^\d{4}$/.test(profile.reg_postcode || "");
      if (!profileComplete) {
        router.replace("/dashboard/onboarding");
      }
    };
    checkOnboarding();
  }, [pathname, router]);

  return (
    <div className="min-h-screen bg-srBg text-srText">
      <header className="sticky top-0 z-30 border-b border-srBorder bg-srPrimary text-[var(--sr-onPrimary)]">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/dashboard" className="text-sm font-semibold text-[var(--sr-onPrimary)]">
            SiteReady Workforce
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/contact" className="text-white/80 hover:text-white">
              Help
            </Link>
            <Link href="/logout" className="text-white/80 hover:text-white">
              Logout
            </Link>
          </div>
        </div>
      </header>
      <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
    </div>
  );
};

export default DashboardLayout;
