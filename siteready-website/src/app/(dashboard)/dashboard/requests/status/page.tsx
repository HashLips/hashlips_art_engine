"use client";

import React from "react";
import styles from "@/components/booking/BookLabourNowForm.module.css";
import SecondaryButton from "@/components/SecondaryButton";

type RequestItem = {
  request_id: string;
  status: string;
  review_status?: string | null;
  role_id: string;
  headcount: number;
  created_at?: number;
};

const STATUS_META: Record<string, { label: string; color: string; next: string }> = {
  submitted: { label: "Submitted", color: "#2563eb", next: "Under review" },
  under_review: { label: "Under review", color: "#f59e0b", next: "Approved or declined" },
  approved: { label: "Approved", color: "#10b981", next: "Assigned" },
  declined: { label: "Declined", color: "#ef4444", next: "Closed" },
  assigned: { label: "Assigned", color: "#6366f1", next: "Active" },
  active: { label: "Active", color: "#0ea5e9", next: "Completed" },
  completed: { label: "Completed", color: "#64748b", next: "Closed" },
};

const getStatusKey = (r: RequestItem) => (r.review_status || r.status || "submitted") as string;

export default function RequestStatusPage() {
  const [items, setItems] = React.useState<RequestItem[]>([]);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    fetch("/api/requests")
      .then(async (r) => {
        if (!r.ok) throw new Error("failed");
        const json = await r.json();
        setItems(json.requests || []);
      })
      .catch(() => setError("Unable to load requests (not configured or not authenticated)."))
      .finally(() => setLoading(false));
  }, []);

  if (error) {
    return (
      <div className={styles.form} style={{ maxWidth: 720, margin: "2rem auto" }}>
        <div className={styles.errorSummary}>{error}</div>
        <SecondaryButton href="/dashboard">
          Go back to main area
        </SecondaryButton>
      </div>
    );
  }

  return (
    <div className={styles.form} style={{ maxWidth: 960, margin: "2rem auto" }}>
      <div className={styles.formHeader}>
        <h2>Your requests</h2>
        <p>After you submit a request, our admin team will review and match suitable workers.</p>
        <div className={styles.actions}>
          <SecondaryButton href="/dashboard">
            Go back to main area
          </SecondaryButton>
          <SecondaryButton href="/dashboard/requests/proposed">
            Proposed workers
          </SecondaryButton>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.group} style={{ background: "#fff", marginBottom: "1rem" }}>
          <div className={styles.groupHead}>
            <strong>Status key</strong>
            <span className={styles.hint}>Statuses update automatically as your request progresses.</span>
          </div>
          <div style={{ display: "grid", gap: "0.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            {Object.entries(STATUS_META).map(([key, meta]) => (
              <div key={key} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <span
                  style={{
                    background: meta.color,
                    color: "#fff",
                    padding: "0.2rem 0.6rem",
                    borderRadius: "999px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  {meta.label}
                </span>
                <span className={styles.hint}>Next: {meta.next}</span>
              </div>
            ))}
          </div>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : items.length === 0 ? (
          <p>No requests yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {items.map((r) => (
              <div key={r.request_id} className={styles.group}>
                <div className={styles.groupHead}>
                  <div>
                    <strong>{r.role_id}</strong> - {r.headcount} workers
                  </div>
                  <SecondaryButton href={`/dashboard/requests/${r.request_id}`}>
                    View
                  </SecondaryButton>
                </div>
                {(() => {
                  const key = getStatusKey(r);
                  const meta = STATUS_META[key] || STATUS_META.submitted;
                  return (
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                      <span
                        style={{
                          background: meta.color,
                          color: "#fff",
                          padding: "0.25rem 0.7rem",
                          borderRadius: "999px",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                        }}
                      >
                        {meta.label}
                      </span>
                      <span className={styles.hint}>Next stage: {meta.next}</span>
                    </div>
                  );
                })()}
                <div>Request ID: {r.request_id}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
