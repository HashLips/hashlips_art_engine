"use client";

import React from "react";
import styles from "@/components/booking/BookLabourNowForm.module.css";
import SecondaryButton from "@/components/SecondaryButton";
import LegalConsentModal from "@/components/legal/LegalConsentModal";
import { LEGAL_DOCUMENTS, LegalDocument } from "@/lib/legal/documents";

type StatusResponse = {
  connected: boolean;
  tenantId?: string;
  scope?: string;
  expiresAt?: number;
  error?: string;
};

type XeroSettings = {
  payroll_calendar_id?: string | null;
  ordinary_earnings_rate_id?: string | null;
  super_fund_id?: string | null;
};

export default function AdminXeroPage() {
  const [error, setError] = React.useState("");
  const [session, setSession] = React.useState<{ adminLevel?: string } | null>(null);
  const [status, setStatus] = React.useState<StatusResponse | null>(null);
  const [message, setMessage] = React.useState("");
  const [settings, setSettings] = React.useState<XeroSettings>({});
  const [settingsMessage, setSettingsMessage] = React.useState("");
  const [legalDoc, setLegalDoc] = React.useState<LegalDocument | null>(null);
  const [legalOpen, setLegalOpen] = React.useState(false);

  const loadStatus = async () => {
    const res = await fetch("/api/integrations/xero/status");
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(json?.error || "Unable to load status.");
      return;
    }
    setStatus(json);
  };

  const loadSettings = async () => {
    const res = await fetch("/api/integrations/xero/settings");
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setSettingsMessage(json?.error || "Unable to load settings.");
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
    if (session.adminLevel !== "admin" && session.adminLevel !== "super_admin") {
      setError("Admin access required.");
      return;
    }
    void loadStatus();
    void loadSettings();
  }, [session]);

  const disconnect = async () => {
    setMessage("");
    const res = await fetch("/api/integrations/xero/disconnect", { method: "POST" });
    if (!res.ok) {
      setMessage("Unable to disconnect Xero.");
      return;
    }
    setMessage("Disconnected from Xero.");
    await loadStatus();
  };

  const testConnection = async () => {
    setMessage("");
    const res = await fetch("/api/integrations/xero/test", { method: "POST" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(json?.error || "Xero test failed.");
      return;
    }
    setMessage("Xero connection OK.");
  };

  const saveSettings = async () => {
    setSettingsMessage("");
    const res = await fetch("/api/integrations/xero/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setSettingsMessage(json?.error || "Unable to save settings.");
      return;
    }
    setSettingsMessage("Settings saved.");
  };

  const connectXero = async () => {
    const res = await fetch("/api/legal/status");
    const json = await res.json().catch(() => ({}));
    const required = Array.isArray(json?.required) ? json.required : [];
    const pending = required.find((doc: { type: string; accepted: boolean }) => !doc.accepted);
    if (pending) {
      const doc = LEGAL_DOCUMENTS[pending.type as keyof typeof LEGAL_DOCUMENTS] || null;
      if (doc) {
        setLegalDoc(doc);
        setLegalOpen(true);
        return;
      }
    }
    window.location.href = "/api/integrations/xero/connect";
  };

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
        <h2>Xero Payroll (AU)</h2>
        <p>Connect SiteReady Workforce to Xero Payroll AU.</p>
        <div className={styles.formHeaderActions}>
          <SecondaryButton href="/dashboard/admin">
            Back to dashboard
          </SecondaryButton>
          <SecondaryButton href="/dashboard/admin/clients">
            Manage clients
          </SecondaryButton>
          <SecondaryButton href="/dashboard/admin/requests">
            View requests
          </SecondaryButton>
          <SecondaryButton href="/dashboard/admin/workers">
            Manage workers
          </SecondaryButton>
          <SecondaryButton href="/logout">
            Log out
          </SecondaryButton>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Connection status</h3>
        <div>Connected: {status?.connected ? "Yes" : "No"}</div>
        {status?.tenantId ? <div>Tenant ID: {status.tenantId}</div> : null}
        {status?.scope ? <div>Scope: {status.scope}</div> : null}
        {status?.expiresAt ? <div>Token expires: {new Date(status.expiresAt * 1000).toLocaleString()}</div> : null}
        {message ? <div className={styles.hint}>{message}</div> : null}
        <div className={styles.actions}>
          <SecondaryButton type="button"  onClick={connectXero}>
            Connect Xero
          </SecondaryButton>
          <SecondaryButton type="button"  onClick={testConnection}>
            Test connection
          </SecondaryButton>
          <SecondaryButton type="button"  onClick={disconnect}>
            Disconnect
          </SecondaryButton>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Defaults</h3>
        <p className={styles.hint}>Set default payroll IDs used when syncing timesheets.</p>
        <div className={styles.gridTwo}>
          <div className={styles.field}>
            <label className={styles.label}>Payroll calendar ID</label>
            <input
              className={styles.input}
              value={settings.payroll_calendar_id || ""}
              onChange={(e) => setSettings((prev) => ({ ...prev, payroll_calendar_id: e.target.value }))}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Ordinary earnings rate ID</label>
            <input
              className={styles.input}
              value={settings.ordinary_earnings_rate_id || ""}
              onChange={(e) => setSettings((prev) => ({ ...prev, ordinary_earnings_rate_id: e.target.value }))}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Default super fund ID (optional)</label>
            <input
              className={styles.input}
              value={settings.super_fund_id || ""}
              onChange={(e) => setSettings((prev) => ({ ...prev, super_fund_id: e.target.value }))}
            />
          </div>
        </div>
        <div className={styles.actions}>
          <SecondaryButton type="button"  onClick={saveSettings}>
            Save defaults
          </SecondaryButton>
          {settingsMessage ? <span className={styles.hint}>{settingsMessage}</span> : null}
        </div>
      </div>

      <LegalConsentModal
        open={legalOpen}
        document={legalDoc}
        onClose={() => setLegalOpen(false)}
        onAccept={async () => {
          if (!legalDoc) return;
          await fetch("/api/legal/accept", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ document_type: legalDoc.type }),
          });
          setLegalOpen(false);
          window.location.href = "/api/integrations/xero/connect";
        }}
      />
    </div>
  );
}
