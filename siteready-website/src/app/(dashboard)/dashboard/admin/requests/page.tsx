"use client";

import React from "react";
import styles from "@/components/booking/BookLabourNowForm.module.css";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";

type RequestItem = {
  request_id: string;
  status: string;
  review_status?: string | null;
  status_reason?: string | null;
  role_id: string;
  headcount: number;
  min_years_experience?: number | null;
  required_tickets?: string[];
  site_address?: string | null;
  site_name?: string | null;
  site_lat?: number | null;
  site_lng?: number | null;
  site_map_url?: string | null;
  shift_start_time?: string | null;
  shift_end_time?: string | null;
  hours_per_day?: number | null;
  expected_duration_value?: number | null;
  expected_duration_unit?: string | null;
  ot_options?: string[] | null;
  base_rate_offer?: number | null;
  travel_allowance?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  notes?: string | null;
  attachment_list?: AttachmentItem[] | string[] | null;
  client_id?: string;
  org_name?: string | null;
  contact_name?: string | null;
  contact_email?: string | null;
};

type AttachmentItem = {
  name: string;
  description?: string;
  key?: string;
  size?: number;
  type?: string;
};

type CandidateItem = {
  worker_id: string;
  company_number: string;
  role_id: string;
  years_experience: number;
  working_now_status?: string | null;
  availability_from_date?: string | null;
  availability_until_date?: string | null;
  holiday_start_date?: string | null;
  holiday_end_date?: string | null;
  tickets: { type: string; verification_status: string }[];
};

const REVIEW_STATUSES = [
  "submitted",
  "under_review",
  "approved",
  "declined",
  "assigned",
  "active",
  "completed",
];

export default function AdminRequestsPage() {
  const [error, setError] = React.useState("");
  const [session, setSession] = React.useState<{ adminLevel?: string } | null>(null);
  const [requests, setRequests] = React.useState<RequestItem[]>([]);
  const [statusEdits, setStatusEdits] = React.useState<Record<string, { review_status: string; status_reason: string }>>({});
  const [suggestions, setSuggestions] = React.useState<Record<string, CandidateItem[]>>({});
  const [clientFilterId, setClientFilterId] = React.useState("");
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const canDelete = session?.adminLevel === "admin" || session?.adminLevel === "super_admin";

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
    fetch("/api/admin/requests")
      .then((r) => r.json())
      .then((json) => setRequests(json.requests || []))
      .catch(() => setError("Unable to load requests."));
  }, [session]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setClientFilterId(params.get("clientId") || "");
  }, []);

  const updateStatus = async (requestId: string) => {
    const next = statusEdits[requestId];
    if (!next) return;
    const res = await fetch(`/api/admin/requests/${requestId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    if (!res.ok) {
      setError("Unable to update request status.");
      return;
    }
    setRequests((prev) =>
      prev.map((r) =>
        r.request_id === requestId ? { ...r, review_status: next.review_status, status_reason: next.status_reason } : r,
      ),
    );
  };

  const loadSuggestions = async (requestId: string) => {
    const res = await fetch(`/api/admin/requests/${requestId}/suggestions`);
    if (!res.ok) return;
    const json = await res.json();
    setSuggestions((prev) => ({ ...prev, [requestId]: json.candidates || [] }));
  };

  const assignWorker = async (requestId: string, workerId: string) => {
    const res = await fetch(`/api/admin/requests/${requestId}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ worker_id: workerId }),
    });
    if (!res.ok) {
      setError("Unable to assign worker.");
      return;
    }
    setRequests((prev) =>
      prev.map((r) => (r.request_id === requestId ? { ...r, review_status: "assigned" } : r)),
    );
  };

  const deleteRequest = async (requestId: string) => {
    if (!canDelete) return;
    if (!window.confirm("Delete this request? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/requests/${requestId}/delete`, { method: "POST" });
    if (!res.ok) {
      setError("Unable to delete request.");
      return;
    }
    setRequests((prev) => prev.filter((r) => r.request_id !== requestId));
  };

  if (error) {
    return (
      <div className={styles.form} style={{ maxWidth: 720, margin: "2rem auto" }}>
        <div className={styles.errorSummary}>{error}</div>
      </div>
    );
  }

  const filtered = clientFilterId ? requests.filter((r) => r.client_id === clientFilterId) : requests;

  return (
    <div className={styles.form} style={{ maxWidth: 1040, margin: "2rem auto" }}>
      <div className={styles.formHeader}>
        <h2>Requests</h2>
        <p>Manage and assign labour requests.</p>
        <div className={styles.formHeaderActions}>
          <SecondaryButton href="/dashboard/admin">Back to dashboard</SecondaryButton>
          <SecondaryButton href="/dashboard/admin/clients">Manage clients</SecondaryButton>
          <SecondaryButton href="/dashboard/admin/workers">Manage workers</SecondaryButton>
          <SecondaryButton href="/dashboard/admin/access">Access & roles</SecondaryButton>
          <SecondaryButton href="/logout">Log out</SecondaryButton>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Requests</h3>
        {filtered.length === 0 ? (
          <p>No requests yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "0.85rem" }}>
            {filtered.map((r) => {
              const current = r.review_status || r.status || "submitted";
              const edit = statusEdits[r.request_id] || { review_status: current, status_reason: r.status_reason || "" };
              const expanded = expandedId === r.request_id;
              return (
                <div key={r.request_id} className={styles.group}>
                  <div className={styles.groupHead}>
                    <div>
                      <div><strong>{r.org_name || r.client_id || "Unknown client"}</strong></div>
                      <div>Request ID: {r.request_id}</div>
                      <div>{r.role_id} - {r.headcount} workers</div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <span className={`${styles.statusBadge} ${styles[`status-${current}`]}`}>
                        {current.replace("_", " ")}
                      </span>
                      <SecondaryButton
                        type="button"
                        onClick={() => setExpandedId(expanded ? null : r.request_id)}
                      >
                        {expanded ? "Close" : "View"}
                      </SecondaryButton>
                    </div>
                  </div>
                  {expanded ? (
                    <>
                      <div>Contact: {r.contact_name || "Not set"} ({r.contact_email || "No email"})</div>
                      <div>Site name: {r.site_name || "Not set"}</div>
                      <div>Site address: {r.site_address || "Not set"}</div>
                      <div>
                        Map:{" "}
                        {r.site_map_url ? (
                          <a href={r.site_map_url} target="_blank" rel="noreferrer">
                            Open in Google Maps
                          </a>
                        ) : (
                          "Not set"
                        )}
                      </div>
                      {r.site_map_url ? (
                        <div className={styles.mapWrapper}>
                          <div className={styles.mapArea}>
                            <iframe
                              title={`Site map ${r.request_id}`}
                              width="100%"
                              height="220"
                              loading="lazy"
                              style={{ border: 0 }}
                              referrerPolicy="no-referrer-when-downgrade"
                              src={
                                r.site_lat != null && r.site_lng != null
                                  ? `https://www.google.com/maps?q=${r.site_lat},${r.site_lng}&z=15&output=embed`
                                  : `https://www.google.com/maps?q=${encodeURIComponent(r.site_address || "")}&z=15&output=embed`
                              }
                            />
                          </div>
                        </div>
                      ) : null}
                      <div>Start date: {r.start_date || "Not set"}</div>
                      <div>Start time: {r.shift_start_time || "Not set"}</div>
                      <div>
                        Duration:{" "}
                        {r.expected_duration_value && r.expected_duration_unit
                          ? `${r.expected_duration_value} ${r.expected_duration_unit}`
                          : "Not set"}
                      </div>
                      <div>Hours per day: {r.hours_per_day ?? "Not set"}</div>
                      <div>Min years experience: {r.min_years_experience ?? "Not set"}</div>
                      <div>Tickets: {(r.required_tickets || []).join(", ") || "None"}</div>
                      <div>Overtime: {r.ot_options && r.ot_options.length ? r.ot_options.join(", ") : "None"}</div>
                      <div>Base rate offer: {r.base_rate_offer ?? "Not set"}</div>
                      <div>Travel allowance: {r.travel_allowance ?? "Not set"}</div>
                      <div>Notes: {r.notes || "None"}</div>
                      {Array.isArray(r.attachment_list) && r.attachment_list.length ? (
                        <div>
                          <strong>Attachments:</strong>
                          <div style={{ display: "grid", gap: "0.35rem", marginTop: "0.35rem" }}>
                            {r.attachment_list.map((item, index) => {
                              const name = typeof item === "string" ? item : item.name;
                              const description = typeof item === "string" ? "" : item.description || "";
                              const key = typeof item === "string" ? undefined : item.key;
                              return (
                                <div key={`${name}-${index}`} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                  <span>{name}</span>
                                  {description ? <span style={{ opacity: 0.7 }}>({description})</span> : null}
                                  {key ? (
                                    <a
                                      href={`/api/admin/requests/${r.request_id}/attachment?key=${encodeURIComponent(key)}`}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      Download
                                    </a>
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}
                      <div className={styles.gridThree}>
                        <div className={styles.field}>
                          <label className={styles.label}>Update status</label>
                          <select
                            className={styles.select}
                            value={edit.review_status}
                            onChange={(e) =>
                              setStatusEdits((prev) => ({
                                ...prev,
                                [r.request_id]: { ...edit, review_status: e.target.value },
                              }))
                            }
                          >
                            {REVIEW_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s.replace("_", " ")}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className={styles.field}>
                          <label className={styles.label}>Status notes (optional)</label>
                          <input
                            className={styles.input}
                            value={edit.status_reason}
                            onChange={(e) =>
                              setStatusEdits((prev) => ({
                                ...prev,
                                [r.request_id]: { ...edit, status_reason: e.target.value },
                              }))
                            }
                          />
                        </div>
                        <div className={styles.field} style={{ alignSelf: "end" }}>
                          <PrimaryButton type="button" onClick={() => updateStatus(r.request_id)}>
                            Save status
                          </PrimaryButton>
                        </div>
                      </div>
                      <div className={styles.actions}>
                        <SecondaryButton type="button" onClick={() => loadSuggestions(r.request_id)}>
                          Suggest workers
                        </SecondaryButton>
                        {canDelete ? (
                          <SecondaryButton type="button" onClick={() => deleteRequest(r.request_id)}>
                            Delete request
                          </SecondaryButton>
                        ) : null}
                      </div>
                      {suggestions[r.request_id]?.length ? (
                        <div style={{ display: "grid", gap: "0.5rem", marginTop: "0.5rem" }}>
                          {suggestions[r.request_id].map((c) => (
                            <div key={c.worker_id} className={styles.group} style={{ background: "#fff" }}>
                              <div>
                                <strong>{c.company_number}</strong> - {c.role_id} ({c.years_experience} yrs)
                              </div>
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
                              <div>Tickets: {c.tickets.map((t) => t.type).join(", ") || "None"}</div>
                              <div className={styles.actions}>
                                <PrimaryButton type="button" onClick={() => assignWorker(r.request_id, c.worker_id)}>
                                  Assign
                                </PrimaryButton>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
