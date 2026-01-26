"use client";

import React from "react";
import styles from "@/components/booking/BookLabourNowForm.module.css";
import SecondaryButton from "@/components/SecondaryButton";
import LegalConsentModal from "@/components/legal/LegalConsentModal";
import { LEGAL_DOCUMENTS, LegalDocument } from "@/lib/legal/documents";

type TimesheetHeader = {
  timesheet_id: string;
  period_start: string;
  period_end: string;
  status: string;
  submitted_at?: string | null;
  worker_id: string;
};

type WorkerSummary = {
  worker_id: string;
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  role_id?: string | null;
};

type TimesheetLine = {
  work_date: string;
  hours_decimal: number;
  notes?: string | null;
};

export default function ClientTimesheetsPage() {
  const [timesheets, setTimesheets] = React.useState<TimesheetHeader[]>([]);
  const [workers, setWorkers] = React.useState<Record<string, WorkerSummary>>({});
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
  const [details, setDetails] = React.useState<Record<string, { lines: TimesheetLine[] }>>({});
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const [legalDoc, setLegalDoc] = React.useState<LegalDocument | null>(null);
  const [legalOpen, setLegalOpen] = React.useState(false);

  const loadTimesheets = React.useCallback(async () => {
    const res = await fetch("/api/timesheets");
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 403 && json?.code === "NEEDS_LEGAL_ACCEPTANCE" && json?.document) {
        const doc = LEGAL_DOCUMENTS[json.document as keyof typeof LEGAL_DOCUMENTS] || null;
        if (doc) {
          setLegalDoc(doc);
          setLegalOpen(true);
        }
        return;
      }
      setError(json?.error || "Unable to load timesheets.");
      return;
    }
    setTimesheets(json.timesheets || []);
    setWorkers(json.workers || {});
  }, []);

  React.useEffect(() => {
    loadTimesheets().catch(() => setError("Unable to load timesheets."));
  }, [loadTimesheets]);

  const toggleDetails = async (timesheetId: string) => {
    const open = !expanded[timesheetId];
    setExpanded((prev) => ({ ...prev, [timesheetId]: open }));
    if (!open || details[timesheetId]) return;
    const res = await fetch(`/api/timesheets/${timesheetId}`);
    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      setDetails((prev) => ({ ...prev, [timesheetId]: { lines: json.lines || [] } }));
    }
  };

  const updateStatus = async (timesheetId: string, status: "approved" | "rejected") => {
    setMessage("");
    setError("");
    const res = await fetch(`/api/timesheets/${timesheetId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json?.error || "Unable to update timesheet.");
      return;
    }
    if (json.warning) {
      setMessage(json.warning);
    } else {
      setMessage(`Timesheet ${status}.`);
    }
    await loadTimesheets();
  };

  return (
    <div className={styles.form} style={{ maxWidth: 1040, margin: "2rem auto" }}>
      <div className={styles.formHeader}>
        <h2>Timesheet approvals</h2>
        <p>Approve or reject weekly timesheets.</p>
        <div className={styles.formHeaderActions}>
          <SecondaryButton href="/dashboard">
            Back to dashboard
          </SecondaryButton>
        </div>
      </div>

      {error ? <div className={styles.errorSummary}>{error}</div> : null}
      {message ? <div className={styles.hint}>{message}</div> : null}

      <div className={styles.section}>
        {timesheets.length === 0 ? (
          <p>No timesheets yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {timesheets.map((sheet) => {
              const worker = workers[sheet.worker_id];
              const displayName =
                worker?.name || [worker?.first_name, worker?.last_name].filter(Boolean).join(" ") || sheet.worker_id;
              return (
                <div key={sheet.timesheet_id} className={styles.group}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                    <div>
                      <strong>{displayName}</strong>
                      {worker?.role_id ? <span className={styles.hint}> ({worker.role_id})</span> : null}
                      <div className={styles.hint}>
                        Week: {sheet.period_start} → {sheet.period_end}
                      </div>
                      <div>Status: {sheet.status}</div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <SecondaryButton type="button"  onClick={() => toggleDetails(sheet.timesheet_id)}>
                        {expanded[sheet.timesheet_id] ? "Hide" : "View"}
                      </SecondaryButton>
                      <SecondaryButton type="button"  onClick={() => updateStatus(sheet.timesheet_id, "approved")}>
                        Approve
                      </SecondaryButton>
                      <SecondaryButton type="button"  onClick={() => updateStatus(sheet.timesheet_id, "rejected")}>
                        Reject
                      </SecondaryButton>
                    </div>
                  </div>
                  {expanded[sheet.timesheet_id] && details[sheet.timesheet_id] ? (
                    <div style={{ marginTop: "0.75rem" }}>
                      {details[sheet.timesheet_id].lines.map((line) => (
                        <div key={`${sheet.timesheet_id}-${line.work_date}`} className={styles.gridThree}>
                          <div className={styles.field}>
                            <label className={styles.label}>Date</label>
                            <input className={styles.input} value={line.work_date} readOnly />
                          </div>
                          <div className={styles.field}>
                            <label className={styles.label}>Hours</label>
                            <input className={styles.input} value={String(line.hours_decimal)} readOnly />
                          </div>
                          <div className={styles.field}>
                            <label className={styles.label}>Notes</label>
                            <input className={styles.input} value={line.notes || ""} readOnly />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
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
          await loadTimesheets();
        }}
      />
    </div>
  );
}
