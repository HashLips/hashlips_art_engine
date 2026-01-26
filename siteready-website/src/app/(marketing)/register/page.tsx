"use client";

import React, { useEffect, useState } from "react";
import styles from "@/components/booking/BookLabourNowForm.module.css";

const GoogleMark: React.FC = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.02 1.53 7.41 2.82l5.08-4.88C33.38 4.57 29.06 2.5 24 2.5 14.8 2.5 6.93 7.76 3.11 15.41l6.19 4.81C11.13 14.03 17.12 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.5 24.5c0-1.57-.14-2.73-.45-3.93H24v7.42h12.78c-.26 2.06-1.66 5.16-4.78 7.24l-.04.27 6.04 4.68.42.04c3.86-3.56 6.08-8.8 6.08-15.72z" />
    <path fill="#FBBC05" d="M9.3 28.22c-.46-1.39-.73-2.87-.73-4.42s.27-3.03.72-4.42l-.03-.29-6.22-4.89-.2.1C1.74 17.09 1.5 20.02 1.5 23.8c0 3.78.24 6.7 1.34 9.5l6.46-5.08z" />
    <path fill="#34A853" d="M24 45.5c6.06 0 11.14-2 14.85-5.45l-6.5-5.04c-1.74 1.2-4.08 2.04-8.35 2.04-6.88 0-12.87-4.53-14.69-10.72l-.26.02-6.2 4.84-.09.25C6.57 39.24 14.8 45.5 24 45.5z" />
  </svg>
);

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"client" | "worker">("client");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [next, setNext] = useState("");
  const [onboardingToken, setOnboardingToken] = useState<string | null>(null);
  const [onboardingReady, setOnboardingReady] = useState(false);
  const clientNext = onboardingToken ? "/onboarding/complete" : next || "/dashboard/requests";
  const workerNext = next && next !== "/dashboard" ? next : "/dashboard/worker";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const n = params.get("next");
    if (n) setNext(n);
    const onboarding = params.get("onboarding");
    if (onboarding) {
      setOnboardingToken(onboarding);
      setRole("client");
    }
  }, []);

  useEffect(() => {
    if (!onboardingToken) {
      setOnboardingReady(true);
      return;
    }
    const init = async () => {
      try {
        const res = await fetch("/api/onboarding/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: onboardingToken }),
        });
        if (!res.ok) {
          setError("Onboarding link is invalid or expired.");
          return;
        }
        setOnboardingReady(true);
      } catch {
        setError("Onboarding link is invalid or expired.");
      }
    };
    init();
  }, [onboardingToken]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, role }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.detail || data?.error || "Registration failed. Please try again.");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div className={styles.form} style={{ maxWidth: 520, margin: "3rem auto" }}>
      <div className={styles.formHeader}>
        <h2>Create account</h2>
        <p>Set up a client or worker account to get started.</p>
      </div>
      <div className="space-y-3 mb-4">
        <a
          className="w-full rounded-full border border-srBorder bg-white px-4 py-2 text-sm font-medium text-srPrimary hover:border-srPrimary transition flex items-center justify-center gap-2"
          href={`/api/auth/oauth/google/start?next=${encodeURIComponent(clientNext)}&role=client`}
        >
          <GoogleMark />
          Continue with Google (Client)
        </a>
        {!onboardingToken ? (
          <a
            className="w-full rounded-full border border-srBorder bg-white px-4 py-2 text-sm font-medium text-srPrimary hover:border-srPrimary transition flex items-center justify-center gap-2"
            href={`/api/auth/oauth/google/start?next=${encodeURIComponent(workerNext)}&role=worker`}
          >
            <GoogleMark />
            Continue with Google (Worker)
          </a>
        ) : null}
        {onboardingToken ? (
          <a
            className="w-full rounded-full border border-srBorder bg-white px-4 py-2 text-sm font-medium text-srPrimary hover:border-srPrimary transition flex items-center justify-center gap-2"
            href={`/api/auth/oauth/apple/start?next=${encodeURIComponent(clientNext)}&role=client`}
          >
            Continue with Apple (Client)
          </a>
        ) : null}
      </div>
      {success && (
        <div className={styles.section}>
          <div className={styles.errorSummary} style={{ background: "#ecfdf3", borderColor: "#86efac", color: "#166534" }}>
            Account created successfully.
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.pillButton}
              onClick={() => {
                const dest = onboardingToken
                  ? "/onboarding/complete"
                  : role === "worker"
                    ? "/dashboard/worker"
                    : next || "/dashboard/requests";
                window.location.assign(dest);
              }}
            >
              Click here to go to your dashboard
            </button>
          </div>
        </div>
      )}
      <form onSubmit={onSubmit} className={styles.section}>
        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <input
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Password</label>
          <input
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
          />
        </div>
        {!onboardingToken ? (
          <div className={styles.field}>
            <label className={styles.label}>Role</label>
            <select className={styles.select} value={role} onChange={(e) => setRole(e.target.value as "client" | "worker")}>
              <option value="client">Client</option>
              <option value="worker">Worker</option>
            </select>
          </div>
        ) : null}
        {error && <div className={styles.errorSummary}>{error}</div>}
        <div className={styles.actions}>
          <button type="submit" className={styles.pillButton} disabled={success || !onboardingReady}>
            Create account
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;

