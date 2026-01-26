import React from "react";
import SectionWrapper from "@/components/SectionWrapper";
import SectionHeading from "@/components/SectionHeading";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import FeatureCard from "@/components/FeatureCard";
import { siteConfig } from "@/config/siteConfig";

export default function SafetyCompliancePage() {
  return (
    <div className="space-y-0">
      <SectionWrapper id="safety-hero">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-12">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-srMuted">
              Sydney & Greater NSW
            </p>
            <h1 className="text-4xl font-bold leading-tight text-srPrimary md:text-5xl">
              Safety & Compliance
            </h1>
            <p className="text-lg text-srMuted">
              We are a Sydney/NSW labour hire and construction cleaning provider with a
              compliance-first approach. Employment, WHS, and insurance are core to how we
              supply labour, not an afterthought.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <PrimaryButton href="/labour-hire">Book labour</PrimaryButton>
              <SecondaryButton href="/for-workers">For workers</SecondaryButton>
            </div>
          </div>
          <div className="rounded-2xl border border-srBorder bg-white p-6 shadow">
            <div className="space-y-4 text-sm text-srMuted">
              <p className="text-base font-semibold text-srPrimary">
                Compliance, WHS, and insurance backed by our portal
              </p>
              <p>
                Client portal shows worker tickets and approvals; worker portal keeps documents
                current; internal portal tracks onboarding, expiries, and incidents.
              </p>
              <p className="text-xs text-srMuted">
                {siteConfig.companyName} • Serving {siteConfig.location}
              </p>
            </div>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper id="employment-model">
        <SectionHeading
          eyebrow="Employment model"
          title="Casual employment under the right award"
          align="left"
        />
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            title="Correct award coverage"
            description="Building and Construction General On-site Award for on-site work; Cleaning Services Award for cleaning; other awards as needed."
          />
          <FeatureCard
            title="Casual loading + super"
            description="Casual loading built into rates, 12% superannuation on ordinary time earnings, workers' comp in place."
          />
          <FeatureCard
            title="Statutory obligations"
            description="Payroll tax once the NSW threshold is exceeded; contract cleaning portable LSL levy (1.0%) where applicable."
          />
        </div>
      </SectionWrapper>

      <SectionWrapper id="whs">
        <SectionHeading
          eyebrow="WHS duties"
          title="Shared WHS duties with host employers"
          align="left"
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3 text-srMuted">
            <p>
              WHS obligations cannot be contracted out. Labour hire and hosts work together on
              site safety, and we coordinate to keep evidence and communication clear.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Induction evidence and ticket checks (white card, high-risk tickets).</li>
              <li>Toolbox talks, SWMS awareness, and site rules alignment.</li>
              <li>Incident reporting and review flow with follow-ups tracked.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-srBorder bg-white p-6 shadow">
            <p className="text-sm font-semibold text-srPrimary">WHS coordination snapshot</p>
            <div className="mt-3 space-y-2 text-sm text-srMuted">
              <div className="rounded-lg bg-srBg p-3">Induction status: Verified</div>
              <div className="rounded-lg bg-srBg p-3">SWMS acknowledgment: Recorded</div>
              <div className="rounded-lg bg-srBg p-3">Incident log: No open items</div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper id="recruitment-vetting" className="bg-srBg">
        <SectionHeading
          eyebrow="Site readiness"
          title="Recruitment, vetting, and site readiness"
          align="left"
        />
        <div className="grid gap-6 md:grid-cols-4">
          <FeatureCard
            title="Right-to-work & ID"
            description="Identity and work rights checked before allocation."
          />
          <FeatureCard
            title="Tickets verified"
            description="Licences and tickets validated; expiry tracking in the portal."
          />
          <FeatureCard
            title="PPE readiness"
            description="Workers attend with required PPE and understand site rules."
          />
          <FeatureCard
            title="References as needed"
            description="Reference checks for higher-risk roles or leading hands."
          />
        </div>
        <p className="mt-4 text-sm text-srMuted">
          This reduces safety and performance risk for hosts and workers by sending people who
          are verified and site-ready.
        </p>
      </SectionWrapper>

      <SectionWrapper id="operations-payroll">
        <SectionHeading
          eyebrow="Operations"
          title="Timesheets, payroll, and billing discipline"
          align="left"
        />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3 text-srMuted">
            <p>
              Weekly digital timesheets, approved by clients, feed payroll. Payroll is run weekly
              with award compliance and STP/Xero integration. Billing is monthly in arrears with
              clear payment terms and stop-work protections for non-payment.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Timesheets → approvals → payroll weekly.</li>
              <li>Award classification controls and QA to avoid underpayment risk.</li>
              <li>Collections discipline to manage debtor delay and insolvency risk.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-srBorder bg-white p-6 shadow">
            <div className="space-y-3 text-sm text-srMuted">
              <div className="flex items-center justify-between">
                <span>Timesheet approvals</span>
                <span className="rounded-full bg-srTeal/10 px-3 py-1 text-srTeal text-xs font-semibold">
                  Weekly
                </span>
              </div>
              <div className="rounded-lg bg-srBg p-3">Payroll run: Scheduled weekly</div>
              <div className="rounded-lg bg-srBg p-3">Invoicing: Monthly in arrears</div>
              <div className="rounded-lg bg-srBg p-3">Collections: Structured follow-up</div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper id="insurance">
        <SectionHeading eyebrow="Insurance" title="Insurance cover that supports hosts" align="left" />
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            title="Workers' compensation (NSW)"
            description="Cover for employees while on host sites."
          />
          <FeatureCard
            title="Public & Products Liability"
            description="Including worker-to-worker where available to protect host exposures."
          />
          <FeatureCard
            title="Professional Indemnity"
            description="For advisory and coordination exposures in labour hire and cleaning."
          />
          <FeatureCard
            title="Management & cyber (recommended)"
            description="Management liability/D&O and cyber insurance to support portal usage and personal data handling."
          />
        </div>
      </SectionWrapper>

      <SectionWrapper id="technology">
        <SectionHeading title="Portal support for compliance" />
        <div className="grid gap-6 lg:grid-cols-3">
          <FeatureCard
            title="Client portal"
            description="Worker profiles and tickets, timesheets, approvals, and basic WHS notes for audit trail."
          />
          <FeatureCard
            title="Worker portal"
            description="Upload and refresh tickets and documents, accept policies, keep availability current."
          />
          <FeatureCard
            title="Internal portal"
            description="Onboarding pipeline, document expiry alerts, incident records, and allocation controls."
          />
        </div>
        <p className="mt-4 text-sm text-srMuted">
          Any future location or GPS features would be optional and rolled out only with explicit
          worker consent and notices that align to NSW Workplace Surveillance requirements.
        </p>
      </SectionWrapper>

      <SectionWrapper id="risks">
        <SectionHeading title="Key risks we actively manage" />
        <div className="grid gap-6 md:grid-cols-4">
          <FeatureCard
            title="Debtor risk"
            description="Credit checks, limits, clear terms, and stop-work clauses to manage non-payment."
          />
          <FeatureCard
            title="Award risk"
            description="Classification controls, payroll QA, and periodic audits to avoid underpayment."
          />
          <FeatureCard
            title="WHS risk"
            description="Joint planning, induction evidence, and incident response procedures with hosts."
          />
          <FeatureCard
            title="Workforce reliability"
            description="Performance tracking, feedback loops, bonuses, and a bench pool for back-up."
          />
        </div>
      </SectionWrapper>
    </div>
  );
}
