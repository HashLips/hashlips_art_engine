"use client";

import React from "react";
import styles from "@/components/booking/BookLabourNowForm.module.css";
import SecondaryButton from "@/components/SecondaryButton";

export default function AdminRequestsPage() {
  const [error, setError] = React.useState("");
  const [session, setSession] = React.useState<{ adminLevel?: string } | null>(null);

  React.useEffect(() => {
    fetch("/api/auth/session")
      .then(async (r) => {
        if (!r.ok) throw new Error("no session");
        const json = await r.json();
        setSession(json.session || null);
      })
      .catch(() => setSession(null));
  }, []);

  React.useEffect(() => {
    if (!session) return;
    if (
      session.adminLevel !== "admin" &&
      session.adminLevel !== "super_admin" &&
      session.adminLevel !== "payroll_admin"
    ) {
      setError("Admin access required.");
      return;
    }
  }, [session]);

  if (error) {
    return (
      <div className={styles.form} style={{ maxWidth: 720, margin: "2rem auto" }}>
        <div className={styles.errorSummary}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.form} style={{ maxWidth: 1040, margin: "2rem auto" }}>
      <div className={styles.formHeader}>
        <h2>Admin dashboard</h2>
        <p>Manage clients, requests, workers, and access.</p>
        <div className={styles.formHeaderActions}>
          <SecondaryButton href="/logout">Log out</SecondaryButton>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Admin sections</h3>
        <div className={styles.gridTwo}>
          <SecondaryButton href="/dashboard/admin/clients">Manage clients</SecondaryButton>
          <SecondaryButton href="/dashboard/admin/requests">View requests</SecondaryButton>
          <SecondaryButton href="/dashboard/admin/workers">Manage workers</SecondaryButton>
          <SecondaryButton href="/dashboard/admin/contractors">Manage contractors</SecondaryButton>
          <SecondaryButton href="/dashboard/admin/xero">Xero payroll</SecondaryButton>
          <SecondaryButton href="/dashboard/admin/xero/accounting">
            Xero accounting settings
          </SecondaryButton>
          <SecondaryButton href="/dashboard/admin/xero/bill-failures">
            Xero bill failures
          </SecondaryButton>
          <SecondaryButton href="/dashboard/admin/signups">Client signups</SecondaryButton>
          <SecondaryButton href="/dashboard/admin/access">Access & roles</SecondaryButton>
        </div>
      </div>
    </div>
  );
}
