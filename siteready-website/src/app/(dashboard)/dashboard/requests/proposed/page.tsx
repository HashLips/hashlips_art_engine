"use client";

import React from "react";
import styles from "@/components/booking/BookLabourNowForm.module.css";
import SecondaryButton from "@/components/SecondaryButton";

type ProposedCandidate = {
  assignment_id: string;
  worker_id: string;
  company_number?: string | null;
  years_experience?: number | null;
  working_now_status?: string | null;
  availability_from_date?: string | null;
  availability_until_date?: string | null;
  holiday_start_date?: string | null;
  holiday_end_date?: string | null;
  tickets?: Array<{ type: string; verification_status?: string | null }>;
};

type ProposedRequest = {
  request_id: string;
  role_id: string;
  headcount: number;
  review_status?: string | null;
  candidates: ProposedCandidate[];
};

export default function ProposedWorkersPage() {
  const [items, setItems] = React.useState<ProposedRequest[]>([]);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    fetch("/api/requests/proposed")
      .then(async (r) => {
        if (!r.ok) throw new Error("failed");
        const json = await r.json();
        setItems(json.requests || []);
      })
      .catch(() => setError("Unable to load proposed workers."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.form} style={{ maxWidth: 960, margin: "2rem auto" }}>
      <div className={styles.formHeader}>
        <h2>Proposed workers</h2>
        <p>Review workers proposed for your requests. Availability and holidays are shown below.</p>
        <div className={styles.actions}>
          <SecondaryButton href="/dashboard/requests/status">
            Back to request status
          </SecondaryButton>
          <SecondaryButton href="/dashboard">
            Go back to main area
          </SecondaryButton>
        </div>
      </div>

      {error ? <div className={styles.errorSummary}>{error}</div> : null}

      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <p>No proposed workers yet.</p>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {items.map((request) => (
            <div key={request.request_id} className={styles.group}>
              <div className={styles.groupHead}>
                <div>
                  <strong>{request.role_id}</strong> - {request.headcount} workers
                </div>
                <div>Request ID: {request.request_id}</div>
              </div>
              <div style={{ display: "grid", gap: "0.5rem" }}>
                {request.candidates.map((c) => (
                  <div key={c.assignment_id} className={styles.group} style={{ background: "#fff" }}>
                    <div>Worker ID: {c.company_number || c.worker_id}</div>
                    <div>Years experience: {c.years_experience ?? "N/A"}</div>
                    {c.working_now_status ? (
                      <div>
                        Availability: {c.working_now_status}
                        {c.availability_from_date ? ` (from ${c.availability_from_date})` : ""}
                        {c.availability_until_date ? ` to ${c.availability_until_date}` : ""}
                      </div>
                    ) : null}
                    {c.holiday_start_date || c.holiday_end_date ? (
                      <div>
                        Holidays: {c.holiday_start_date || "TBD"} to {c.holiday_end_date || "TBD"}
                      </div>
                    ) : null}
                    {c.tickets?.length ? (
                      <div>Tickets: {c.tickets.map((t) => `${t.type} (${t.verification_status || "pending"})`).join(", ")}</div>
                    ) : (
                      <div>Tickets: None</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
