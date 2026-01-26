import React from "react";
import SectionWrapper from "@/components/SectionWrapper";
import SectionHeading from "@/components/SectionHeading";
import FeatureCard from "@/components/FeatureCard";

export default function TechnologyPage() {
  return (
    <div className="space-y-0">
      <SectionWrapper id="tech-hero">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-12">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-srMuted">
              Operations + technology
            </p>
            <h1 className="text-4xl font-bold leading-tight text-srPrimary md:text-5xl">
              Our labour & cleaning portal
            </h1>
            <p className="text-lg text-srMuted">
              Clients, workers, and internal teams share one system for bookings, timesheets,
              approvals, and reporting. Less back-and-forth, faster approvals, clearer invoicing.
            </p>
          </div>
          <div className="rounded-2xl border border-srBorder bg-white p-6 shadow">
            <div className="grid grid-cols-3 gap-4 text-center text-sm font-semibold text-srPrimary">
              <div className="rounded-lg bg-srBg p-4">Bookings</div>
              <div className="rounded-lg bg-srBg p-4">Workers</div>
              <div className="rounded-lg bg-srBg p-4">Timesheets</div>
            </div>
            <div className="mt-6 space-y-3 text-srMuted">
              <div className="rounded-lg bg-srBg p-3">Booking #1402 • Awaiting approval</div>
              <div className="rounded-lg bg-srBg p-3">Worker: J. Smith • Inductions complete</div>
              <div className="rounded-lg bg-srBg p-3">
                Timesheet: Site B • Approved, queued for invoicing
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper id="tech-client-portal">
        <SectionHeading eyebrow="Client portal" title="Self-serve and approvals for site teams." />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3 text-srMuted">
            <ul className="list-disc space-y-2 pl-5">
              <li>Create and manage bookings for labour and cleaning.</li>
              <li>View worker profiles, tickets, and readiness.</li>
              <li>Approve timesheets, raise disputes, and add notes.</li>
              <li>Download basic labour reports (hours by site, role, and date).</li>
            </ul>
          </div>
          <div className="rounded-xl border border-srBorder bg-white p-6 shadow">
            <p className="mb-3 text-sm font-semibold text-srPrimary">Bookings list</p>
            <div className="space-y-2 text-sm text-srMuted">
              <div className="rounded-lg bg-srBg p-3">Site A • 3 labourers • Awaiting approval</div>
              <div className="rounded-lg bg-srBg p-3">Site B • Cleaning crew • In progress</div>
              <div className="rounded-lg bg-srBg p-3">Site C • TA + TC • Approved</div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper id="tech-worker-portal" className="bg-srBg">
        <SectionHeading eyebrow="Worker portal" title="Shifts, tickets, and availability." />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3 text-srMuted">
            <ul className="list-disc space-y-2 pl-5">
              <li>Update tickets, licences, and availability.</li>
              <li>See upcoming shifts and site details.</li>
              <li>See timesheets submitted and approval status.</li>
              <li>Sign contracts and policies online.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-srBorder bg-white p-6 shadow">
            <p className="mb-3 text-sm font-semibold text-srPrimary">Upcoming shifts</p>
            <div className="space-y-2 text-sm text-srMuted">
              <div className="rounded-lg bg-srBg p-3">Mon • Site A • 7:00–15:00 • TA</div>
              <div className="rounded-lg bg-srBg p-3">Tue • Site B • 6:30–14:30 • Cleaner</div>
              <div className="rounded-lg bg-srBg p-3">Wed • Site C • 7:00–15:30 • Labourer</div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper id="tech-internal-portal">
        <SectionHeading
          eyebrow="Internal portal"
          title="Dispatch, compliance, and WHS in one view."
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            title="Onboarding pipeline"
            description="Document checks and expiry alerts keep workers compliant."
          />
          <FeatureCard
            title="Dispatch board"
            description="Who is on which site, with cover plans for no-shows."
          />
          <FeatureCard
            title="Incident & WHS logs"
            description="Incidents recorded with follow-ups tracked."
          />
          <FeatureCard
            title="KPIs & reporting"
            description="Fill rate, time-to-fill, no-show %, DSO, and margin proxy."
          />
        </div>
      </SectionWrapper>

      <SectionWrapper id="tech-roadmap" className="bg-srBg">
        <SectionHeading title="Roadmap" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            title="MVP (now)"
            description="Profiles, bookings, timesheets, approvals, and Xero-friendly invoicing data."
          />
          <FeatureCard
            title="Next"
            description="Richer reporting, feedback scores, and worker reliability metrics."
          />
          <FeatureCard
            title="Later"
            description="Optional GPS/location features with proper consent and notice, aligned to NSW Workplace Surveillance requirements."
          />
          <FeatureCard
            title="Ongoing"
            description="Continuous improvements to scheduling, dispute handling, and dashboards."
          />
        </div>
      </SectionWrapper>
    </div>
  );
}
