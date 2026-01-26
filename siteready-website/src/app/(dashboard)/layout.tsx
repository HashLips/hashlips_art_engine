import DashboardLayout from "@/components/DashboardLayout";
import CookieConsentBanner from "@/components/CookieConsentBanner";

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="dashboard" className="min-h-screen bg-srBg text-srText">
      <DashboardLayout>{children}</DashboardLayout>
      <CookieConsentBanner />
    </div>
  );
}
