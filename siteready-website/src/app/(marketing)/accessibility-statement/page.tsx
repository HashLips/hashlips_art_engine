import { COMPANY } from "@/config/company";

export default function AccessibilityStatementPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-srText">
      <h1 className="text-3xl font-bold tracking-tight">Accessibility Statement</h1>
        <p className="mt-4 text-srMuted">
          <strong>{COMPANY.legalName}</strong> (“SiteReady Workforce”, “we”, “us”, “our”) is committed to providing a
          website and online services that are accessible to as many people as possible, including people living with
          disability.
        </p>
        <p className="mt-3 text-srMuted">
          We are continually improving the user experience for everyone and applying relevant accessibility standards
          across our public website and client/worker portals.
        </p>

        <h2 className="mt-10 text-xl font-semibold">Our accessibility approach</h2>
        <p className="mt-3 text-srMuted">
          We aim to work towards conformance with the <strong>Web Content Accessibility Guidelines (WCAG) 2.1</strong> at{" "}
          <strong>Level AA</strong>.
        </p>
        <p className="mt-3 text-srMuted">
          Accessibility is ongoing. If you experience any issues using our website or portal, please tell us — we use
          feedback to identify and prioritise improvements.
        </p>

        <h2 className="mt-10 text-xl font-semibold">Compatibility with browsers and assistive technology</h2>
        <p className="mt-3 text-srMuted">
          Our website and portals are designed to work with modern browsers and common assistive technologies. This
          includes (but is not limited to):
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-srMuted">
          <li>Recent versions of <strong>Chrome</strong>, <strong>Edge</strong>, <strong>Firefox</strong>, and <strong>Safari</strong></li>
          <li>Screen readers such as <strong>NVDA</strong>, <strong>JAWS</strong>, and <strong>VoiceOver</strong></li>
          <li>Mobile accessibility features on <strong>iOS</strong> and <strong>Android</strong> (for example, VoiceOver / TalkBack)</li>
          <li>Keyboard-only navigation (no mouse)</li>
        </ul>

        <h2 className="mt-10 text-xl font-semibold">Technical specifications</h2>
        <p className="mt-3 text-srMuted">
          Accessibility of our website relies on the following technologies working with your browser and any assistive
          technologies or plugins installed:
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-srMuted">
          <li>HTML</li>
          <li>CSS</li>
          <li>JavaScript</li>
          <li>WAI-ARIA (where appropriate)</li>
        </ul>

        <h2 className="mt-10 text-xl font-semibold">Known limitations and ongoing improvements</h2>
        <p className="mt-3 text-srMuted">We are actively working to improve accessibility across:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-srMuted">
          <li>Forms (labels, error messaging, and focus states)</li>
          <li>Keyboard navigation and focus visibility</li>
          <li>Colour contrast and readability</li>
          <li>Portal workflows (requests, timesheets, and onboarding steps)</li>
          <li>Uploaded content (for example, documents provided during onboarding)</li>
        </ul>
        <p className="mt-3 text-srMuted">
          If we identify accessibility barriers, we will aim to provide an alternative where reasonable.
        </p>

        <h2 className="mt-10 text-xl font-semibold">Get in touch</h2>
        <p className="mt-3 text-srMuted">
          We welcome feedback on the accessibility of our website and digital services.
        </p>
        <p className="mt-3 text-srMuted">If you encounter an accessibility issue, please include:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-srMuted">
          <li>The page address (URL)</li>
          <li>What you were trying to do</li>
          <li>Your device and browser</li>
          <li>Any assistive technology you use (if relevant)</li>
        </ul>
        <p className="mt-4 text-srMuted">
          <strong>Email:</strong> {COMPANY.email}
          <br />
          <strong>Address:</strong> {COMPANY.address}
          <br />
          <strong>WhatsApp:</strong> {COMPANY.whatsapp}
          <br />
          <strong>Contact form:</strong> /contact
        </p>

        <h3 className="mt-8 text-lg font-semibold">National Relay Service (NRS)</h3>
        <p className="mt-3 text-srMuted">
          If you are Deaf, hard of hearing, or have a speech/communication difficulty, you can contact us via the{" "}
          <strong>National Relay Service</strong> by asking the relay officer to contact us using the WhatsApp/phone
          number above.
        </p>

        <h2 className="mt-10 text-xl font-semibold">Updates to this statement</h2>
        <p className="mt-3 text-srMuted">
          This statement may be updated from time to time to reflect improvements and changes to our services.
        </p>
      <p className="mt-4 text-xs text-srMuted">
        <strong>Last updated:</strong> 25 January 2026
      </p>
    </div>
  );
}
