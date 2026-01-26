import SectionWrapper from "@/components/SectionWrapper";
import SectionHeading from "@/components/SectionHeading";
import FeatureCard from "@/components/FeatureCard";
import RoleCard from "@/components/RoleCard";
import StepCard from "@/components/StepCard";
import ClientSignupToBookLabourCard from "@/components/ClientSignupToBookLabourCard";
import Link from "next/link";

export const metadata = {
  title: "Construction Labour Hire – Sydney / NSW | SiteReady Workforce",
  description:
    "Vetted construction labour and cleaning crews across Sydney & NSW. Clear compliance, reliable attendance, and portal-backed timesheets and invoicing.",
};

export default function LabourHirePage() {
  return (
    <div className="space-y-0">
      <SectionWrapper id="labour-hero">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-12">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-srMuted">Labour hire – Sydney / NSW</p>
            <h1 className="text-4xl font-bold leading-tight text-srPrimary md:text-5xl">
              Construction labour hire – Sydney / NSW
            </h1>
            <p className="text-lg text-srMuted">
              Reliable, vetted labour with award-compliant pay, 12% super on OTE, and WHS built in. Timesheets and
              approvals run through the portal so you spend less time chasing paperwork.
            </p>
            <p className="text-sm text-srMuted">
              Already have an account?{" "}
              <Link href="/login?next=/dashboard/requests" className="text-srPrimary underline">
                Log in
              </Link>
              .
            </p>
          </div>
          <ClientSignupToBookLabourCard />
        </div>
      </SectionWrapper>

      <SectionWrapper id="labour-why-siteready">
        <SectionHeading eyebrow="Why hosts use us" title="Vetted people, clear compliance, less admin." />
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            title="Vetted, ticketed workers who show up ready"
            description="Reliability tracking, feedback, and bench cover to backfill no-shows fast."
          />
          <FeatureCard
            title="Award & WHS compliance baked in"
            description="Correct award classification, casual loading, 12% super on OTE, workers comp, and payroll tax where applicable."
          />
          <FeatureCard
            title="Admin handled"
            description="Portal-based timesheets, approvals, invoicing, and reporting so site teams stay focused on delivery."
          />
        </div>
      </SectionWrapper>

      <SectionWrapper id="labour-roles">
        <SectionHeading eyebrow="Roles we supply" title="Labour, cleaning, and site support across Sydney and NSW." />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <RoleCard title="General & skilled labourers" description="Site-ready labour for day-to-day support and project pushes." />
          <RoleCard
            title="Ticketed workers"
            description="Doggers, riggers, plant operators, and traffic control (TC/TMI) as required."
          />
          <RoleCard
            title="Construction cleaning crews"
            description="Rough, final, safety, and specialised cleans; toilets, offices, truck entry/exit."
          />
          <RoleCard title="Trade assistants" description="Support for trades and subcontractors to keep tasks moving." />
          <RoleCard
            title="Leading hands / site supervisors"
            description="Working supervisors for smaller crews where on-the-ground oversight matters."
          />
          <RoleCard title="On-request roles" description="If you need something else, we'll source and vet for the right tickets." />
        </div>
        <p className="mt-4 text-sm text-srMuted">Sample roles only – we can source additional tickets or skills on request.</p>
      </SectionWrapper>

      <SectionWrapper id="labour-process" className="bg-srBg">
        <SectionHeading title="How bookings work" />
        <div className="grid gap-6 md:grid-cols-4">
          <StepCard stepNumber={1} title="Submit request" description="Online form with site details, roles, and shift expectations." />
          <StepCard stepNumber={2} title="Confirm scope & WHS" description="We align on tickets, PPE, inductions, and site protocols." />
          <StepCard stepNumber={3} title="Allocate vetted workers" description="We dispatch via the portal and track reliability and attendance." />
          <StepCard stepNumber={4} title="Approve & invoice" description="You approve timesheets; we invoice in arrears in Xero-friendly format." />
        </div>
      </SectionWrapper>

      <SectionWrapper id="labour-after-signup">
        <SectionHeading title="What happens after you sign up" />
        <ul className="list-disc space-y-2 pl-6 text-srMuted">
          <li>Create your login (Google, Apple, or email + password)</li>
          <li>Complete setup in the client portal</li>
          <li>Submit requests + track workers and timesheets</li>
        </ul>
      </SectionWrapper>

      <SectionWrapper id="labour-compliance">
        <SectionHeading title="Compliance & insurance" />
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            title="Correct award and pay"
            description="Casual employees paid under the right award, with casual loading and super at 12% on OTE."
          />
          <FeatureCard
            title="Insurance ready"
            description="Workers compensation, public liability, and professional indemnity in place for host onboarding."
          />
          <FeatureCard
            title="Payroll tax where applicable"
            description="Payroll tax managed when thresholds are met; clear recordkeeping for audit trails."
          />
        </div>
      </SectionWrapper>

    </div>
  );
}
