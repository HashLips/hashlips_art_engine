import SiteLayout from "@/components/SiteLayout";
import CookieConsentBanner from "@/components/CookieConsentBanner";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="marketing" className="min-h-screen bg-srBg text-srText">
      <SiteLayout>{children}</SiteLayout>
      <CookieConsentBanner />
    </div>
  );
}
