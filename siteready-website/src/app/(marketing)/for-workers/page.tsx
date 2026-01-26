"use client";

import React, { useMemo, useState } from "react";
import SectionWrapper from "@/components/SectionWrapper";
import SectionHeading from "@/components/SectionHeading";
import FeatureCard from "@/components/FeatureCard";
import RoleCard from "@/components/RoleCard";
import StepCard from "@/components/StepCard";
import PrimaryButton from "@/components/PrimaryButton";

type ApplicationFormState = {
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  suburb: string;
  travelRadiusKm: string;
  rightToWork: string;
  visaType: string;
  roles: string[];
  tickets: string;
  experienceYears: string;
};

const defaultFormState: ApplicationFormState = {
  firstName: "",
  lastName: "",
  mobile: "",
  email: "",
  suburb: "",
  travelRadiusKm: "",
  rightToWork: "",
  visaType: "",
  roles: [],
  tickets: "",
  experienceYears: "",
};

export default function ForWorkersPage() {
  const [formData, setFormData] = useState<ApplicationFormState>(defaultFormState);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const roleOptions = useMemo(
    () => [
      "General & skilled labouring",
      "Construction cleaning",
      "Trade assistance",
      "Ticketed roles (forklift, EWP, traffic control, etc.)",
    ],
    [],
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (value: string) => {
    setFormData((prev) => {
      const exists = prev.roles.includes(value);
      return {
        ...prev,
        roles: exists ? prev.roles.filter((v) => v !== value) : [...prev.roles, value],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await response.json();
      if (response.ok && json.success) {
        setStatus("success");
        setFormData(defaultFormState);
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error("Application submission failed:", err);
      setStatus("error");
    }
  };

  return (
    <div className="space-y-0">
      <SectionWrapper id="workers-hero">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-12">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-srMuted">
              Work with SiteReady
            </p>
            <h1 className="text-4xl font-bold leading-tight text-srPrimary md:text-5xl">
              Find steady construction work in Sydney / NSW
            </h1>
            <p className="text-lg text-srMuted">
              Weekly pay, casual roles under the right award, and access to multiple sites and
              projects via one agency. We focus on reliable shifts, safety, and clear expectations.
            </p>
            <PrimaryButton href="#workers-apply">Apply now</PrimaryButton>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-srPrimary to-srTeal p-8 text-white shadow-lg">
            <div className="flex min-h-[16rem] items-center justify-center text-center text-lg font-semibold">
              Worker portal: shifts, availability, tickets
            </div>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper id="workers-benefits">
        <SectionHeading eyebrow="What we offer workers" title="Reliable sites and weekly pay." />
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            title="Weekly pay cycle"
            description="Paid weekly on approved timesheets under the correct award with casual loading and super."
          />
          <FeatureCard
            title="Work across major projects"
            description="Sydney and Greater NSW sites, TOD precincts, and infrastructure projects."
          />
          <FeatureCard
            title="Clear expectations and safety"
            description="Inductions, PPE requirements, and WHS focus so you know what to expect before attending."
          />
        </div>
      </SectionWrapper>

      <SectionWrapper id="workers-work-types" className="bg-srBg">
        <SectionHeading title="Types of work" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <RoleCard
            title="General & skilled labouring"
            description="Keep sites moving with reliable day-to-day labour."
          />
          <RoleCard
            title="Construction cleaning"
            description="Rough, final, and safety cleans plus site amenities and access points."
          />
          <RoleCard
            title="Trade assistance"
            description="Support trades and subcontractors across busy stages."
          />
          <RoleCard
            title="Ticketed roles"
            description="Forklift, EWP, traffic control, and other tickets as required."
          />
        </div>
      </SectionWrapper>

      <SectionWrapper id="workers-requirements">
        <SectionHeading title="What we look for" />
        <ul className="list-disc space-y-2 pl-5 text-srMuted">
          <li>White card and right to work in Australia.</li>
          <li>Relevant tickets where required (traffic, EWP, dogging/rigging, etc.).</li>
          <li>Good attendance history and a safety-first mindset.</li>
          <li>Willingness to travel across Sydney / Greater Sydney for shifts.</li>
        </ul>
      </SectionWrapper>

      <SectionWrapper id="workers-process">
        <SectionHeading title="How it works" />
        <div className="grid gap-6 md:grid-cols-5">
          <StepCard
            stepNumber={1}
            title="Apply once"
            description="Tell us your details, tickets, and availability."
          />
          <StepCard
            stepNumber={2}
            title="Vetting"
            description="We check documents and references where required."
          />
          <StepCard
            stepNumber={3}
            title="Set travel & availability"
            description="Share your travel radius and the days you prefer to work."
          />
          <StepCard
            stepNumber={4}
            title="We offer shifts"
            description="We call you for shifts that match your skills and location."
          />
          <StepCard
            stepNumber={5}
            title="Weekly pay"
            description="Paid weekly on approved timesheets submitted through the portal."
          />
        </div>
      </SectionWrapper>

      <SectionWrapper id="workers-apply">
        <SectionHeading
          eyebrow="Apply now"
          title="Tell us about your experience and availability."
          subtitle="We use this information only for recruitment and placement. You’ll get an acknowledgement email once submitted."
          align="left"
        />
        <form onSubmit={handleSubmit} className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-srPrimary">
                  First name *
                </label>
                <input
                  required
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-srBorder bg-white px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-srPrimary">
                  Last name *
                </label>
                <input
                  required
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-srBorder bg-white px-3 py-2"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-srPrimary">
                  Mobile *
                </label>
                <input
                  required
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-srBorder bg-white px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-srPrimary">
                  Email *
                </label>
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-srBorder bg-white px-3 py-2"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-srPrimary">
                  Suburb
                </label>
                <input
                  name="suburb"
                  value={formData.suburb}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-srBorder bg-white px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-srPrimary">
                  Travel radius (km)
                </label>
                <input
                  name="travelRadiusKm"
                  value={formData.travelRadiusKm}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-srBorder bg-white px-3 py-2"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-srPrimary">
                  Right to work
                </label>
                <select
                  name="rightToWork"
                  value={formData.rightToWork}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-srBorder bg-white px-3 py-2"
                >
                  <option value="">Select</option>
                  <option value="Citizen">Citizen / PR</option>
                  <option value="Visa">Visa</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-srPrimary">
                  Visa type (if applicable)
                </label>
                <input
                  name="visaType"
                  value={formData.visaType}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-srBorder bg-white px-3 py-2"
                  placeholder="Only if on a visa"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-srPrimary">
                Roles you’re interested in
              </label>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {roleOptions.map((role) => (
                  <label key={role} className="flex items-center gap-2 text-sm text-srText">
                    <input
                      type="checkbox"
                      checked={formData.roles.includes(role)}
                      onChange={() => handleCheckboxChange(role)}
                      className="h-4 w-4 rounded border-srBorder"
                    />
                    <span>{role}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-srPrimary">
                Tickets held
              </label>
              <textarea
                name="tickets"
                value={formData.tickets}
                onChange={handleChange}
                rows={3}
                className="mt-1 w-full rounded-lg border border-srBorder bg-white px-3 py-2"
                placeholder="White card, traffic, forklift, EWP, dogging/rigging, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-srPrimary">
                Years of experience
              </label>
              <select
                name="experienceYears"
                value={formData.experienceYears}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-srBorder bg-white px-3 py-2"
              >
                <option value="">Select</option>
                <option value="0-1">0-1</option>
                <option value="1-3">1-3</option>
                <option value="3-5">3-5</option>
                <option value="5+">5+</option>
              </select>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <PrimaryButton type="submit">
                {status === "submitting" ? "Submitting..." : "Submit application"}
              </PrimaryButton>
            </div>
            {status === "success" && (
              <p className="text-sm font-semibold text-green-700">
                Thanks — your application is in. We’ll review and be in touch.
              </p>
            )}
            {status === "error" && (
              <p className="text-sm font-semibold text-red-600">
                Something went wrong. Please try again or call us.
              </p>
            )}
            <p className="text-xs text-srMuted">
              We use this information only for recruitment and placement. You’ll receive an
              acknowledgement email once submitted.
            </p>
          </div>
        </form>
      </SectionWrapper>
    </div>
  );
}
