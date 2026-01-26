import { COMPANY } from "@/config/company";

export default function CookiePolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-srText">
      <h1 className="text-3xl font-bold tracking-tight">Cookie Policy</h1>
        <p className="mt-4 text-srMuted">
          This Cookie Policy explains how <strong>{COMPANY.legalName}</strong> (“SiteReady Workforce”, “we”, “us”, “our”)
          uses cookies and similar technologies on our website and portals.
        </p>

        <h2 className="mt-10 text-xl font-semibold">1. What are cookies?</h2>
        <p className="mt-3 text-srMuted">
          Cookies are small text files stored on your device when you visit a website. Cookies help websites function,
          improve user experience, and provide reporting and analytics.
        </p>
        <p className="mt-3 text-srMuted">
          We may also use similar technologies such as local storage, pixels and tags.
        </p>

        <h2 className="mt-10 text-xl font-semibold">2. Why we use cookies</h2>
        <p className="mt-3 text-srMuted">We use cookies to:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-srMuted">
          <li>make the website and portals work properly</li>
          <li>remember preferences (including cookie consent)</li>
          <li>understand how visitors use the website so we can improve it</li>
          <li>help keep our services secure</li>
        </ul>

        <h2 className="mt-10 text-xl font-semibold">3. Types of cookies we may use</h2>
        <h3 className="mt-6 text-lg font-semibold">3.1 Strictly necessary cookies</h3>
        <p className="mt-3 text-srMuted">These are required for core functions such as:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-srMuted">
          <li>login/session management and security</li>
          <li>fraud prevention</li>
          <li>form submissions and site operation</li>
        </ul>

        <h3 className="mt-6 text-lg font-semibold">3.2 Preference cookies</h3>
        <p className="mt-3 text-srMuted">
          These remember choices you make, such as cookie consent and certain UI settings.
        </p>

        <h3 className="mt-6 text-lg font-semibold">3.3 Analytics cookies</h3>
        <p className="mt-3 text-srMuted">
          These help us understand website usage (for example, pages visited and device types) so we can improve the site.
        </p>

        <h3 className="mt-6 text-lg font-semibold">3.4 Third‑party cookies</h3>
        <p className="mt-3 text-srMuted">
          Some features and integrations may set cookies from third parties (for example, authentication providers). Those
          third parties manage their cookies in accordance with their own policies.
        </p>

        <h2 className="mt-10 text-xl font-semibold">4. Managing cookies</h2>
        <p className="mt-3 text-srMuted">
          You can control cookies through your browser settings, including blocking or deleting cookies. Note that blocking
          certain cookies may affect site functionality.
        </p>

        <h2 className="mt-10 text-xl font-semibold">5. Cookie consent</h2>
        <p className="mt-3 text-srMuted">
          When you first visit our website, you will see a cookie notice. If you select <strong>Accept</strong>, we will
          store your preference and apply it as described in this Cookie Policy.
        </p>

        <h2 className="mt-10 text-xl font-semibold">6. Contact us</h2>
        <p className="mt-3 text-srMuted">
          If you have questions about our use of cookies, contact us:
        </p>
        <p className="mt-3 text-srMuted">
          <strong>Email:</strong> {COMPANY.email}
          <br />
          <strong>Registered office:</strong> {COMPANY.address}
        </p>

      <p className="mt-4 text-xs text-srMuted">
        <strong>Last updated:</strong> 25 January 2026
      </p>
    </div>
  );
}
