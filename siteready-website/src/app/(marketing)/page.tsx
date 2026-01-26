import React from "react";
import SectionWrapper from "@/components/SectionWrapper";
import SectionHeading from "@/components/SectionHeading";
import FeatureCard from "@/components/FeatureCard";
import StepCard from "@/components/StepCard";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";

export default function HomePage() {
  return (
    <div className="space-y-0">
      <SectionWrapper id="home-hero">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-12">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-srMuted">
              Sydney & Greater NSW
            </p>
            <h1 className="text-4xl font-bold leading-tight text-srPrimary md:text-5xl">
              Construction labour & cleaning, without the chaos
            </h1>
            <p className="text-lg text-srMuted">
              Vetted labourers, ticketed workers, and construction cleaning crews with
              compliance packs ready. We combine operations and a simple portal to cut
              no-shows, reduce admin on timesheets and approvals, and keep invoicing clean
              for builders and site teams.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <PrimaryButton href="/labour-hire">Book labour</PrimaryButton>
              <SecondaryButton href="/for-workers">Find site work</SecondaryButton>
            </div>
            <p className="text-sm text-srMuted">
              Launching Feb 2026 - Serving Sydney & NSW
            </p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-srPrimary to-srTeal p-8 text-white shadow-lg">
            <div className="flex min-h-[16rem] items-center justify-center text-center text-lg font-semibold">
              Portal dashboard mockup
            </div>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper id="home-problems">
        <SectionHeading eyebrow="Problems we solve" title="Less risk, less admin, better shifts." />
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            title="No-shows & quality issues"
            description="Bench coverage and fast replacements, with feedback and reliability scoring on every worker."
          />
          <FeatureCard
            title="Compliance uncertainty"
            description="Correct awards, casual loading, 12% super, workers comp, payroll tax where applicable, and WHS documentation ready."
          />
          <FeatureCard
            title="Timesheet & dispute friction"
            description="Portal-driven timesheets, approvals, and Xero-friendly invoicing data to reduce back-and-forth."
          />
        </div>
      </SectionWrapper>

      <SectionWrapper id="home-services">
        <SectionHeading eyebrow="What we supply" title="Labour, cleaning, and site support." />
        <div className="grid gap-6 md:grid-cols-2">
          <FeatureCard
            title="General & ticketed labour"
            description="General labourers, skilled labourers, trade assistants, and plant/ticketed operators as required."
          />
          <FeatureCard
            title="Construction cleaning crews"
            description="Rough, final, safety and specialised cleans plus site offices, toilets, and truck entry/exit points."
          />
          <FeatureCard
            title="Supervisors & leading hands"
            description="Site support for small crews where a working supervisor or leading hand keeps shifts moving."
          />
          <FeatureCard
            title="On-request roles"
            description="If you need a role not listed, we'll source and vet for that ticket or skill set."
          />
        </div>
      </SectionWrapper>

      <SectionWrapper id="home-how-it-works">
        <SectionHeading title="How it works" />
        <div className="grid gap-6 md:grid-cols-3">
          <StepCard
            stepNumber={1}
            title="Brief us"
            description="Share site details, roles, tickets, start dates, and shift expectations."
          />
          <StepCard
            stepNumber={2}
            title="We fill shifts"
            description="We allocate vetted workers, track timesheets, and manage replacements as needed."
          />
          <StepCard
            stepNumber={3}
            title="You approve & we invoice"
            description="You approve timesheets; we invoice in Xero-friendly format with clear backup."
          />
        </div>
      </SectionWrapper>

      <SectionWrapper id="home-tech" className="bg-srBg">
        <SectionHeading title="Tech and reporting built in" />
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <div className="space-y-4 text-srMuted">
            <p>
              Client portal for bookings, worker profiles, and timesheet approvals. Worker
              portal for shifts and availability. Internal dispatch/compliance portal to keep
              WHS, incidents, and reporting tidy.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Bookings, timesheets, approvals, and invoicing data in one place.</li>
              <li>Incident logging and basic dashboards for hours by site and role.</li>
              <li>Roadmap: scheduling, feedback, reliability metrics, optional GPS with consent.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-srBorder bg-white p-6 shadow">
            <div className="grid grid-cols-3 gap-4 text-center text-sm font-semibold text-srPrimary">
              <div className="rounded-lg bg-srBg p-4">Bookings</div>
              <div className="rounded-lg bg-srBg p-4">Workers</div>
              <div className="rounded-lg bg-srBg p-4">Timesheets</div>
            </div>
            <div className="mt-6 space-y-3 text-srMuted">
              <div className="rounded-lg bg-srBg p-3">Booking #1023 - Confirmed</div>
              <div className="rounded-lg bg-srBg p-3">Worker: A. Lee - On shift</div>
              <div className="rounded-lg bg-srBg p-3">
                Timesheet: Site A - Awaiting approval
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper id="home-who-for">
        <SectionHeading
          eyebrow="Who we're for"
          title="Builders, subcontractors, and project teams across Sydney and NSW."
        />
        <p className="max-w-3xl text-srMuted">
          We support metro projects, TOD precincts, and infrastructure sites with reliable labour,
          cleaning crews, and a compliance-first approach. Shifts are tracked in the portal, you
          approve quickly, and we handle billing in arrears with disciplined cash management.
        </p>
      </SectionWrapper>
    </div>
  );
}



