"use client";

import React from "react";
import styles from "@/components/booking/BookLabourNowForm.module.css";
import SecondaryButton from "@/components/SecondaryButton";

type AssignmentItem = {
  assignment_id: string;
  request_id: string;
  status: string;
};

export default function WorkerProposedPage() {
  const [assignments, setAssignments] = React.useState<AssignmentItem[]>([]);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    fetch("/api/workers/me/assignments")
      .then((r) => r.json())
      .then((json) => setAssignments((json.assignments || []).filter((a: AssignmentItem) => a.status === "proposed")))
      .catch(() => setError("Unable to load proposed positions."));
  }, []);

  return (
    <div className={styles.form} style={{ maxWidth: 920, margin: "2rem auto" }}>
      <div className={styles.formHeader}>
        <h2 style={{ fontWeight: 800, color: "#0f172a" }}>Proposed positions</h2>
        <p>Review positions that are waiting for your approval.</p>
      </div>
      {error ? <div className={styles.errorSummary}>{error}</div> : null}
      {assignments.length === 0 ? (
        <p>No proposed positions right now.</p>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {assignments.map((a) => (
            <div key={a.assignment_id} className={styles.group}>
              <div>Request: {a.request_id}</div>
              <div>Status: {a.status}</div>
            </div>
          ))}
        </div>
      )}
      <div className={styles.actions}>
        <SecondaryButton href="/dashboard/worker">Back to worker portal</SecondaryButton>
      </div>
    </div>
  );
}
