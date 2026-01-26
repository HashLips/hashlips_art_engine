"use client";

import React from "react";
import styles from "@/components/booking/BookLabourNowForm.module.css";
import SecondaryButton from "@/components/SecondaryButton";
import StatusBadge from "@/components/shared/StatusBadge";

type WorkerItem = {
  worker_id: string;
  company_number?: string | null;
  name?: string | null;
  email?: string | null;
  role_id?: string | null;
  verified_status?: string | null;
  delete_requested?: number | null;
  working_now_status?: string | null;
  availability_from_date?: string | null;
  availability_until_date?: string | null;
  holiday_start_date?: string | null;
  holiday_end_date?: string | null;
};

type WorkerDetails = {
  worker_id: string;
  company_number?: string | null;
  name?: string | null;
  email?: string | null;
  title?: string | null;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  dob?: string | null;
  mobile?: string | null;
  phone?: string | null;
  role_id?: string | null;
  verified_status?: string | null;
  working_now_status?: string | null;
  availability_from_date?: string | null;
  availability_until_date?: string | null;
  holiday_start_date?: string | null;
  holiday_end_date?: string | null;
  address_street?: string | null;
  address_city?: string | null;
  address_state?: string | null;
  address_postcode?: string | null;
  address_number?: string | null;
  address_floor?: string | null;
  address_unit?: string | null;
  address_building?: string | null;
  company_name?: string | null;
  company_structure?: string | null;
  company_abn?: string | null;
  company_acn?: string | null;
  company_website?: string | null;
  company_address_street?: string | null;
  company_address_number?: string | null;
  company_address_postcode?: string | null;
  has_own_abn?: number | null;
  bank_name?: string | null;
  bank_account_name?: string | null;
  bank_bsb?: string | null;
  bank_account_number?: string | null;
  company_bank_account_name?: string | null;
  company_bank_bsb?: string | null;
  company_bank_account_number?: string | null;
  super_fund_name?: string | null;
  super_product_name?: string | null;
  super_choice?: string | null;
  super_status?: string | null;
  super_contribution_restrictions?: number | null;
  super_fund_type?: string | null;
  super_abn?: string | null;
  super_usi?: string | null;
  smsf_abn?: string | null;
  smsf_bank_bsb?: string | null;
  smsf_bank_account?: string | null;
  smsf_bank_account_name?: string | null;
  smsf_esa?: string | null;
  super_member_number?: string | null;
  tfn?: string | null;
  emergency_contact_title?: string | null;
  emergency_contact_first_name?: string | null;
  emergency_contact_family_name?: string | null;
  emergency_contact_mobile?: string | null;
  emergency_contact_email?: string | null;
  privacy_agreed?: number | null;
  indemnity_agreed?: number | null;
  delete_requested_at?: string | null;
  delete_request_reason?: string | null;
  drivers_license_front_name?: string | null;
  drivers_license_back_name?: string | null;
  id_document_type?: string | null;
  id_document_front_name?: string | null;
  id_document_back_name?: string | null;
  id_verification_status?: string | null;
  id_verification_notes?: string | null;
  license_verification_status?: string | null;
  license_verification_notes?: string | null;
  work_experience?: Array<{
    site_name?: string;
    position?: string;
    start_date?: string;
    end_date?: string;
    reason?: string;
    reason_other?: string;
    reference_name?: string;
    reference_position?: string;
    reference_position_other?: string;
    reference_mobile?: string;
    reference_phone?: string;
    reference_email?: string;
    notes?: string;
    work_media?: Array<{
      name?: string;
      key?: string;
      type?: string;
      description?: string;
      verification_status?: string | null;
      verification_notes?: string | null;
    }>;
  }>;
  work_media?: Array<{
    name?: string;
    key?: string;
    type?: string;
    description?: string;
    verification_status?: string | null;
    verification_notes?: string | null;
  }>;
  work_comments?: string | null;
  encryptionAvailable?: boolean;
  delete_requested?: number | null;
  tickets?: Array<{
    ticket_id: string;
    type: string;
    verification_status?: string | null;
    verification_notes?: string | null;
    front_image_key?: string | null;
    back_image_key?: string | null;
    front_image_name?: string | null;
    back_image_name?: string | null;
    expiry_date?: string | null;
    renewal_status?: string | null;
  }>;
};

type TaxDeclarationSummary = {
  tax_residency_status?: string | null;
  employment_basis?: string | null;
  claim_tax_free_threshold?: number | null;
  has_study_training_loan?: number | null;
  has_sfss_debt?: number | null;
  tfn_status?: string | null;
  tfn_last4?: string | null;
  tfn_declaration_signed?: number | null;
  tfn_declaration_signed_at?: string | null;
};

type TaxDeclarationSummaryItem = {
  worker_id: string;
  name?: string | null;
  email?: string | null;
  signed: boolean;
  whmThreshold: boolean;
  missing: boolean;
};

type SuperFundResult = {
  fundName: string;
  abn: string;
};

type SuperFundProduct = {
  productName: string;
  usi: string;
  contributionRestrictions: number;
  fromDate?: string | null;
  toDate?: string | null;
};

type SuperEdit = {
  choice?: string;
  status?: string;
  fundName?: string;
  productName?: string;
  abn?: string;
  usi?: string;
  restrictions?: number;
  memberNumber?: string;
  smsfAbn?: string;
  smsfBankBsb?: string;
  smsfBankAccount?: string;
  smsfBankAccountName?: string;
  smsfEsa?: string;
};

export default function AdminWorkersPage() {
  const [error, setError] = React.useState("");
  const [session, setSession] = React.useState<{ adminLevel?: string } | null>(null);
  const [workers, setWorkers] = React.useState<WorkerItem[]>([]);
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
  const [details, setDetails] = React.useState<Record<string, WorkerDetails | null>>({});
  const [detailError, setDetailError] = React.useState<Record<string, string>>({});
  const [previewModal, setPreviewModal] = React.useState<{ src: string; alt: string } | null>(null);
  const [statusEdits, setStatusEdits] = React.useState<Record<string, { idStatus?: string; idNotes?: string; licenseStatus?: string; licenseNotes?: string }>>({});
  const [ticketEdits, setTicketEdits] = React.useState<Record<string, { status?: string; notes?: string; renewal?: string }>>({});
  const [mediaEdits, setMediaEdits] = React.useState<Record<string, { status?: string; notes?: string }>>({});
  const [approveWarnings, setApproveWarnings] = React.useState<Record<string, boolean>>({});
  const [syncMessages, setSyncMessages] = React.useState<Record<string, string>>({});
  const [syncBusy, setSyncBusy] = React.useState<Record<string, boolean>>({});
  const [superEdits, setSuperEdits] = React.useState<Record<string, SuperEdit>>({});
  const [superQueries, setSuperQueries] = React.useState<Record<string, string>>({});
  const [superResults, setSuperResults] = React.useState<Record<string, SuperFundResult[]>>({});
  const [superProducts, setSuperProducts] = React.useState<Record<string, SuperFundProduct[]>>({});
  const [superLoading, setSuperLoading] = React.useState<Record<string, boolean>>({});
  const [superProductLoading, setSuperProductLoading] = React.useState<Record<string, boolean>>({});
  const [superMessages, setSuperMessages] = React.useState<Record<string, string>>({});
  const [taxDeclarations, setTaxDeclarations] = React.useState<Record<string, TaxDeclarationSummary | null>>({});
  const [taxDeclarationSummaries, setTaxDeclarationSummaries] = React.useState<TaxDeclarationSummaryItem[]>([]);
  const [mapsKey, setMapsKey] = React.useState("");
  const cardStyle = {
    border: "1px solid var(--color-srBorder)",
    borderRadius: 18,
    padding: "1rem",
    background: "var(--color-srCard)",
  };
  const cardBorderColor = "var(--color-srBorder)";
  const statusToneFor = (status?: string | null) => {
    const value = (status || "unverified").toLowerCase();
    if (["verified", "approved", "signed", "active", "completed"].includes(value)) return "success";
    if (["pending", "under_review"].includes(value)) return "pending";
    if (["needs_clearer", "out_of_date", "rejected", "missing", "declined", "expired"].includes(value)) return "danger";
    return "neutral";
  };
  const formatStatusLabel = (status?: string | null) =>
    (status || "unverified").replace(/_/g, " ");
  const expiryCountdown = (expiryDate?: string | null) => {
    if (!expiryDate) return "";
    const end = new Date(expiryDate);
    if (Number.isNaN(end.getTime())) return "";
    const today = new Date();
    const diffDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "Expired";
    return `Expires in ${diffDays} day${diffDays === 1 ? "" : "s"}`;
  };
  const combinedDocStatus = (worker: WorkerDetails | null) => {
    if (!worker) return "pending";
    const licenseStatus = worker.license_verification_status || "pending";
    const idStatus = worker.id_verification_status || "pending";
    if (licenseStatus === "verified" && idStatus === "verified") return "verified";
    if ([licenseStatus, idStatus].includes("needs_clearer")) return "needs_clearer";
    if ([licenseStatus, idStatus].includes("out_of_date")) return "out_of_date";
    if ([licenseStatus, idStatus].includes("rejected")) return "rejected";
    return "pending";
  };
  const needsApproval = (worker: WorkerDetails | null) => {
    if (!worker) return false;
    const hasLicenseDocs = !!worker.drivers_license_front_name || !!worker.drivers_license_back_name;
    const hasIdDocs = !!worker.id_document_front_name || !!worker.id_document_back_name;
    const licenseOk = !hasLicenseDocs || worker.license_verification_status === "verified";
    const idOk = !hasIdDocs || worker.id_verification_status === "verified";
    const ticketsOk = !(worker.tickets || []).some((t) => t.verification_status !== "verified");
    const workMediaItems = [
      ...(worker.work_media || []),
      ...((worker.work_experience || []).flatMap((exp) => exp.work_media || [])),
    ].filter((media) => media?.key);
    const mediaOk = workMediaItems.every((media) => media.verification_status === "verified");
    return !(licenseOk && idOk && ticketsOk && mediaOk);
  };
  const previewBoxStyle = {
    width: 140,
    height: 96,
    borderRadius: 12,
    overflow: "hidden",
  };
  const previewImgStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
    display: "block",
  };

  const formatWorkerId = (worker: { name?: string | null; company_number?: string | null }) => {
    const safeName = (worker.name || "worker").trim().replace(/\s+/g, "-");
    const digits = (worker.company_number || "00000").replace(/\D/g, "").slice(-5).padStart(5, "0");
    return `${safeName}-${digits}`;
  };
  const formatFullName = (worker: { first_name?: string | null; middle_name?: string | null; last_name?: string | null; name?: string | null }) =>
    [worker.first_name, worker.middle_name, worker.last_name].filter(Boolean).join(" ") || worker.name || "Not set";

  const formatAddress = (worker: WorkerDetails | null) => {
    if (!worker) return "";
    return [
      worker.address_unit ? `Unit ${worker.address_unit}` : "",
      worker.address_floor ? `Floor ${worker.address_floor}` : "",
      worker.address_number || "",
      worker.address_building || "",
      worker.address_street || "",
      worker.address_city || "",
      worker.address_state || "",
      worker.address_postcode || "",
    ]
      .filter(Boolean)
      .join(" ");
  };

  const addressForMap = (worker: WorkerDetails | null) => encodeURIComponent(formatAddress(worker));

  const docUrl = (workerId: string, type: string) =>
    `/api/admin/workers/${encodeURIComponent(workerId)}/document?type=${encodeURIComponent(type)}`;
  const ticketImageUrl = (workerId: string, ticketId: string, side: "front" | "back") =>
    `/api/admin/workers/${encodeURIComponent(workerId)}/tickets/${encodeURIComponent(ticketId)}/image?side=${side}`;
  const mediaUrl = (workerId: string, key: string) =>
    `/api/admin/workers/${encodeURIComponent(workerId)}/media?key=${encodeURIComponent(key)}`;

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
    fetch("/api/public-config")
      .then((res) => res.json())
      .then((data) => {
        if (data?.mapsKey) setMapsKey(data.mapsKey);
      })
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    if (!session) return;
    if (session.adminLevel !== "admin" && session.adminLevel !== "super_admin") {
      setError("Admin access required.");
      return;
    }
    fetch("/api/admin/workers")
      .then((r) => r.json())
      .then((json) => setWorkers(json.workers || []))
      .catch(() => setError("Unable to load workers."));
    fetch("/api/admin/workers/tax-declarations")
      .then((r) => r.json())
      .then((json) => setTaxDeclarationSummaries(json.summaries || []))
      .catch(() => null);
  }, [session]);

  const loadDetails = async (workerId: string) => {
    setDetailError((prev) => ({ ...prev, [workerId]: "" }));
    const res = await fetch(`/api/admin/workers/${workerId}`);
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      setDetailError((prev) => ({ ...prev, [workerId]: json?.error || "Unable to load worker details." }));
      return;
    }
    const worker = json.worker as WorkerDetails;
    setDetails((prev) => ({
      ...prev,
      [workerId]: {
        ...worker,
        tickets: json.tickets || [],
      },
    }));
    setSuperEdits((prev) => ({
      ...prev,
      [workerId]: {
        choice: worker.super_choice || worker.super_fund_type || "",
        status: worker.super_status || "",
        fundName: worker.super_fund_name || "",
        productName: worker.super_product_name || "",
        abn: worker.super_abn || "",
        usi: worker.super_usi || "",
        restrictions: worker.super_contribution_restrictions ?? 0,
        memberNumber: worker.super_member_number || "",
        smsfAbn: worker.smsf_abn || "",
        smsfBankBsb: worker.smsf_bank_bsb || "",
        smsfBankAccount: worker.smsf_bank_account || "",
        smsfBankAccountName: worker.smsf_bank_account_name || "",
        smsfEsa: worker.smsf_esa || "",
      },
    }));
    setSuperQueries((prev) => ({ ...prev, [workerId]: worker.super_fund_name || "" }));
    fetch(`/api/worker/tax-declaration?worker_id=${encodeURIComponent(workerId)}`)
      .then((r) => r.json())
      .then((taxJson) => {
        setTaxDeclarations((prev) => ({
          ...prev,
          [workerId]: taxJson?.declaration || null,
        }));
      })
      .catch(() => {
        setTaxDeclarations((prev) => ({
          ...prev,
          [workerId]: null,
        }));
      });
  };
  const superSearchTimers = React.useRef<Record<string, number>>({});
  const updateSuperEdit = (workerId: string, patch: Partial<SuperEdit>) => {
    setSuperEdits((prev) => ({
      ...prev,
      [workerId]: { ...prev[workerId], ...patch },
    }));
  };
  const searchSuperFunds = (workerId: string, query: string) => {
    setSuperQueries((prev) => ({ ...prev, [workerId]: query }));
    if (superSearchTimers.current[workerId]) {
      window.clearTimeout(superSearchTimers.current[workerId]);
    }
    if (query.trim().length < 2) {
      setSuperResults((prev) => ({ ...prev, [workerId]: [] }));
      return;
    }
    superSearchTimers.current[workerId] = window.setTimeout(async () => {
      setSuperLoading((prev) => ({ ...prev, [workerId]: true }));
      try {
        const res = await fetch(`/api/superfunds/search?q=${encodeURIComponent(query.trim())}`);
        const json = await res.json();
        setSuperResults((prev) => ({ ...prev, [workerId]: json?.results || [] }));
      } catch {
        setSuperResults((prev) => ({ ...prev, [workerId]: [] }));
      } finally {
        setSuperLoading((prev) => ({ ...prev, [workerId]: false }));
      }
    }, 300);
  };
  const loadSuperProducts = async (workerId: string, abn: string) => {
    setSuperProductLoading((prev) => ({ ...prev, [workerId]: true }));
    try {
      const res = await fetch(`/api/superfunds/products?abn=${encodeURIComponent(abn)}`);
      const json = await res.json();
      setSuperProducts((prev) => ({ ...prev, [workerId]: json?.products || [] }));
    } catch {
      setSuperProducts((prev) => ({ ...prev, [workerId]: [] }));
    } finally {
      setSuperProductLoading((prev) => ({ ...prev, [workerId]: false }));
    }
  };
  const saveSuperDetails = async (workerId: string) => {
    const edit = superEdits[workerId];
    if (!edit) return;
    setSuperMessages((prev) => ({ ...prev, [workerId]: "" }));
    const payload = {
      super_choice: edit.choice || "",
      super_status: edit.status || (edit.choice === "STAPLED" ? "PENDING_PAYROLL" : ""),
      super_fund_type: edit.choice || "",
      super_fund_name: edit.fundName || "",
      super_product_name: edit.productName || "",
      super_abn: edit.abn || "",
      super_usi: edit.usi || "",
      super_member_number: edit.memberNumber || "",
      super_contribution_restrictions: edit.restrictions ?? 0,
      smsf_abn: edit.smsfAbn || "",
      smsf_bank_bsb: edit.smsfBankBsb || "",
      smsf_bank_account: edit.smsfBankAccount || "",
      smsf_bank_account_name: edit.smsfBankAccountName || "",
      smsf_esa: edit.smsfEsa || "",
    };
    const res = await fetch(`/api/admin/workers/${workerId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      setSuperMessages((prev) => ({ ...prev, [workerId]: json?.error || "Unable to save super details." }));
      return;
    }
    setSuperMessages((prev) => ({ ...prev, [workerId]: "Super details saved." }));
    await loadDetails(workerId);
  };

  const toggleWorker = (workerId: string) => {
    setExpanded((prev) => {
      const next = { ...prev, [workerId]: !prev[workerId] };
      return next;
    });
    if (!details[workerId]) {
      void loadDetails(workerId);
    }
  };

  const deleteWorker = async (workerId: string) => {
    if (!confirm("Delete this worker? This removes the worker and user record.")) return;
    const res = await fetch(`/api/admin/workers/${workerId}/delete`, { method: "POST" });
    if (!res.ok) {
      setError("Unable to delete worker.");
      return;
    }
    setWorkers((prev) => prev.filter((w) => w.worker_id !== workerId));
    setExpanded((prev) => ({ ...prev, [workerId]: false }));
    setDetails((prev) => ({ ...prev, [workerId]: null }));
  };

  const updateWorkerStatuses = async (workerId: string) => {
    const update = statusEdits[workerId];
    if (!update) return;
    const res = await fetch(`/api/admin/workers/${workerId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_verification_status: update.idStatus,
        id_verification_notes: update.idNotes,
        license_verification_status: update.licenseStatus,
        license_verification_notes: update.licenseNotes,
      }),
    });
    if (!res.ok) {
      setError("Unable to update document status.");
      return;
    }
    await loadDetails(workerId);
  };

  const updateTicketStatus = async (workerId: string, ticketId: string) => {
    const update = ticketEdits[ticketId];
    if (!update?.status) return;
    const res = await fetch(`/api/admin/workers/${workerId}/tickets/${ticketId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        verification_status: update.status,
        verification_notes: update.notes || "",
        visible_to_clients: update.status === "verified" ? 1 : 0,
        renewal_status: update.renewal,
      }),
    });
    if (!res.ok) {
      setError("Unable to update ticket status.");
      return;
    }
    await loadDetails(workerId);
  };

  const updateMediaStatus = async (workerId: string, key: string) => {
    const update = mediaEdits[key];
    if (!update?.status) return;
    const res = await fetch(`/api/admin/workers/${workerId}/media-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key,
        verification_status: update.status,
        verification_notes: update.notes || "",
      }),
    });
    if (!res.ok) {
      setError("Unable to update work media status.");
      return;
    }
    await loadDetails(workerId);
  };

  const approveWorker = async (workerId: string) => {
    const worker = details[workerId];
    if (worker) {
      const hasLicenseDocs = !!worker.drivers_license_front_name || !!worker.drivers_license_back_name;
      const hasIdDocs = !!worker.id_document_front_name || !!worker.id_document_back_name;
      const licenseOk = !hasLicenseDocs || worker.license_verification_status === "verified";
      const idOk = !hasIdDocs || worker.id_verification_status === "verified";
      const ticketsOk = !(worker.tickets || []).some((t) => t.verification_status !== "verified");
      const workMediaItems = [
        ...(worker.work_media || []),
        ...((worker.work_experience || []).flatMap((exp) => exp.work_media || [])),
      ].filter((media) => media?.key);
      const mediaOk = workMediaItems.every((media) => media.verification_status === "verified");
      if (!licenseOk || !idOk || !ticketsOk || !mediaOk) {
        setApproveWarnings((prev) => ({ ...prev, [workerId]: true }));
        return;
      }
    }
    if (!confirm("Approve this worker and send the approval email?")) return;
    const res = await fetch(`/api/admin/workers/${workerId}/approve`, { method: "POST" });
    if (!res.ok) {
      setError("Unable to approve worker.");
      return;
    }
    setApproveWarnings((prev) => ({ ...prev, [workerId]: false }));
    await loadDetails(workerId);
  };

  const syncWorkerToXero = async (workerId: string) => {
    setSyncMessages((prev) => ({ ...prev, [workerId]: "" }));
    setSyncBusy((prev) => ({ ...prev, [workerId]: true }));
    try {
      const res = await fetch(`/api/admin/workers/${workerId}/xero-sync`, { method: "POST" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSyncMessages((prev) => ({ ...prev, [workerId]: json.error || "Xero sync failed." }));
      } else {
        setSyncMessages((prev) => ({ ...prev, [workerId]: "Xero sync completed." }));
      }
    } catch {
      setSyncMessages((prev) => ({ ...prev, [workerId]: "Xero sync failed." }));
    } finally {
      setSyncBusy((prev) => ({ ...prev, [workerId]: false }));
    }
  };

  if (error) {
    return (
      <div className={styles.form} style={{ maxWidth: 720, margin: "2rem auto" }}>
        <div className={styles.errorSummary}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.form} style={{ maxWidth: 1040, margin: "2rem auto" }}>
      <div className={styles.formHeader}>
        <h2>Workers</h2>
        <p>Worker profiles and verification status.</p>
        <div className={styles.formHeaderActions}>
          <SecondaryButton href="/dashboard/admin">
            Back to dashboard
          </SecondaryButton>
          <SecondaryButton href="/dashboard/admin/clients">
            Manage clients
          </SecondaryButton>
          <SecondaryButton href="/dashboard/admin/requests">
            View requests
          </SecondaryButton>
          <SecondaryButton href="/dashboard/admin/access">
            Access & roles
          </SecondaryButton>
          <SecondaryButton href="/logout">
            Log out
          </SecondaryButton>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Tax declaration follow-ups</h3>
        {taxDeclarationSummaries.length === 0 ? (
          <p>No tax declaration data yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {taxDeclarationSummaries
              .filter((item) => item.missing || item.whmThreshold)
              .map((item) => (
                <div key={`tax-${item.worker_id}`} className={styles.group}>
                  <div style={{ fontWeight: 700 }}>
                    {item.name || "Unnamed"} ({item.email || "No email"})
                  </div>
                  <div>Worker ID: {item.worker_id}</div>
                  {item.missing ? (
                    <div className="font-semibold text-[var(--sr-danger)]">Missing or unsigned declaration</div>
                  ) : null}
                  {item.whmThreshold ? (
                    <div className="font-semibold text-[var(--sr-warning)]">Working holiday maker with tax-free threshold set</div>
                  ) : null}
                </div>
              ))}
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h3>Workers</h3>
        {workers.length === 0 ? (
          <p>No workers yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {workers.map((w) => (
              <div key={w.worker_id} className={styles.group}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                  <StatusBadge tone="neutral">Worker ID: {formatWorkerId(w)}</StatusBadge>
                  <StatusBadge tone={statusToneFor(w.verified_status)}>
                    Verified: {formatStatusLabel(w.verified_status)}
                  </StatusBadge>
                </div>
                <div style={{ marginTop: "0.5rem", fontWeight: 700 }}>{formatFullName(w)}</div>
                <div className="text-[var(--color-srMuted)]">{w.role_id || "Unassigned"}</div>
                <div>Email: {w.email || "Not set"}</div>
                <div>Delete request: {w.delete_requested ? "Yes" : "No"}</div>
                {w.working_now_status ? (
                  <div>
                    Availability: {w.working_now_status}
                    {w.availability_from_date ? ` (from ${w.availability_from_date})` : ""}
                    {w.availability_until_date ? ` to ${w.availability_until_date}` : ""}
                  </div>
                ) : null}
                {w.holiday_start_date || w.holiday_end_date ? (
                  <div>
                    Holidays: {w.holiday_start_date || "TBD"} to {w.holiday_end_date || "TBD"}
                  </div>
                ) : null}
                <div className={styles.actions}>
                  <SecondaryButton type="button"  onClick={() => toggleWorker(w.worker_id)}>
                    {expanded[w.worker_id] ? "Hide details" : "View details"}
                  </SecondaryButton>
                  {session?.adminLevel === "super_admin" ? (
                    <SecondaryButton type="button"  onClick={() => deleteWorker(w.worker_id)}>
                      Delete worker
                    </SecondaryButton>
                  ) : null}
                </div>
                {expanded[w.worker_id] ? (
                  <div className={styles.group} style={{ marginTop: "0.75rem" }}>
                    {detailError[w.worker_id] ? (
                      <div className={styles.errorSummary}>{detailError[w.worker_id]}</div>
                    ) : details[w.worker_id] ? (
                      <>
                        <div className={styles.section} style={cardStyle}>
                          <StatusBadge tone="neutral">Worker profile</StatusBadge>
                          <StatusBadge tone="neutral">
                            Worker ID: {formatWorkerId(details[w.worker_id] || {})}
                          </StatusBadge>
                          <div style={{ marginTop: "0.5rem", fontWeight: 700 }}>
                            {formatFullName(details[w.worker_id] || {})}
                          </div>
                          <div>Email: {details[w.worker_id]?.email || "Not set"}</div>
                          <div>Mobile: {details[w.worker_id]?.mobile || "Not set"}</div>
                          <div>Phone: {details[w.worker_id]?.phone || "Not set"}</div>
                          <div>Date of birth: {details[w.worker_id]?.dob || "Not set"}</div>
                          <div>
                            Address: {formatAddress(details[w.worker_id]) || "Not set"}
                          </div>
                          {formatAddress(details[w.worker_id]) ? (
                            <div style={{ marginTop: "0.5rem" }}>
                              <iframe
                                title="Worker location"
                                src={
                                  mapsKey
                                    ? `https://www.google.com/maps/embed/v1/place?key=${mapsKey}&q=${addressForMap(details[w.worker_id])}`
                                    : `https://www.google.com/maps?q=${addressForMap(details[w.worker_id])}&output=embed`
                                }
                                style={{ width: "100%", height: 240, border: "0", borderRadius: 12 }}
                                loading="lazy"
                              />
                            </div>
                          ) : null}
                          <div style={{ marginTop: "0.75rem" }}>
                            Availability: {details[w.worker_id]?.working_now_status || "Not set"}
                            {details[w.worker_id]?.availability_from_date ? ` (from ${details[w.worker_id]?.availability_from_date})` : ""}
                            {details[w.worker_id]?.availability_until_date ? ` to ${details[w.worker_id]?.availability_until_date}` : ""}
                          </div>
                          {details[w.worker_id]?.holiday_start_date || details[w.worker_id]?.holiday_end_date ? (
                            <div>
                              Holidays: {details[w.worker_id]?.holiday_start_date || "TBD"} to {details[w.worker_id]?.holiday_end_date || "TBD"}
                            </div>
                          ) : null}
                      </div>

                        <div
                          className={styles.section}
                          style={{
                            ...cardStyle,
                            borderColor:
                              (details[w.worker_id]?.drivers_license_front_name || details[w.worker_id]?.drivers_license_back_name) &&
                              details[w.worker_id]?.license_verification_status !== "verified"
                                ? "var(--sr-danger)"
                                : (details[w.worker_id]?.id_document_front_name || details[w.worker_id]?.id_document_back_name) &&
                                    details[w.worker_id]?.id_verification_status !== "verified"
                                  ? "var(--sr-danger)"
                                  : cardBorderColor,
                            borderWidth:
                              (details[w.worker_id]?.drivers_license_front_name || details[w.worker_id]?.drivers_license_back_name) &&
                              details[w.worker_id]?.license_verification_status !== "verified"
                                ? 2
                                : (details[w.worker_id]?.id_document_front_name || details[w.worker_id]?.id_document_back_name) &&
                                    details[w.worker_id]?.id_verification_status !== "verified"
                                  ? 2
                                  : 1,
                          }}
                        >
                          <StatusBadge tone="neutral">Company details</StatusBadge>
                          <div>Company name: {details[w.worker_id]?.company_name || "Not set"}</div>
                          <div>Structure: {details[w.worker_id]?.company_structure || "Not set"}</div>
                          <div>ABN: {details[w.worker_id]?.company_abn || "Not set"}</div>
                          <div>ACN: {details[w.worker_id]?.company_acn || "Not set"}</div>
                          <div>Website: {details[w.worker_id]?.company_website || "Not set"}</div>
                          <div>
                            Company address:{" "}
                            {[
                              details[w.worker_id]?.company_address_number,
                              details[w.worker_id]?.company_address_street,
                              details[w.worker_id]?.company_address_postcode,
                            ]
                              .filter(Boolean)
                              .join(" ") || "Not set"}
                          </div>
                        </div>

                        {(() => {
                          const detail = details[w.worker_id];
                          const edit = superEdits[w.worker_id] || {};
                          const superChoice = edit.choice || detail?.super_choice || detail?.super_fund_type || "";
                          const needsSuper =
                            !superChoice ||
                            superChoice === "STAPLED" ||
                            (superChoice === "REGULATED" && !(edit.usi || detail?.super_usi)) ||
                            (superChoice === "SMSF" && !(edit.smsfAbn || detail?.smsf_abn));
                          const products = superProducts[w.worker_id] || [];
                          const results = superResults[w.worker_id] || [];
                          return (
                            <div
                              className={styles.section}
                              style={{
                                ...cardStyle,
                                borderColor: needsSuper ? "var(--sr-danger)" : cardBorderColor,
                                borderWidth: needsSuper ? 2 : 1,
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                                <StatusBadge tone="neutral">Superannuation (payroll)</StatusBadge>
                                <StatusBadge tone={statusToneFor(superChoice || "pending")}>
                                  {formatStatusLabel(superChoice || "pending")}
                                </StatusBadge>
                                {detail?.super_status ? (
                                  <StatusBadge tone={statusToneFor(detail.super_status)}>
                                    {formatStatusLabel(detail.super_status)}
                                  </StatusBadge>
                                ) : null}
                              </div>
                              {needsSuper ? (
                                <div className="mb-2 font-semibold text-[var(--sr-danger)]">
                                  Super details pending payroll completion.
                                </div>
                              ) : null}

                              <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                                <SecondaryButton
                                  type="button"
                                  style={{
                                    background: superChoice === "REGULATED" ? "var(--sr-successBg)" : "var(--color-srCard)",
                                    borderColor: "var(--color-srBorder)",
                                    textAlign: "left",
                                    justifyContent: "flex-start",
                                  }}
                                  onClick={() => {
                                    updateSuperEdit(w.worker_id, {
                                      choice: "REGULATED",
                                      status: "",
                                      fundName: "",
                                      productName: "",
                                      abn: "",
                                      usi: "",
                                      restrictions: 0,
                                    });
                                    setSuperQueries((prev) => ({ ...prev, [w.worker_id]: "" }));
                                    setSuperResults((prev) => ({ ...prev, [w.worker_id]: [] }));
                                    setSuperProducts((prev) => ({ ...prev, [w.worker_id]: [] }));
                                  }}
                                >
                                  <strong>I have a super fund</strong>
                                </SecondaryButton>
                                <SecondaryButton
                                  type="button"
                                  style={{
                                    background: superChoice === "SMSF" ? "var(--sr-accentSoft)" : "var(--color-srCard)",
                                    borderColor: "var(--color-srBorder)",
                                    textAlign: "left",
                                    justifyContent: "flex-start",
                                  }}
                                  onClick={() =>
                                    updateSuperEdit(w.worker_id, {
                                      choice: "SMSF",
                                      status: "",
                                      fundName: "",
                                      productName: "",
                                      abn: "",
                                      usi: "",
                                      restrictions: 0,
                                    })
                                  }
                                >
                                  <strong>I have an SMSF</strong>
                                </SecondaryButton>
                                <SecondaryButton
                                  type="button"
                                  style={{
                                    background: superChoice === "STAPLED" ? "var(--sr-warningBg)" : "var(--color-srCard)",
                                    borderColor: "var(--color-srBorder)",
                                    textAlign: "left",
                                    justifyContent: "flex-start",
                                  }}
                                  onClick={() =>
                                    updateSuperEdit(w.worker_id, {
                                      choice: "STAPLED",
                                      status: "PENDING_PAYROLL",
                                      fundName: "",
                                      productName: "",
                                      abn: "",
                                      usi: "",
                                      restrictions: 0,
                                      smsfAbn: "",
                                      smsfBankBsb: "",
                                      smsfBankAccount: "",
                                      smsfBankAccountName: "",
                                      smsfEsa: "",
                                    })
                                  }
                                >
                                  <strong>Stapled fund (pending)</strong>
                                </SecondaryButton>
                              </div>

                              {superChoice === "REGULATED" ? (
                                <div style={{ marginTop: "0.75rem" }}>
                                  <div className={styles.field}>
                                    <label className={styles.label}>Search fund</label>
                                    <input
                                      className={styles.input}
                                      value={superQueries[w.worker_id] || ""}
                                      onChange={(e) => searchSuperFunds(w.worker_id, e.target.value)}
                                      placeholder="Start typing fund name"
                                    />
                                    {superLoading[w.worker_id] ? (
                                      <div style={{ fontSize: "0.85rem", color: "var(--color-srMuted)" }}>Searching…</div>
                                    ) : null}
                                  </div>
                                  {results.length ? (
                                    <div style={{ border: "1px solid var(--color-srBorder)", borderRadius: 10, overflow: "hidden" }}>
                                      {results.map((result) => (
                                        <button
                                          key={`${result.abn}-${result.fundName}`}
                                          type="button"
                                          style={{ width: "100%", textAlign: "left", padding: "0.5rem 0.75rem", border: "0", background: "transparent" }}
                                          onClick={() => {
                                            updateSuperEdit(w.worker_id, {
                                              fundName: result.fundName,
                                              abn: result.abn,
                                              productName: "",
                                              usi: "",
                                              restrictions: 0,
                                            });
                                            setSuperQueries((prev) => ({ ...prev, [w.worker_id]: result.fundName }));
                                            setSuperResults((prev) => ({ ...prev, [w.worker_id]: [] }));
                                            loadSuperProducts(w.worker_id, result.abn);
                                          }}
                                        >
                                          <div style={{ fontWeight: 600 }}>{result.fundName}</div>
                                          <div style={{ fontSize: "0.8rem", color: "var(--color-srMuted)" }}>ABN {result.abn}</div>
                                        </button>
                                      ))}
                                    </div>
                                  ) : null}
                                  <div className={styles.gridThree} style={{ marginTop: "0.75rem" }}>
                                    <div className={styles.field}>
                                      <label className={styles.label}>Fund ABN</label>
                                      <input className={styles.input} value={edit.abn || detail?.super_abn || ""} readOnly />
                                    </div>
                                    <div className={styles.field}>
                                      <label className={styles.label}>Product / USI</label>
                                      <select
                                        className={styles.select}
                                        value={edit.usi || detail?.super_usi || ""}
                                        onChange={(e) => {
                                          const selected = products.find((p) => p.usi === e.target.value);
                                          updateSuperEdit(w.worker_id, {
                                            usi: e.target.value,
                                            productName: selected?.productName || "",
                                            restrictions: selected?.contributionRestrictions || 0,
                                          });
                                        }}
                                      >
                                        <option value="">{superProductLoading[w.worker_id] ? "Loading..." : "Select product"}</option>
                                        {products.map((product) => (
                                          <option key={product.usi} value={product.usi}>
                                            {product.productName}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div className={styles.field}>
                                      <label className={styles.label}>Member number</label>
                                      <input
                                        className={styles.input}
                                        value={edit.memberNumber ?? detail?.super_member_number ?? ""}
                                        onChange={(e) => updateSuperEdit(w.worker_id, { memberNumber: e.target.value })}
                                      />
                                    </div>
                                  </div>
                                  {edit.restrictions || detail?.super_contribution_restrictions ? (
                                    <div style={{ marginTop: "0.5rem", fontWeight: 700, color: "var(--sr-warning)" }}>
                                      Contribution restrictions flagged for this product.
                                    </div>
                                  ) : null}
                                </div>
                              ) : null}

                              {superChoice === "SMSF" ? (
                                <div className={styles.gridThree} style={{ marginTop: "0.75rem" }}>
                                  <div className={styles.field}>
                                    <label className={styles.label}>SMSF ABN</label>
                                    <input className={styles.input} value={edit.smsfAbn ?? detail?.smsf_abn ?? ""} onChange={(e) => updateSuperEdit(w.worker_id, { smsfAbn: e.target.value })} />
                                  </div>
                                  <div className={styles.field}>
                                    <label className={styles.label}>SMSF bank account name</label>
                                    <input
                                      className={styles.input}
                                      value={edit.smsfBankAccountName ?? detail?.smsf_bank_account_name ?? ""}
                                      onChange={(e) => updateSuperEdit(w.worker_id, { smsfBankAccountName: e.target.value })}
                                    />
                                  </div>
                                  <div className={styles.field}>
                                    <label className={styles.label}>SMSF bank BSB</label>
                                    <input className={styles.input} value={edit.smsfBankBsb ?? detail?.smsf_bank_bsb ?? ""} onChange={(e) => updateSuperEdit(w.worker_id, { smsfBankBsb: e.target.value })} />
                                  </div>
                                  <div className={styles.field}>
                                    <label className={styles.label}>SMSF bank account number</label>
                                    <input className={styles.input} value={edit.smsfBankAccount ?? detail?.smsf_bank_account ?? ""} onChange={(e) => updateSuperEdit(w.worker_id, { smsfBankAccount: e.target.value })} />
                                  </div>
                                  <div className={styles.field}>
                                    <label className={styles.label}>SMSF ESA</label>
                                    <input className={styles.input} value={edit.smsfEsa ?? detail?.smsf_esa ?? ""} onChange={(e) => updateSuperEdit(w.worker_id, { smsfEsa: e.target.value })} />
                                  </div>
                                </div>
                              ) : null}

                              {superChoice === "STAPLED" ? (
                                <div
                                  style={{
                                    marginTop: "0.75rem",
                                    padding: "0.6rem 0.75rem",
                                    borderRadius: 10,
                                    background: "var(--sr-warningBg)",
                                    color: "var(--sr-warning)",
                                  }}
                                >
                                  Payroll will confirm the stapled fund externally. Admin can replace this with regulated or SMSF details once confirmed.
                                </div>
                              ) : null}

                              <div className={styles.actions} style={{ marginTop: "0.75rem" }}>
                                <SecondaryButton type="button"  onClick={() => saveSuperDetails(w.worker_id)}>
                                  Save super details
                                </SecondaryButton>
                                {superMessages[w.worker_id] ? <span style={{ fontWeight: 700 }}>{superMessages[w.worker_id]}</span> : null}
                              </div>
                            </div>
                          );
                        })()}

                        <div
                          className={styles.section}
                          style={{
                            ...cardStyle,
                            borderColor: needsApproval(details[w.worker_id]) ? "var(--sr-danger)" : cardBorderColor,
                            borderWidth: needsApproval(details[w.worker_id]) ? 2 : 1,
                            animation: needsApproval(details[w.worker_id]) ? "adminPulse 1.6s ease-in-out infinite" : undefined,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                            <StatusBadge tone="neutral">Identification documents</StatusBadge>
                            <StatusBadge tone={statusToneFor(combinedDocStatus(details[w.worker_id]))}>
                              {formatStatusLabel(combinedDocStatus(details[w.worker_id]))}
                            </StatusBadge>
                          </div>
                          <div>Document type: {details[w.worker_id]?.id_document_type || "Not set"}</div>
                          <div style={{ display: "grid", gap: "1.25rem" }}>
                            <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)" }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                {details[w.worker_id]?.drivers_license_front_name ? (
                                  <div className={styles.field}>
                                    <label className={styles.label}>Driver licence (front) - {details[w.worker_id]?.drivers_license_front_name}</label>
                                    <SecondaryButton
                                      type="button"
                                      style={{ padding: 0, background: "transparent", border: "none" }}
                                      onClick={() => setPreviewModal({ src: docUrl(w.worker_id, "drivers_license_front"), alt: "Driver licence front" })}
                                    >
                                      <div style={previewBoxStyle}>
                                        <img src={docUrl(w.worker_id, "drivers_license_front")} alt="Driver licence front" style={previewImgStyle} />
                                      </div>
                                    </SecondaryButton>
                                  </div>
                                ) : null}
                                {details[w.worker_id]?.drivers_license_back_name ? (
                                  <div className={styles.field}>
                                    <label className={styles.label}>Driver licence (back) - {details[w.worker_id]?.drivers_license_back_name}</label>
                                    <SecondaryButton
                                      type="button"
                                      style={{ padding: 0, background: "transparent", border: "none" }}
                                      onClick={() => setPreviewModal({ src: docUrl(w.worker_id, "drivers_license_back"), alt: "Driver licence back" })}
                                    >
                                      <div style={previewBoxStyle}>
                                        <img src={docUrl(w.worker_id, "drivers_license_back")} alt="Driver licence back" style={previewImgStyle} />
                                      </div>
                                    </SecondaryButton>
                                  </div>
                                ) : null}
                              </div>
                              <div className={styles.gridTwo}>
                                <div className={styles.field}>
                                  <label className={styles.label}>Licence status</label>
                                  <select
                                    className={styles.select}
                                    value={statusEdits[w.worker_id]?.licenseStatus ?? details[w.worker_id]?.license_verification_status ?? "pending"}
                                    onChange={(e) => setStatusEdits((prev) => ({ ...prev, [w.worker_id]: { ...prev[w.worker_id], licenseStatus: e.target.value } }))}
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="verified">Verified</option>
                                    <option value="needs_clearer">Needs clearer upload</option>
                                    <option value="out_of_date">Out of date</option>
                                    <option value="rejected">Rejected</option>
                                  </select>
                                </div>
                                <div className={styles.field}>
                                  <label className={styles.label}>Licence notes</label>
                                  <input
                                    className={styles.input}
                                    value={statusEdits[w.worker_id]?.licenseNotes ?? details[w.worker_id]?.license_verification_notes ?? ""}
                                    onChange={(e) => setStatusEdits((prev) => ({ ...prev, [w.worker_id]: { ...prev[w.worker_id], licenseNotes: e.target.value } }))}
                                  />
                                </div>
                              </div>
                            </div>

                            <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)" }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                {details[w.worker_id]?.id_document_front_name ? (
                                  <div className={styles.field}>
                                    <label className={styles.label}>ID document (front) - {details[w.worker_id]?.id_document_front_name}</label>
                                    <SecondaryButton
                                      type="button"
                                      style={{ padding: 0, background: "transparent", border: "none" }}
                                      onClick={() => setPreviewModal({ src: docUrl(w.worker_id, "id_document_front"), alt: "ID document front" })}
                                    >
                                      <div style={previewBoxStyle}>
                                        <img src={docUrl(w.worker_id, "id_document_front")} alt="ID document front" style={previewImgStyle} />
                                      </div>
                                    </SecondaryButton>
                                  </div>
                                ) : null}
                                {details[w.worker_id]?.id_document_back_name ? (
                                  <div className={styles.field}>
                                    <label className={styles.label}>ID document (back) - {details[w.worker_id]?.id_document_back_name}</label>
                                    <SecondaryButton
                                      type="button"
                                      style={{ padding: 0, background: "transparent", border: "none" }}
                                      onClick={() => setPreviewModal({ src: docUrl(w.worker_id, "id_document_back"), alt: "ID document back" })}
                                    >
                                      <div style={previewBoxStyle}>
                                        <img src={docUrl(w.worker_id, "id_document_back")} alt="ID document back" style={previewImgStyle} />
                                      </div>
                                    </SecondaryButton>
                                  </div>
                                ) : null}
                              </div>
                              <div className={styles.gridTwo}>
                                <div className={styles.field}>
                                  <label className={styles.label}>ID status</label>
                                  <select
                                    className={styles.select}
                                    value={statusEdits[w.worker_id]?.idStatus ?? details[w.worker_id]?.id_verification_status ?? "pending"}
                                    onChange={(e) => setStatusEdits((prev) => ({ ...prev, [w.worker_id]: { ...prev[w.worker_id], idStatus: e.target.value } }))}
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="verified">Verified</option>
                                    <option value="needs_clearer">Needs clearer upload</option>
                                    <option value="out_of_date">Out of date</option>
                                    <option value="rejected">Rejected</option>
                                  </select>
                                </div>
                                <div className={styles.field}>
                                  <label className={styles.label}>ID notes</label>
                                  <input
                                    className={styles.input}
                                    value={statusEdits[w.worker_id]?.idNotes ?? details[w.worker_id]?.id_verification_notes ?? ""}
                                    onChange={(e) => setStatusEdits((prev) => ({ ...prev, [w.worker_id]: { ...prev[w.worker_id], idNotes: e.target.value } }))}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className={styles.actions}>
                            <SecondaryButton type="button"  onClick={() => updateWorkerStatuses(w.worker_id)}>
                              Save document status
                            </SecondaryButton>
                          </div>
                        </div>

                        <div className={styles.section} style={cardStyle}>
                          <StatusBadge tone="neutral">Banking</StatusBadge>
                          <div>Bank name: {details[w.worker_id]?.bank_name || "Not set"}</div>
                          <div>Account name: {details[w.worker_id]?.bank_account_name || "Not set"}</div>
                          <div>BSB: {details[w.worker_id]?.bank_bsb || "Not set"}</div>
                          <div>Account number: {details[w.worker_id]?.bank_account_number || "Not set"}</div>
                          {details[w.worker_id]?.has_own_abn ? (
                            <>
                              <div>Company account name: {details[w.worker_id]?.company_bank_account_name || "Not set"}</div>
                              <div>Company BSB: {details[w.worker_id]?.company_bank_bsb || "Not set"}</div>
                              <div>Company account number: {details[w.worker_id]?.company_bank_account_number || "Not set"}</div>
                            </>
                          ) : null}
                        </div>

                        {(() => {
                          const taxInfo = taxDeclarations[w.worker_id];
                          const signed = !!taxInfo?.tfn_declaration_signed;
                          return (
                            <div className={styles.section} style={cardStyle}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                                <StatusBadge tone="neutral">Tax declaration</StatusBadge>
                                <StatusBadge tone={signed ? "success" : "danger"}>
                                  {signed ? "signed" : "missing"}
                                </StatusBadge>
                              </div>
                              {taxInfo ? (
                                <>
                                  <div>Residency: {taxInfo.tax_residency_status || "Not set"}</div>
                                  <div>Employment basis: {taxInfo.employment_basis || "Not set"}</div>
                                  <div>TFN status: {taxInfo.tfn_status || "Not set"} {taxInfo.tfn_last4 ? `(****${taxInfo.tfn_last4})` : ""}</div>
                                  <div>Tax-free threshold: {taxInfo.claim_tax_free_threshold ? "Yes" : "No"}</div>
                                  <div>Study/training loan: {taxInfo.has_study_training_loan ? "Yes" : "No"}</div>
                                  <div>SFSS debt: {taxInfo.has_sfss_debt ? "Yes" : "No"}</div>
                                  <div>Signed at: {taxInfo.tfn_declaration_signed_at || "Not signed"}</div>
                                </>
                              ) : (
                                <div>Tax declaration not provided.</div>
                              )}
                            </div>
                          );
                        })()}

                        <div className={styles.section} style={cardStyle}>
                          <StatusBadge tone="neutral">Tickets</StatusBadge>
                          {details[w.worker_id]?.tickets?.length ? (
                            <div style={{ display: "grid", gap: "0.75rem" }}>
                              {details[w.worker_id]?.tickets?.map((t) => (
                                <div key={t.ticket_id} className={styles.group}>
                                  <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)" }}>
                                    <div>
                                      <div style={{ fontWeight: 700 }}>{t.type}</div>
                                      <div style={{ marginTop: "0.25rem" }}>
                                        <StatusBadge tone={statusToneFor(t.verification_status)}>
                                          {formatStatusLabel(t.verification_status || "pending")}
                                        </StatusBadge>
                                      </div>
                                      <div style={{ marginTop: "0.5rem" }}>
                                        Expiry: {t.expiry_date || "Not set"}
                                        {t.expiry_date ? (
                                          <span style={{ marginLeft: "0.5rem", fontWeight: 700 }}>
                                            {expiryCountdown(t.expiry_date)}
                                          </span>
                                        ) : null}
                                      </div>
                                      {t.expiry_date && (() => {
                                        const countdown = expiryCountdown(t.expiry_date);
                                        const isExpired = countdown === "Expired";
                                        const match = countdown.match(/Expires in (\d+)/);
                                        const days = match ? Number(match[1]) : null;
                                        if (!isExpired && (days === null || days > 30)) return null;
                                        return (
                                          <div style={{ marginTop: "0.35rem", fontWeight: 700, color: "var(--sr-danger)" }}>
                                            {isExpired ? "Ticket expired. Update required." : "Ticket expires within 30 days."}
                                          </div>
                                        );
                                      })()}
                                      {t.renewal_status === "will_not_renew" ? (
                                        <div style={{ marginTop: "0.35rem", fontWeight: 700, color: "var(--sr-danger)" }}>
                                          Worker marked: ticket will not be renewed.
                                        </div>
                                      ) : null}
                                      {t.front_image_name ? <div style={{ marginTop: "0.5rem" }}>Front image: {t.front_image_name}</div> : null}
                                      {t.back_image_name ? <div>Back image: {t.back_image_name}</div> : null}
                                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
                                        {t.front_image_key ? (
                                          <SecondaryButton
                                            type="button"
                                            style={{ padding: 0, background: "transparent", border: "none" }}
                                            onClick={() => setPreviewModal({ src: ticketImageUrl(w.worker_id, t.ticket_id, "front"), alt: "Ticket front" })}
                                          >
                                            <div style={previewBoxStyle}>
                                              <img src={ticketImageUrl(w.worker_id, t.ticket_id, "front")} alt="Ticket front" style={previewImgStyle} />
                                            </div>
                                          </SecondaryButton>
                                        ) : null}
                                        {t.back_image_key ? (
                                          <SecondaryButton
                                            type="button"
                                            style={{ padding: 0, background: "transparent", border: "none" }}
                                            onClick={() => setPreviewModal({ src: ticketImageUrl(w.worker_id, t.ticket_id, "back"), alt: "Ticket back" })}
                                          >
                                            <div style={previewBoxStyle}>
                                              <img src={ticketImageUrl(w.worker_id, t.ticket_id, "back")} alt="Ticket back" style={previewImgStyle} />
                                            </div>
                                          </SecondaryButton>
                                        ) : null}
                                      </div>
                                    </div>
                                    <div>
                                      <div className={styles.field}>
                                        <label className={styles.label}>Ticket status</label>
                                        <select
                                          className={styles.select}
                                          value={ticketEdits[t.ticket_id]?.status ?? t.verification_status ?? "pending"}
                                          onChange={(e) => setTicketEdits((prev) => ({ ...prev, [t.ticket_id]: { ...prev[t.ticket_id], status: e.target.value } }))}
                                        >
                                          <option value="pending">Pending</option>
                                          <option value="verified">Verified</option>
                                          <option value="needs_clearer">Needs clearer upload</option>
                                          <option value="out_of_date">Out of date</option>
                                          <option value="rejected">Rejected</option>
                                        </select>
                                      </div>
                                      <div className={styles.field}>
                                        <label className={styles.label}>Renewal status</label>
                                        <select
                                          className={styles.select}
                                          value={ticketEdits[t.ticket_id]?.renewal ?? t.renewal_status ?? "active"}
                                          onChange={(e) =>
                                            setTicketEdits((prev) => ({ ...prev, [t.ticket_id]: { ...prev[t.ticket_id], renewal: e.target.value } }))
                                          }
                                        >
                                          <option value="active">Active (will renew)</option>
                                          <option value="will_not_renew">Will not renew</option>
                                        </select>
                                      </div>
                                      <div className={styles.field}>
                                        <label className={styles.label}>Notes</label>
                                        <input
                                          className={styles.input}
                                          value={ticketEdits[t.ticket_id]?.notes ?? ""}
                                          onChange={(e) => setTicketEdits((prev) => ({ ...prev, [t.ticket_id]: { ...prev[t.ticket_id], notes: e.target.value } }))}
                                        />
                                      </div>
                                      <div className={styles.actions}>
                                        <SecondaryButton type="button"  onClick={() => updateTicketStatus(w.worker_id, t.ticket_id)}>
                                          Save ticket status
                                        </SecondaryButton>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div>Tickets: None</div>
                          )}
                        </div>

                        <div className={styles.section} style={cardStyle}>
                          <StatusBadge tone="neutral">Work experience</StatusBadge>
                          {details[w.worker_id]?.work_experience?.length ? (
                            <div style={{ display: "grid", gap: "0.75rem" }}>
                              {details[w.worker_id]?.work_experience?.map((exp, idx) => (
                                <div key={`exp-${idx}`} className={styles.group}>
                                  <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)" }}>
                                    <div>
                                      <div style={{ fontWeight: 700 }}>{exp.site_name || "Site"}</div>
                                      {exp.work_media?.length ? (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
                                          {exp.work_media.map((media, mediaIdx) => {
                                            const mediaKey = media.key || "";
                                            return (
                                              <div key={`media-${mediaIdx}`} style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "minmax(0, 140px) minmax(0, 1fr)", alignItems: "start" }}>
                                                <SecondaryButton
                                                  type="button"
                                                  style={{ padding: 0, background: "transparent", border: "none" }}
                                                  onClick={() => (media.key ? setPreviewModal({ src: mediaUrl(w.worker_id, media.key), alt: media.name || "Work media" }) : null)}
                                                >
                                                  <div style={previewBoxStyle}>
                                                    <img src={media.key ? mediaUrl(w.worker_id, media.key) : ""} alt={media.name || "Work media"} style={previewImgStyle} />
                                                  </div>
                                                </SecondaryButton>
                                                <div>
                                                  <div style={{ fontWeight: 600, marginBottom: "0.35rem" }}>{media.name || "Work media"}</div>
                                                  <label className={styles.label}>Media status</label>
                                                  <select
                                                    className={styles.select}
                                                    value={mediaEdits[mediaKey]?.status ?? media.verification_status ?? "pending"}
                                                    onChange={(e) =>
                                                      setMediaEdits((prev) => ({ ...prev, [mediaKey]: { ...prev[mediaKey], status: e.target.value } }))
                                                    }
                                                  >
                                                    <option value="pending">Pending</option>
                                                    <option value="verified">Verified</option>
                                                    <option value="needs_clearer">Needs clearer upload</option>
                                                    <option value="out_of_date">Out of date</option>
                                                    <option value="rejected">Rejected</option>
                                                  </select>
                                                  <label className={styles.label} style={{ marginTop: "0.5rem" }}>
                                                    Notes
                                                  </label>
                                                  <input
                                                    className={styles.input}
                                                    value={mediaEdits[mediaKey]?.notes ?? media.verification_notes ?? ""}
                                                    onChange={(e) =>
                                                      setMediaEdits((prev) => ({ ...prev, [mediaKey]: { ...prev[mediaKey], notes: e.target.value } }))
                                                    }
                                                  />
                                                  <div className={styles.actions}>
                                                    <SecondaryButton type="button"  onClick={() => updateMediaStatus(w.worker_id, mediaKey)}>
                                                      Save media status
                                                    </SecondaryButton>
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      ) : (
                                        <div style={{ marginTop: "0.5rem", color: "#64748b" }}>No media uploaded.</div>
                                      )}
                                    </div>
                                    <div style={{ background: "#f8fafc", borderRadius: 12, padding: "0.75rem", border: "1px solid #e2e8f0" }}>
                                      <div>Position: {exp.position || "Not set"}</div>
                                      <div>Start: {exp.start_date || "Not set"} - Finish: {exp.end_date || "Not set"}</div>
                                      <div>Reason: {exp.reason_other || exp.reason || "Not set"}</div>
                                      <div>Notes: {exp.notes || "Not set"}</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div>No work experience saved.</div>
                          )}
                          {details[w.worker_id]?.work_comments ? (
                            <div style={{ marginTop: "0.5rem" }}>Additional comments: {details[w.worker_id]?.work_comments}</div>
                          ) : null}
                          {details[w.worker_id]?.work_media?.length ? (
                            <div style={{ marginTop: "0.5rem" }}>
                              <StatusBadge tone="neutral">Work media (additional)</StatusBadge>
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                {details[w.worker_id]?.work_media?.map((media, mediaIdx) => {
                                  const mediaKey = media.key || "";
                                  return (
                                    <div key={`extra-media-${mediaIdx}`} style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "minmax(0, 140px) minmax(0, 1fr)", alignItems: "start" }}>
                                    <SecondaryButton
                                      type="button"
                                      style={{ padding: 0, background: "transparent", border: "none" }}
                                      onClick={() =>
                                        media.key ? setPreviewModal({ src: mediaUrl(w.worker_id, media.key), alt: media.name || "Work media" }) : null
                                      }
                                    >
                                      <div style={previewBoxStyle}>
                                        <img src={media.key ? mediaUrl(w.worker_id, media.key) : ""} alt={media.name || "Work media"} style={previewImgStyle} />
                                      </div>
                                    </SecondaryButton>
                                      <div>
                                        <div style={{ fontWeight: 600, marginBottom: "0.35rem" }}>{media.name || "Work media"}</div>
                                        <label className={styles.label}>Media status</label>
                                        <select
                                          className={styles.select}
                                          value={mediaEdits[mediaKey]?.status ?? media.verification_status ?? "pending"}
                                          onChange={(e) =>
                                            setMediaEdits((prev) => ({ ...prev, [mediaKey]: { ...prev[mediaKey], status: e.target.value } }))
                                          }
                                        >
                                          <option value="pending">Pending</option>
                                          <option value="verified">Verified</option>
                                          <option value="needs_clearer">Needs clearer upload</option>
                                          <option value="out_of_date">Out of date</option>
                                          <option value="rejected">Rejected</option>
                                        </select>
                                        <label className={styles.label} style={{ marginTop: "0.5rem" }}>
                                          Notes
                                        </label>
                                        <input
                                          className={styles.input}
                                          value={mediaEdits[mediaKey]?.notes ?? media.verification_notes ?? ""}
                                          onChange={(e) =>
                                            setMediaEdits((prev) => ({ ...prev, [mediaKey]: { ...prev[mediaKey], notes: e.target.value } }))
                                          }
                                        />
                                        <div className={styles.actions}>
                                          <SecondaryButton type="button"  onClick={() => updateMediaStatus(w.worker_id, mediaKey)}>
                                            Save media status
                                          </SecondaryButton>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ) : null}
                        </div>

                        <div className={styles.section} style={cardStyle}>
                          <StatusBadge tone="neutral">Emergency contact</StatusBadge>
                          <div>
                            {details[w.worker_id]?.emergency_contact_title || ""}{" "}
                            {details[w.worker_id]?.emergency_contact_first_name || ""}{" "}
                            {details[w.worker_id]?.emergency_contact_family_name || ""}
                          </div>
                          <div>Mobile: {details[w.worker_id]?.emergency_contact_mobile || "Not set"}</div>
                          <div>Email: {details[w.worker_id]?.emergency_contact_email || "Not set"}</div>
                        </div>

                        <div className={styles.section} style={cardStyle}>
                          <StatusBadge tone="neutral">Consents</StatusBadge>
                          <div>Privacy agreed: {details[w.worker_id]?.privacy_agreed ? "Yes" : "No"}</div>
                          <div>Indemnity agreed: {details[w.worker_id]?.indemnity_agreed ? "Yes" : "No"}</div>
                        </div>

                        {details[w.worker_id]?.delete_requested ? (
                          <div className={styles.section} style={cardStyle}>
                            <StatusBadge tone="danger">Delete request</StatusBadge>
                            <div>Requested at: {details[w.worker_id]?.delete_requested_at || "Not set"}</div>
                            <div>Reason: {details[w.worker_id]?.delete_request_reason || "Not provided"}</div>
                            <div className={styles.actions}>
                              <SecondaryButton type="button"  onClick={() => deleteWorker(w.worker_id)}>
                                Approve delete
                              </SecondaryButton>
                            </div>
                          </div>
                        ) : null}

                        <div className={styles.actions}>
                          <SecondaryButton type="button"  onClick={() => approveWorker(w.worker_id)}>
                            Approve worker
                          </SecondaryButton>
                          <SecondaryButton
                            type="button"
                            style={{ background: "#e0f2fe", borderColor: "#38bdf8", color: "#075985" }}
                            onClick={() => syncWorkerToXero(w.worker_id)}
                            disabled={!!syncBusy[w.worker_id]}
                          >
                            {syncBusy[w.worker_id] ? "Syncing to Xero..." : "Sync to Xero"}
                          </SecondaryButton>
                          {approveWarnings[w.worker_id] ? (
                            <span style={{ color: "#dc2626", fontWeight: 700 }}>
                              Missing approvals detected. Please check the highlighted sections.
                            </span>
                          ) : null}
                          {syncMessages[w.worker_id] ? (
                            <span style={{ color: "#0f172a", fontWeight: 700 }}>{syncMessages[w.worker_id]}</span>
                          ) : null}
                        </div>
                      </>
                    ) : (
                      <div>Loading details...</div>
                    )}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      {previewModal ? (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.72)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "2rem",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              maxWidth: 820,
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              position: "relative",
              padding: "1.5rem",
            }}
          >
            <SecondaryButton
              type="button"
              style={{ position: "sticky", top: 0, alignSelf: "flex-end", marginLeft: "auto" }}
              onClick={() => setPreviewModal(null)}
            >
              Close
            </SecondaryButton>
            <div style={{ marginTop: "1rem" }}>
              <img
                src={previewModal.src}
                alt={previewModal.alt}
                style={{ width: "100%", borderRadius: 12, objectFit: "contain" }}
              />
            </div>
          </div>
        </div>
      ) : null}
      <style jsx global>{`
        @keyframes adminPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(248, 113, 113, 0.35);
          }
          70% {
            box-shadow: 0 0 0 8px rgba(248, 113, 113, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(248, 113, 113, 0);
          }
        }
      `}</style>
    </div>
  );
}
