"use client";

import React from "react";
import styles from "@/components/booking/BookLabourNowForm.module.css";
import SecondaryButton from "@/components/SecondaryButton";
import PrimaryButton from "@/components/PrimaryButton";

type ContractorRow = {
  worker_id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  company_name?: string | null;
  abn?: string | null;
  contractor_pay_rate_cents?: number | null;
  updated_at?: string | null;
  missing_pay_rate?: boolean;
  missing_company_details?: boolean;
};

export default function AdminContractorsPage() {
  const [error, setError] = React.useState("");
  const [session, setSession] = React.useState<{ adminLevel?: string } | null>(null);
  const [rows, setRows] = React.useState<ContractorRow[]>([]);
  const [saving, setSaving] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState("");

  const loadRows = async () => {
    const res = await fetch("/api/admin/contractors");
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(json?.error || "Unable to load contractors.");
      return;
    }
    setRows(Array.isArray(json.contractors) ? json.contractors : []);
  };

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
    void loadRows();
  }, [session]);

  const saveRate = async (workerId: string, value: number | null | undefined) => {
    setMessage("");
    setSaving(workerId);
    const cents = value == null ? 0 : Math.round(value * 100);
    const res = await fetch(`/api/admin/contractors/${workerId}/pay-rate`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contractor_pay_rate_cents: cents }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setMessage(json?.error || "Unable to save pay rate.");
    }
    await loadRows();
    setSaving(null);
  };

  if (error) {
    return (
      <div className={styles.form} style={{ maxWidth: 720, margin: "2rem auto" }}>
        <div className={styles.errorSummary}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.form} style={{ maxWidth: 1100, margin: "2rem auto" }}>
      <div className={styles.formHeader}>
        <h2>Contractor management</h2>
        <p>Set contractor pay rates for ACCPAY bill creation.</p>
        <div className={styles.formHeaderActions}>
          <SecondaryButton href="/dashboard/admin">Back to dashboard</SecondaryButton>
          <SecondaryButton href="/dashboard/admin/xero">Xero payroll</SecondaryButton>
          <SecondaryButton href="/logout">Log out</SecondaryButton>
        </div>
      </div>

      {message ? <div className={styles.hint}>{message}</div> : null}

      <div className={styles.section}>
        <h3>Contractors</h3>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Worker</th>
                <th>Company</th>
                <th>ABN</th>
                <th>Pay rate (AUD/hr)</th>
                <th>Flags</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const name = [row.first_name, row.last_name].filter(Boolean).join(" ");
                const rate = row.contractor_pay_rate_cents != null ? row.contractor_pay_rate_cents / 100 : "";
                return (
                  <tr key={row.worker_id}>
                    <td>
                      <div>{name || row.worker_id}</div>
                      <div className={styles.muted}>{row.email}</div>
                    </td>
                    <td>{row.company_name || "—"}</td>
                    <td>{row.abn || "—"}</td>
                    <td>
                      <input
                        className={styles.input}
                        type="number"
                        min="0"
                        step="0.01"
                        value={rate}
                        onChange={(e) => {
                          const next = e.target.value === "" ? null : Number(e.target.value);
                          setRows((prev) =>
                            prev.map((item) =>
                              item.worker_id === row.worker_id
                                ? { ...item, contractor_pay_rate_cents: next == null ? null : Math.round(next * 100) }
                                : item,
                            ),
                          );
                        }}
                      />
                    </td>
                    <td>
                      {row.missing_pay_rate ? <span className={styles.warning}>Missing pay rate</span> : null}
                      {row.missing_company_details ? <span className={styles.warning}>Missing company details</span> : null}
                    </td>
                    <td>
                      <PrimaryButton
                        type="button"
                        onClick={() => saveRate(row.worker_id, rate === "" ? null : Number(rate))}
                      >
                        {saving === row.worker_id ? "Saving..." : "Save"}
                      </PrimaryButton>
                    </td>
                  </tr>
                );
              })}
              {!rows.length ? (
                <tr>
                  <td colSpan={6}>No contractors found.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
