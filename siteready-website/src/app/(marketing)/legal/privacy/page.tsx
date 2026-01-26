import { COMPANY } from "@/config/company";

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-srText">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-4 text-srMuted">
          This Privacy Policy explains how <strong>{COMPANY.legalName}</strong> (“SiteReady Workforce”, “we”, “us”, “our”)
          collects, uses, stores and discloses personal information.
        </p>

        <h2 className="mt-10 text-xl font-semibold">1. Who we are</h2>
        <p className="mt-3 text-srMuted">
          <strong>Business / Legal name:</strong> {COMPANY.legalName}
          <br />
          <strong>ABN:</strong> {COMPANY.abn}
          <br />
          <strong>Registered office:</strong> {COMPANY.address}
          <br />
          <strong>Email:</strong> {COMPANY.email}
          <br />
          <strong>WhatsApp:</strong> {COMPANY.whatsapp}
        </p>

        <h2 className="mt-10 text-xl font-semibold">2. What this policy covers</h2>
        <p className="mt-3 text-srMuted">This policy covers personal information we collect through:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-srMuted">
          <li>our website (including enquiry and signup forms)</li>
          <li>our client and worker portals</li>
          <li>communications with us (email, phone, SMS and WhatsApp where you provide your number)</li>
          <li>our labour hire and workforce management services</li>
        </ul>

        <h2 className="mt-10 text-xl font-semibold">3. What is personal information?</h2>
        <p className="mt-3 text-srMuted">
          Personal information is information or an opinion about an identified individual, or an individual who is
          reasonably identifiable.
        </p>

        <h2 className="mt-10 text-xl font-semibold">4. The types of personal information we collect</h2>
        <p className="mt-3 text-srMuted">
          The type of information we collect depends on your relationship with us.
        </p>

        <h3 className="mt-6 text-lg font-semibold">4.1 Website visitors and enquiries</h3>
        <p className="mt-3 text-srMuted">We may collect:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-srMuted">
          <li>name</li>
          <li>email address</li>
          <li>phone number and WhatsApp number (if provided)</li>
          <li>company name and role (if provided)</li>
          <li>enquiry details</li>
          <li>technical information such as IP address, browser/device type, and website usage data (via cookies and similar technologies)</li>
        </ul>

        <h3 className="mt-6 text-lg font-semibold">4.2 Clients (employers/hosts) and their representatives</h3>
        <p className="mt-3 text-srMuted">We may collect:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-srMuted">
          <li>contact details (name, email, phone, WhatsApp)</li>
          <li>business details (company name, address, ABN/ACN where relevant)</li>
          <li>booking requests, site details and supervisor details</li>
          <li>timesheet approvals and related records</li>
          <li>portal activity records (for example, logins and actions taken within the portal)</li>
        </ul>

        <h3 className="mt-6 text-lg font-semibold">4.3 Workers, contractors and job applicants</h3>
        <p className="mt-3 text-srMuted">We may collect information relevant to recruitment, placement and compliance, including:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-srMuted">
          <li>identification and contact details (name, email, phone, address/suburb)</li>
          <li>right-to-work details (including visa type where relevant)</li>
          <li>licences, tickets and qualifications (for example White Card and other certifications)</li>
          <li>work history, experience, role preferences and availability</li>
          <li>references and checks where relevant to placements and safety/compliance</li>
          <li>payroll and payment-related information where required to engage and pay you</li>
          <li>timesheets and attendance information</li>
        </ul>

        <h2 className="mt-10 text-xl font-semibold">5. How we collect personal information</h2>
        <p className="mt-3 text-srMuted">We collect personal information when you:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-srMuted">
          <li>fill in forms on our website (including signup and contact forms)</li>
          <li>create an account, sign in, or use our portal</li>
          <li>request workers, manage assignments, or submit/approve timesheets</li>
          <li>apply for work or provide tickets and documents</li>
          <li>contact us by email, phone, SMS or WhatsApp (if you choose to use it)</li>
        </ul>
        <p className="mt-3 text-srMuted">We may also receive personal information from:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-srMuted">
          <li>clients/hosts (for example, where a host provides site requirements or shift details)</li>
          <li>referees (where applicable)</li>
          <li>service providers supporting our operations (for example, authentication, communications, accounting/payroll and hosting)</li>
        </ul>

        <h2 className="mt-10 text-xl font-semibold">6. Why we collect, hold and use personal information</h2>
        <p className="mt-3 text-srMuted">We collect and use personal information to:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-srMuted">
          <li>provide labour hire and workforce management services</li>
          <li>assess worker applications and match workers to roles and sites</li>
          <li>manage bookings, rosters, assignments, attendance and timesheets</li>
          <li>meet safety, compliance and insurance requirements</li>
          <li>communicate with clients and workers about bookings, shifts and updates</li>
          <li>provide support and improve our website and portal</li>
          <li>meet legal and regulatory obligations</li>
          <li>prevent fraud and protect our systems</li>
        </ul>

        <h2 className="mt-10 text-xl font-semibold">7. Disclosure of personal information</h2>
        <p className="mt-3 text-srMuted">We may disclose personal information to:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-srMuted">
          <li>clients/hosts (for example, to confirm worker allocation, attendance and timesheets)</li>
          <li>workers/contractors (for example, shift details and site contact information needed for coordination)</li>
          <li>our service providers (for example, hosting, authentication, communications, analytics, accounting/payroll tools)</li>
          <li>professional advisers (for example, lawyers, accountants and insurers)</li>
          <li>regulators, courts or authorities where required or authorised by law</li>
        </ul>
        <p className="mt-3 text-srMuted">We do not sell personal information.</p>

        <h2 className="mt-10 text-xl font-semibold">8. Overseas disclosure</h2>
        <p className="mt-3 text-srMuted">
          Some service providers we use may store or process data outside Australia. Where we disclose information overseas,
          we take reasonable steps to ensure personal information is handled in a manner consistent with this policy and
          appropriate privacy protections.
        </p>

        <h2 className="mt-10 text-xl font-semibold">9. Security and storage</h2>
        <p className="mt-3 text-srMuted">
          We take reasonable steps to protect personal information from misuse, interference, loss, unauthorised access,
          modification or disclosure. This includes access controls, encryption where appropriate, and monitoring.
        </p>

        <h2 className="mt-10 text-xl font-semibold">10. Data retention</h2>
        <p className="mt-3 text-srMuted">
          We retain personal information only for as long as necessary for our functions and activities, and for legal, safety,
          insurance, compliance, and dispute resolution purposes.
        </p>

        <h2 className="mt-10 text-xl font-semibold">11. Accessing and correcting your personal information</h2>
        <p className="mt-3 text-srMuted">
          You may request access to the personal information we hold about you and request corrections if it is inaccurate,
          out of date, incomplete, irrelevant or misleading.
        </p>
        <p className="mt-3 text-srMuted">To make a request, contact us using the details in section 1.</p>

        <h2 className="mt-10 text-xl font-semibold">12. Marketing communications</h2>
        <p className="mt-3 text-srMuted">
          If we send you marketing or promotional communications, you can opt out at any time by using the unsubscribe option
          (where available) or by contacting us.
        </p>
        <p className="mt-3 text-srMuted">
          Operational communications (for example, onboarding, booking confirmations, shift updates, and portal notices) may
          still be sent where required to provide our services.
        </p>

        <h2 className="mt-10 text-xl font-semibold">13. Cookies and analytics</h2>
        <p className="mt-3 text-srMuted">
          We use cookies and similar technologies to operate our website and help improve it. For more information, see our{" "}
          <strong>Cookie Policy</strong> at: <a className="underline text-srPrimary" href="/legal/cookies">/legal/cookies</a>
        </p>

        <h2 className="mt-10 text-xl font-semibold">14. Privacy complaints</h2>
        <p className="mt-3 text-srMuted">
          If you believe we have not handled your personal information appropriately, please contact us and we will work to
          resolve your complaint.
        </p>
        <p className="mt-3 text-srMuted">
          <strong>Email:</strong> {COMPANY.email}
          <br />
          <strong>Registered office:</strong> {COMPANY.address}
        </p>

        <h2 className="mt-10 text-xl font-semibold">15. Changes to this policy</h2>
        <p className="mt-3 text-srMuted">We may update this policy from time to time. The latest version will be available on our website.</p>
      <p className="mt-4 text-xs text-srMuted">
        <strong>Last updated:</strong> 25 January 2026
      </p>
    </div>
  );
}
