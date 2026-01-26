"use client";

import React from "react";
import styles from "@/components/booking/BookLabourNowForm.module.css";
import SecondaryButton from "@/components/SecondaryButton";

type Settings = {
  default_purchases_account_code?: string | null;
  bill_status_mode?: "DRAFT" | "AUTHORISED";
};

export default function AdminAccountingSettingsPage() {
  const [error, setError] = React.useState("");
  const [session, setSession] = React.useState<{ adminLevel?: string } | null>(null);
  const [settings, setSettings] = React.useState<Settings>({});
  const [message, setMessage] = React.useState("");

  const loadSettings = async () => {
    const res = await fetch("/api/admin/xero/accounting-settings");
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(json?.error || "Unable to load settings.");
      return;
    }
    setSettings(json.settings || {});
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
    void loadSettings();
  }, [session]);

  const save = async () => {
    setMessage("");
    const res = await fetch("/api/admin/xero/accounting-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(json?.error || "Unable to save settings.");
      return;
    }
    setSettings(json.settings || {});
    setMessage("Accounting settings saved.");
  };

  if (error) {
    return (
      <div className={styles.form} style={{ maxWidth: 720, margin: "2rem auto" }}>
        <div className={styles.errorSummary}>{error}</div>
      </div>
    );
  }

  const showWarning =
    !settings.default_purchases_account_code || settings.default_purchases_account_code === "000";

  return (
    <div className={styles.form} style={{ maxWidth: 960, margin: "2rem auto" }}>
      <div className={styles.formHeader}>
        <h2>Xero Accounting settings</h2>
        <p>Configure contractor bill settings for ACCPAY invoices.</p>
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

      <div className={styles.section}>
        <h3>Purchases account</h3>
        <p className={styles.hint}>Bills cannot sync until a valid purchases account code is set.</p>
        {showWarning ? (
          <div className={styles.alert}>Bills cannot sync until this is configured.</div>
        ) : null}
        <div className={styles.gridTwo}>
          <div className={styles.field}>
            <label className={styles.label}>Default purchases account code</label>
            <input
              className={styles.input}
              value={settings.default_purchases_account_code || ""}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, default_purchases_account_code: e.target.value }))
              }
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Bill status mode</label>
            <select
              className={styles.select}
              value={settings.bill_status_mode || "DRAFT"}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, bill_status_mode: e.target.value as Settings["bill_status_mode"] }))
              }
            >
              <option value="DRAFT">Draft (recommended)</option>
              <option value="AUTHORISED">Authorised</option>
            </select>
            {settings.bill_status_mode === "AUTHORISED" ? (
              <div className={styles.alert}>
                Authorised bills affect accounting immediately. Use Draft during rollout.
              </div>
            ) : null}
          </div>
        </div>
        <div className={styles.actions}>
          <SecondaryButton  type="button" onClick={save}>
            Save settings
          </SecondaryButton>
          {message ? <span className={styles.hint}>{message}</span> : null}
        </div>
      </div>
    </div>
  );
}
