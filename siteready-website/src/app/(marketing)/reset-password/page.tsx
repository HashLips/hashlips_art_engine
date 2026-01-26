"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import styles from "@/components/booking/BookLabourNowForm.module.css";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className={styles.form} style={{ maxWidth: 520, margin: "3rem auto" }}>Loading…</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!token) {
      setError("Reset link is missing or invalid.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      setError(json?.error || "Unable to reset password.");
      return;
    }
    setMessage("Password reset. You can now sign in.");
  };

  return (
    <div className={styles.form} style={{ maxWidth: 520, margin: "3rem auto" }}>
      <div className={styles.formHeader}>
        <h2>Reset password</h2>
        <p>Set a new password for your account.</p>
      </div>
      <form onSubmit={onSubmit} className={styles.section}>
        <div className={styles.field}>
          <label className={styles.label}>New password</label>
          <input
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Confirm new password</label>
          <input
            className={styles.input}
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="********"
          />
        </div>
        {error && <div className={styles.errorSummary}>{error}</div>}
        {message && <div className={styles.hint}>{message}</div>}
        <div className={styles.actions}>
          <button type="submit" className={styles.pillButton}>
            Reset password
          </button>
        </div>
      </form>
    </div>
  );
}
