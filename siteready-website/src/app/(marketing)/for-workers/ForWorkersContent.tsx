"use client";

import FeatureCard from "@/components/FeatureCard";
import PrimaryButton from "@/components/PrimaryButton";
import RoleCard from "@/components/RoleCard";
import SecondaryButton from "@/components/SecondaryButton";
import SectionHeading from "@/components/SectionHeading";
import SectionWrapper from "@/components/SectionWrapper";
import StepCard from "@/components/StepCard";
import React, { useState } from "react";

const workerSteps = [
  {
    title: "Apply online",
    description: "Tell us your experience, tickets, and where you can work.",
  },
  {
    title: "Interview & document checks",
    description: "Brief interview, right-to-work, tickets, and references.",
  },
  {
    title: "Induction & onboarding",
    description: "Safety expectations, site rules, and PPE confirmed.",
  },
  {
    title: "Allocated to site",
    description: "You’ll have supervisor contact before your first shift.",
  },
  {
    title: "Weekly pay on approved timesheets",
    description: "Timesheets approved by hosts; payroll processed weekly.",
  },
];

const roleOptions = [
  "General & skilled labouring",
  "Construction cleaning",
  "Trade assistance",
  "Ticketed roles (forklift, EWP, traffic, etc.)",
];

export default function ForWorkersContent() {
  const [applyData, setApplyData] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
    suburb: "",
    travelRadius: "",
    rightToWork: "Yes",
    visaType: "",
    roles: [] as string[],
    tickets: "",
    experienceYears: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setApplyData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleRole = (role: string) => {
    setApplyData((prev) => {
      const exists = prev.roles.includes(role);
      return {
        ...prev,
        roles: exists ? prev.roles.filter((r) => r !== role) : [...prev.roles, role],
      };
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Worker application", applyData);
    setSubmitted(true);
  };

  return (
    <>
      <SectionWrapper id="workers-hero">
        <div className="grid gap-10 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold text-srPrimary leading-tight">
              Regular construction work on good sites.
            </h1>
            <p className="text-lg text-srMuted">
              Casual work with correct award-based pay, super, and weekly payroll.
              We partner with safety-focused hosts and support you with PPE and
              inductions so you stay site-ready.
            </p>
            <div className="flex flex-wrap gap-3">
              <PrimaryButton href="#workers-apply">Apply now</PrimaryButton>
              <SecondaryButton href="/technology">Portal preview</SecondaryButton>
            </div>
          </div>
          <div className="rounded-2xl border border-srBorder bg-white shadow-sm p-6 space-y-3">
            <h3 className="text-lg font-semibold text-srPrimary">
              Weekly pay, clear comms
            </h3>
            <p className="text-sm text-srMuted">
              You’ll know your shift, contact, and site rules before you arrive.
              Payroll runs weekly based on approved timesheets.
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs text-srMuted">
              <div className="rounded-lg bg-srBg p-3">White card required</div>
              <div className="rounded-lg bg-srBg p-3">PPE support available</div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper id="workers-benefits">
        <SectionHeading title="Why work with SiteReady?" align="left" />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <FeatureCard
            title="Paid weekly and on time"
            description="Approved timesheets go to payroll weekly with clear payslips."
          />
          <FeatureCard
            title="Safety-focused host sites"
            description="We prioritise hosts with good WHS practices and clear inductions."
          />
          <FeatureCard
            title="Support to stay site-ready"
            description="Guidance on tickets, PPE, and inductions so you keep working."
          />
        </div>
      </SectionWrapper>

      <SectionWrapper id="workers-work-types">
        <SectionHeading title="Types of work" align="left" />
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {roleOptions.map((role) => (
            <RoleCard key={role} title={role} />
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper id="workers-requirements">
        <SectionHeading title="What you need to get started" align="left" />
        <ul className="mt-6 space-y-2 text-srMuted text-sm">
          <li>White card (Construction Induction)</li>
          <li>Right to work in Australia</li>
          <li>Basic PPE (boots, hi-vis, hard hat – we can assist)</li>
          <li>Bank and super details</li>
          <li>Reliable attendance &amp; communication</li>
        </ul>
      </SectionWrapper>

      <SectionWrapper id="workers-process">
        <SectionHeading title="How it works" align="left" />
        <div className="mt-8 grid gap-6 md:grid-cols-5">
          {workerSteps.map((step, index) => (
            <StepCard
              key={step.title}
              stepNumber={index + 1}
              title={step.title}
              description={step.description}
            />
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper id="workers-apply">
        <SectionHeading
          title="Apply for work"
          align="left"
          subtitle="Fill in your details and we’ll be in touch. Right to work and safety come first."
        />
        <div className="mt-8 rounded-2xl border border-srBorder bg-white shadow-sm p-6">
          {submitted ? (
            <div className="text-srPrimary font-semibold">
              Thanks – your application is in. We’ll contact you soon.
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-srPrimary">
                    First name *
                  </label>
                  <input
                    required
                    name="firstName"
                    value={applyData.firstName}
                    onChange={handleChange}
                    className="rounded-lg border border-srBorder px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-srPrimary">
                    Last name *
                  </label>
                  <input
                    required
                    name="lastName"
                    value={applyData.lastName}
                    onChange={handleChange}
                    className="rounded-lg border border-srBorder px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-srPrimary">
                    Mobile *
                  </label>
                  <input
                    required
                    name="mobile"
                    value={applyData.mobile}
                    onChange={handleChange}
                    className="rounded-lg border border-srBorder px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-srPrimary">
                    Email *
                  </label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={applyData.email}
                    onChange={handleChange}
                    className="rounded-lg border border-srBorder px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-srPrimary">
                    Suburb
                  </label>
                  <input
                    name="suburb"
                    value={applyData.suburb}
                    onChange={handleChange}
                    className="rounded-lg border border-srBorder px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-srPrimary">
                    Travel radius (km)
                  </label>
                  <input
                    name="travelRadius"
                    value={applyData.travelRadius}
                    onChange={handleChange}
                    className="rounded-lg border border-srBorder px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-srPrimary">
                    Right to work in Australia?
                  </label>
                  <select
                    name="rightToWork"
                    value={applyData.rightToWork}
                    onChange={handleChange}
                    className="rounded-lg border border-srBorder px-3 py-2 text-sm"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                {applyData.rightToWork === "No" ? (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-srPrimary">
                      Visa type
                    </label>
                    <input
                      name="visaType"
                      value={applyData.visaType}
                      onChange={handleChange}
                      className="rounded-lg border border-srBorder px-3 py-2 text-sm"
                    />
                  </div>
                ) : null}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-srPrimary">
                  Roles interested in
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  {roleOptions.map((role) => (
                    <label
                      key={role}
                      className="flex items-start gap-2 text-sm text-srMuted"
                    >
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={applyData.roles.includes(role)}
                        onChange={() => toggleRole(role)}
                      />
                      <span>{role}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-srPrimary">
                  Tickets held (forklift, EWP, traffic, etc.)
                </label>
                <textarea
                  name="tickets"
                  value={applyData.tickets}
                  onChange={handleChange}
                  className="rounded-lg border border-srBorder px-3 py-2 text-sm min-h-[100px]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-srPrimary">
                  Years of experience
                </label>
                <select
                  name="experienceYears"
                  value={applyData.experienceYears}
                  onChange={handleChange}
                  className="rounded-lg border border-srBorder px-3 py-2 text-sm"
                >
                  <option value="">Select</option>
                  <option value="0-1">0-1</option>
                  <option value="1-3">1-3</option>
                  <option value="3-5">3-5</option>
                  <option value="5+">5+</option>
                </select>
              </div>

              <PrimaryButton type="submit">Submit application</PrimaryButton>
            </form>
          )}
        </div>
      </SectionWrapper>
    </>
  );
}
