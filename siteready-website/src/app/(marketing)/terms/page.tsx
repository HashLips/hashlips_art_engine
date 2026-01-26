export const metadata = {
  title: "Terms of Use | SiteReady Workforce",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Website Terms of Use</h1>
        <p className="mt-4 text-sm text-slate-600">
          These terms apply to use of this website. By using the site, you agree to these terms.
        </p>

        <h2 className="mt-10 text-xl font-semibold">No advice</h2>
        <p className="mt-3 text-slate-700">
          Information on this website is general in nature and may change. It is not legal, financial,
          or safety advice.
        </p>

        <h2 className="mt-10 text-xl font-semibold">Bookings and applications</h2>
        <p className="mt-3 text-slate-700">
          Submitting a booking or application does not guarantee acceptance or availability. We may
          request additional information to confirm suitability and compliance.
        </p>

        <h2 className="mt-10 text-xl font-semibold">Acceptable use</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
          <li>Do not misuse forms or submit false information.</li>
          <li>Do not attempt to interfere with site operation or security.</li>
        </ul>

        <h2 className="mt-10 text-xl font-semibold">Liability</h2>
        <p className="mt-3 text-slate-700">
          To the extent permitted by law, we exclude liability for loss arising from use of this website
          or reliance on its content.
        </p>

        <h2 className="mt-10 text-xl font-semibold">Contact</h2>
        <p className="mt-3 text-slate-700">
          For questions about these terms, contact us via the Contact page.
        </p>

      <p className="mt-10 text-xs text-slate-500">
        Note: This is general information and not legal advice.
      </p>
    </div>
  );
}
