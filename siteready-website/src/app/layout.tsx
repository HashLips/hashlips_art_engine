import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SiteReady Workforce – Construction Labour Hire & Cleaning, Sydney",
  description:
    "SiteReady Workforce Pty Ltd supplies vetted construction labour and construction cleaning services across Sydney and NSW.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
