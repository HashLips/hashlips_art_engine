"use client";

import styles from "@/components/booking/BookLabourNowForm.module.css";
import React from "react";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";

type SessionResponse = { ok: boolean; session?: { role?: string; adminLevel?: string } };

export default function DashboardPage() {
  const [data, setData] = React.useState<SessionResponse | null>(null);
  const [error, setError] = React.useState<string>("");

  React.useEffect(() => {
    fetch("/api/auth/session")
      .then(async (r) => {
        if (!r.ok) {
          throw new Error("not signed in");
        }
        const json = await r.json();
        setData(json);
      })
      .catch(() => setError("Not signed in. Please login to continue."));
  }, []);


  if (error) {
    return (
      <div className={styles.form} style={{ maxWidth: 720, margin: "3rem auto" }}>
        <div className={styles.errorSummary}>{error}</div>
        <PrimaryButton href="/login">Go to login</PrimaryButton>
      </div>
    );
  }

  if (!data) return <p style={{ padding: "2rem" }}>Loading...</p>;

  return (
    <div className={styles.form} style={{ maxWidth: 960, margin: "2rem auto" }}>
      <div className={styles.formHeader}>
        <h2>Dashboard</h2>
        <p>Welcome, role: {data.session?.role}</p>
      </div>
      <div className={styles.section}>
        <p>This is a placeholder dashboard. Requests, candidates, timesheets, and incidents will appear here.</p>
        <div className={styles.actions}>
          {data.session?.adminLevel ? (
            <PrimaryButton href="/dashboard/admin">Go to admin dashboard</PrimaryButton>
          ) : data.session?.role === "worker" ? (
            <PrimaryButton href="/dashboard/worker">Go to worker dashboard</PrimaryButton>
          ) : (
            <>
              <PrimaryButton href="/dashboard/requests">Book labour now</PrimaryButton>
              <SecondaryButton href="/dashboard/requests/status">See requested workers</SecondaryButton>
              <SecondaryButton href="/dashboard/timesheets">Approve timesheets</SecondaryButton>
            </>
          )}
          <SecondaryButton href="/logout">Logout</SecondaryButton>
        </div>
      </div>
    </div>
  );
}
