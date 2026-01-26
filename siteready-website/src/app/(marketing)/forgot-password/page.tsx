"use client";

import React, { useState } from "react";
import styles from "@/components/booking/BookLabourNowForm.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const res = await fetch("/api/auth/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      setError("Unable to send reset email. Please try again.");
      return;
    }
    setMessage("If that email is registered, a reset link has been sent.");
  };

  return (
    <div className={styles.form} style={{ maxWidth: 520, margin: "3rem auto" }}>
      <div className={styles.formHeader}>
        <h2>Forgot password</h2>
        <p>Enter your email and we will send a reset link.</p>
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
        {error && <div className={styles.errorSummary}>{error}</div>}
        {message && <div className={styles.hint}>{message}</div>}
        <div className={styles.actions}>
          <button type="submit" className={styles.pillButton}>
            Send reset link
          </button>
        </div>
      </form>
    </div>
  );
}
