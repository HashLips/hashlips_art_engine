"use client";

import React from "react";
import styles from "@/components/booking/BookLabourNowForm.module.css";
import SecondaryButton from "@/components/SecondaryButton";
import LegalConsentModal from "@/components/legal/LegalConsentModal";
import { LEGAL_DOCUMENTS, LegalDocument } from "@/lib/legal/documents";

type AssignmentItem = {
  assignment_id: string;
  request_id: string;
  client_id: string;
  status: string;
};

type TimesheetHeader = {
  timesheet_id: string;
  period_start: string;
  period_end: string;
  status: string;
  submitted_at?: string | null;
};

type TimesheetLineDraft = {
  work_date: string;
  hours_decimal: string;
  start_time: string;
  finish_time: string;
  break_mins: string;
  notes: string;
};

const startOfWeek = (date: Date) => {
  const day = (date.getDay() + 6) % 7;
  const start = new Date(date);
  start.setDate(date.getDate() - day);
  return start;
};

const formatDate = (date: Date) => date.toISOString().slice(0, 10);

const calculateHours = (startTime: string, finishTime: string, breakMins: string) => {
  if (!startTime || !finishTime) return "";
  const [startH, startM] = startTime.split(":").map(Number);
  const [finishH, finishM] = finishTime.split(":").map(Number);
  if (Number.isNaN(startH) || Number.isNaN(startM) || Number.isNaN(finishH) || Number.isNaN(finishM)) return "";
  const startTotal = startH * 60 + startM;
  const finishTotal = finishH * 60 + finishM;
  if (finishTotal < startTotal) return "";
  const breakMinutes = Math.max(0, Number(breakMins || 0));
  const workedMinutes = Math.max(0, finishTotal - startTotal - breakMinutes);
  return (workedMinutes / 60).toFixed(2);
};

export default function WorkerTimesheetsPage() {
  const [assignments, setAssignments] = React.useState<AssignmentItem[]>([]);
  const [timesheets, setTimesheets] = React.useState<TimesheetHeader[]>([]);
  const [assignmentId, setAssignmentId] = React.useState("");
  const [clientId, setClientId] = React.useState("");
  const [weekStart, setWeekStart] = React.useState(formatDate(startOfWeek(new Date())));
  const [lines, setLines] = React.useState<TimesheetLineDraft[]>([]);
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const [legalDoc, setLegalDoc] = React.useState<LegalDocument | null>(null);
  const [legalOpen, setLegalOpen] = React.useState(false);

  const buildWeekLines = React.useCallback((start: string) => {
    const base = new Date(`${start}T00:00:00`);
    const next: TimesheetLineDraft[] = [];
    for (let i = 0; i < 7; i += 1) {
      const day = new Date(base);
      day.setDate(base.getDate() + i);
        next.push({
          work_date: formatDate(day),
          hours_decimal: "",
          start_time: "",
          finish_time: "",
          break_mins: "",
          notes: "",
        });
      }
    setLines(next);
  }, []);

  const loadData = React.useCallback(async () => {
    const [assignmentsRes, timesheetsRes] = await Promise.all([
      fetch("/api/workers/me/assignments"),
      fetch("/api/timesheets"),
    ]);
    const assignmentsJson = await assignmentsRes.json();
    const timesheetsJson = await timesheetsRes.json();
    setAssignments(assignmentsJson.assignments || []);
    setTimesheets(timesheetsJson.timesheets || []);
  }, []);

  React.useEffect(() => {
    buildWeekLines(weekStart);
  }, [weekStart, buildWeekLines]);

  React.useEffect(() => {
    loadData().catch(() => setError("Unable to load timesheets."));
  }, [loadData]);

  const onAssignmentChange = (value: string) => {
    setAssignmentId(value);
    const assignment = assignments.find((item) => item.assignment_id === value);
    setClientId(assignment?.client_id || "");
  };

  const submitTimesheet = async (submit: boolean) => {
    setError("");
    setMessage("");
    if (!assignmentId || !clientId) {
      setError("Please choose an assignment.");
      return;
    }
    const payloadLines = lines
      .filter((line) => Number(line.hours_decimal) > 0)
      .map((line) => ({
        work_date: line.work_date,
        hours_decimal: Number(line.hours_decimal),
        earnings_code: "ORDINARY",
        notes: line.notes,
      }));
    if (!payloadLines.length) {
      setError("Please enter at least one day with hours.");
      return;
    }
    const res = await fetch("/api/timesheets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        assignment_id: assignmentId,
        period_start: weekStart,
        period_end: formatDate(new Date(new Date(`${weekStart}T00:00:00`).getTime() + 6 * 86400000)),
        submit,
        lines: payloadLines,
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.status === 403 && json?.code === "NEEDS_LEGAL_ACCEPTANCE" && json?.document) {
      const doc = LEGAL_DOCUMENTS[json.document as keyof typeof LEGAL_DOCUMENTS] || null;
      if (doc) {
        setLegalDoc(doc);
        setLegalOpen(true);
      }
      return;
    }
    if (!res.ok) {
      setError(json?.error || "Unable to save timesheet.");
      return;
    }
    setMessage(submit ? "Timesheet submitted." : "Timesheet saved as draft.");
    await loadData();
  };

  return (
    <div className={styles.form} style={{ maxWidth: 1040, margin: "2rem auto" }}>
      <div className={styles.formHeader}>
        <h2>Weekly timesheets</h2>
        <p>Submit weekly hours for approval.</p>
        <div className={styles.formHeaderActions}>
          <SecondaryButton href="/dashboard/worker">
            Back to worker portal
          </SecondaryButton>
        </div>
      </div>

      {error ? <div className={styles.errorSummary}>{error}</div> : null}
      {message ? <div className={styles.hint}>{message}</div> : null}

      <div className={styles.section}>
        <h3>Create a timesheet</h3>
        <div className={styles.gridTwo}>
          <div className={styles.field}>
            <label className={styles.label}>Assignment</label>
            <select className={styles.select} value={assignmentId} onChange={(e) => onAssignmentChange(e.target.value)}>
              <option value="">Select assignment...</option>
              {assignments.map((assignment) => (
                <option key={assignment.assignment_id} value={assignment.assignment_id}>
                  {assignment.request_id} ({assignment.status})
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Week starting</label>
            <input className={styles.input} type="date" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} />
          </div>
        </div>
        <div className={styles.section}>
          <h4 style={{ fontWeight: 800 }}>Hours</h4>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {lines.map((line, index) => (
              <div
                key={line.work_date}
                className={styles.gridThree}
                style={{
                  borderRadius: 16,
                  padding: "0.75rem",
                  border: "1px solid #e2e8f0",
                  background: ["#fff7ed", "#eff6ff", "#ecfdf3", "#fdf2f8", "#fef9c3", "#f3f4f6", "#ede9fe"][index % 7],
                }}
              >
                <div className={styles.field}>
                  <label className={styles.label}>Date</label>
                  <input className={styles.input} value={line.work_date} readOnly />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Start time</label>
                  <input
                    className={styles.input}
                    type="time"
                    value={line.start_time}
                    onChange={(e) => {
                      const next = [...lines];
                      const start_time = e.target.value;
                      const hours_decimal = calculateHours(start_time, line.finish_time, line.break_mins);
                      next[index] = { ...line, start_time, hours_decimal };
                      setLines(next);
                    }}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Break (mins)</label>
                  <input
                    className={styles.input}
                    type="number"
                    min="0"
                    step="5"
                    value={line.break_mins}
                    onChange={(e) => {
                      const next = [...lines];
                      const break_mins = e.target.value;
                      const hours_decimal = calculateHours(line.start_time, line.finish_time, break_mins);
                      next[index] = { ...line, break_mins, hours_decimal };
                      setLines(next);
                    }}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Finish time</label>
                  <input
                    className={styles.input}
                    type="time"
                    value={line.finish_time}
                    onChange={(e) => {
                      const next = [...lines];
                      const finish_time = e.target.value;
                      const hours_decimal = calculateHours(line.start_time, finish_time, line.break_mins);
                      next[index] = { ...line, finish_time, hours_decimal };
                      setLines(next);
                    }}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Total hours</label>
                  <input
                    className={styles.input}
                    value={line.hours_decimal}
                    readOnly
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Notes</label>
                  <input
                    className={styles.input}
                    value={line.notes}
                    onChange={(e) => {
                      const next = [...lines];
                      next[index] = { ...line, notes: e.target.value };
                      setLines(next);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.actions}>
          <SecondaryButton type="button"  onClick={() => submitTimesheet(false)}>
            Save draft
          </SecondaryButton>
          <SecondaryButton type="button"  onClick={() => submitTimesheet(true)}>
            Submit for approval
          </SecondaryButton>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Submitted timesheets</h3>
        {timesheets.length === 0 ? (
          <p>No timesheets yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {timesheets.map((sheet) => (
              <div key={sheet.timesheet_id} className={styles.group}>
                <div>Week: {sheet.period_start} → {sheet.period_end}</div>
                <div>Status: {sheet.status}</div>
                {sheet.submitted_at ? <div>Submitted: {new Date(sheet.submitted_at).toLocaleString()}</div> : null}
              </div>
            ))}
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
        }}
      />
    </div>
  );
}
