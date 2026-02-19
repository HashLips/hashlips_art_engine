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
  reg_building_name?: string | null;
  reg_floor_level?: string | null;
  reg_street?: string | null;
  reg_state?: string | null;
  reg_postcode?: string | null;
  timesheet_approver_title?: string | null;
  timesheet_approver_first_name?: string | null;
  timesheet_approver_middle_name?: string | null;
  timesheet_approver_last_name?: string | null;
  timesheet_approver_position?: string | null;
  timesheet_approver_email?: string | null;
  timesheet_approver_mobile?: string | null;
  timesheet_approver_backup_title?: string | null;
  timesheet_approver_backup_first_name?: string | null;
  timesheet_approver_backup_middle_name?: string | null;
  timesheet_approver_backup_last_name?: string | null;
  timesheet_approver_backup_position?: string | null;
  timesheet_approver_backup_email?: string | null;
  timesheet_approver_backup_mobile?: string | null;
  invoice_contact_title?: string | null;
  invoice_contact_first_name?: string | null;
  invoice_contact_middle_name?: string | null;
  invoice_contact_last_name?: string | null;
  invoice_contact_email?: string | null;
  invoice_contact_mobile?: string | null;
  tfn?: string | null;
  accounts_payable_email_shared?: string | null;
  remittance_email?: string | null;
  purchase_order_required?: number | null;
  default_po_format?: string | null;
  po_required_for?: string | null;
  billing_address_line1?: string | null;
  billing_address_line2?: string | null;
  billing_building_name?: string | null;
  billing_floor_level?: string | null;
  billing_suburb?: string | null;
  billing_state?: string | null;
  billing_postcode?: string | null;
  billing_country?: string | null;
  service_interest_mode?: string | null;
  profile_file_name?: string | null;
  profile_file_type?: string | null;
  profile_file_content?: string | null;
  request_count?: number | null;
  latest_status?: string | null;
  policy_acceptance?: {
    client_terms?: boolean;
    privacy_policy?: boolean;
    frontend_terms?: boolean;
  };
};

type ClientEventsPayload = {
  ok: boolean;
  unreviewed_count: number;
  unreviewed_by_client: Record<string, { count: number; sections: string[] }>;
  events?: Array<{
    client_id: string;
    event_type: string;
    reviewed_at?: number | null;
    meta_json?: string | null;
  }>;
};
type ClientChangeDetail = {
  key: string;
  label: string;
  section: string;
  before: string;
  after: string;
};

export default function AdminClientsPage() {
  const DISMISSED_WARNINGS_KEY = "sr_admin_client_dismissed_warnings_v1";
  const [error, setError] = React.useState("");
  const [session, setSession] = React.useState<{ adminLevel?: string } | null>(null);
  const [clients, setClients] = React.useState<ClientItem[]>([]);
  const [clientEdits, setClientEdits] = React.useState<Record<string, Partial<ClientItem>>>({});
  const [openByClient, setOpenByClient] = React.useState<Record<string, boolean>>({});
  const [changesOpenByClient, setChangesOpenByClient] = React.useState<Record<string, boolean>>({});
  const [eventMap, setEventMap] = React.useState<Record<string, { count: number; sections: string[] }>>({});
  const [changedDetailMap, setChangedDetailMap] = React.useState<Record<string, ClientChangeDetail[]>>({});
  const [dismissedWarningsByClient, setDismissedWarningsByClient] = React.useState<Record<string, string[]>>({});
  const [targetClientId, setTargetClientId] = React.useState<string | null>(null);

  const canEditClients = session?.adminLevel === "super_admin";
  const canDelete = session?.adminLevel === "admin" || session?.adminLevel === "super_admin";

  const loadEvents = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/client-events?limit=200", {
        credentials: "include",
        cache: "no-store",
      });
      const data = (await res.json()) as ClientEventsPayload;
      if (res.ok && data?.unreviewed_by_client) {
        setEventMap(data.unreviewed_by_client);
        const detailByClient: Record<string, ClientChangeDetail[]> = {};
        for (const evt of data.events || []) {
          if (evt.event_type !== "client_profile_update") continue;
          const clientId = String(evt.client_id || "").trim();
          if (!clientId) continue;
          const metaRaw = String(evt.meta_json || "").trim();
          if (!metaRaw) continue;
          try {
            const meta = JSON.parse(metaRaw) as { changed_fields?: string[]; changed_details?: ClientChangeDetail[] };
            const details = Array.isArray(meta?.changed_details) ? meta.changed_details : [];
            if (!detailByClient[clientId]) detailByClient[clientId] = [];
            for (const d of details) {
              const key = String(d?.key || "").trim();
              if (!key) continue;
              if (detailByClient[clientId].some((x) => x.key === key && x.after === d.after && x.before === d.before)) continue;
              detailByClient[clientId].push({
                key,
                label: String(d?.label || key),
                section: String(d?.section || "General"),
                before: String(d?.before || "Not set"),
                after: String(d?.after || "Not set"),
              });
            }
          } catch {
            // Ignore malformed meta_json.
          }
        }
        setChangedDetailMap(detailByClient);
      }
    } catch {
      // Best effort.
    }
  }, []);

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
    if (typeof window === "undefined") return;
    const value = new URLSearchParams(window.location.search).get("clientId");
    setTargetClientId(value);
  }, []);
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(DISMISSED_WARNINGS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, string[]>;
      if (parsed && typeof parsed === "object") setDismissedWarningsByClient(parsed);
    } catch {
      // Ignore bad local storage payload.
    }
  }, []);
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(DISMISSED_WARNINGS_KEY, JSON.stringify(dismissedWarningsByClient));
    } catch {
      // Ignore write errors.
    }
  }, [dismissedWarningsByClient]);

  React.useEffect(() => {
    if (!session) return;
    if (session.adminLevel !== "admin" && session.adminLevel !== "super_admin") {
      setError("Admin access required.");
      return;
    }
    fetch("/api/admin/clients", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((json) => setClients(json.clients || []))
      .catch(() => setError("Unable to load clients."));
    void loadEvents();
  }, [session, loadEvents]);

  const markClientReviewed = React.useCallback(async (clientId: string) => {
    try {
      await fetch("/api/admin/client-events/review", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId }),
      });
      setEventMap((prev) => {
        const next = { ...prev };
        delete next[clientId];
        return next;
      });
    } catch {
      // Best effort.
    }
  }, []);

  React.useEffect(() => {
    if (!targetClientId) return;
    if (!clients.some((c) => c.client_id === targetClientId)) return;
    setOpenByClient((prev) => ({ ...prev, [targetClientId]: true }));
    if (eventMap[targetClientId]) {
      void markClientReviewed(targetClientId);
    }
  }, [targetClientId, clients, eventMap, markClientReviewed]);

  const toggleClient = async (clientId: string) => {
    const currentlyOpen = Boolean(openByClient[clientId]);
    const nextOpen = !currentlyOpen;
    setOpenByClient((prev) => ({ ...prev, [clientId]: nextOpen }));
    if (nextOpen && eventMap[clientId]) {
      await markClientReviewed(clientId);
    }
  };

  const updateClient = async (clientId: string) => {
    if (!canEditClients) return;
    const payload = clientEdits[clientId];
    if (!payload) return;
    const res = await fetch(`/api/admin/clients/${clientId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });
    if (!res.ok) {
      setError("Unable to update client.");
      return;
    }
    setClients((prev) => prev.map((c) => (c.client_id === clientId ? { ...c, ...payload } : c)));
    await loadEvents();
  };

  const deleteClient = async (clientId: string) => {
    if (!canDelete) return;
    if (!window.confirm("Delete this client and all related requests? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/clients/${clientId}/delete`, {
      method: "POST",
      credentials: "include",
    });
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

  const infoCardStyle: React.CSSProperties = {
    background: "var(--color-srCard)",
    border: "1px solid var(--color-srBorder)",
    borderRadius: "10px",
    padding: "0.55rem 0.65rem",
  };
  const infoLabelStyle: React.CSSProperties = {
    fontSize: "0.8rem",
    color: "var(--color-srMuted)",
    marginBottom: "0.15rem",
    fontWeight: 700,
  };
  const infoValueStyle: React.CSSProperties = {
    fontWeight: 700,
    color: "var(--color-srPrimary)",
    wordBreak: "break-word",
  };
  const detailId = (d: ClientChangeDetail) => `${d.key}|${d.before}|${d.after}`;
  const isDismissed = (clientId: string, d: ClientChangeDetail) =>
    (dismissedWarningsByClient[clientId] || []).includes(detailId(d));
  const visibleDetailsByClient = (clientId: string) =>
    (changedDetailMap[clientId] || []).filter((d) => !isDismissed(clientId, d));
  const dismissWarning = (clientId: string, d: ClientChangeDetail) => {
    const id = detailId(d);
    setDismissedWarningsByClient((prev) => {
      const current = prev[clientId] || [];
      if (current.includes(id)) return prev;
      return { ...prev, [clientId]: [...current, id] };
    });
  };
  const dismissAllWarnings = (clientId: string) => {
    const details = changedDetailMap[clientId] || [];
    if (!details.length) return;
    const ids = details.map(detailId);
    setDismissedWarningsByClient((prev) => ({ ...prev, [clientId]: Array.from(new Set(ids)) }));
  };
  const hasFieldChange = (clientId: string, keys: string[]) => {
    return visibleDetailsByClient(clientId).some((d) => keys.includes(d.key));
  };
  const sectionChanges = (clientId: string, keys: string[]) =>
    visibleDetailsByClient(clientId).filter((d) => keys.includes(d.key));
  const hasVisibleWarnings = (clientId: string) => visibleDetailsByClient(clientId).length > 0;
  const clientRef = (clientId: string) =>
    `CLT-${String(clientId || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6) || "UNKNOWN"}`;

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
        <div className={styles.groupHead}>
          <h3 style={{ margin: 0 }}>Clients</h3>
          <button className={styles.pillButton} type="button" onClick={() => void loadEvents()}>
            Refresh alerts
          </button>
        </div>
        {!canEditClients ? (
          <p className={styles.hint}>Client profiles are view-only for admin users.</p>
        ) : null}
        {clients.length === 0 ? (
          <p>No clients yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {clients.map((c) => {
              const hasRequests = (c.request_count || 0) > 0;
              const statusKey = hasRequests ? (c.latest_status || "submitted") : "none";
              const unreviewed = eventMap[c.client_id];
              const isOpen = Boolean(openByClient[c.client_id]);
              const changesOpen = changesOpenByClient[c.client_id] !== false;
              const warningsVisible = hasVisibleWarnings(c.client_id);
              return (
                <div
                  key={c.client_id}
                  className={`${styles.group} ${warningsVisible ? styles.pulseAlert : ""}`}
                >
                  <div className={styles.groupHead}>
                    <button
                      className={styles.pillButton}
                      type="button"
                      onClick={() => void toggleClient(c.client_id)}
                    >
                      {isOpen ? "Hide" : "Open"} {c.org_name || "Unnamed company"} ({clientRef(c.client_id)})
                    </button>
                    <span className={`${styles.statusBadge} ${styles[`status-${statusKey}`]}`}>
                      {hasRequests ? statusKey.replace("_", " ") : "No requests"}
                    </span>
                  </div>
                  {unreviewed && warningsVisible ? (
                    <div className={styles.warningBox} style={{ marginTop: "0.5rem" }}>
                      Needs review: {unreviewed.count} change(s) • Sections:{" "}
                      {unreviewed.sections.length ? unreviewed.sections.join(", ") : "general"}
                    </div>
                  ) : null}
                  {!isOpen ? null : (
                    <>
                      {warningsVisible ? (
                        <div className={`${styles.warningBox} ${styles.pulseAlert}`} style={{ marginTop: "0.65rem" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                            <div style={{ fontWeight: 800 }}>What changed (before {"->"} after)</div>
                            <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                              <button
                                type="button"
                                className={styles.pillButton}
                                onClick={() => setChangesOpenByClient((prev) => ({ ...prev, [c.client_id]: !changesOpen }))}
                              >
                                {changesOpen ? "Close" : "Open"}
                              </button>
                              <button
                                type="button"
                                className={styles.pillButton}
                                onClick={() => dismissAllWarnings(c.client_id)}
                              >
                                Understood
                              </button>
                            </div>
                          </div>
                          {changesOpen ? (
                            <div style={{ display: "grid", gap: "0.3rem", marginTop: "0.4rem" }}>
                              {visibleDetailsByClient(c.client_id).map((d, i) => (
                                <div
                                  key={`${d.key}-${i}`}
                                  style={{ fontSize: "0.92rem", lineHeight: 1.35, display: "flex", justifyContent: "space-between", gap: "0.5rem", flexWrap: "wrap" }}
                                >
                                  <div>
                                    <strong>{d.section}</strong> | {d.label}: <em>{d.before}</em> {"->"} <em>{d.after}</em>
                                  </div>
                                  <div style={{ display: "flex", gap: "0.35rem" }}>
                                    <button type="button" className={styles.pillButton} onClick={() => dismissWarning(c.client_id, d)}>
                                      Understood
                                    </button>
                                    <button type="button" className={styles.pillButton} onClick={() => dismissWarning(c.client_id, d)}>
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                      {canEditClients ? (
                        <div className={styles.gridThree} style={{ marginTop: "0.75rem" }}>
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
                            <PrimaryButton type="button" onClick={() => void updateClient(c.client_id)}>
                              Save client
                            </PrimaryButton>
                          </div>
                        </div>
                      ) : null}
                      <div style={{ marginTop: "0.75rem", display: "grid", gap: "0.75rem" }}>
                        <div style={{ fontWeight: 700 }}>Company & contact</div>
                        <div className={styles.gridThree}>
                          {[
                            ["Client Ref", clientRef(c.client_id), []],
                            ["Client ID", c.client_id, []],
                            ["Structure", c.structure || "Not set", ["structure"]],
                            ["ACN", c.acn || "Not set", ["acn"]],
                            ["ABN", c.abn || "Not set", ["abn"]],
                            ["TFN", c.tfn || "Not set", ["tfn"]],
                            ["Website", c.website || "Not set", ["website"]],
                            [
                              "Service Interest",
                              c.service_interest_mode === "notify_future"
                                ? "Notify when coverage available"
                                : c.service_interest_mode === "declined"
                                  ? "Declined continuation"
                                  : "Request labour now",
                              ["service_interest_mode"],
                            ],
                            ["Contact", `${c.contact_title ? `${c.contact_title} ` : ""}${c.contact_name || "Not set"}`, ["contact_title", "contact_name"]],
                            ["Job Title", c.contact_job_title || "Not set", ["contact_job_title"]],
                            ["Email", c.contact_email || "Not set", ["contact_email"]],
                            ["Mobile", c.contact_mobile || "Not set", ["contact_mobile"]],
                            ["Landline", c.contact_landline || "Not set", ["contact_landline"]],
                            ["Preferred Contact Time", c.preferred_contact_time || "Not set", ["preferred_contact_time"]],
                            ["Registered Street", c.reg_street || "Not set", ["reg_street"]],
                            ["Registered Building", c.reg_building_name || "Not set", ["reg_building_name"]],
                            ["Registered Floor", c.reg_floor_level || "Not set", ["reg_floor_level"]],
                            ["Location", `${c.reg_state || "-"} ${c.reg_postcode || "-"}`.trim(), ["reg_state", "reg_postcode"]],
                          ].map(([label, value, keys]) => (
                            <div
                              key={String(label)}
                              style={infoCardStyle}
                              className={hasFieldChange(c.client_id, (keys as string[]) || []) ? styles.pulseAlert : undefined}
                            >
                              <div style={infoLabelStyle}>{label}</div>
                              <div style={infoValueStyle}>{String(value)}</div>
                            </div>
                          ))}
                        </div>

                        <div style={{ fontWeight: 700 }}>Timesheet approvers</div>
                        <div className={styles.gridTwo}>
                          <div style={infoCardStyle}>
                            <div style={infoLabelStyle}>Primary approver</div>
                            <div style={infoValueStyle}>
                              {[c.timesheet_approver_title, c.timesheet_approver_first_name, c.timesheet_approver_middle_name, c.timesheet_approver_last_name]
                                .filter(Boolean)
                                .join(" ") || "Not set"}
                            </div>
                            <div className={styles.hint}>Position: {c.timesheet_approver_position || "Not set"}</div>
                            <div className={styles.hint}>Email: {c.timesheet_approver_email || "Not set"}</div>
                            <div className={styles.hint}>Mobile: {c.timesheet_approver_mobile || "Not set"}</div>
                          </div>
                          <div style={infoCardStyle}>
                            <div style={infoLabelStyle}>Backup approver</div>
                            <div style={infoValueStyle}>
                              {[c.timesheet_approver_backup_title, c.timesheet_approver_backup_first_name, c.timesheet_approver_backup_middle_name, c.timesheet_approver_backup_last_name]
                                .filter(Boolean)
                                .join(" ") || "Not set"}
                            </div>
                            <div className={styles.hint}>Position: {c.timesheet_approver_backup_position || "Not set"}</div>
                            <div className={styles.hint}>Email: {c.timesheet_approver_backup_email || "Not set"}</div>
                            <div className={styles.hint}>Mobile: {c.timesheet_approver_backup_mobile || "Not set"}</div>
                          </div>
                        </div>

                        <div style={{ fontWeight: 700 }}>Invoicing / Accounts payable</div>
                        <div className={styles.gridThree}>
                          {[
                            [
                              "Invoice Contact",
                              [c.invoice_contact_title, c.invoice_contact_first_name, c.invoice_contact_middle_name, c.invoice_contact_last_name]
                                .filter(Boolean)
                                .join(" ") || "Not set",
                              ["invoice_contact_title", "invoice_contact_first_name", "invoice_contact_middle_name", "invoice_contact_last_name"],
                            ],
                            ["Invoice Contact Email", c.invoice_contact_email || "Not set", ["invoice_contact_email"]],
                            ["Invoice Contact Mobile", c.invoice_contact_mobile || "Not set", ["invoice_contact_mobile"]],
                            ["AP Shared Email", c.accounts_payable_email_shared || "Not set", ["accounts_payable_email_shared"]],
                            ["Remittance Email", c.remittance_email || "Not set", ["remittance_email"]],
                            [
                              "PO Required",
                              `${Number(c.purchase_order_required) === 1 ? "Yes" : "No"} (${c.po_required_for || "every_booking"})`,
                              ["purchase_order_required", "po_required_for"],
                            ],
                            ["Default PO Format", c.default_po_format || "Not set", ["default_po_format"]],
                            ["Profile File", c.profile_file_name || "Not set", ["profile_file_name"]],
                          ].map(([label, value, keys]) => (
                            <div
                              key={String(label)}
                              style={infoCardStyle}
                              className={hasFieldChange(c.client_id, (keys as string[]) || []) ? styles.pulseAlert : undefined}
                            >
                              <div style={infoLabelStyle}>{label}</div>
                              <div style={infoValueStyle}>{String(value)}</div>
                            </div>
                          ))}
                        </div>

                        <div style={{ fontWeight: 700 }}>Billing address</div>
                        {sectionChanges(c.client_id, [
                          "billing_address_line1",
                          "billing_address_line2",
                          "billing_building_name",
                          "billing_floor_level",
                          "billing_suburb",
                          "billing_state",
                          "billing_postcode",
                          "billing_country",
                        ]).length ? (
                          <div className={`${styles.warningBox} ${styles.pulseAlert}`} style={{ marginTop: "0.35rem" }}>
                            <div style={{ fontWeight: 800, marginBottom: "0.25rem" }}>
                              Billing changes (before {"->"} after)
                            </div>
                            {sectionChanges(c.client_id, [
                              "billing_address_line1",
                              "billing_address_line2",
                              "billing_building_name",
                              "billing_floor_level",
                              "billing_suburb",
                              "billing_state",
                              "billing_postcode",
                              "billing_country",
                            ]).map((d, i) => (
                              <div key={`${d.key}-billing-${i}`} style={{ fontSize: "0.92rem", lineHeight: 1.35 }}>
                                <strong>{d.label}</strong>: <em>{d.before}</em> {"->"} <em>{d.after}</em>
                              </div>
                            ))}
                          </div>
                        ) : null}
                        <div
                          style={infoCardStyle}
                          className={
                            hasFieldChange(c.client_id, [
                              "billing_address_line1",
                              "billing_address_line2",
                              "billing_building_name",
                              "billing_floor_level",
                              "billing_suburb",
                              "billing_state",
                              "billing_postcode",
                              "billing_country",
                            ])
                              ? styles.pulseAlert
                              : undefined
                          }
                        >
                          <div style={infoLabelStyle}>Address</div>
                          <div style={infoValueStyle}>
                            {[
                              c.billing_address_line1,
                              c.billing_address_line2,
                              c.billing_building_name,
                              c.billing_floor_level,
                              c.billing_suburb,
                              c.billing_state,
                              c.billing_postcode,
                              c.billing_country,
                            ]
                              .filter(Boolean)
                              .join(", ") || "Not set"}
                          </div>
                        </div>

                        <div style={{ fontWeight: 700 }}>Policy acceptance</div>
                        <div className={styles.gridFour}>
                          {[
                            ["Client Terms", c.policy_acceptance?.client_terms],
                            ["Privacy Policy", c.policy_acceptance?.privacy_policy],
                            ["Website Terms", c.policy_acceptance?.frontend_terms],
                          ].map(([label, accepted]) => (
                            <div key={String(label)} style={infoCardStyle}>
                              <div style={infoLabelStyle}>{label}</div>
                              <div
                                style={{
                                  ...infoValueStyle,
                                  color: accepted ? "#16a34a" : "#dc2626",
                                }}
                              >
                                {accepted ? "Accepted" : "Not accepted"}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className={styles.actions}>
                        <SecondaryButton href={`/dashboard/admin/requests?clientId=${c.client_id}`}>
                          View requests
                        </SecondaryButton>
                        {canDelete ? (
                          <SecondaryButton type="button" onClick={() => void deleteClient(c.client_id)}>
                            Delete client
                          </SecondaryButton>
                        ) : null}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
