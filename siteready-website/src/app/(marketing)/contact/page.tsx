"use client";

import React, { useState } from "react";
import PrimaryButton from "@/components/PrimaryButton";
import SectionHeading from "@/components/SectionHeading";
import SectionWrapper from "@/components/SectionWrapper";
import { siteConfig } from "@/config/siteConfig";
import { COMPANY } from "@/config/company";

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    whatsapp: "",
    message: "",
  });
  const [status, setStatus] = useState<Status>("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setStatus("success");
        setFormData({
          name: "",
          company: "",
          email: "",
          phone: "",
          whatsapp: "",
          message: "",
        });
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Contact submit error", error);
      setStatus("error");
    }
  };

  return (
    <SectionWrapper id="contact">
      <div className="max-w-2xl mx-auto space-y-8">
        <SectionHeading
          eyebrow="Contact"
          title="Talk to SiteReady Workforce"
          subtitle={`Request workers, discuss staffing needs, or ask about our coverage in ${siteConfig.location}.`}
          align="left"
        />
        <div className="rounded-2xl border border-srBorder bg-white shadow-sm p-6 space-y-4">
          <div className="text-sm text-srMuted space-y-1">
            <p className="font-semibold text-srPrimary">{COMPANY.legalName}</p>
            <p>ABN {COMPANY.abn}</p>
            <p>{COMPANY.address}</p>
            <p>Email: {COMPANY.email}</p>
            <p>WhatsApp: {COMPANY.whatsapp}</p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-srPrimary">Name *</label>
              <input
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="rounded-lg border border-srBorder px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-srPrimary">Company</label>
              <input
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="rounded-lg border border-srBorder px-3 py-2 text-sm"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-srPrimary">
                  Email *
                </label>
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="rounded-lg border border-srBorder px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-srPrimary">Phone</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="rounded-lg border border-srBorder px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-srPrimary">WhatsApp (optional)</label>
              <input
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                className="rounded-lg border border-srBorder px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-srPrimary">Message *</label>
              <textarea
                required
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="rounded-lg border border-srBorder px-3 py-2 text-sm min-h-[140px]"
              />
            </div>
            <div className="flex items-center gap-3">
              <PrimaryButton type="submit">
                {status === "submitting" ? "Sending..." : "Send message"}
              </PrimaryButton>
              {status === "success" && (
                <span className="text-sm text-green-700">
                  Thanks, we’ve received your message.
                </span>
              )}
              {status === "error" && (
                <span className="text-sm text-red-600">
                  Something went wrong. Please try again.
                </span>
              )}
            </div>
            <p className="mt-4 text-xs text-srMuted">
              Your message will be emailed to our internal team at {siteConfig.contact.email} and
              stored only so we can respond to your enquiry and manage potential bookings. We do
              not sell your details to third parties.
            </p>
            <div className="mt-6 rounded-xl border border-srBorder bg-srCard p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-srPrimary">Prefer WhatsApp?</p>
                  <p className="text-sm text-srMuted">
                    Scan the QR code or click to start a WhatsApp chat.
                  </p>
                  <PrimaryButton href="https://wa.me/61413291026">
                    Chat on WhatsApp
                  </PrimaryButton>
                </div>
                <img
                  src="/whatsapp-qr.png?v=2"
                  alt="SiteReady Workforce WhatsApp QR code"
                  className="h-28 w-28 rounded-lg border border-srBorder bg-white"
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </SectionWrapper>
  );
}
