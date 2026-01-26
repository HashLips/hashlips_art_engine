"use client";

import React from "react";
import styles from "@/components/booking/BookLabourNowForm.module.css";
import SecondaryButton from "@/components/SecondaryButton";

type WorkingNowForm = {
  status: "available_now" | "working_until" | "working_pause" | "working_offers_on" | "";
  end_date: string;
  notes: string;
  availability_from_date: string;
  availability_until_date: string;
  holiday_start_date: string;
  holiday_end_date: string;
};

export default function WorkerWorkingNowPage() {
  const [form, setForm] = React.useState<WorkingNowForm>({
    status: "",
    end_date: "",
    notes: "",
    availability_from_date: "",
    availability_until_date: "",
    holiday_start_date: "",
    holiday_end_date: "",
  });
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const totalHolidayDays = React.useMemo(() => {
    if (!form.holiday_start_date || !form.holiday_end_date) return "";
    const start = new Date(form.holiday_start_date);
    const end = new Date(form.holiday_end_date);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "";
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? `${diff} day(s)` : "";
  }, [form.holiday_start_date, form.holiday_end_date]);

  React.useEffect(() => {
    fetch("/api/workers/me/working-now")
      .then((r) => r.json())
      .then((json) => {
        if (!json?.ok) return;
        setForm({
          status: json.data?.status || "",
          end_date: json.data?.end_date || "",
          notes: json.data?.notes || "",
          availability_from_date: json.data?.availability_from_date || "",
          availability_until_date: json.data?.availability_until_date || "",
          holiday_start_date: json.data?.holiday_start_date || "",
          holiday_end_date: json.data?.holiday_end_date || "",
        });
      })
      .catch(() => setError("Unable to load working status."));
  }, []);

  const save = async () => {
    setError("");
    setMessage("");
    if (!form.status) {
      setError("Please choose one option.");
      return;
    }
    const res = await fetch("/api/workers/me/working-now", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      setError(json?.error || "Unable to save working status.");
      return;
    }
    setMessage("Working status saved.");
  };

  const saveAvailable = async () => {
    const payload = {
      ...form,
      status: "available_now" as const,
      availability_from_date: new Date().toISOString().slice(0, 10),
      availability_until_date: "",
    };
    setForm(payload);
    setError("");
    setMessage("");
    const res = await fetch("/api/workers/me/working-now", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      setError(json?.error || "Unable to save working status.");
      return;
    }
    setMessage("You are marked as fully available.");
  };

  return (
    <div className={styles.form} style={{ maxWidth: 900, margin: "2rem auto" }}>
      <div className={styles.formHeader}>
        <h2 style={{ fontWeight: 800, color: "#0f172a" }}>Current status / Working now / Holidays</h2>
        <p>What is your current status?</p>
      </div>
      {error ? <div className={styles.errorSummary}>{error}</div> : null}
      {message ? <div className={styles.hint}>{message}</div> : null}

      <div className={styles.section}>
        <h3 style={{ fontWeight: 800, color: "#0f172a" }}>Your current status</h3>
        <div className={styles.field}>
          <label className={styles.label}>
            <input
              type="radio"
              name="working-now"
              checked={form.status === "available_now"}
              onChange={() =>
                setForm((prev) => ({
                  ...prev,
                  status: "available_now",
                  availability_from_date: new Date().toISOString().slice(0, 10),
                }))
              }
            />{" "}
            I am currently available for work as of now.
          </label>
          {form.status === "available_now" ? (
            <div className={styles.field} style={{ marginTop: "0.5rem" }}>
              <label className={styles.label}>Available now date</label>
              <input className={styles.input} readOnly value={form.availability_from_date} />
            </div>
          ) : null}
          <label className={styles.label}>
            <input
              type="radio"
              name="working-now"
              checked={form.status === "working_until"}
              onChange={() => setForm((prev) => ({ ...prev, status: "working_until" }))}
            />{" "}
            I am currently working now and will be available for work from ...
          </label>
          {form.status === "working_until" ? (
            <div className={styles.gridThree} style={{ marginTop: "0.75rem" }}>
              <div className={styles.field}>
                <label className={styles.label}>Available from</label>
                <input
                  className={styles.input}
                  type="date"
                  value={form.availability_from_date}
                  onChange={(e) => setForm((prev) => ({ ...prev, availability_from_date: e.target.value }))}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Available until (optional)</label>
                <input
                  className={styles.input}
                  type="date"
                  value={form.availability_until_date}
                  onChange={(e) => setForm((prev) => ({ ...prev, availability_until_date: e.target.value }))}
                />
              </div>
            </div>
          ) : null}
          <label className={styles.label}>
            <input
              type="radio"
              name="working-now"
              checked={form.status === "working_pause"}
              onChange={() => setForm((prev) => ({ ...prev, status: "working_pause" }))}
            />{" "}
            I am working elsewhere and want to pause offers until I update my status.
          </label>
          <label className={styles.label}>
            <input
              type="radio"
              name="working-now"
              checked={form.status === "working_offers_on"}
              onChange={() => setForm((prev) => ({ ...prev, status: "working_offers_on" }))}
            />{" "}
            I am working elsewhere but still want offers.
          </label>
        </div>
        <div className={styles.field} style={{ marginTop: "1.5rem" }}>
          <label className={styles.label}>Notes (optional)</label>
          <textarea
            className={styles.textarea}
            rows={3}
            value={form.notes}
            onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="Share any details that help us plan your next offer."
          />
        </div>
      </div>

      <div className={styles.section}>
        <h3 style={{ fontWeight: 800, color: "#0f172a" }}>Planned holidays</h3>
        <p className={styles.hint}>
          If you have planned holidays and want us to be aware, enter the dates here. This is shown to proposed job site managers.
        </p>
        <p className={styles.hint}>
          You do not need to edit your Availability on the worker portal page — this will update internally.
        </p>
        <div className={styles.gridThree}>
          <div className={styles.field}>
            <label className={styles.label}>Date from</label>
            <input
              className={styles.input}
              type="date"
              value={form.holiday_start_date}
              onChange={(e) => setForm((prev) => ({ ...prev, holiday_start_date: e.target.value }))}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Date until</label>
            <input
              className={styles.input}
              type="date"
              value={form.holiday_end_date}
              onChange={(e) => setForm((prev) => ({ ...prev, holiday_end_date: e.target.value }))}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Total days</label>
            <input
              className={styles.input}
              readOnly
              value={totalHolidayDays}
            />
          </div>
        </div>
      </div>

      <div className={styles.actions} style={{ marginTop: "2rem" }}>
        <SecondaryButton type="button"  onClick={save}>
          Save working status
        </SecondaryButton>
        <SecondaryButton
          type="button"
          style={{ background: "#dcfce7", borderColor: "#22c55e", color: "#166534" }}
          onClick={saveAvailable}
        >
          Now fully available
        </SecondaryButton>
        <SecondaryButton href="/dashboard/worker">Back to worker portal</SecondaryButton>
      </div>
    </div>
  );
}
