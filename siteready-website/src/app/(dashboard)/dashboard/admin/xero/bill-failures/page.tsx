"use client";

import React from "react";
import styles from "@/components/booking/BookLabourNowForm.module.css";
import SecondaryButton from "@/components/SecondaryButton";

type FailureRow = {
  timesheet_id: string;
  worker_id?: string;
  first_name?: string | null;
  last_name?: string | null;
  period_start?: string | null;
  period_end?: string | null;
  approved_at?: string | null;
  attempts?: number | null;
  last_synced_at?: string | null;
  sync_error?: string | null;
  total_hours?: number | null;
};

export default function AdminBillFailuresPage() {
  const [error, setError] = React.useState("");
  const [session, setSession] = React.useState<{ adminLevel?: string } | null>(null);
  const [rows, setRows] = React.useState<FailureRow[]>([]);
  const [message, setMessage] = React.useState("");
  const [retrying, setRetrying] = React.useState<string | null>(null);

  const loadRows = async () => {
    const res = await fetch("/api/admin/xero/sync-failures?type=bills");
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(json?.error || "Unable to load failures.");
      return;
    }
    setRows(Array.isArray(json.failures) ? json.failures : []);
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

  const retry = async (timesheetId: string) => {
    setMessage("");
    setRetrying(timesheetId);
    const res = await fetch(`/api/admin/xero/retry-bill?timesheetId=${encodeURIComponent(timesheetId)}`, {
      method: "POST",
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(json?.error || "Retry failed.");
    } else if (json?.result?.warning) {
      setMessage(json.result.warning);
    } else {
      setMessage("Retry requested.");
    }
    setRetrying(null);
    await loadRows();
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
        <h2>Bill sync failures</h2>
        <p>Retry failed contractor bill syncs.</p>
        <div className={styles.formHeaderActions}>
          <SecondaryButton href="/dashboard/admin">
            Back to dashboard
          </SecondaryButton>
          <SecondaryButton href="/dashboard/admin/xero">
            Xero payroll
          </SecondaryButton>
          <SecondaryButton href="/logout">
            Log out
          </SecondaryButton>
        </div>
      </div>

      {message ? <div className={styles.hint}>{message}</div> : null}

      <div className={styles.section}>
        <h3>Failed bills</h3>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Worker</th>
                <th>Period</th>
                <th>Hours</th>
                <th>Attempts</th>
                <th>Last attempt</th>
                <th>Error</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const name = [row.first_name, row.last_name].filter(Boolean).join(" ");
                return (
                  <tr key={row.timesheet_id}>
                    <td>
                      <div>{name || row.worker_id}</div>
                      <div className={styles.muted}>{row.timesheet_id}</div>
                    </td>
                    <td>
                      {row.period_start} – {row.period_end}
                    </td>
                    <td>{row.total_hours ?? "—"}</td>
                    <td>{row.attempts ?? 0}</td>
                    <td>{row.last_synced_at ? new Date(row.last_synced_at).toLocaleString() : "—"}</td>
                    <td className={styles.muted}>{row.sync_error || "—"}</td>
                    <td>
                      <SecondaryButton
                        type="button"
                        disabled={retrying === row.timesheet_id}
                        onClick={() => retry(row.timesheet_id)}
                      >
                        {retrying === row.timesheet_id ? "Retrying..." : "Retry"}
                      </SecondaryButton>
                    </td>
                  </tr>
                );
              })}
              {!rows.length ? (
                <tr>
                  <td colSpan={7}>No failed bill syncs.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
