"use client";

import React from "react";
import styles from "@/components/booking/BookLabourNowForm.module.css";

type XeroStatus = {
  connected: boolean;
  tenantId?: string;
  scope?: string;
  expiresAt?: number;
  updatedAt?: number;
};

export default function AdminXeroPage() {
  const [status, setStatus] = React.useState<XeroStatus | null>(null);
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const loadStatus = React.useCallback(() => {
    fetch("/api/integrations/xero/status")
      .then(async (res) => {
        if (!res.ok) throw new Error("Unable to load Xero status");
        const json = await res.json();
        setStatus(json);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load Xero status"));
  }, []);

  React.useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const runTest = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/integrations/xero/test", { method: "POST" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Test connection failed");
      }
      loadStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Test connection failed");
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/integrations/xero/disconnect", { method: "POST" });
      if (!res.ok) throw new Error("Disconnect failed");
      setStatus({ connected: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Disconnect failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.form} style={{ maxWidth: 960, margin: "2rem auto" }}>
      <div className={styles.formHeader}>
        <h2>Xero Payroll AU</h2>
        <p>Connect SiteReady Workforce to Xero Payroll AU for employee sync and timesheets.</p>
        <div className={styles.formHeaderActions}>
          <a className={styles.pillButton} href="/dashboard/admin">
            Back to dashboard
          </a>
        </div>
      </div>

      {error && <div className={styles.errorSummary}>{error}</div>}

      <div className={styles.section}>
        <h3>Connection status</h3>
        <div className={styles.summaryRow}>
          <span>Status</span>
          <strong>{status?.connected ? "Connected" : "Not connected"}</strong>
        </div>
        {status?.connected && (
          <>
            <div className={styles.summaryRow}>
              <span>Tenant ID</span>
              <strong>{status.tenantId}</strong>
            </div>
            <div className={styles.summaryRow}>
              <span>Scope</span>
              <strong>{status.scope}</strong>
            </div>
          </>
        )}
      </div>

      <div className={styles.section}>
        <h3>Actions</h3>
        <div className={styles.gridTwo}>
          <a className={styles.pillButton} href="/api/integrations/xero/connect">
            Connect Xero
          </a>
          <button className={styles.pillButton} type="button" onClick={runTest} disabled={busy || !status?.connected}>
            Test connection
          </button>
          <button className={styles.pillButton} type="button" onClick={disconnect} disabled={busy || !status?.connected}>
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
}
