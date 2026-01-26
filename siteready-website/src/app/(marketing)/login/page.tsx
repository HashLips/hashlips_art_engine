"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/components/booking/BookLabourNowForm.module.css";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [next, setNext] = useState("/dashboard");
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const n = params.get("next");
    if (n) {
      setNext(n);
    }
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        setError("Login failed. Please try again.");
        return;
      }
      if (typeof window !== "undefined") {
        window.location.assign(next);
        return;
      }
      router.push(next);
    } catch {
      setError("Login failed. Please try again.");
    }
  };

  return (
    <div className={styles.form} style={{ maxWidth: 520, margin: "3rem auto" }}>
      <div className={styles.formHeader}>
        <h2>Login</h2>
        <p>
          Use Google/Apple SSO, or if you prefer another email provider, sign in below with email and password.
          If you don’t have an account yet, create one with any email.
        </p>
      </div>

      <div className="space-y-3 mb-4">
        <PrimarySSOButtons next={next} />
      </div>

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
        <div className="mt-2 text-sm">
          <a className="text-srPrimary hover:text-srAccent" href="/forgot-password">
            Forgot password?
          </a>
        </div>
        {error && <div className={styles.errorSummary}>{error}</div>}
        <div className={styles.actions}>
          <button type="submit" className={styles.pillButton}>
            Continue
          </button>
        </div>
        <div className="mt-3 text-sm">
          <a className="text-srPrimary hover:text-srAccent" href={`/register?next=${encodeURIComponent(next)}`}>
            Create an account
          </a>
        </div>
      </form>
    </div>
  );
};

const GoogleMark: React.FC = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.02 1.53 7.41 2.82l5.08-4.88C33.38 4.57 29.06 2.5 24 2.5 14.8 2.5 6.93 7.76 3.11 15.41l6.19 4.81C11.13 14.03 17.12 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.5 24.5c0-1.57-.14-2.73-.45-3.93H24v7.42h12.78c-.26 2.06-1.66 5.16-4.78 7.24l-.04.27 6.04 4.68.42.04c3.86-3.56 6.08-8.8 6.08-15.72z" />
    <path fill="#FBBC05" d="M9.3 28.22c-.46-1.39-.73-2.87-.73-4.42s.27-3.03.72-4.42l-.03-.29-6.22-4.89-.2.1C1.74 17.09 1.5 20.02 1.5 23.8c0 3.78.24 6.7 1.34 9.5l6.46-5.08z" />
    <path fill="#34A853" d="M24 45.5c6.06 0 11.14-2 14.85-5.45l-6.5-5.04c-1.74 1.2-4.08 2.04-8.35 2.04-6.88 0-12.87-4.53-14.69-10.72l-.26.02-6.2 4.84-.09.25C6.57 39.24 14.8 45.5 24 45.5z" />
  </svg>
);

const PrimarySSOButtons: React.FC<{ next: string }> = ({ next }) => {
  const base = "/api/auth/oauth";
  const clientNext = encodeURIComponent(next || "/dashboard/requests");
  const workerNext = encodeURIComponent(next && next !== "/dashboard" ? next : "/dashboard/worker");
  return (
    <div className="flex flex-col gap-2">
      <a
        className="w-full rounded-full border border-srBorder bg-white px-4 py-2 text-sm font-medium text-srPrimary hover:border-srPrimary transition flex items-center justify-center gap-2"
        href={`${base}/google/start?next=${clientNext}&role=client`}
      >
        <GoogleMark />
        Continue with Google (Client)
      </a>
      <a
        className="w-full rounded-full border border-srBorder bg-white px-4 py-2 text-sm font-medium text-srPrimary hover:border-srPrimary transition flex items-center justify-center gap-2"
        href={`${base}/google/start?next=${workerNext}&role=worker`}
      >
        <GoogleMark />
        Continue with Google (Worker)
      </a>
      <a
        className="w-full rounded-full border border-srBorder bg-white px-4 py-2 text-sm font-medium text-srPrimary hover:border-srPrimary transition"
        href={`${base}/apple/start?next=${clientNext}`}
      >
        Continue with Apple
      </a>
    </div>
  );
};

export default LoginPage;
