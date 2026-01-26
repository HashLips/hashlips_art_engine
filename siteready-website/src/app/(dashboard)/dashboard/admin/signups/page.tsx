"use client";

import React from "react";
import styles from "@/components/booking/BookLabourNowForm.module.css";
import SecondaryButton from "@/components/SecondaryButton";

type SignupRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  whatsapp: string | null;
  status: "email_sent" | "email_clicked" | "converted" | "expired";
  email_sent_at: number;
  email_clicked_at: number | null;
  updated_at: number;
};

type TabKey = "email_sent" | "email_clicked" | "converted";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "email_sent", label: "Awaiting email click" },
  { key: "email_clicked", label: "Clicked not completed" },
  { key: "converted", label: "Converted" },
];

const formatDate = (value?: number | null) => {
  if (!value) return "-";
  try {
    return new Date(value * 1000).toLocaleString();
  } catch {
    return "-";
  }
};

export default function AdminSignupsPage() {
  const [error, setError] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<TabKey>("email_sent");
  const [signups, setSignups] = React.useState<SignupRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [resendBusy, setResendBusy] = React.useState<Record<string, boolean>>({});

  const loadSignups = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/signups");
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        setError(json?.error || "Unable to load signups.");
        setLoading(false);
        return;
      }
      const json = await res.json();
      setSignups(json.signups || []);
    } catch {
      setError("Unable to load signups.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadSignups();
  }, [loadSignups]);

  const filtered = React.useMemo(() => {
    if (activeTab === "email_sent") {
      return signups.filter((s) => s.status === "email_sent" && !s.email_clicked_at);
    }
    if (activeTab === "email_clicked") {
      return signups.filter((s) => s.status === "email_clicked" && !!s.email_clicked_at);
    }
    return signups.filter((s) => s.status === "converted");
  }, [activeTab, signups]);

  const resendEmail = async (id: string) => {
    setResendBusy((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch("/api/admin/signups/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        setError(json?.error || "Unable to resend email.");
        return;
      }
      await loadSignups();
    } catch {
      setError("Unable to resend email.");
    } finally {
      setResendBusy((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className={styles.form} style={{ maxWidth: 1040, margin: "2rem auto" }}>
      <div className={styles.formHeader}>
        <h2>Client signups</h2>
        <p>Track onboarding emails and conversion progress.</p>
        <div className={styles.formHeaderActions}>
          <SecondaryButton href="/dashboard/admin">Back to admin</SecondaryButton>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.actions} style={{ justifyContent: "flex-start", gap: "0.5rem" }}>
          {tabs.map((tab) => (
            <SecondaryButton
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={activeTab === tab.key ? styles.pillButton : undefined}
            >
              {tab.label}
            </SecondaryButton>
          ))}
        </div>
      </div>

      {error ? <div className={styles.errorSummary}>{error}</div> : null}
      {loading ? <div className={styles.hint}>Loading signups...</div> : null}

      {!loading && filtered.length === 0 ? (
        <div className={styles.hint}>No signups in this view.</div>
      ) : null}

      {!loading && filtered.length > 0 ? (
        <div className={styles.section}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Status</th>
                  <th>Last update</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((signup) => (
                  <tr key={signup.id}>
                    <td>{`${signup.first_name} ${signup.last_name}`}</td>
                    <td>{signup.email}</td>
                    <td>{signup.mobile}</td>
                    <td>{signup.status.replace("_", " ")}</td>
                    <td>{formatDate(signup.updated_at)}</td>
                    <td>
                      {signup.status !== "converted" ? (
                        <SecondaryButton
                          type="button"
                          onClick={() => resendEmail(signup.id)}
                          disabled={!!resendBusy[signup.id]}
                        >
                          {resendBusy[signup.id] ? "Resending..." : "Resend email"}
                        </SecondaryButton>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
