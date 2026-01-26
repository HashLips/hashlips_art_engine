export const metadata = {
  title: "Privacy Policy | SiteReady Workforce",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-4 text-sm text-slate-600">
          This page explains how SiteReady Workforce may collect, use, store and disclose personal
          information through this website and related communications.
        </p>

        <h2 className="mt-10 text-xl font-semibold">What we collect</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
          <li>Contact details (name, email, phone) you submit via forms.</li>
          <li>Work-related details submitted by workers (tickets, experience, availability).</li>
          <li>Booking details submitted by clients (site location, shift details, roles required).</li>
          <li>Technical data for basic site operation (e.g. request logs for security/debugging).</li>
        </ul>

        <h2 className="mt-10 text-xl font-semibold">How we use information</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
          <li>To respond to enquiries and process bookings/applications.</li>
          <li>To meet WHS/compliance requirements relevant to placements.</li>
          <li>To improve service quality and reliability (operational reporting).</li>
          <li>To prevent misuse and maintain security.</li>
        </ul>

        <h2 className="mt-10 text-xl font-semibold">Disclosure</h2>
        <p className="mt-3 text-slate-700">
          We may disclose information to service providers (e.g. email delivery, hosting, IT tools)
          and, where relevant, to host clients for site induction and compliance coordination.
        </p>

        <h2 className="mt-10 text-xl font-semibold">Security & retention</h2>
        <p className="mt-3 text-slate-700">
          We take reasonable steps to protect information. We retain information as needed for
          operational, legal, and compliance purposes.
        </p>

        <h2 className="mt-10 text-xl font-semibold">Contact</h2>
        <p className="mt-3 text-slate-700">
          If you have privacy questions, contact us via the Contact page.
        </p>

      <p className="mt-10 text-xs text-slate-500">
        Note: This is general information and not legal advice. You should obtain professional advice
        for your specific business circumstances.
      </p>
    </div>
  );
}
