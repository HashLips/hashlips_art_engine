"use client";

import React from "react";
import styles from "@/components/booking/BookLabourNowForm.module.css";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import Card from "@/components/shared/Card";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  whatsapp: string;
};

const emptyState: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  mobile: "",
  whatsapp: "",
};

const ClientSignupToBookLabourCard: React.FC = () => {
  const [form, setForm] = React.useState<FormState>(emptyState);
  const [status, setStatus] = React.useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = React.useState("");

  const onChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/client-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          mobile: form.mobile.trim(),
          whatsapp: form.whatsapp.trim() || undefined,
        }),
      });
      if (!res.ok) {
        setStatus("error");
        setMessage("Unable to send onboarding email. Please try again.");
        return;
      }
      setStatus("sent");
      setMessage(
        "Check your email — your onboarding link will let you create your login (Google, Apple, or email + password) and complete setup in the client portal.\n\nSometimes the email will go into your junk email. If you do not see it in your main inbox, the email will be from info@sitereadyworkforce.com.",
      );
      setForm(emptyState);
    } catch {
      setStatus("error");
      setMessage("Unable to send onboarding email. Please try again.");
    }
  };

  return (
    <Card className="shadow-lg">
      <div className="space-y-4">
        <div>
          <h3 className="text-2xl font-semibold text-srPrimary">Sign up to book labour</h3>
          <p className="text-sm text-srMuted">
            Simply fill in the sign up form below. An email for onboarding will be sent to you to start the process.
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className={styles.field}>
              <label className={styles.label}>First name *</label>
              <input
                className={styles.input}
                value={form.firstName}
                onChange={(e) => onChange("firstName", e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Last name *</label>
              <input
                className={styles.input}
                value={form.lastName}
                onChange={(e) => onChange("lastName", e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className={styles.field}>
              <label className={styles.label}>Email *</label>
              <input
                className={styles.input}
                type="email"
                value={form.email}
                onChange={(e) => onChange("email", e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Mobile *</label>
              <input
                className={styles.input}
                value={form.mobile}
                onChange={(e) => onChange("mobile", e.target.value)}
                required
              />
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>WhatsApp (optional)</label>
            <input
              className={styles.input}
              value={form.whatsapp}
              onChange={(e) => onChange("whatsapp", e.target.value)}
            />
          </div>
          {message ? (
            <div className={status === "sent" ? styles.hint : styles.errorSummary}>
              {message.split("\n").map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          ) : null}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <PrimaryButton type="submit">
              {status === "sending" ? "Sending..." : "Send onboarding email"}
            </PrimaryButton>
            <SecondaryButton href="/login">Already have an account? Log in</SecondaryButton>
          </div>
        </form>
      </div>
    </Card>
  );
};

export default ClientSignupToBookLabourCard;
