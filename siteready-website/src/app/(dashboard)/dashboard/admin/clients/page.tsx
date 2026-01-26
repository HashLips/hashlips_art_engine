"use client";

import React from "react";
import styles from "@/components/booking/BookLabourNowForm.module.css";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";

type ClientItem = {
  client_id: string;
  org_name?: string | null;
  structure?: string | null;
  acn?: string | null;
  abn?: string | null;
  website?: string | null;
  contact_title?: string | null;
  contact_email?: string | null;
  contact_name?: string | null;
  contact_job_title?: string | null;
  contact_mobile?: string | null;
  contact_landline?: string | null;
  preferred_contact_time?: string | null;
  reg_street?: string | null;
  reg_state?: string | null;
  reg_postcode?: string | null;
  tfn?: string | null;
  profile_file_name?: string | null;
  profile_file_type?: string | null;
  profile_file_content?: string | null;
  request_count?: number | null;
  latest_status?: string | null;
};

export default function AdminClientsPage() {
  const [error, setError] = React.useState("");
  const [session, setSession] = React.useState<{ adminLevel?: string } | null>(null);
  const [clients, setClients] = React.useState<ClientItem[]>([]);
  const [clientEdits, setClientEdits] = React.useState<Record<string, Partial<ClientItem>>>({});

  const canEditClients = session?.adminLevel === "super_admin";
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
    fetch("/api/admin/clients")
      .then((r) => r.json())
      .then((json) => setClients(json.clients || []))
      .catch(() => setError("Unable to load clients."));
  }, [session]);

  const updateClient = async (clientId: string) => {
    if (!canEditClients) return;
    const payload = clientEdits[clientId];
    if (!payload) return;
    const res = await fetch(`/api/admin/clients/${clientId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setError("Unable to update client.");
      return;
    }
    setClients((prev) => prev.map((c) => (c.client_id === clientId ? { ...c, ...payload } : c)));
  };

  const deleteClient = async (clientId: string) => {
    if (!canDelete) return;
    if (!window.confirm("Delete this client and all related requests? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/clients/${clientId}/delete`, { method: "POST" });
    if (!res.ok) {
      setError("Unable to delete client.");
      return;
    }
    setClients((prev) => prev.filter((c) => c.client_id !== clientId));
  };

  if (error) {
    return (
      <div className={styles.form} style={{ maxWidth: 720, margin: "2rem auto" }}>
        <div className={styles.errorSummary}>{error}</div>
      </div>
    );
  }

  const filtered = clients;

  return (
    <div className={styles.form} style={{ maxWidth: 1040, margin: "2rem auto" }}>
      <div className={styles.formHeader}>
        <h2>Manage clients</h2>
        <p>Client profiles and request status.</p>
        <div className={styles.formHeaderActions}>
          <SecondaryButton href="/dashboard/admin">Back to dashboard</SecondaryButton>
          <SecondaryButton href="/dashboard/admin/requests">View requests</SecondaryButton>
          <SecondaryButton href="/dashboard/admin/workers">Manage workers</SecondaryButton>
          <SecondaryButton href="/dashboard/admin/access">Access & roles</SecondaryButton>
          <SecondaryButton href="/logout">Log out</SecondaryButton>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Clients</h3>
        {!canEditClients && <p className={styles.hint}>Client profiles are view-only for admin users.</p>}
        {filtered.length === 0 ? (
          <p>No clients yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {filtered.map((c) => {
              const hasRequests = (c.request_count || 0) > 0;
              const statusKey = hasRequests ? (c.latest_status || "submitted") : "none";
              return (
                <div key={c.client_id} className={styles.group}>
                  <div className={styles.groupHead}>
                    <div>
                      <strong>{c.org_name || "Unnamed company"}</strong>
                    </div>
                    <span className={`${styles.statusBadge} ${styles[`status-${statusKey}`]}`}>
                      {hasRequests ? statusKey.replace("_", " ") : "No requests"}
                    </span>
                  </div>
                  {canEditClients ? (
                    <div className={styles.gridThree}>
                      <div className={styles.field}>
                        <label className={styles.label}>Company name</label>
                        <input
                          className={styles.input}
                          value={(clientEdits[c.client_id]?.org_name ?? c.org_name ?? "") as string}
                          onChange={(e) =>
                            setClientEdits((prev) => ({
                              ...prev,
                              [c.client_id]: { ...(prev[c.client_id] || {}), org_name: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <div className={styles.field}>
                        <label className={styles.label}>Contact name</label>
                        <input
                          className={styles.input}
                          value={(clientEdits[c.client_id]?.contact_name ?? c.contact_name ?? "") as string}
                          onChange={(e) =>
                            setClientEdits((prev) => ({
                              ...prev,
                              [c.client_id]: { ...(prev[c.client_id] || {}), contact_name: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <div className={styles.field}>
                        <label className={styles.label}>Contact email</label>
                        <input
                          className={styles.input}
                          value={(clientEdits[c.client_id]?.contact_email ?? c.contact_email ?? "") as string}
                          onChange={(e) =>
                            setClientEdits((prev) => ({
                              ...prev,
                              [c.client_id]: { ...(prev[c.client_id] || {}), contact_email: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <div className={styles.field}>
                        <label className={styles.label}>State</label>
                        <input
                          className={styles.input}
                          value={(clientEdits[c.client_id]?.reg_state ?? c.reg_state ?? "") as string}
                          onChange={(e) =>
                            setClientEdits((prev) => ({
                              ...prev,
                              [c.client_id]: { ...(prev[c.client_id] || {}), reg_state: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <div className={styles.field}>
                        <label className={styles.label}>Postcode</label>
                        <input
                          className={styles.input}
                          value={(clientEdits[c.client_id]?.reg_postcode ?? c.reg_postcode ?? "") as string}
                          onChange={(e) =>
                            setClientEdits((prev) => ({
                              ...prev,
                              [c.client_id]: { ...(prev[c.client_id] || {}), reg_postcode: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <div className={styles.field} style={{ alignSelf: "end" }}>
                        <PrimaryButton type="button" onClick={() => updateClient(c.client_id)}>
                          Save client
                        </PrimaryButton>
                      </div>
                    </div>
                  ) : null}
                  <div style={{ marginTop: "0.75rem", display: "grid", gap: "0.25rem" }}>
                    <div>Structure: {c.structure || "Not set"}</div>
                    <div>ACN: {c.acn || "Not set"}</div>
                    <div>ABN: {c.abn || "Not set"}</div>
                    <div>TFN: {c.tfn || "Not set"}</div>
                    <div>Website: {c.website || "Not set"}</div>
                    <div>Contact: {c.contact_title ? `${c.contact_title} ` : ""}{c.contact_name || "Not set"}</div>
                    <div>Job title: {c.contact_job_title || "Not set"}</div>
                    <div>Email: {c.contact_email || "Not set"}</div>
                    <div>Mobile: {c.contact_mobile || "Not set"}</div>
                    <div>Landline: {c.contact_landline || "Not set"}</div>
                    <div>Preferred contact time: {c.preferred_contact_time || "Not set"}</div>
                    <div>Registered street: {c.reg_street || "Not set"}</div>
                    <div>Location: {c.reg_state || "-"} {c.reg_postcode || "-"}</div>
                    <div>Profile file: {c.profile_file_name || "Not set"}</div>
                  </div>
                  <div className={styles.actions}>
                    <SecondaryButton href={`/dashboard/admin/requests?clientId=${c.client_id}`}>
                      View requests
                    </SecondaryButton>
                    {canDelete ? (
                      <SecondaryButton type="button" onClick={() => deleteClient(c.client_id)}>
                        Delete client
                      </SecondaryButton>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
