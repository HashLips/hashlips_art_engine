"use client";

import React, { useState } from "react";
import styles from "@/components/booking/BookLabourNowForm.module.css";

const AdminSetupPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setError(json?.error || "Unable to set up admin account.");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Unable to set up admin account.");
    }
  };

  return (
    <div className={styles.form} style={{ maxWidth: 520, margin: "3rem auto" }}>
      <div className={styles.formHeader}>
        <h2>Admin setup</h2>
        <p>Set the super admin email and password.</p>
      </div>
      {success && (
        <div className={styles.section}>
          <div className={styles.errorSummary} style={{ background: "#ecfdf3", borderColor: "#86efac", color: "#166534" }}>
            Admin account set up successfully.
          </div>
          <div className={styles.actions}>
            <a className={styles.pillButton} href="/admin-login">
              Go to admin login
            </a>
          </div>
        </div>
      )}
      <form onSubmit={onSubmit} className={styles.section}>
        <div className={styles.field}>
          <label className={styles.label}>Admin email</label>
          <input
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="info@sitereadyworkforce.com"
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
          <span className={styles.hint}>Minimum 8 characters.</span>
        </div>
        {error && <div className={styles.errorSummary}>{error}</div>}
        <div className={styles.actions}>
          <button type="submit" className={styles.pillButton} disabled={success}>
            Set admin password
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSetupPage;
