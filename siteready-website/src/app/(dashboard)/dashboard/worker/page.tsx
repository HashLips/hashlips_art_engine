"use client";

import React from "react";
import styles from "@/components/booking/BookLabourNowForm.module.css";
import { COMPANY_STRUCTURES, TICKETS } from "@/lib/bookings/datasets";
import LegalConsentModal from "@/components/legal/LegalConsentModal";
import { LEGAL_DOCUMENTS, LegalDocument } from "@/lib/legal/documents";
import SecondaryButton from "@/components/SecondaryButton";

const AU_BANKS = [
  "ANZ",
  "Bank of Queensland",
  "Bank of Sydney",
  "Bendigo Bank",
  "Commonwealth Bank",
  "ING",
  "Macquarie Bank",
  "ME Bank",
  "NAB",
  "RACQ Bank",
  "Suncorp",
  "Westpac",
  "St.George Bank",
  "BankSA",
  "Bankwest",
  "HSBC",
  "Citibank",
  "AMP Bank",
  "Judo Bank",
];
const previewBoxStyle = {
  width: "100%",
  height: 140,
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  overflow: "hidden",
  background: "#f8fafc",
};
const previewImgStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover" as const,
  display: "block",
};
const miniPreviewBoxStyle = {
  width: 64,
  height: 44,
  borderRadius: 8,
  border: "1px solid #e2e8f0",
  overflow: "hidden",
  background: "#f8fafc",
};

type WorkerProfile = {
  engagement_type?: "EMPLOYEE_CASUAL" | "CONTRACTOR_ABN" | null;
  title?: string | null;
  name?: string | null;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  dob?: string | null;
  mobile?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  phone?: string | null;
  address_number?: string | null;
  address_floor?: string | null;
  address_unit?: string | null;
  address_building?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  address_suburb?: string | null;
  address_street?: string | null;
  address_city?: string | null;
  address_state?: string | null;
  address_postcode?: string | null;
  address_country?: string | null;
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
  australian_resident_for_tax?: number | null;
  claim_tax_free_threshold?: number | null;
  help_debt?: number | null;
  sfss_debt?: number | null;
  has_own_abn?: number | null;
  company_name?: string | null;
  company_structure?: string | null;
  company_abn?: string | null;
  company_acn?: string | null;
  company_website?: string | null;
  company_address?: string | null;
  company_address_number?: string | null;
  company_address_floor?: string | null;
  company_address_unit?: string | null;
  company_address_building?: string | null;
  company_address_street?: string | null;
  company_address_postcode?: string | null;
  company_tfn?: string | null;
  company_address_same?: number | null;
  privacy_agreed?: number | null;
  indemnity_agreed?: number | null;
  emergency_contact_title?: string | null;
  emergency_contact_first_name?: string | null;
  emergency_contact_family_name?: string | null;
  emergency_contact_mobile?: string | null;
  emergency_contact_email?: string | null;
  bank_account_name?: string | null;
  bank_name?: string | null;
  bank_bsb?: string | null;
  bank_account_number?: string | null;
  company_bank_account_name?: string | null;
  company_bank_bsb?: string | null;
  company_bank_account_number?: string | null;
  delete_requested?: number | null;
  company_number?: string | null;
  working_now_status?: string | null;
  working_now_end_date?: string | null;
  working_now_notes?: string | null;
  holiday_start_date?: string | null;
  holiday_end_date?: string | null;
  availability_from_date?: string | null;
  availability_until_date?: string | null;
  work_experience?: WorkExperienceItem[];
  work_comments?: string | null;
  drivers_license_front_key?: string | null;
  drivers_license_back_key?: string | null;
  drivers_license_front_name?: string | null;
  drivers_license_back_name?: string | null;
  id_document_type?: string | null;
  id_document_front_key?: string | null;
  id_document_back_key?: string | null;
  id_document_front_name?: string | null;
  id_document_back_name?: string | null;
  verified_status?: "unverified" | "pending" | "verified" | null;
};

type TicketItem = {
  ticket_id: string;
  type: string;
  created_at?: number | null;
  front_image_key?: string | null;
  back_image_key?: string | null;
  front_image_name?: string | null;
  back_image_name?: string | null;
  ticket_number?: string | null;
  years_experience?: number | null;
  issue_date?: string | null;
  expiry_date?: string | null;
  verification_status?: string | null;
  renewal_status?: string | null;
};

type TicketDraft = {
  draft_id: string;
  type: string;
  other_type: string;
  issue_date: string;
  ticket_number: string;
  expiry_date: string;
  front_image: string;
  front_image_type: string;
  front_image_name: string;
  back_image: string;
  back_image_type: string;
  back_image_name: string;
  locked?: boolean;
  update_of?: string;
  update_label?: string;
};

type AssignmentItem = {
  assignment_id: string;
  request_id: string;
  status: string;
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

type TaxDeclarationForm = {
  tax_residency_status: "AUSTRALIAN_RESIDENT" | "FOREIGN_RESIDENT" | "WORKING_HOLIDAY_MAKER" | "";
  employment_basis: "FULL_TIME" | "PART_TIME" | "CASUAL" | "LABOUR_HIRE" | "SUPER_INCOME_STREAM" | "";
  claim_tax_free_threshold: boolean | null;
  has_study_training_loan: boolean | null;
  has_sfss_debt: boolean | null;
  tfn_status: "PROVIDED" | "APPLIED_OR_ENQUIRED" | "EXEMPT_UNDER18" | "EXEMPT_PENSION" | "NOT_QUOTED" | "";
  tfn_input: string;
  tfn_last4: string;
  tfn_not_quoted_ack: boolean;
  changed_surname_since_ato: boolean | null;
  previous_family_name: string;
  eligible_to_receive_leave_loading: boolean | null;
  has_student_startup_loan: boolean | null;
  has_trade_support_loan_debt: boolean | null;
  withholding_additional_amount_cents: string;
  withholding_variation_percent: string;
  has_withholding_variation_notice: boolean | null;
  tfn_declaration_full_name: string;
  tfn_declaration_signed: boolean;
};

type WorkExperienceItem = {
  site_name: string;
  position: string;
  start_date: string;
  end_date: string;
  reason: string;
  reason_other?: string;
  reference_name?: string;
  reference_position?: string;
  reference_position_other?: string;
  reference_mobile?: string;
  reference_phone?: string;
  reference_email?: string;
  notes?: string;
  work_media?: WorkMediaItem[];
};

type WorkMediaItem = {
  name: string;
  type: string;
  size: number;
  content?: string;
  description?: string;
  key?: string;
};

const EXPERIENCE_REASONS = [
  "Work site finished",
  "Temporary position",
  "Travel time too long",
  "Not enough pay",
  "Other",
];
const POSITION_OPTIONS = [
  "Project Manager",
  "Site Supervisor",
  "Site Foreman",
  "Construction Manager",
  "Other",
];

const formatAddress = (profile: WorkerProfile) =>
  [
    profile.address_unit ? `Unit ${profile.address_unit}` : "",
    profile.address_floor ? `Floor ${profile.address_floor}` : "",
    profile.address_number || "",
    profile.address_building || "",
    profile.address_street || "",
    profile.address_city || "",
    profile.address_state || "",
    profile.address_postcode || "",
  ]
    .filter(Boolean)
    .join(" ");

const formatCompanyAddress = (profile: WorkerProfile) =>
  [
    profile.company_address_unit ? `Unit ${profile.company_address_unit}` : "",
    profile.company_address_floor ? `Floor ${profile.company_address_floor}` : "",
    profile.company_address_number || "",
    profile.company_address_building || "",
    profile.company_address_street || "",
    profile.company_address_postcode || "",
  ]
    .filter(Boolean)
    .join(" ");

export default function WorkerDashboardPage() {
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [profile, setProfile] = React.useState<WorkerProfile>({
    engagement_type: "EMPLOYEE_CASUAL",
    title: "",
    name: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    dob: "",
    mobile: "",
    whatsapp: "",
    email: "",
    phone: "",
    address_number: "",
    address_floor: "",
    address_unit: "",
    address_building: "",
    address_line1: "",
    address_line2: "",
    address_suburb: "",
    address_street: "",
    address_city: "",
    address_state: "",
    address_postcode: "",
    address_country: "Australia",
    super_fund_name: "",
    super_product_name: "",
    super_choice: "",
    super_status: "",
    super_contribution_restrictions: 0,
    super_fund_type: "",
    super_abn: "",
    super_usi: "",
    smsf_abn: "",
    smsf_bank_bsb: "",
    smsf_bank_account: "",
    smsf_bank_account_name: "",
    smsf_esa: "",
    super_member_number: "",
    tfn: "",
    australian_resident_for_tax: 1,
    claim_tax_free_threshold: 1,
    help_debt: 0,
    sfss_debt: 0,
    has_own_abn: null,
    company_name: "",
    company_structure: "",
    company_abn: "",
    company_acn: "",
    company_website: "",
    company_address: "",
    company_address_number: "",
    company_address_floor: "",
    company_address_unit: "",
    company_address_building: "",
    company_address_street: "",
    company_address_postcode: "",
    company_tfn: "",
    company_address_same: null,
    privacy_agreed: 0,
    indemnity_agreed: 0,
    emergency_contact_title: "",
    emergency_contact_first_name: "",
    emergency_contact_family_name: "",
    emergency_contact_mobile: "",
    emergency_contact_email: "",
    bank_account_name: "",
    bank_bsb: "",
    bank_account_number: "",
    company_bank_account_name: "",
    company_bank_bsb: "",
    company_bank_account_number: "",
    work_experience: [],
    work_comments: "",
  });
  const [tickets, setTickets] = React.useState<TicketItem[]>([]);
  const [assignments, setAssignments] = React.useState<AssignmentItem[]>([]);
  const [taxDeclaration, setTaxDeclaration] = React.useState<TaxDeclarationForm>({
    tax_residency_status: "",
    employment_basis: "",
    claim_tax_free_threshold: null,
    has_study_training_loan: null,
    has_sfss_debt: null,
    tfn_status: "",
    tfn_input: "",
    tfn_last4: "",
    tfn_not_quoted_ack: false,
    changed_surname_since_ato: null,
    previous_family_name: "",
    eligible_to_receive_leave_loading: null,
    has_student_startup_loan: null,
    has_trade_support_loan_debt: null,
    withholding_additional_amount_cents: "",
    withholding_variation_percent: "",
    has_withholding_variation_notice: null,
    tfn_declaration_full_name: "",
    tfn_declaration_signed: false,
  });
  const [taxDeclarationErrors, setTaxDeclarationErrors] = React.useState<Record<string, string>>({});
  const [taxDeclarationMessage, setTaxDeclarationMessage] = React.useState("");
  const [taxDeclarationSaving, setTaxDeclarationSaving] = React.useState(false);
  const [taxDeclarationSubmitting, setTaxDeclarationSubmitting] = React.useState(false);
  const [taxDeclarationLocked, setTaxDeclarationLocked] = React.useState(false);
  const [tfnNotQuotedOpen, setTfnNotQuotedOpen] = React.useState(false);
  const [tfnNotQuotedConfirm, setTfnNotQuotedConfirm] = React.useState(false);
  const [tfnNotQuotedPendingSubmit, setTfnNotQuotedPendingSubmit] = React.useState(false);
  const [tfnNotQuotedPendingStatus, setTfnNotQuotedPendingStatus] = React.useState<TaxDeclarationForm["tfn_status"] | null>(null);
  const [withholdingVariationProof, setWithholdingVariationProof] = React.useState<{ key: string; name: string; type?: string } | null>(null);
  const [withholdingVariationPreview, setWithholdingVariationPreview] = React.useState("");
  const [withholdingVariationUploading, setWithholdingVariationUploading] = React.useState(false);
  const [withholdingVariationError, setWithholdingVariationError] = React.useState("");

  const createTicketDraft = React.useCallback((seed: Partial<TicketDraft> = {}): TicketDraft => ({
    draft_id: crypto.randomUUID(),
    type: "",
    other_type: "",
    issue_date: "",
    ticket_number: "",
    expiry_date: "",
    front_image: "",
    front_image_type: "",
    front_image_name: "",
    back_image: "",
    back_image_type: "",
    back_image_name: "",
    locked: false,
    update_of: "",
    update_label: "",
    ...seed,
  }), []);
  const [ticketForms, setTicketForms] = React.useState<TicketDraft[]>([
    createTicketDraft({ type: "White Card (WHS)", locked: true }),
  ]);
  const [ticketErrors, setTicketErrors] = React.useState<Record<string, {
    type?: string;
    other_type?: string;
    ticket_number?: string;
    issue_date?: string;
    expiry_date?: string;
    front_image?: string;
    back_image?: string;
  }>>({});
  const [ticketSaving, setTicketSaving] = React.useState<Record<string, boolean>>({});
  const [ticketSaved, setTicketSaved] = React.useState<Record<string, boolean>>({});
  const [submitMessage, setSubmitMessage] = React.useState("");
  const [submitStatus, setSubmitStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [whiteCardError, setWhiteCardError] = React.useState("");
  const [ticketClock, setTicketClock] = React.useState(0);
  const [workExperienceRows, setWorkExperienceRows] = React.useState<WorkExperienceItem[]>([
    { site_name: "", position: "", start_date: "", end_date: "", reason: "", work_media: [] },
  ]);
  const [workMediaError, setWorkMediaError] = React.useState("");
  const [submitAttempted, setSubmitAttempted] = React.useState(false);
  const [profileSaveMessage, setProfileSaveMessage] = React.useState("");
  const [profileErrors, setProfileErrors] = React.useState<Record<string, string>>({});
  const [profileSaving, setProfileSaving] = React.useState(false);
  const [workExperienceSaving, setWorkExperienceSaving] = React.useState(false);
  const [workExperienceMessage, setWorkExperienceMessage] = React.useState("");
  const [deleteReason, setDeleteReason] = React.useState("");
  const [mapsKey, setMapsKey] = React.useState("");
  const [mapError, setMapError] = React.useState("");
  const [previewModal, setPreviewModal] = React.useState<{ src: string; alt: string } | null>(null);
  const [fundQuery, setFundQuery] = React.useState("");
  const [fundResults, setFundResults] = React.useState<SuperFundResult[]>([]);
  const [fundLoading, setFundLoading] = React.useState(false);
  const [fundProducts, setFundProducts] = React.useState<SuperFundProduct[]>([]);
  const [productLoading, setProductLoading] = React.useState(false);
  const [fundWarning, setFundWarning] = React.useState("");
  const [legalDoc, setLegalDoc] = React.useState<LegalDocument | null>(null);
  const [legalOpen, setLegalOpen] = React.useState(false);
  const [docUploads, setDocUploads] = React.useState({
    drivers_license_front: "",
    drivers_license_front_type: "",
    drivers_license_back: "",
    drivers_license_back_type: "",
    drivers_license_front_name: "",
    drivers_license_back_name: "",
    id_document_type: "",
    id_document_front: "",
    id_document_front_type: "",
    id_document_back: "",
    id_document_back_type: "",
    id_document_front_name: "",
    id_document_back_name: "",
  });
  const [docPreviews, setDocPreviews] = React.useState({
    drivers_license_front: "",
    drivers_license_back: "",
    id_document_front: "",
    id_document_back: "",
  });
  const streetRef = React.useRef<HTMLInputElement | null>(null);
  const streetAutocomplete = React.useRef<google.maps.places.Autocomplete | null>(null);
  const companyStreetRef = React.useRef<HTMLInputElement | null>(null);
  const companyStreetAutocomplete = React.useRef<google.maps.places.Autocomplete | null>(null);
  const mapRef = React.useRef<HTMLDivElement | null>(null);
  const mapInstance = React.useRef<google.maps.Map | null>(null);
  const mapMarker = React.useRef<google.maps.Marker | null>(null);
  const geocoderRef = React.useRef<google.maps.Geocoder | null>(null);
  const lastGeocoded = React.useRef<string>("");

  const onProfileChange = (field: keyof WorkerProfile, value: string | number) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };
  const onTaxDeclarationChange = (field: keyof TaxDeclarationForm, value: string | boolean) => {
    setTaxDeclaration((prev) => ({ ...prev, [field]: value }));
    setTaxDeclarationErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };
  const handleTfnStatusChange = (value: TaxDeclarationForm["tfn_status"]) => {
    if (value === "NOT_QUOTED" && !taxDeclaration.tfn_not_quoted_ack) {
      setTfnNotQuotedPendingStatus(value);
      setTfnNotQuotedPendingSubmit(false);
      setTfnNotQuotedConfirm(false);
      setTfnNotQuotedOpen(true);
      return;
    }
    onTaxDeclarationChange("tfn_status", value);
    if (value !== "NOT_QUOTED") {
      onTaxDeclarationChange("tfn_not_quoted_ack", false);
    }
  };
  const superChoice = profile.super_choice || profile.super_fund_type || "";

  const attachAutocomplete = (
    input: HTMLInputElement | null,
    storeRef: React.MutableRefObject<google.maps.places.Autocomplete | null>,
    onPlace: (place: google.maps.places.PlaceResult) => void,
  ) => {
    if (!input || !window.google?.maps?.places) return;
    storeRef.current = new google.maps.places.Autocomplete(input, {
      types: ["address"],
      componentRestrictions: { country: "au" },
    });
    storeRef.current.addListener("place_changed", () => {
      const place = storeRef.current?.getPlace();
      if (place) onPlace(place);
    });
  };

  const loadWorkerProfile = React.useCallback(async () => {
    const [profileJson, ticketJson, assignmentsJson] = await Promise.all([
      fetch("/api/workers/me").then((r) => r.json()),
      fetch("/api/workers/me/tickets").then((r) => r.json()),
      fetch("/api/workers/me/assignments").then((r) => r.json()),
    ]);
    if (!profileJson.ok) throw new Error("Profile load failed");
    const nextProfile = profileJson.profile || {};
    setProfile({
      engagement_type: nextProfile.engagement_type || "EMPLOYEE_CASUAL",
      ...nextProfile,
    });
    setFundQuery(nextProfile.super_fund_name || "");
    setDocUploads((prev) => ({
      ...prev,
      id_document_type: nextProfile.id_document_type || "",
      drivers_license_front_name: nextProfile.drivers_license_front_name || "",
      drivers_license_back_name: nextProfile.drivers_license_back_name || "",
      id_document_front_name: nextProfile.id_document_front_name || "",
      id_document_back_name: nextProfile.id_document_back_name || "",
    }));
    setDocPreviews({
      drivers_license_front: nextProfile.drivers_license_front_key
        ? `/api/workers/me/document?key=${encodeURIComponent(nextProfile.drivers_license_front_key)}`
        : "",
      drivers_license_back: nextProfile.drivers_license_back_key
        ? `/api/workers/me/document?key=${encodeURIComponent(nextProfile.drivers_license_back_key)}`
        : "",
      id_document_front: nextProfile.id_document_front_key
        ? `/api/workers/me/document?key=${encodeURIComponent(nextProfile.id_document_front_key)}`
        : "",
      id_document_back: nextProfile.id_document_back_key
        ? `/api/workers/me/document?key=${encodeURIComponent(nextProfile.id_document_back_key)}`
        : "",
    });
    setWorkExperienceRows(
      profileJson.profile?.work_experience?.length
        ? profileJson.profile.work_experience.map((row: WorkExperienceItem) => ({
            ...row,
            work_media: row.work_media || [],
          }))
        : [{ site_name: "", position: "", start_date: "", end_date: "", reason: "", work_media: [] }],
    );
    const nextTickets = ticketJson.tickets || [];
    setTickets(nextTickets);
    const hasWhiteCard = nextTickets.some((ticket: TicketItem) => ticket.type === "White Card (WHS)");
    setTicketForms(hasWhiteCard ? [createTicketDraft()] : [createTicketDraft({ type: "White Card (WHS)", locked: true })]);
    setAssignments(assignmentsJson.assignments || []);
  }, [createTicketDraft]);

  const loadTaxDeclaration = React.useCallback(async () => {
    const res = await fetch("/api/worker/tax-declaration");
    const json = await res.json();
    if (!json?.ok) return;
    const declaration = json.declaration || null;
    if (!declaration) {
      setTaxDeclaration((prev) => ({
        ...prev,
        tfn_declaration_full_name:
          [profile.first_name, profile.middle_name, profile.last_name].filter(Boolean).join(" ") || prev.tfn_declaration_full_name,
      }));
      setTaxDeclarationLocked(false);
      return;
    }
    const toBool = (value: unknown) => (value === null || value === undefined ? null : !!value);
    setTaxDeclaration({
      tax_residency_status: declaration.tax_residency_status || "",
      employment_basis: declaration.employment_basis || "",
      claim_tax_free_threshold: toBool(declaration.claim_tax_free_threshold),
      has_study_training_loan: toBool(declaration.has_study_training_loan),
      has_sfss_debt: toBool(declaration.has_sfss_debt),
      tfn_status: declaration.tfn_status || "",
      tfn_input: "",
      tfn_last4: declaration.tfn_last4 || "",
      tfn_not_quoted_ack: !!declaration.tfn_not_quoted_ack,
      changed_surname_since_ato: toBool(declaration.changed_surname_since_ato),
      previous_family_name: declaration.previous_family_name || "",
      eligible_to_receive_leave_loading: toBool(declaration.eligible_to_receive_leave_loading),
      has_student_startup_loan: toBool(declaration.has_student_startup_loan),
      has_trade_support_loan_debt: toBool(declaration.has_trade_support_loan_debt),
      withholding_additional_amount_cents:
        typeof declaration.withholding_additional_amount_cents === "number"
          ? Math.round(declaration.withholding_additional_amount_cents / 100).toString()
          : "",
      withholding_variation_percent: declaration.withholding_variation_percent?.toString() || "",
      has_withholding_variation_notice: null,
      tfn_declaration_full_name: declaration.tfn_declaration_full_name || "",
      tfn_declaration_signed: !!declaration.tfn_declaration_signed,
    });
    setTaxDeclarationLocked(!!declaration.tfn_declaration_signed);
  }, [profile.first_name, profile.middle_name, profile.last_name]);

  const loadWithholdingVariationProof = React.useCallback(async () => {
    const res = await fetch("/api/worker/tax-declaration/withholding-variation-proof");
    const json = await res.json();
    if (!json?.ok) return;
    const doc = json.document || null;
    if (!doc) {
      setWithholdingVariationProof(null);
      setWithholdingVariationPreview("");
      setTaxDeclaration((prev) => ({ ...prev, has_withholding_variation_notice: false }));
      return;
    }
    setWithholdingVariationProof({ key: doc.file_key, name: doc.file_name, type: doc.file_type || undefined });
    const preview = doc.file_key && (doc.file_type || "").startsWith("image/")
      ? `/api/worker/tax-declaration/withholding-variation-proof?key=${encodeURIComponent(doc.file_key)}`
      : "";
    setWithholdingVariationPreview(preview);
    setTaxDeclaration((prev) => ({ ...prev, has_withholding_variation_notice: true }));
  }, []);

  React.useEffect(() => {
    loadWorkerProfile().catch(() => setError("Unable to load worker profile."));
    loadTaxDeclaration().catch(() => null);
    loadWithholdingVariationProof().catch(() => null);
  }, [loadTaxDeclaration, loadWorkerProfile, loadWithholdingVariationProof]);

  React.useEffect(() => {
    const dayMs = 1000 * 60 * 60 * 24;
    setTicketClock(Date.now());
    const interval = window.setInterval(() => setTicketClock(Date.now()), dayMs);
    return () => window.clearInterval(interval);
  }, []);

  React.useEffect(() => {
    const envKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
    if (envKey) {
      setMapsKey(envKey);
      return;
    }
    fetch("/api/public-config")
      .then((res) => res.json())
      .then((data) => {
        if (data?.mapsKey) {
          setMapsKey(data.mapsKey);
        }
      })
      .catch(() => null);
  }, []);

  React.useEffect(() => {
    if (!mapsKey) {
      setMapError("Google Maps key is not configured.");
      return;
    }
    if (!mapsKey || typeof window === "undefined") return;
    const ensureMap = () => {
      if (!mapRef.current || !window.google?.maps) return;
      if (mapInstance.current) return;
      mapInstance.current = new google.maps.Map(mapRef.current, {
        center: { lat: -33.8688, lng: 151.2093 },
        zoom: 13,
      });
      mapMarker.current = new google.maps.Marker({
        map: mapInstance.current,
        position: { lat: -33.8688, lng: 151.2093 },
      });
      geocoderRef.current = new google.maps.Geocoder();
      setMapError("");
    };
    const initAutocomplete = () => {
      if (!window.google?.maps?.places) return;
      ensureMap();
      attachAutocomplete(streetRef.current, streetAutocomplete, (place) => {
        const address = place.formatted_address;
        const components = place.address_components || [];
        const getPart = (type: string) => components.find((c) => c.types.includes(type))?.long_name || "";
        const streetNumber = getPart("street_number");
        const route = getPart("route");
        const locality = getPart("locality") || getPart("postal_town");
        const state = getPart("administrative_area_level_1");
        const postcode = getPart("postal_code");
        if (streetNumber) onProfileChange("address_number", streetNumber);
        if (route) onProfileChange("address_street", route);
        if (locality) onProfileChange("address_city", locality);
        if (state) onProfileChange("address_state", state);
        if (postcode) onProfileChange("address_postcode", postcode);
        if (address && !route) onProfileChange("address_street", address);
        if (place.geometry?.location && mapInstance.current && mapMarker.current) {
          mapInstance.current.setCenter(place.geometry.location);
          mapMarker.current.setPosition(place.geometry.location);
          mapInstance.current.setZoom(15);
        }
      });
      attachAutocomplete(companyStreetRef.current, companyStreetAutocomplete, (place) => {
        const address = place.formatted_address;
        const components = place.address_components || [];
        const getPart = (type: string) => components.find((c) => c.types.includes(type))?.long_name || "";
        const streetNumber = getPart("street_number");
        const route = getPart("route");
        const postcode = getPart("postal_code");
        if (streetNumber) onProfileChange("company_address_number", streetNumber);
        if (route) onProfileChange("company_address_street", route);
        if (postcode) onProfileChange("company_address_postcode", postcode);
        if (address && !route) onProfileChange("company_address_street", address);
      });
    };
    if (window.google?.maps?.places) {
      initAutocomplete();
      return;
    }
    const existing = document.querySelector(`script[src*="maps.googleapis.com/maps/api/js"]`);
    if (existing) {
      existing.addEventListener("load", initAutocomplete);
      return () => existing.removeEventListener("load", initAutocomplete);
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${mapsKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", initAutocomplete);
    script.addEventListener("error", () => setMapError("Google Maps failed to load."));
    document.head.appendChild(script);
    return () => {
      script.removeEventListener("load", initAutocomplete);
      script.removeEventListener("error", () => setMapError("Google Maps failed to load."));
    };
  }, [mapsKey]);

  React.useEffect(() => {
    if (!profile.has_own_abn) return;
    if (!window.google?.maps?.places) return;
    if (!companyStreetRef.current || companyStreetAutocomplete.current) return;
    attachAutocomplete(companyStreetRef.current, companyStreetAutocomplete, (place) => {
      const address = place.formatted_address;
      const components = place.address_components || [];
      const getPart = (type: string) => components.find((c) => c.types.includes(type))?.long_name || "";
      const streetNumber = getPart("street_number");
      const route = getPart("route");
      const postcode = getPart("postal_code");
      if (streetNumber) onProfileChange("company_address_number", streetNumber);
      if (route) onProfileChange("company_address_street", route);
      if (postcode) onProfileChange("company_address_postcode", postcode);
      if (address && !route) onProfileChange("company_address_street", address);
    });
  }, [profile.has_own_abn, profile.company_address_same]);

  React.useEffect(() => {
    if (profile.company_address_same !== 1) return;
    const formatted = [
      profile.address_unit ? `Unit ${profile.address_unit}` : "",
      profile.address_floor ? `Floor ${profile.address_floor}` : "",
      profile.address_number || "",
      profile.address_building || "",
      profile.address_street || "",
      profile.address_city || "",
      profile.address_state || "",
      profile.address_postcode || "",
    ]
      .filter(Boolean)
      .join(" ");
    if (formatted && profile.company_address !== formatted) {
      onProfileChange("company_address", formatted);
    }
    if (profile.address_number && profile.company_address_number !== profile.address_number) {
      onProfileChange("company_address_number", profile.address_number);
    }
    if (profile.address_floor && profile.company_address_floor !== profile.address_floor) {
      onProfileChange("company_address_floor", profile.address_floor);
    }
    if (profile.address_unit && profile.company_address_unit !== profile.address_unit) {
      onProfileChange("company_address_unit", profile.address_unit);
    }
    if (profile.address_building && profile.company_address_building !== profile.address_building) {
      onProfileChange("company_address_building", profile.address_building);
    }
    if (profile.address_street && profile.company_address_street !== profile.address_street) {
      onProfileChange("company_address_street", profile.address_street);
    }
    if (profile.address_postcode && profile.company_address_postcode !== profile.address_postcode) {
      onProfileChange("company_address_postcode", profile.address_postcode);
    }
  }, [
    profile.company_address_same,
    profile.address_unit,
    profile.address_floor,
    profile.address_number,
    profile.address_building,
    profile.address_street,
    profile.address_city,
    profile.address_state,
    profile.address_postcode,
    profile.company_address,
    profile.company_address_number,
    profile.company_address_floor,
    profile.company_address_unit,
    profile.company_address_building,
    profile.company_address_street,
    profile.company_address_postcode,
  ]);

  React.useEffect(() => {
    if (superChoice !== "REGULATED") {
      setFundResults([]);
      setFundProducts([]);
      setFundWarning("");
      return;
    }
    const query = fundQuery.trim();
    if (query.length < 2) {
      setFundResults([]);
      return;
    }
    let active = true;
    setFundLoading(true);
    const handle = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/superfunds/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        if (active) {
          setFundResults(Array.isArray(json?.results) ? json.results : []);
        }
      } catch {
        if (active) setFundResults([]);
      } finally {
        if (active) setFundLoading(false);
      }
    }, 300);
    return () => {
      active = false;
      window.clearTimeout(handle);
    };
  }, [fundQuery, superChoice]);

  React.useEffect(() => {
    if (superChoice !== "REGULATED") return;
    if (!profile.super_abn) {
      setFundProducts([]);
      setFundWarning("");
      return;
    }
    let active = true;
    setProductLoading(true);
    fetch(`/api/superfunds/products?abn=${encodeURIComponent(profile.super_abn)}`)
      .then((res) => res.json())
      .then((json) => {
        if (!active) return;
        setFundProducts(Array.isArray(json?.products) ? json.products : []);
      })
      .catch(() => {
        if (active) setFundProducts([]);
      })
      .finally(() => {
        if (active) setProductLoading(false);
      });
    return () => {
      active = false;
    };
  }, [profile.super_abn, superChoice]);

  React.useEffect(() => {
    if (superChoice !== "REGULATED") {
      setFundWarning("");
      return;
    }
    const selected = fundProducts.find((product) => product.usi === profile.super_usi);
    if (selected?.contributionRestrictions) {
      setFundWarning("This super product may restrict contributions. Please confirm with your fund if unsure.");
    } else {
      setFundWarning("");
    }
  }, [fundProducts, profile.super_usi, superChoice]);

  React.useEffect(() => {
    const addressComplete = profile.address_street;
    if (!addressComplete) return;
    if (!window.google?.maps || !mapInstance.current) return;
    if (!geocoderRef.current) {
      geocoderRef.current = new google.maps.Geocoder();
    }
    const query = [
      profile.address_number || "",
      profile.address_building || "",
      profile.address_street || "",
      profile.address_postcode || "",
    ]
      .filter(Boolean)
      .join(" ");
    if (!query || query === lastGeocoded.current) return;
    geocoderRef.current.geocode({ address: query }, (results, status) => {
      if (status !== "OK" || !results?.[0]?.geometry?.location) return;
      const location = results[0].geometry.location;
      mapInstance.current?.setCenter(location);
      mapMarker.current?.setPosition(location);
      mapInstance.current?.setZoom(15);
      lastGeocoded.current = query;
    });
  }, [
    profile.address_number,
    profile.address_building,
    profile.address_street,
    profile.address_postcode,
  ]);

  const readFileAsBase64 = (file: File) =>
    new Promise<{ base64: string; type: string }>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === "string" ? reader.result : "";
        const base64 = result.includes(",") ? result.split(",")[1] : result;
        resolve({ base64: base64 || "", type: file.type });
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const uploadWithholdingVariationProof = async (file: File) => {
    setWithholdingVariationError("");
    setWithholdingVariationUploading(true);
    try {
      const data = await readFileAsBase64(file);
      const res = await fetch("/api/worker/tax-declaration/withholding-variation-proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_name: file.name,
          file_type: data.type,
          file_base64: data.base64,
        }),
      });
      const json = await res.json();
      if (!json?.ok) {
        setWithholdingVariationError(json?.error || "Unable to upload proof.");
        return;
      }
      const doc = json.document;
      setWithholdingVariationProof(doc ? { key: doc.file_key, name: doc.file_name, type: doc.file_type || undefined } : null);
      const preview = doc?.file_key && (doc.file_type || "").startsWith("image/")
        ? `/api/worker/tax-declaration/withholding-variation-proof?key=${encodeURIComponent(doc.file_key)}`
        : "";
      setWithholdingVariationPreview(preview);
      setTaxDeclaration((prev) => ({ ...prev, has_withholding_variation_notice: true }));
    } finally {
      setWithholdingVariationUploading(false);
    }
  };

  const deleteWithholdingVariationProof = async () => {
    setWithholdingVariationError("");
    const res = await fetch("/api/worker/tax-declaration/withholding-variation-proof", { method: "DELETE" });
    const json = await res.json();
    if (!json?.ok) {
      setWithholdingVariationError(json?.error || "Unable to delete proof.");
      return;
    }
    setWithholdingVariationProof(null);
    setWithholdingVariationPreview("");
    setTaxDeclaration((prev) => ({ ...prev, has_withholding_variation_notice: false }));
  };

  const handleExperienceMediaChange = async (index: number, mediaIndex: number, file: File | null) => {
    if (!file) return;
    const maxTotal = 10 * 1024 * 1024;
    const data = await readFileAsBase64(file);
    const nextRows = [...workExperienceRows];
    const current = nextRows[index];
    const mediaList = [...(current.work_media || [])];
    const nextItem = mediaList[mediaIndex] || { name: "", type: "", size: 0, content: "", description: "" };
    mediaList[mediaIndex] = {
      ...nextItem,
      name: file.name,
      type: file.type,
      size: file.size,
      content: data.base64,
    };
    const total = mediaList.reduce((sum, item) => sum + (item.size || 0), 0);
    if (total > maxTotal) {
      setWorkMediaError("Work media exceeds 10MB total. Please reduce file sizes.");
      return;
    }
    nextRows[index] = { ...current, work_media: mediaList };
    setWorkExperienceRows(nextRows);
  };

  const deleteExperienceMedia = async (index: number, mediaIndex: number) => {
    const nextRows = [...workExperienceRows];
    const current = nextRows[index];
    const mediaList = [...(current.work_media || [])];
    const target = mediaList[mediaIndex];
    if (target?.key) {
      await fetch(`/api/workers/me/media?key=${encodeURIComponent(target.key)}`, { method: "DELETE" });
    }
    mediaList.splice(mediaIndex, 1);
    nextRows[index] = { ...current, work_media: mediaList };
    setWorkExperienceRows(nextRows);
    setWorkExperienceMessage("Work media removed. Please save work experience.");
  };

  const stripEmptyFields = (payload: Record<string, unknown>, keep: Set<string> = new Set()) =>
    Object.fromEntries(
      Object.entries(payload).filter(([key, value]) => {
        if (keep.has(key)) return true;
        if (Array.isArray(value)) return true;
        if (value === undefined || value === null) return false;
        if (typeof value === "string" && value.trim() === "") return false;
        return true;
      }),
    );

  const saveProfileRequest = async (
    submitForApproval: boolean,
    options: { showProfileMessage?: boolean } = {},
  ) => {
    setMessage("");
    if (options.showProfileMessage !== false) {
      setProfileSaveMessage("");
    }
    setWorkMediaError("");
    setError("");
    const formattedAddress = formatAddress(profile);
    const formattedCompanyAddress = formatCompanyAddress(profile);
    const companyAddress =
      profile.company_address_same ? formattedAddress : formattedCompanyAddress || profile.company_address || "";
    const companyAddressSame = profile.company_address_same === 1;
    const hasOwnAbn = profile.has_own_abn === 1;
    const completeWorkRows = workExperienceRows
      .filter((row) => row.site_name && row.position && row.start_date && row.reason)
      .map((row) => ({
        ...row,
        work_media: (row.work_media || []).filter((media) => media.name),
      }));
    const resolvedSuperChoice = superChoice || profile.super_choice || profile.super_fund_type || "";
    const resolvedSuperStatus =
      resolvedSuperChoice === "STAPLED" ? "PENDING_PAYROLL" : profile.super_status || "";
    const rawPayload = {
      ...profile,
      ...docUploads,
      privacy_agreed: !!profile.privacy_agreed,
      indemnity_agreed: !!profile.indemnity_agreed,
      has_own_abn: hasOwnAbn,
      company_address_same: companyAddressSame,
      company_address: companyAddress,
      work_experience: completeWorkRows,
      super_choice: resolvedSuperChoice,
      super_fund_type: resolvedSuperChoice || profile.super_fund_type || "",
      super_status: resolvedSuperStatus,
      submit_for_approval: submitForApproval,
    };
    const payload = stripEmptyFields(rawPayload, new Set(["submit_for_approval"]));
    const res = await fetch("/api/workers/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => null);
    if (res.status === 403 && json?.code === "NEEDS_LEGAL_ACCEPTANCE" && json?.document) {
      const doc = LEGAL_DOCUMENTS[json.document as keyof typeof LEGAL_DOCUMENTS] || null;
      if (doc) {
        setLegalDoc(doc);
        setLegalOpen(true);
      }
      return { ok: false, error: json?.error || "Legal acceptance required." };
    }
    if (!res.ok) {
      if (submitForApproval) {
        const issueMessages = Array.isArray(json?.details?.issues)
          ? (json.details.issues as Array<{ path?: string; message?: string }>)
              .map((issue) => {
                const path = issue.path ? `${issue.path}: ` : "";
                return issue.message ? `${path}${issue.message}` : "";
              })
              .filter(Boolean)
          : [];
        const fieldErrors = json?.details?.fieldErrors
          ? Object.values(json.details.fieldErrors as Record<string, string[]>)
              .flat()
              .filter(Boolean)
          : [];
        const detailParts = [...issueMessages, ...fieldErrors];
        const detailMessage = detailParts.length ? ` ${detailParts.join(" ")}` : "";
        setError(`${json?.error || "Unable to submit profile."}${detailMessage}`);
      } else if (options.showProfileMessage !== false) {
        setProfileSaveMessage(json?.error || "Unable to save profile.");
      }
      return { ok: false, error: json?.error || "Unable to save profile." };
    }
    if (submitForApproval) {
      return { ok: true };
    }
    const baseMessage = "Profile is saved but not approved until submitted at the bottom of the page SUBMIT PROFILE.";
    const warning = json?.warning ? ` ${json.warning}` : "";
    if (options.showProfileMessage !== false) {
      setProfileSaveMessage(`${baseMessage}${warning}`);
    }
    if (options.showProfileMessage !== false) {
      try {
        await loadWorkerProfile();
      } catch {
        setError("Profile saved, but unable to refresh details.");
      }
    }
    return { ok: true, warning: json?.warning || "" };
  };

  const getProfileErrors = () => {
    const nextErrors: Record<string, string> = {};
    if (!profile.title?.trim()) nextErrors.title = "Required";
    if (!profile.first_name?.trim()) nextErrors.first_name = "Required";
    if (!profile.last_name?.trim()) nextErrors.last_name = "Required";
    if (!profile.dob?.trim()) nextErrors.dob = "Required";
    if (!profile.mobile?.trim()) nextErrors.mobile = "Required";
    if (!profile.address_number?.trim()) nextErrors.address_number = "Required";
    if (!profile.address_street?.trim()) nextErrors.address_street = "Required";
    if (!profile.address_postcode?.trim()) nextErrors.address_postcode = "Required";
    if (engagementType === "EMPLOYEE_CASUAL" && !superChoice) nextErrors.super_choice = "Please choose a superannuation option.";
    if (!docUploads.id_document_type?.trim()) {
      nextErrors.id_document_type = "Required";
    }
    const hasLicenseFront = !!docUploads.drivers_license_front || !!profile.drivers_license_front_key;
    const hasLicenseBack = !!docUploads.drivers_license_back || !!profile.drivers_license_back_key;
    const hasIdFront = !!docUploads.id_document_front || !!profile.id_document_front_key;
    const hasIdBack = !!docUploads.id_document_back || !!profile.id_document_back_key;
    if (docUploads.id_document_type === "driving_licence") {
      if (!hasLicenseFront) nextErrors.drivers_license_front = "Required";
      if (!hasLicenseBack) nextErrors.drivers_license_back = "Required";
    }
    if (docUploads.id_document_type === "passport") {
      if (!hasIdFront) nextErrors.id_document_front = "Required";
    }
    if (docUploads.id_document_type === "other") {
      if (!hasIdFront) nextErrors.id_document_front = "Required";
      if (!hasIdBack) nextErrors.id_document_back = "Required";
    }
    return nextErrors;
  };

  const getTaxDeclarationErrors = (requireSignature: boolean) => {
    const nextErrors: Record<string, string> = {};
    if (!taxDeclaration.tax_residency_status) nextErrors.tax_residency_status = "Required";
    if (!taxDeclaration.employment_basis) nextErrors.employment_basis = "Required";
    if (taxDeclaration.claim_tax_free_threshold === null) nextErrors.claim_tax_free_threshold = "Required";
    if (taxDeclaration.has_study_training_loan === null) nextErrors.has_study_training_loan = "Required";
    if (taxDeclaration.has_sfss_debt === null) nextErrors.has_sfss_debt = "Required";
    if (!taxDeclaration.tfn_status) nextErrors.tfn_status = "Required";
    if (taxDeclaration.tfn_status === "PROVIDED") {
      const tfnCandidate = taxDeclaration.tfn_input.trim();
      if (!tfnCandidate && !taxDeclaration.tfn_last4) {
        nextErrors.tfn_input = "TFN is required.";
      }
    }
    if (taxDeclaration.tfn_status === "NOT_QUOTED" && !taxDeclaration.tfn_not_quoted_ack) {
      nextErrors.tfn_not_quoted_ack = "Please acknowledge the TFN notice.";
    }
    if (taxDeclaration.changed_surname_since_ato && !taxDeclaration.previous_family_name.trim()) {
      nextErrors.previous_family_name = "Required";
    }
    if (taxDeclaration.tax_residency_status === "WORKING_HOLIDAY_MAKER" && taxDeclaration.claim_tax_free_threshold) {
      nextErrors.claim_tax_free_threshold =
        "Working holiday makers generally do not claim the tax-free threshold. Please check with payroll if unsure.";
    }
    if (taxDeclaration.has_withholding_variation_notice && !withholdingVariationProof) {
      nextErrors.withholding_variation_notice = "Please upload the ATO-approved variation notice.";
    }
    if (requireSignature && !taxDeclaration.tfn_declaration_signed) {
      nextErrors.tfn_declaration_signed = "Please sign the declaration.";
    }
    return nextErrors;
  };

  const saveTaxDeclaration = async (submit: boolean, skipNotQuotedModal = false) => {
    setTaxDeclarationMessage("");
    setError("");
    if (engagementType !== "EMPLOYEE_CASUAL") {
      setTaxDeclarationMessage("Tax declaration is only required for Employee (Casual Labour Hire).");
      return { ok: false };
    }
    if (!skipNotQuotedModal && taxDeclaration.tfn_status === "NOT_QUOTED" && !taxDeclaration.tfn_not_quoted_ack) {
      setTfnNotQuotedPendingSubmit(submit);
      setTfnNotQuotedPendingStatus("NOT_QUOTED");
      setTfnNotQuotedConfirm(false);
      setTfnNotQuotedOpen(true);
      return { ok: false };
    }
    const nextErrors = getTaxDeclarationErrors(submit);
    setTaxDeclarationErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setTaxDeclarationMessage("Please fill in the highlighted tax declaration fields.");
      return { ok: false };
    }
    const fullName = [profile.first_name, profile.middle_name, profile.last_name].filter(Boolean).join(" ").trim();
    setTaxDeclarationSaving(!submit);
    setTaxDeclarationSubmitting(submit);
    const payload = {
      tax_residency_status: taxDeclaration.tax_residency_status,
      employment_basis: engagementType === "EMPLOYEE_CASUAL" ? "LABOUR_HIRE" : taxDeclaration.employment_basis,
      claim_tax_free_threshold: !!taxDeclaration.claim_tax_free_threshold,
      has_study_training_loan: !!taxDeclaration.has_study_training_loan,
      has_sfss_debt: !!taxDeclaration.has_sfss_debt,
      tfn_status: taxDeclaration.tfn_status,
      tfn_not_quoted_ack: skipNotQuotedModal ? true : taxDeclaration.tfn_not_quoted_ack,
      tfn: taxDeclaration.tfn_status === "PROVIDED" ? taxDeclaration.tfn_input : "",
      changed_surname_since_ato: !!taxDeclaration.changed_surname_since_ato,
      previous_family_name: taxDeclaration.previous_family_name,
      eligible_to_receive_leave_loading:
        engagementType === "EMPLOYEE_CASUAL" ? false : !!taxDeclaration.eligible_to_receive_leave_loading,
      has_student_startup_loan: !!taxDeclaration.has_student_startup_loan,
      has_trade_support_loan_debt: !!taxDeclaration.has_trade_support_loan_debt,
      withholding_additional_amount_cents: taxDeclaration.withholding_additional_amount_cents
        ? Number(taxDeclaration.withholding_additional_amount_cents) * 100
        : undefined,
      tfn_declaration_full_name: fullName || taxDeclaration.tfn_declaration_full_name,
      tfn_declaration_signed: submit ? taxDeclaration.tfn_declaration_signed : false,
    };
    const res = await fetch("/api/worker/tax-declaration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => null);
    setTaxDeclarationSaving(false);
    setTaxDeclarationSubmitting(false);
    if (!res.ok) {
      setTaxDeclarationMessage(json?.error || "Unable to save tax declaration.");
      return { ok: false };
    }
    if (json?.declaration) {
      setTaxDeclaration((prev) => ({
        ...prev,
        tfn_last4: json.declaration.tfn_last4 || prev.tfn_last4,
        tfn_input: "",
      }));
      if (json.declaration.tfn_declaration_signed) {
        setTaxDeclarationLocked(true);
      }
    }
    setTaxDeclarationMessage(submit ? "Tax declaration submitted and signed." : "Tax declaration saved.");
    return { ok: true };
  };

  const submitProfile = async () => {
    setError("");
    setSubmitMessage("");
    setSubmitStatus("idle");
    setSubmitAttempted(true);
    const nextErrors = getProfileErrors();
    const taxErrors = engagementType === "EMPLOYEE_CASUAL" ? getTaxDeclarationErrors(true) : {};
    setTaxDeclarationErrors(taxErrors);
    setProfileErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || Object.keys(taxErrors).length > 0) {
      const sections: string[] = [];
      const errorKeys = new Set(Object.keys(nextErrors));
      const hasProfileFields = [
        "title",
        "first_name",
        "last_name",
        "dob",
        "mobile",
        "address_number",
        "address_street",
        "address_postcode",
      ].some((key) => errorKeys.has(key));
      if (hasProfileFields) sections.push("Your profile");
      if (errorKeys.has("id_document_type") || errorKeys.has("drivers_license_front") || errorKeys.has("drivers_license_back") || errorKeys.has("id_document_front") || errorKeys.has("id_document_back")) {
        sections.push("Identification documents");
      }
      if (errorKeys.has("super_choice")) sections.push("Superannuation choice");
      if (engagementType === "EMPLOYEE_CASUAL" && Object.keys(taxErrors).length > 0) sections.push("Tax declarations");
      const sectionText = sections.length ? ` SECTIONS MISSING: ${sections.join(", ")}.` : "";
      setSubmitMessage(`Please see above missing information boxes highlighted in red.${sectionText}`);
      setSubmitStatus("error");
      return;
    }
    if (!profile.privacy_agreed || !profile.indemnity_agreed) {
      setSubmitMessage("Please agree to the privacy and indemnity statements before submitting for approval.");
      setSubmitStatus("error");
      return;
    }
    const hasWhiteCard = tickets.some((ticket) => ticket.type === "White Card (WHS)");
    if (!hasWhiteCard) {
      const whiteCardDraft = ticketForms.find((draft) => draft.type === "White Card (WHS)");
      if (whiteCardDraft) {
        const nextErrors: {
          type?: string;
          other_type?: string;
          ticket_number?: string;
          issue_date?: string;
          expiry_date?: string;
          front_image?: string;
          back_image?: string;
        } = {};
        if (!whiteCardDraft.ticket_number.trim()) {
          nextErrors.ticket_number = "Ticket / Card number is required.";
        }
        if (!whiteCardDraft.issue_date) {
          nextErrors.issue_date = "Ticket issue / training date is required.";
        }
        if (!whiteCardDraft.expiry_date) {
          nextErrors.expiry_date = "Expiry date is required.";
        }
        if (!whiteCardDraft.front_image) {
          nextErrors.front_image = "White Card front image is required.";
        }
        if (!whiteCardDraft.back_image) {
          nextErrors.back_image = "White Card back image is required.";
        }
        setTicketErrors((prev) => ({ ...prev, [whiteCardDraft.draft_id]: nextErrors }));
      }
      setWhiteCardError("White Card (WHS) is required before submitting.");
      setSubmitMessage("Please add White Card (WHS) details and images before submitting.");
      setSubmitStatus("error");
      return;
    }
    setWhiteCardError("");
    setSubmitStatus("loading");
    setSubmitMessage("Uploading profile... please wait.");
    const result = await saveProfileRequest(true, { showProfileMessage: false });
    if (!result.ok) {
      setSubmitStatus("error");
      setSubmitMessage(result.error || "Unable to submit profile.");
      return;
    }
    setSubmitStatus("success");
    setSubmitMessage("Upload profile complete. Please wait for approval email. Thank you.");
  };

  const saveProfile = async (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    setError("");
    setSubmitMessage("");
    setProfileSaving(true);
    const nextErrors = getProfileErrors();
    setProfileErrors(nextErrors);
    const hasErrors = Object.keys(nextErrors).length > 0;
    await saveProfileRequest(false, { showProfileMessage: false });
    if (hasErrors) {
      setProfileSaveMessage("Saved draft. Please fill in the missing information highlighted in red.");
    } else {
      setProfileSaveMessage("Profile is saved but not approved until submitted at the bottom of the page SUBMIT PROFILE.");
    }
    setProfileSaving(false);
  };

  const saveWorkExperience = async () => {
    setWorkExperienceMessage("");
    setWorkExperienceSaving(true);
    const result = await saveProfileRequest(false, { showProfileMessage: false });
    if (result.ok) {
      const warning = result.warning ? ` ${result.warning}` : "";
      setWorkExperienceMessage(`Work experience saved.${warning}`);
    } else {
      setWorkExperienceMessage(result.error || "Unable to save work experience.");
    }
    setWorkExperienceSaving(false);
  };

  const updateTicketDraft = (draftId: string, updates: Partial<TicketDraft>) => {
    setTicketForms((prev) =>
      prev.map((item) => (item.draft_id === draftId ? { ...item, ...updates } : item)),
    );
    setTicketSaved((prev) => ({ ...prev, [draftId]: false }));
  };

  const addTicket = async (draftId: string) => {
    setError("");
    setMessage("");
    setWhiteCardError("");
    const nextErrors: {
      type?: string;
      other_type?: string;
      ticket_number?: string;
      issue_date?: string;
      expiry_date?: string;
      front_image?: string;
      back_image?: string;
    } = {};
    const draft = ticketForms.find((item) => item.draft_id === draftId);
    if (!draft) return;
    if (!draft.type) {
      nextErrors.type = "Please choose a ticket type.";
    }
    if (draft.type === "Other" && !draft.other_type.trim()) {
      nextErrors.other_type = "Please name the other ticket type.";
    }
    if (!draft.ticket_number.trim()) {
      nextErrors.ticket_number = "Ticket / Card number is required.";
    }
    if (!draft.issue_date) {
      nextErrors.issue_date = "Ticket issue / training date is required.";
    }
    if (!draft.expiry_date) {
      nextErrors.expiry_date = "Expiry date is required.";
    }
    if (draft.type === "White Card (WHS)" && !draft.front_image) {
      nextErrors.front_image = "White Card front image is required.";
    }
    if (draft.type === "White Card (WHS)" && !draft.back_image) {
      nextErrors.back_image = "White Card back image is required.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setTicketErrors((prev) => ({ ...prev, [draftId]: nextErrors }));
      return;
    }
    setTicketErrors((prev) => ({ ...prev, [draftId]: {} }));
    setTicketSaving((prev) => ({ ...prev, [draftId]: true }));
    setTicketSaved((prev) => ({ ...prev, [draftId]: false }));
    const res = await fetch("/api/workers/me/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...draft,
        other_type: draft.other_type.trim(),
        years_experience: calculateTicketYears(draft.issue_date),
      }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      setError(json?.error || "Unable to save ticket.");
      setTicketSaving((prev) => ({ ...prev, [draftId]: false }));
      return;
    }
    setTickets((prev) => [json.ticket, ...prev].filter(Boolean));
    if (draft.update_of) {
      setTicketForms((prev) => prev.filter((form) => form.draft_id !== draftId));
      setMessage(`Updated ${json.ticket?.type || "ticket"} saved. Previous version kept.`);
    } else if (json.ticket?.type === "White Card (WHS)") {
      setWhiteCardError("");
      setTicketForms((prev) => {
        const filtered = prev.filter((form) => form.draft_id !== draftId);
        if (filtered.length === 0) return [createTicketDraft()];
        const hasUnlocked = filtered.some((form) => !form.locked);
        return hasUnlocked ? filtered : [...filtered, createTicketDraft()];
      });
      setMessage("White Card saved. You can add another ticket below.");
    } else {
      setMessage("Ticket saved (verification pending).");
    }
    setTicketSaving((prev) => ({ ...prev, [draftId]: false }));
    setTicketSaved((prev) => ({ ...prev, [draftId]: true }));
  };

  const addAnotherTicket = () => {
    setTicketForms((prev) => [...prev, createTicketDraft()]);
    setError("");
    setMessage("Ready to add another ticket.");
  };

  const addUpdateTicket = (ticket: TicketItem) => {
    const knownType = (TICKETS as readonly string[]).includes(ticket.type);
    const seed: Partial<TicketDraft> = {
      type: knownType ? ticket.type : "Other",
      other_type: knownType ? "" : ticket.type,
      locked: true,
      update_of: ticket.ticket_id,
      update_label: ticket.type,
    };
    setTicketForms((prev) => [...prev, createTicketDraft(seed)]);
    setMessage(`Update ${ticket.type} ticket by uploading the new images and dates. The old ticket will be kept.`);
  };

  const deleteTicket = async (ticketId: string) => {
    const res = await fetch(`/api/workers/me/tickets?ticket_id=${encodeURIComponent(ticketId)}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Unable to delete ticket.");
      return;
    }
    setTickets((prev) => prev.filter((t) => t.ticket_id !== ticketId));
  };

  const setTicketRenewalStatus = async (ticketId: string, renewalStatus: "active" | "will_not_renew") => {
    const res = await fetch("/api/workers/me/tickets/renewal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticket_id: ticketId, renewal_status: renewalStatus }),
    });
    if (!res.ok) {
      setError("Unable to update ticket renewal status.");
      return;
    }
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.ticket_id === ticketId ? { ...ticket, renewal_status: renewalStatus } : ticket,
      ),
    );
  };

  const deleteTicketImage = async (ticketId: string, side: "front" | "back") => {
    const res = await fetch(
      `/api/workers/me/tickets/image?ticket_id=${encodeURIComponent(ticketId)}&side=${side}`,
      { method: "DELETE" },
    );
    if (!res.ok) {
      setError("Unable to delete ticket image.");
      return;
    }
    setTickets((prev) =>
      prev.map((ticket) => {
        if (ticket.ticket_id !== ticketId) return ticket;
        if (side === "front") {
          return { ...ticket, front_image_key: null, front_image_name: null };
        }
        return { ...ticket, back_image_key: null, back_image_name: null };
      }),
    );
  };

  const deleteIdentityDoc = async (type: "drivers_license_front" | "drivers_license_back" | "id_document_front" | "id_document_back") => {
    const res = await fetch(`/api/workers/me/document?type=${type}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Unable to delete document.");
      return;
    }
    setDocPreviews((prev) => ({ ...prev, [type]: "" }));
    setDocUploads((prev) => ({
      ...prev,
      ...(type === "drivers_license_front"
        ? { drivers_license_front: "", drivers_license_front_type: "", drivers_license_front_name: "" }
        : {}),
      ...(type === "drivers_license_back"
        ? { drivers_license_back: "", drivers_license_back_type: "", drivers_license_back_name: "" }
        : {}),
      ...(type === "id_document_front"
        ? { id_document_front: "", id_document_front_type: "", id_document_front_name: "" }
        : {}),
      ...(type === "id_document_back"
        ? { id_document_back: "", id_document_back_type: "", id_document_back_name: "" }
        : {}),
    }));
    setProfile((prev) => ({
      ...prev,
      ...(type === "drivers_license_front" ? { drivers_license_front_key: null, drivers_license_front_name: null } : {}),
      ...(type === "drivers_license_back" ? { drivers_license_back_key: null, drivers_license_back_name: null } : {}),
      ...(type === "id_document_front" ? { id_document_front_key: null, id_document_front_name: null } : {}),
      ...(type === "id_document_back" ? { id_document_back_key: null, id_document_back_name: null } : {}),
    }));
  };

  const renderDocPreviewRow = (params: {
    name: string;
    preview: string;
    alt: string;
    onDelete: () => void;
  }) => {
    if (!params.preview) return null;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => setPreviewModal({ src: params.preview, alt: params.alt })}
          style={{ padding: 0, border: 0, background: "transparent" }}
        >
          <div style={miniPreviewBoxStyle}>
            <img src={params.preview} alt={params.alt} style={previewImgStyle} />
          </div>
        </button>
        <div style={{ flex: "1 1 200px", fontSize: "0.9rem", color: "#0f172a" }}>
          {params.name || "Uploaded file"}
        </div>
        <SecondaryButton
          type="button"
          style={{ background: "#ecfdf3", borderColor: "#22c55e", color: "#166534" }}
          onClick={() => setPreviewModal({ src: params.preview, alt: params.alt })}
        >
          Preview
        </SecondaryButton>
        <SecondaryButton
          type="button"
          style={{ background: "#fee2e2", borderColor: "#ef4444", color: "#991b1b" }}
          onClick={params.onDelete}
        >
          Delete
        </SecondaryButton>
      </div>
    );
  };

  const renderTicketPreviewRow = (params: {
    name: string;
    preview: string;
    alt: string;
    onDelete?: () => void;
  }) => {
    if (!params.preview) return null;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => setPreviewModal({ src: params.preview, alt: params.alt })}
          style={{ padding: 0, border: 0, background: "transparent" }}
        >
          <div style={miniPreviewBoxStyle}>
            <img src={params.preview} alt={params.alt} style={previewImgStyle} />
          </div>
        </button>
        <div style={{ flex: "1 1 200px", fontSize: "0.9rem", color: "#0f172a" }}>
          {params.name || "Uploaded image"}
        </div>
        <SecondaryButton
          type="button"
          style={{ background: "#ecfdf3", borderColor: "#22c55e", color: "#166534" }}
          onClick={() => setPreviewModal({ src: params.preview, alt: params.alt })}
        >
          Preview
        </SecondaryButton>
        {params.onDelete ? (
          <SecondaryButton
            type="button"
            style={{ background: "#fee2e2", borderColor: "#ef4444", color: "#991b1b" }}
            onClick={params.onDelete}
          >
            Delete
          </SecondaryButton>
        ) : null}
      </div>
    );
  };

  const calculateTicketDuration = (issueDate?: string, nowOverride?: number) => {
    if (!issueDate) return "Not set";
    const start = new Date(issueDate);
    if (Number.isNaN(start.getTime())) return "Not set";
    if (!nowOverride) return "Not set";
    const today = new Date(nowOverride);
    let years = today.getFullYear() - start.getFullYear();
    let months = today.getMonth() - start.getMonth();
    let days = today.getDate() - start.getDate();
    if (days < 0) {
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
      months -= 1;
    }
    if (months < 0) {
      months += 12;
      years -= 1;
    }
    if (years < 0) return "Not set";
    return `${years}y ${months}m ${days}d`;
  };

  const calculateExpiryCountdown = (expiryDate?: string) => {
    if (!expiryDate) return "";
    const end = new Date(expiryDate);
    if (Number.isNaN(end.getTime())) return "";
    const today = new Date();
    const diffDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "Expired";
    return `Expires in ${diffDays} day${diffDays === 1 ? "" : "s"}`;
  };

  const calculateTicketYears = (issueDate?: string) => {
    if (!issueDate) return undefined;
    const start = new Date(issueDate);
    if (Number.isNaN(start.getTime())) return undefined;
    const today = new Date();
    let years = today.getFullYear() - start.getFullYear();
    let months = today.getMonth() - start.getMonth();
    const days = today.getDate() - start.getDate();
    if (days < 0) {
      months -= 1;
    }
    if (months < 0) {
      years -= 1;
    }
    return years < 0 ? undefined : years;
  };

  const handleSelectFund = (fund: SuperFundResult) => {
    setFundQuery(fund.fundName);
    setFundResults([]);
    onProfileChange("super_fund_name", fund.fundName);
    onProfileChange("super_abn", fund.abn);
    onProfileChange("super_product_name", "");
    onProfileChange("super_usi", "");
    setFundWarning("");
  };

  const handleSelectProduct = (usi: string) => {
    const product = fundProducts.find((item) => item.usi === usi);
    onProfileChange("super_usi", usi);
    onProfileChange("super_product_name", product?.productName || "");
    onProfileChange(
      "super_contribution_restrictions",
      product?.contributionRestrictions ? 1 : 0,
    );
    if (product?.contributionRestrictions) {
      setFundWarning("This super product may restrict contributions. Please confirm with your fund if unsure.");
    } else {
      setFundWarning("");
    }
  };


  const requestDelete = async () => {
    const res = await fetch("/api/workers/me/delete-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: deleteReason }),
    });
    if (!res.ok) {
      setError("Unable to request account deletion.");
      return;
    }
    setProfile((prev) => ({ ...prev, delete_requested: 1 }));
    setMessage("Delete request submitted for admin approval.");
  };

  const cancelDelete = async () => {
    const res = await fetch("/api/workers/me/delete-request/cancel", { method: "POST" });
    if (!res.ok) {
      setError("Unable to cancel delete request.");
      return;
    }
    setProfile((prev) => ({ ...prev, delete_requested: 0 }));
    setMessage("Delete request cancelled.");
  };

  const companyAbnDigits = (profile.company_abn || "").replace(/\D/g, "");
  const companyAcnDigits = (profile.company_acn || "").replace(/\D/g, "");
  const engagementType = profile.engagement_type || "EMPLOYEE_CASUAL";

  React.useEffect(() => {
    if (engagementType === "EMPLOYEE_CASUAL" && taxDeclaration.employment_basis !== "LABOUR_HIRE") {
      setTaxDeclaration((prev) => ({ ...prev, employment_basis: "LABOUR_HIRE" }));
    }
  }, [engagementType, taxDeclaration.employment_basis]);

  React.useEffect(() => {
    if (engagementType === "EMPLOYEE_CASUAL" && taxDeclaration.eligible_to_receive_leave_loading) {
      setTaxDeclaration((prev) => ({ ...prev, eligible_to_receive_leave_loading: false }));
    }
  }, [engagementType, taxDeclaration.eligible_to_receive_leave_loading]);
  const abnLengthInvalid = !!companyAbnDigits && companyAbnDigits.length !== 11;
  const acnLengthInvalid = !!companyAcnDigits && companyAcnDigits.length !== 9;
  const abnAcnMismatch =
    companyAbnDigits.length === 11 &&
    companyAcnDigits.length === 9 &&
    companyAbnDigits.slice(2) !== companyAcnDigits;
  const sectionTitleStyle = { fontWeight: 800, color: "#0f172a" };
  const statusInfo = (() => {
    const hasProposed = assignments.some((a) => a.status === "proposed");
    const hasActive = assignments.some((a) => ["active", "contracted", "released"].includes(a.status));
    if (hasProposed) {
      return { label: "Proposed position - waiting your approval", bg: "#fef3c7", color: "#92400e" };
    }
    if (hasActive) {
      return { label: "Assigned to job", bg: "#dcfce7", color: "#166534" };
    }
    if (profile.working_now_status === "working_pause") {
      return { label: "Working elsewhere - offers paused", bg: "#fee2e2", color: "#991b1b" };
    }
    if (profile.working_now_status === "working_offers_on") {
      return { label: "Working elsewhere - still open to offers", bg: "#e0f2fe", color: "#075985" };
    }
    if (profile.working_now_status === "working_until") {
      const from = profile.availability_from_date ? ` (available from ${profile.availability_from_date})` : "";
      return { label: `Working now${from}`, bg: "#fef3c7", color: "#92400e" };
    }
    if (profile.working_now_status === "available_now") {
      const from = profile.availability_from_date ? ` (from ${profile.availability_from_date})` : "";
      return { label: `Fully available${from}`, bg: "#dcfce7", color: "#166534" };
    }
    if (profile.verified_status === "verified") {
      return { label: "Approved", bg: "#dcfce7", color: "#166534" };
    }
    if (profile.verified_status === "pending") {
      return { label: "Pending approval", bg: "#e0f2fe", color: "#075985" };
    }
    return { label: "Unverified - complete your profile", bg: "#fee2e2", color: "#991b1b" };
  })();
  const verificationInfo = (() => {
    if (profile.verified_status === "verified") {
      return { label: "Approved profile", bg: "#dcfce7", color: "#166534" };
    }
    if (profile.verified_status === "pending") {
      return { label: "Pending approval", bg: "#e0f2fe", color: "#075985" };
    }
    return { label: "Unverified - complete your profile", bg: "#fee2e2", color: "#991b1b" };
  })();

  return (
    <div className={styles.form} style={{ maxWidth: 1040, margin: "2rem auto" }}>
      <div className={styles.formHeader}>
        <h2 style={{ fontWeight: 800, color: "#0f172a" }}>Worker portal</h2>
        <p>Manage your profile, tickets, availability, and assignments.</p>
        <div style={{ marginTop: "0.75rem", display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
          {profile.first_name && profile.last_name ? (
            <div style={{ padding: "0.5rem 0.9rem", borderRadius: 10, background: "#f1f5f9", color: "#0f172a", fontWeight: 700 }}>
              Worker ID: {`${profile.first_name}-${profile.last_name}-${(profile.company_number || "00000").replace(/\\D/g, "").slice(-5).padStart(5, "0")}`}
            </div>
          ) : null}
          <div style={{ padding: "0.5rem 0.9rem", borderRadius: 10, background: verificationInfo.bg, color: verificationInfo.color, fontWeight: 700 }}>
            Status: {verificationInfo.label}
          </div>
          <div style={{ padding: "0.5rem 0.9rem", borderRadius: 10, background: statusInfo.bg, color: statusInfo.color, fontWeight: 700 }}>
            Availability: {statusInfo.label}
          </div>
          <SecondaryButton
            href="/dashboard/worker/proposed"
            style={{ background: "#eff6ff", borderColor: "#3b82f6", color: "#1d4ed8" }}
          >
            Proposed positions
          </SecondaryButton>
          <SecondaryButton
            href="/dashboard/worker/assignments"
            style={{ background: "#ecfdf3", borderColor: "#22c55e", color: "#166534" }}
          >
            Active assignments
          </SecondaryButton>
          <SecondaryButton
            href="/dashboard/worker/timesheets"
            style={{ background: "#eef2ff", borderColor: "#6366f1", color: "#3730a3" }}
          >
            Timesheets
          </SecondaryButton>
          <SecondaryButton
            href="/dashboard/worker/working-now"
            style={{ background: "#fff7ed", borderColor: "#f97316", color: "#c2410c" }}
          >
            Availability Status
          </SecondaryButton>
          <SecondaryButton
            href="/logout"
            style={{ background: "#fef2f2", borderColor: "#ef4444", color: "#991b1b" }}
          >
            Log out
          </SecondaryButton>
        </div>
      </div>
      {error ? <div className={styles.errorSummary}>{error}</div> : null}

        <div className={styles.section}>
          <h3 style={sectionTitleStyle}><strong>YOUR PROFILE</strong></h3>
          <div className={styles.section}>
          <div className={styles.gridFour}>
            <div className={styles.field}>
              <label className={styles.label}>Title</label>
              <select
                className={`${styles.select} ${profileErrors.title ? styles.errorHighlight : ""}`}
                value={profile.title || ""}
                onChange={(e) => onProfileChange("title", e.target.value)}
              >
                <option value="">Select...</option>
                <option value="Mr">Mr</option>
                <option value="Mrs">Mrs</option>
                <option value="Miss">Miss</option>
                <option value="Ms">Ms</option>
                <option value="Mx">Mx</option>
              </select>
              {profileErrors.title ? <div className={styles.error}>Required</div> : null}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>First name *</label>
              <input
                className={`${styles.input} ${profileErrors.first_name ? styles.errorHighlight : ""}`}
                value={profile.first_name || ""}
                onChange={(e) => onProfileChange("first_name", e.target.value)}
              />
              {profileErrors.first_name ? <div className={styles.error}>Required</div> : null}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Middle name</label>
              <input className={styles.input} value={profile.middle_name || ""} onChange={(e) => onProfileChange("middle_name", e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Last / Family name *</label>
              <input
                className={`${styles.input} ${profileErrors.last_name ? styles.errorHighlight : ""}`}
                value={profile.last_name || ""}
                onChange={(e) => onProfileChange("last_name", e.target.value)}
              />
              {profileErrors.last_name ? <div className={styles.error}>Required</div> : null}
            </div>
          </div>

          <div className={styles.gridThree}>
            <div className={styles.field}>
              <label className={styles.label}>Date of birth *</label>
              <input
                className={`${styles.input} ${profileErrors.dob ? styles.errorHighlight : ""}`}
                type="date"
                value={profile.dob || ""}
                onChange={(e) => onProfileChange("dob", e.target.value)}
              />
              {profileErrors.dob ? <div className={styles.error}>Required</div> : null}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Mobile *</label>
              <input
                className={`${styles.input} ${profileErrors.mobile ? styles.errorHighlight : ""}`}
                value={profile.mobile || ""}
                onChange={(e) => onProfileChange("mobile", e.target.value)}
              />
              {profileErrors.mobile ? <div className={styles.error}>Required</div> : null}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input className={styles.input} value={profile.email || ""} onChange={(e) => onProfileChange("email", e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Phone (optional)</label>
              <input className={styles.input} value={profile.phone || ""} onChange={(e) => onProfileChange("phone", e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>If you have a WhatsApp number</label>
              <input className={styles.input} value={profile.whatsapp || ""} onChange={(e) => onProfileChange("whatsapp", e.target.value)} />
            </div>
          </div>

          <div className={styles.gridFour}>
            <div className={styles.field}>
              <label className={styles.label}>Address number *</label>
              <input
                className={`${styles.input} ${profileErrors.address_number ? styles.errorHighlight : ""}`}
                value={profile.address_number || ""}
                onChange={(e) => onProfileChange("address_number", e.target.value)}
              />
              {profileErrors.address_number ? <div className={styles.error}>Required</div> : null}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Floor (optional)</label>
              <input className={styles.input} value={profile.address_floor || ""} onChange={(e) => onProfileChange("address_floor", e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Unit / room number (optional)</label>
              <input className={styles.input} value={profile.address_unit || ""} onChange={(e) => onProfileChange("address_unit", e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Building name (if applicable)</label>
              <input className={styles.input} value={profile.address_building || ""} onChange={(e) => onProfileChange("address_building", e.target.value)} />
            </div>
          </div>

          <div className={styles.gridThree}>
            <div className={styles.field} style={{ gridColumn: "span 2" }}>
              <label className={styles.label}>Start typing address with number *</label>
              <input
                className={`${styles.input} ${profileErrors.address_street ? styles.errorHighlight : ""}`}
                ref={streetRef}
                value={profile.address_street || ""}
                onChange={(e) => onProfileChange("address_street", e.target.value)}
              />
              {profileErrors.address_street ? <div className={styles.error}>Required</div> : null}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Postcode *</label>
              <input
                className={`${styles.input} ${profileErrors.address_postcode ? styles.errorHighlight : ""}`}
                value={profile.address_postcode || ""}
                onChange={(e) => onProfileChange("address_postcode", e.target.value)}
              />
              {profileErrors.address_postcode ? <div className={styles.error}>Required</div> : null}
            </div>
          </div>
          <div className={styles.field} style={{ marginTop: "1rem", marginBottom: "1rem" }}>
            {mapError ? (
              <div className={styles.error} style={{ marginBottom: "0.5rem" }}>
                {mapError}
              </div>
            ) : null}
            <div
              ref={mapRef}
              style={{
                height: 240,
                borderRadius: 12,
                border: "1px solid #d4d4d4",
                overflow: "hidden",
              }}
            />
          </div>

          <div className={styles.section} style={{ marginTop: "0.75rem" }}>
            <h4>Engagement type</h4>
            <div className={styles.gridTwo}>
              <label className={styles.label} style={{ fontWeight: 700 }}>
                <input
                  type="radio"
                  name="engagement_type"
                  value="EMPLOYEE_CASUAL"
                  checked={engagementType === "EMPLOYEE_CASUAL"}
                  onChange={() => {
                    onProfileChange("engagement_type", "EMPLOYEE_CASUAL");
                    onProfileChange("has_own_abn", 0);
                  }}
                />{" "}
                Employee (Casual Labour Hire)
              </label>
              <label className={styles.label} style={{ fontWeight: 700 }}>
                <input
                  type="radio"
                  name="engagement_type"
                  value="CONTRACTOR_ABN"
                  checked={engagementType === "CONTRACTOR_ABN"}
                  onChange={() => {
                    onProfileChange("engagement_type", "CONTRACTOR_ABN");
                    onProfileChange("has_own_abn", 1);
                  }}
                />{" "}
                Contractor (Operate under ABN/company)
              </label>
            </div>
          </div>


          {engagementType === "EMPLOYEE_CASUAL" ? (
          <>
          <div
            className={styles.section}
            style={{
              marginTop: "0.5rem",
              border: profileErrors.super_choice ? "2px solid #ef4444" : undefined,
              boxShadow: profileErrors.super_choice ? "0 0 0 2px rgba(239,68,68,0.35)" : undefined,
            }}
          >
            <h4>Superannuation choice</h4>
            <div className={styles.gridThree}>
              <SecondaryButton
                type="button"
                style={{
                  borderRadius: 16,
                  padding: "1rem",
                  background: superChoice === "REGULATED" ? "#dcfce7" : "#f8fafc",
                  borderColor: superChoice === "REGULATED" ? "#22c55e" : "#e2e8f0",
                  textAlign: "left",
                  color: "#0f172a",
                  width: "100%",
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                }}
                onClick={() => {
                  onProfileChange("super_choice", "REGULATED");
                  onProfileChange("super_fund_type", "REGULATED");
                  onProfileChange("super_status", "");
                  onProfileChange("smsf_abn", "");
                  onProfileChange("smsf_bank_bsb", "");
                  onProfileChange("smsf_bank_account", "");
                  onProfileChange("smsf_bank_account_name", "");
                  onProfileChange("smsf_esa", "");
                }}
              >
                <strong>I have a super fund</strong>
                <div style={{ fontSize: "0.85rem", marginTop: "0.25rem", color: "#475569" }}>
                  Search your fund and select the correct product/USI.
                </div>
              </SecondaryButton>
              <SecondaryButton
                type="button"
                style={{
                  borderRadius: 16,
                  padding: "1rem",
                  background: superChoice === "SMSF" ? "#e0f2fe" : "#f8fafc",
                  borderColor: superChoice === "SMSF" ? "#38bdf8" : "#e2e8f0",
                  textAlign: "left",
                  color: "#0f172a",
                  width: "100%",
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                }}
                onClick={() => {
                  onProfileChange("super_choice", "SMSF");
                  onProfileChange("super_fund_type", "SMSF");
                  onProfileChange("super_status", "");
                  onProfileChange("super_abn", "");
                  onProfileChange("super_usi", "");
                  onProfileChange("super_product_name", "");
                  setFundQuery("");
                  setFundResults([]);
                  setFundProducts([]);
                  setFundWarning("");
                }}
              >
                <strong>I have an SMSF</strong>
                <div style={{ fontSize: "0.85rem", marginTop: "0.25rem", color: "#475569" }}>
                  Enter your SMSF ABN, bank details and ESA.
                </div>
              </SecondaryButton>
              <SecondaryButton
                type="button"
                style={{
                  borderRadius: 16,
                  padding: "1rem",
                  background: superChoice === "STAPLED" ? "#fef3c7" : "#f8fafc",
                  borderColor: superChoice === "STAPLED" ? "#f59e0b" : "#e2e8f0",
                  textAlign: "left",
                  color: "#0f172a",
                  width: "100%",
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                }}
                onClick={() => {
                  onProfileChange("super_choice", "STAPLED");
                  onProfileChange("super_fund_type", "STAPLED");
                  onProfileChange("super_status", "PENDING_PAYROLL");
                  onProfileChange("super_abn", "");
                  onProfileChange("super_usi", "");
                  onProfileChange("super_product_name", "");
                  onProfileChange("super_contribution_restrictions", 0);
                  setFundQuery("");
                  setFundResults([]);
                  setFundProducts([]);
                  setFundWarning("");
                }}
              >
                <strong>I’m not sure / use my stapled fund</strong>
                <div style={{ fontSize: "0.85rem", marginTop: "0.25rem", color: "#475569" }}>
                  Payroll will confirm your stapled fund or use the default fund where permitted.
                </div>
              </SecondaryButton>
            </div>
            {superChoice === "STAPLED" ? (
              <div style={{ marginTop: "0.75rem", padding: "0.7rem 0.9rem", borderRadius: 12, background: "#fff7ed", color: "#92400e", fontWeight: 600 }}>
                If you do not know your fund details, choose this option. Payroll will confirm your stapled fund. If no stapled fund exists, we may use the nominated default fund where permitted.
                {" "}If you’re unsure, speak to your fund or adviser.
              </div>
            ) : null}
            {profileErrors.super_choice ? (
              <div className={styles.error} style={{ marginTop: "0.5rem" }}>
                {profileErrors.super_choice}
              </div>
            ) : null}
          </div>

          <div className={styles.gridTwo}>
            <div className={styles.field}>
              <label className={styles.label}>
                Super member number <span style={{ color: "#b91c1c", fontWeight: 700 }}>(If registering as a company leave blank)</span>
              </label>
              <input className={styles.input} value={profile.super_member_number || ""} onChange={(e) => onProfileChange("super_member_number", e.target.value)} />
            </div>
          </div>

          {superChoice === "REGULATED" ? (
            <div className={styles.section} style={{ marginTop: "0.75rem" }}>
              <h4>Regulated super fund selection</h4>
              <div className={styles.field}>
                <label className={styles.label}>Search super fund (regulated)</label>
                <input
                  className={styles.input}
                  value={fundQuery}
                  onChange={(e) => setFundQuery(e.target.value)}
                  placeholder="Start typing fund name"
                />
                {fundLoading ? <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.35rem" }}>Searching…</div> : null}
                {fundResults.length ? (
                  <div
                    style={{
                      marginTop: "0.5rem",
                      border: "1px solid #e2e8f0",
                      borderRadius: 10,
                      overflow: "hidden",
                      background: "#fff",
                    }}
                  >
                    {fundResults.map((result) => (
                      <button
                        key={`${result.abn}-${result.fundName}`}
                        type="button"
                        onClick={() => handleSelectFund(result)}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "0.6rem 0.85rem",
                          border: "0",
                          background: "transparent",
                          cursor: "pointer",
                          borderBottom: "1px solid #e2e8f0",
                        }}
                      >
                        <div style={{ fontWeight: 600 }}>{result.fundName}</div>
                        <div style={{ fontSize: "0.8rem", color: "#64748b" }}>ABN {result.abn}</div>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className={styles.gridThree}>
                <div className={styles.field}>
                  <label className={styles.label}>Super fund ABN</label>
                  <input className={styles.input} value={profile.super_abn || ""} readOnly />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Super product / USI</label>
                  <select
                    className={styles.select}
                    value={profile.super_usi || ""}
                    onChange={(e) => handleSelectProduct(e.target.value)}
                    disabled={!profile.super_abn || productLoading}
                  >
                    <option value="">{productLoading ? "Loading products…" : "Select product"}</option>
                    {fundProducts.map((product) => (
                      <option key={product.usi} value={product.usi}>
                        {product.productName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>USI</label>
                  <input className={styles.input} value={profile.super_usi || ""} readOnly />
                </div>
              </div>
              {fundWarning ? (
                <div style={{ marginTop: "0.5rem", padding: "0.6rem 0.75rem", borderRadius: 10, background: "#fff7ed", color: "#9a3412", fontWeight: 600 }}>
                  {fundWarning}
                </div>
              ) : null}
            </div>
          ) : null}

          {superChoice === "SMSF" ? (
            <div className={styles.section} style={{ marginTop: "0.75rem" }}>
              <h4>SMSF details</h4>
              <div className={styles.gridThree}>
                <div className={styles.field}>
                  <label className={styles.label}>SMSF ABN</label>
                  <input className={styles.input} value={profile.smsf_abn || ""} onChange={(e) => onProfileChange("smsf_abn", e.target.value)} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>SMSF bank account name</label>
                  <input className={styles.input} value={profile.smsf_bank_account_name || ""} onChange={(e) => onProfileChange("smsf_bank_account_name", e.target.value)} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>SMSF bank BSB</label>
                  <input className={styles.input} value={profile.smsf_bank_bsb || ""} onChange={(e) => onProfileChange("smsf_bank_bsb", e.target.value)} />
                </div>
              </div>
              <div className={styles.gridThree}>
                <div className={styles.field}>
                  <label className={styles.label}>SMSF bank account number</label>
                  <input className={styles.input} value={profile.smsf_bank_account || ""} onChange={(e) => onProfileChange("smsf_bank_account", e.target.value)} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>SMSF ESA (optional)</label>
                  <input className={styles.input} value={profile.smsf_esa || ""} onChange={(e) => onProfileChange("smsf_esa", e.target.value)} />
                </div>
              </div>
            </div>
          ) : null}
          <div
            className={styles.section}
            style={{
              marginTop: "0.75rem",
              border: Object.keys(taxDeclarationErrors).length ? "2px solid #ef4444" : undefined,
              boxShadow: Object.keys(taxDeclarationErrors).length ? "0 0 0 2px rgba(239,68,68,0.35)" : undefined,
            }}
          >
            <h4>Tax declaration</h4>
            <p style={{ marginTop: "0.35rem", color: "#475569" }}>
              Answer the tax declaration questions below. If you’re unsure, check with payroll.
            </p>
            {taxDeclarationLocked ? (
              <div style={{ marginTop: "0.5rem", padding: "0.6rem 0.75rem", borderRadius: 10, background: "#ecfeff", color: "#0f766e", fontWeight: 700 }}>
                This declaration is signed. Contact payroll if you need to update it.
              </div>
            ) : null}

            <div className={styles.section} style={{ marginTop: "0.75rem" }}>
              <h5>Section A — TFN status</h5>
              <div className={styles.gridTwo}>
                {[
                  { value: "PROVIDED", label: "I have my TFN" },
                  { value: "APPLIED_OR_ENQUIRED", label: "I’ve applied or enquired" },
                  { value: "EXEMPT_UNDER18", label: "I’m exempt (under 18)" },
                  { value: "EXEMPT_PENSION", label: "I’m exempt (pension/allowance)" },
                  { value: "NOT_QUOTED", label: "I am not quoting my TFN" },
                ].map((opt) => (
                  <label key={opt.value} className={styles.label} style={{ fontWeight: 700 }}>
                    <input
                      type="radio"
                      name="tfn_status"
                      value={opt.value}
                      disabled={taxDeclarationLocked}
                      checked={taxDeclaration.tfn_status === opt.value}
                      onChange={() => handleTfnStatusChange(opt.value as TaxDeclarationForm["tfn_status"])}
                    />{" "}
                    {opt.label}
                  </label>
                ))}
              </div>
              {taxDeclarationErrors.tfn_status ? <div className={styles.error}>{taxDeclarationErrors.tfn_status}</div> : null}
              {taxDeclarationErrors.tfn_not_quoted_ack ? (
                <div className={styles.error}>{taxDeclarationErrors.tfn_not_quoted_ack}</div>
              ) : null}
              {taxDeclaration.tfn_status === "PROVIDED" ? (
                <div className={styles.field} style={{ marginTop: "0.5rem" }}>
                  <label className={styles.label}>TFN (8 or 9 digits)</label>
                  <input
                    className={styles.input}
                    type="password"
                    inputMode="numeric"
                    value={taxDeclaration.tfn_input}
                    onChange={(e) => onTaxDeclarationChange("tfn_input", e.target.value.replace(/\D/g, ""))}
                    disabled={taxDeclarationLocked}
                  />
                  <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.25rem" }}>We store this securely.</div>
                  {taxDeclaration.tfn_last4 ? (
                    <div style={{ marginTop: "0.35rem", fontWeight: 700 }}>Saved TFN ending: ****{taxDeclaration.tfn_last4}</div>
                  ) : null}
                  {taxDeclarationErrors.tfn_input ? <div className={styles.error}>{taxDeclarationErrors.tfn_input}</div> : null}
                </div>
              ) : null}
            </div>

            <div className={styles.section} style={{ marginTop: "0.75rem" }}>
              <h5>Section B — Name change</h5>
              <div className={styles.gridTwo}>
                <label className={styles.label} style={{ fontWeight: 700 }}>
                  <input
                    type="radio"
                    name="changed_surname_since_ato"
                    value="no"
                    checked={taxDeclaration.changed_surname_since_ato === false}
                    onChange={() => onTaxDeclarationChange("changed_surname_since_ato", false)}
                    disabled={taxDeclarationLocked}
                  />{" "}
                  No
                </label>
                <label className={styles.label} style={{ fontWeight: 700 }}>
                  <input
                    type="radio"
                    name="changed_surname_since_ato"
                    value="yes"
                    checked={taxDeclaration.changed_surname_since_ato === true}
                    onChange={() => onTaxDeclarationChange("changed_surname_since_ato", true)}
                    disabled={taxDeclarationLocked}
                  />{" "}
                  Yes
                </label>
              </div>
              {taxDeclaration.changed_surname_since_ato ? (
                <div className={styles.field}>
                  <label className={styles.label}>Previous family name</label>
                  <input
                    className={styles.input}
                    value={taxDeclaration.previous_family_name}
                    onChange={(e) => onTaxDeclarationChange("previous_family_name", e.target.value)}
                    disabled={taxDeclarationLocked}
                  />
                  {taxDeclarationErrors.previous_family_name ? <div className={styles.error}>{taxDeclarationErrors.previous_family_name}</div> : null}
                </div>
              ) : null}
            </div>

            <div className={styles.section} style={{ marginTop: "0.75rem" }}>
              <h5>Section C — Residency status</h5>
              <div className={styles.gridTwo}>
                {[
                  { value: "AUSTRALIAN_RESIDENT", label: "Australian resident for tax purposes" },
                  { value: "FOREIGN_RESIDENT", label: "Foreign resident for tax purposes" },
                  { value: "WORKING_HOLIDAY_MAKER", label: "Working holiday maker" },
                ].map((opt) => (
                  <label key={opt.value} className={styles.label} style={{ fontWeight: 700 }}>
                    <input
                      type="radio"
                      name="tax_residency_status"
                      value={opt.value}
                      checked={taxDeclaration.tax_residency_status === opt.value}
                      onChange={() => onTaxDeclarationChange("tax_residency_status", opt.value)}
                      disabled={taxDeclarationLocked}
                    />{" "}
                    {opt.label}
                  </label>
                ))}
              </div>
              {taxDeclarationErrors.tax_residency_status ? <div className={styles.error}>{taxDeclarationErrors.tax_residency_status}</div> : null}
              {taxDeclaration.tax_residency_status === "FOREIGN_RESIDENT" ? (
                <div style={{ marginTop: "0.5rem", color: "#92400e", fontWeight: 600 }}>
                  Foreign residents may have different threshold rules. Please check with payroll if unsure.
                </div>
              ) : null}
            </div>

            <div className={styles.section} style={{ marginTop: "0.75rem" }}>
              <h5>Section D - Employment basis</h5>
              <div className={styles.field}>
                <label className={styles.label}>Employment basis</label>
                <input className={styles.input} value="Labour hire (Casual)" readOnly />
                <div className={styles.hint}>
                  This is set by SiteReady Workforce based on your engagement type.
                </div>
              </div>
              {taxDeclarationErrors.employment_basis ? <div className={styles.error}>{taxDeclarationErrors.employment_basis}</div> : null}
            </div>

            <div className={styles.section} style={{ marginTop: "0.75rem" }}>
              <h5>Section E — Tax-free threshold</h5>
              <div className={styles.gridTwo}>
                <label className={styles.label} style={{ fontWeight: 700 }}>
                  <input
                    type="radio"
                    name="claim_tax_free_threshold"
                    value="yes"
                    checked={taxDeclaration.claim_tax_free_threshold === true}
                    onChange={() => onTaxDeclarationChange("claim_tax_free_threshold", true)}
                    disabled={taxDeclarationLocked}
                  />{" "}
                  Yes, claim the tax-free threshold
                </label>
                <label className={styles.label} style={{ fontWeight: 700 }}>
                  <input
                    type="radio"
                    name="claim_tax_free_threshold"
                    value="no"
                    checked={taxDeclaration.claim_tax_free_threshold === false}
                    onChange={() => onTaxDeclarationChange("claim_tax_free_threshold", false)}
                    disabled={taxDeclarationLocked}
                  />{" "}
                  No
                </label>
              </div>
              {taxDeclarationErrors.claim_tax_free_threshold ? <div className={styles.error}>{taxDeclarationErrors.claim_tax_free_threshold}</div> : null}
            </div>

            <div className={styles.section} style={{ marginTop: "0.75rem" }}>
              <h5>Section F — Study/training loans and SFSS</h5>
              <div className={styles.gridTwo}>
                <label className={styles.label} style={{ fontWeight: 700 }}>
                  <input
                    type="radio"
                    name="has_study_training_loan"
                    value="yes"
                    checked={taxDeclaration.has_study_training_loan === true}
                    onChange={() => onTaxDeclarationChange("has_study_training_loan", true)}
                    disabled={taxDeclarationLocked}
                  />{" "}
                  I have a HELP/VSL/FS/SSL/TSL debt
                </label>
                <label className={styles.label} style={{ fontWeight: 700 }}>
                  <input
                    type="radio"
                    name="has_study_training_loan"
                    value="no"
                    checked={taxDeclaration.has_study_training_loan === false}
                    onChange={() => onTaxDeclarationChange("has_study_training_loan", false)}
                    disabled={taxDeclarationLocked}
                  />{" "}
                  No study/training loan
                </label>
                <label className={styles.label} style={{ fontWeight: 700 }}>
                  <input
                    type="radio"
                    name="has_sfss_debt"
                    value="yes"
                    checked={taxDeclaration.has_sfss_debt === true}
                    onChange={() => onTaxDeclarationChange("has_sfss_debt", true)}
                    disabled={taxDeclarationLocked}
                  />{" "}
                  I have an SFSS debt
                </label>
                <label className={styles.label} style={{ fontWeight: 700 }}>
                  <input
                    type="radio"
                    name="has_sfss_debt"
                    value="no"
                    checked={taxDeclaration.has_sfss_debt === false}
                    onChange={() => onTaxDeclarationChange("has_sfss_debt", false)}
                    disabled={taxDeclarationLocked}
                  />{" "}
                  No SFSS debt
                </label>
              </div>
              {taxDeclarationErrors.has_study_training_loan ? <div className={styles.error}>{taxDeclarationErrors.has_study_training_loan}</div> : null}
              {taxDeclarationErrors.has_sfss_debt ? <div className={styles.error}>{taxDeclarationErrors.has_sfss_debt}</div> : null}
            </div>

            <div className={styles.section} style={{ marginTop: "0.75rem" }}>
              <h5>Section G - Additional options</h5>
              <div className={styles.gridTwo}>
                <label className={styles.label} style={{ fontWeight: 700 }}>
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={(e) => onTaxDeclarationChange("eligible_to_receive_leave_loading", e.target.checked)}
                    disabled
                  />{" "}
                  Eligible to receive leave loading
                </label>
                <div className={styles.hint} style={{ alignSelf: "center" }}>
                  Not applicable for Casual labour hire engagements.
                </div>
                <label className={styles.label} style={{ fontWeight: 700 }}>
                  <input
                    type="checkbox"
                    checked={!!taxDeclaration.has_student_startup_loan}
                    onChange={(e) => onTaxDeclarationChange("has_student_startup_loan", e.target.checked)}
                    disabled={taxDeclarationLocked}
                  />{" "}
                  Student Start-up Loan
                </label>
                <label className={styles.label} style={{ fontWeight: 700 }}>
                  <input
                    type="checkbox"
                    checked={!!taxDeclaration.has_trade_support_loan_debt}
                    onChange={(e) => onTaxDeclarationChange("has_trade_support_loan_debt", e.target.checked)}
                    disabled={taxDeclarationLocked}
                  />{" "}
                  Trade Support Loan debt
                </label>
              </div>
              <div className={styles.gridTwo}>
                <div className={styles.field}>
                  <label className={styles.label}>Additional withholding amount (optional, AUD per pay run)</label>
                  <input
                    className={styles.input}
                    inputMode="numeric"
                    value={taxDeclaration.withholding_additional_amount_cents}
                    onChange={(e) => onTaxDeclarationChange("withholding_additional_amount_cents", e.target.value.replace(/\D/g, ""))}
                    disabled={taxDeclarationLocked}
                  />
                  <div className={styles.hint}>Extra tax withheld each pay (optional).</div>
                </div>
              </div>
              <div className={styles.section} style={{ marginTop: "0.75rem" }}>
                <label className={styles.label} style={{ fontWeight: 700 }}>
                  I have an ATO-approved withholding variation notice
                </label>
                <div className={styles.gridTwo}>
                  <label className={styles.label} style={{ fontWeight: 700 }}>
                    <input
                      type="radio"
                      name="withholding_variation_notice"
                      value="yes"
                      checked={taxDeclaration.has_withholding_variation_notice === true}
                      onChange={() => onTaxDeclarationChange("has_withholding_variation_notice", true)}
                      disabled={taxDeclarationLocked}
                    />{" "}
                    Yes
                  </label>
                  <label className={styles.label} style={{ fontWeight: 700 }}>
                    <input
                      type="radio"
                      name="withholding_variation_notice"
                      value="no"
                      checked={taxDeclaration.has_withholding_variation_notice === false}
                      onChange={() => onTaxDeclarationChange("has_withholding_variation_notice", false)}
                      disabled={taxDeclarationLocked}
                    />{" "}
                    No
                  </label>
                </div>
                {taxDeclaration.has_withholding_variation_notice ? (
                  <div className={styles.field}>
                    <label className={styles.label}>Upload notice (PDF/JPG/PNG)</label>
                    <input
                      className={styles.input}
                      type="file"
                      accept="application/pdf,image/*"
                      capture="environment"
                      disabled={taxDeclarationLocked || withholdingVariationUploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void uploadWithholdingVariationProof(file);
                      }}
                    />
                    <div className={styles.hint}>Payroll will review and apply the approved percentage.</div>
                    {withholdingVariationProof ? (
                      <div style={{ marginTop: "0.5rem" }}>
                        {renderTicketPreviewRow({
                          name: withholdingVariationProof.name,
                          preview: withholdingVariationPreview,
                          alt: "Withholding variation notice",
                          onDelete: taxDeclarationLocked ? undefined : deleteWithholdingVariationProof,
                        })}
                      </div>
                    ) : null}
                    {taxDeclarationErrors.withholding_variation_notice ? (
                      <div className={styles.error}>{taxDeclarationErrors.withholding_variation_notice}</div>
                    ) : null}
                    {withholdingVariationError ? <div className={styles.error}>{withholdingVariationError}</div> : null}
                  </div>
                ) : null}
                {taxDeclaration.withholding_variation_percent ? (
                  <div style={{ marginTop: "0.5rem", fontWeight: 700 }}>
                    Payroll has applied a withholding variation of {taxDeclaration.withholding_variation_percent}%.
                  </div>
                ) : null}
              </div>
            </div>

            <div className={styles.section} style={{ marginTop: "0.75rem" }}>
              <h5>Section H — Electronic declaration</h5>
              <p style={{ color: "#475569" }}>
                I declare that the information provided is true and correct and that I am authorised to make this declaration.
              </p>
              <div className={styles.field}>
                <label className={styles.label}>Full name</label>
                <input
                  className={styles.input}
                  value={
                    taxDeclaration.tfn_declaration_full_name ||
                    [profile.first_name, profile.middle_name, profile.last_name].filter(Boolean).join(" ")
                  }
                  onChange={(e) => onTaxDeclarationChange("tfn_declaration_full_name", e.target.value)}
                  disabled={taxDeclarationLocked}
                />
              </div>
              <label className={styles.label} style={{ fontWeight: 700 }}>
                <input
                  type="checkbox"
                  checked={taxDeclaration.tfn_declaration_signed}
                  onChange={(e) => onTaxDeclarationChange("tfn_declaration_signed", e.target.checked)}
                  disabled={taxDeclarationLocked}
                />{" "}
                Tick to sign using the details you used to log on.
              </label>
              {taxDeclarationErrors.tfn_declaration_signed ? <div className={styles.error}>{taxDeclarationErrors.tfn_declaration_signed}</div> : null}
            </div>

            <div className={styles.actions} style={{ marginTop: "0.75rem" }}>
              <SecondaryButton
                type="button"
                onClick={() => saveTaxDeclaration(false)}
                disabled={taxDeclarationSaving || taxDeclarationSubmitting || taxDeclarationLocked}
              >
                {taxDeclarationSaving ? "Saving..." : "Save declaration"}
              </SecondaryButton>
              <SecondaryButton
                type="button"
                onClick={() => saveTaxDeclaration(true)}
                disabled={taxDeclarationSaving || taxDeclarationSubmitting || taxDeclarationLocked}
                style={{ background: "#16a34a", borderColor: "#16a34a", color: "#fff", fontWeight: 800 }}
              >
                {taxDeclarationSubmitting ? "Submitting..." : "Submit declaration"}
              </SecondaryButton>
            </div>
            {taxDeclarationMessage ? <div style={{ marginTop: "0.5rem", fontWeight: 700 }}>{taxDeclarationMessage}</div> : null}
          </div>
          </>
          ) : null}

          {engagementType === "CONTRACTOR_ABN" ? (
            <div className={styles.section}>
              <div style={{ marginBottom: "0.75rem", padding: "0.6rem 0.75rem", borderRadius: 10, background: "#fff7ed", color: "#9a3412", fontWeight: 600 }}>
                Tax declaration is only required for Employee (Casual Labour Hire).
              </div>
              <h4 style={{ color: "#1d4ed8", fontWeight: 800 }}>Company details (if operating under your ABN)</h4>
              <div className={styles.gridThree}>
                <div className={styles.field}>
                  <label className={styles.label}>Company name</label>
                  <input className={styles.input} value={profile.company_name || ""} onChange={(e) => onProfileChange("company_name", e.target.value)} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Company structure</label>
                  <select className={styles.select} value={profile.company_structure || ""} onChange={(e) => onProfileChange("company_structure", e.target.value)}>
                    <option value="">Select...</option>
                    {COMPANY_STRUCTURES.map((structure) => (
                      <option key={structure} value={structure}>
                        {structure}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>ABN (11 digits)</label>
                  <input
                    className={`${styles.input} ${abnLengthInvalid || abnAcnMismatch ? styles.errorHighlight : ""}`}
                    value={companyAbnDigits}
                    maxLength={11}
                    inputMode="numeric"
                    onChange={(e) => onProfileChange("company_abn", e.target.value.replace(/\D/g, "").slice(0, 11))}
                  />
                  {abnLengthInvalid ? <span className={styles.error}>ABN must be 11 digits.</span> : null}
                  {abnAcnMismatch ? <span className={styles.error}>ABN last 9 digits must match the ACN.</span> : null}
                </div>
              </div>
              <div className={styles.gridThree}>
                <div className={styles.field}>
                  <label className={styles.label}>ACN</label>
                  <input
                    className={`${styles.input} ${acnLengthInvalid || abnAcnMismatch ? styles.errorHighlight : ""}`}
                    value={companyAcnDigits}
                    maxLength={9}
                    inputMode="numeric"
                    onChange={(e) => onProfileChange("company_acn", e.target.value.replace(/\D/g, "").slice(0, 9))}
                  />
                  {acnLengthInvalid ? <span className={styles.error}>ACN must be 9 digits.</span> : null}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Website</label>
                  <input className={styles.input} value={profile.company_website || ""} onChange={(e) => onProfileChange("company_website", e.target.value)} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Company TFN</label>
                  <input className={styles.input} value={profile.company_tfn || ""} onChange={(e) => onProfileChange("company_tfn", e.target.value)} />
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Is the company address the same as the address above?</label>
                <select
                  className={styles.select}
                  value={profile.company_address_same === 1 ? "yes" : "no"}
                  onChange={(e) => onProfileChange("company_address_same", e.target.value === "yes" ? 1 : 0)}
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
                <div className={styles.hint} style={{ marginTop: "0.35rem" }}>
                  Address and banking fields stay open so you can review and edit details.
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>
                  Company address preview (auto-filled when you choose yes).
                </label>
                <input className={styles.input} value={profile.company_address || ""} readOnly />
              </div>
              <div className={styles.gridFour}>
                <div className={styles.field}>
                  <label className={styles.label}>Address number *</label>
                  <input
                    className={styles.input}
                    value={profile.company_address_number || ""}
                    onChange={(e) => onProfileChange("company_address_number", e.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Floor (optional)</label>
                  <input
                    className={styles.input}
                    value={profile.company_address_floor || ""}
                    onChange={(e) => onProfileChange("company_address_floor", e.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Unit / room number (optional)</label>
                  <input
                    className={styles.input}
                    value={profile.company_address_unit || ""}
                    onChange={(e) => onProfileChange("company_address_unit", e.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Building name (if applicable)</label>
                  <input
                    className={styles.input}
                    value={profile.company_address_building || ""}
                    onChange={(e) => onProfileChange("company_address_building", e.target.value)}
                  />
                </div>
              </div>
              <div className={styles.gridThree}>
                <div className={styles.field} style={{ gridColumn: "span 2" }}>
                  <label className={styles.label}>Start typing company address with number *</label>
                  <input
                    className={styles.input}
                    ref={companyStreetRef}
                    value={profile.company_address_street || ""}
                    onChange={(e) => onProfileChange("company_address_street", e.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Postcode *</label>
                  <input
                    className={styles.input}
                    value={profile.company_address_postcode || ""}
                    onChange={(e) => onProfileChange("company_address_postcode", e.target.value)}
                  />
                </div>
              </div>
              <div className={styles.gridThree}>
                <div className={styles.field}>
                  <label className={styles.label}>Company bank account name</label>
                  <input
                    className={styles.input}
                    value={profile.company_bank_account_name || ""}
                    onChange={(e) => onProfileChange("company_bank_account_name", e.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Company BSB</label>
                  <input
                    className={styles.input}
                    value={profile.company_bank_bsb || ""}
                    onChange={(e) => onProfileChange("company_bank_bsb", e.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Company account number</label>
                  <input
                    className={styles.input}
                    value={profile.company_bank_account_number || ""}
                    onChange={(e) => onProfileChange("company_bank_account_number", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ) : null}

          <div className={styles.section}>
            <h4 style={sectionTitleStyle}>Identification documents</h4>
            <div className={styles.gridThree}>
              <div className={styles.field}>
                <label className={styles.label}>Select ID type *</label>
                <select
                  className={`${styles.select} ${profileErrors.id_document_type ? styles.errorHighlight : ""}`}
                  value={docUploads.id_document_type}
                  onChange={(e) => setDocUploads((prev) => ({ ...prev, id_document_type: e.target.value }))}
                >
                  <option value="">Select...</option>
                  <option value="driving_licence">Driving licence</option>
                  <option value="passport">Passport</option>
                  <option value="other">Other</option>
                </select>
                {profileErrors.id_document_type ? <div className={styles.error}>Required</div> : null}
              </div>
            </div>
            {docUploads.id_document_type === "driving_licence" ? (
              <div className={styles.gridThree}>
                <div className={styles.field}>
                  <label className={styles.label}>Driver licence (front)</label>
                  <input
                    className={`${styles.input} ${profileErrors.drivers_license_front ? styles.errorHighlight : ""}`}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const data = await readFileAsBase64(file);
                      setDocUploads((prev) => ({
                        ...prev,
                        drivers_license_front: data.base64,
                        drivers_license_front_type: data.type,
                        drivers_license_front_name: file.name,
                      }));
                      setDocPreviews((prev) => ({
                        ...prev,
                        drivers_license_front: `data:${data.type};base64,${data.base64}`,
                      }));
                    }}
                  />
                  {profileErrors.drivers_license_front ? <div className={styles.error}>Required</div> : null}
                  {renderDocPreviewRow({
                    name: docUploads.drivers_license_front_name || profile.drivers_license_front_name || "Driver licence front",
                    preview: docPreviews.drivers_license_front,
                    alt: "Driver licence front",
                    onDelete: () => deleteIdentityDoc("drivers_license_front"),
                  })}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Driver licence (back)</label>
                  <input
                    className={`${styles.input} ${profileErrors.drivers_license_back ? styles.errorHighlight : ""}`}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const data = await readFileAsBase64(file);
                      setDocUploads((prev) => ({
                        ...prev,
                        drivers_license_back: data.base64,
                        drivers_license_back_type: data.type,
                        drivers_license_back_name: file.name,
                      }));
                      setDocPreviews((prev) => ({
                        ...prev,
                        drivers_license_back: `data:${data.type};base64,${data.base64}`,
                      }));
                    }}
                  />
                  {profileErrors.drivers_license_back ? <div className={styles.error}>Required</div> : null}
                  {renderDocPreviewRow({
                    name: docUploads.drivers_license_back_name || profile.drivers_license_back_name || "Driver licence back",
                    preview: docPreviews.drivers_license_back,
                    alt: "Driver licence back",
                    onDelete: () => deleteIdentityDoc("drivers_license_back"),
                  })}
                </div>
              </div>
            ) : null}
            {docUploads.id_document_type === "passport" ? (
              <div className={styles.gridThree}>
                <div className={styles.field}>
                  <label className={styles.label}>Passport image</label>
                  <input
                    className={`${styles.input} ${profileErrors.id_document_front ? styles.errorHighlight : ""}`}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const data = await readFileAsBase64(file);
                      setDocUploads((prev) => ({
                        ...prev,
                        id_document_front: data.base64,
                        id_document_front_type: data.type,
                        id_document_front_name: file.name,
                      }));
                      setDocPreviews((prev) => ({
                        ...prev,
                        id_document_front: `data:${data.type};base64,${data.base64}`,
                      }));
                    }}
                  />
                  {profileErrors.id_document_front ? <div className={styles.error}>Required</div> : null}
                  {renderDocPreviewRow({
                    name: docUploads.id_document_front_name || profile.id_document_front_name || "Passport image",
                    preview: docPreviews.id_document_front,
                    alt: "Passport image",
                    onDelete: () => deleteIdentityDoc("id_document_front"),
                  })}
                </div>
              </div>
            ) : null}
            {docUploads.id_document_type === "other" ? (
              <div className={styles.gridThree}>
                <div className={styles.field}>
                  <label className={styles.label}>Other ID (front)</label>
                  <input
                    className={`${styles.input} ${profileErrors.id_document_front ? styles.errorHighlight : ""}`}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const data = await readFileAsBase64(file);
                      setDocUploads((prev) => ({
                        ...prev,
                        id_document_front: data.base64,
                        id_document_front_type: data.type,
                        id_document_front_name: file.name,
                      }));
                      setDocPreviews((prev) => ({
                        ...prev,
                        id_document_front: `data:${data.type};base64,${data.base64}`,
                      }));
                    }}
                  />
                  {profileErrors.id_document_front ? <div className={styles.error}>Required</div> : null}
                  {renderDocPreviewRow({
                    name: docUploads.id_document_front_name || profile.id_document_front_name || "Other ID front",
                    preview: docPreviews.id_document_front,
                    alt: "Other ID front",
                    onDelete: () => deleteIdentityDoc("id_document_front"),
                  })}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Other ID (back)</label>
                  <input
                    className={`${styles.input} ${profileErrors.id_document_back ? styles.errorHighlight : ""}`}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const data = await readFileAsBase64(file);
                      setDocUploads((prev) => ({
                        ...prev,
                        id_document_back: data.base64,
                        id_document_back_type: data.type,
                        id_document_back_name: file.name,
                      }));
                      setDocPreviews((prev) => ({
                        ...prev,
                        id_document_back: `data:${data.type};base64,${data.base64}`,
                      }));
                    }}
                  />
                  {profileErrors.id_document_back ? <div className={styles.error}>Required</div> : null}
                  {renderDocPreviewRow({
                    name: docUploads.id_document_back_name || profile.id_document_back_name || "Other ID back",
                    preview: docPreviews.id_document_back,
                    alt: "Other ID back",
                    onDelete: () => deleteIdentityDoc("id_document_back"),
                  })}
                </div>
              </div>
            ) : null}
          </div>

          {!profile.has_own_abn ? (
            <div className={styles.section}>
              <h4 style={sectionTitleStyle}>Your banking</h4>
              <p className={styles.hint}>Where do you want payments to be made to?</p>
              <div className={styles.gridThree}>
                <div className={styles.field}>
                  <label className={styles.label}>Bank name</label>
                  <select
                    className={styles.select}
                    value={profile.bank_name || ""}
                    onChange={(e) => onProfileChange("bank_name", e.target.value)}
                  >
                    <option value="">Select bank...</option>
                    {AU_BANKS.map((bank) => (
                      <option key={bank} value={bank}>
                        {bank}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Account name</label>
                  <input
                    className={styles.input}
                    value={profile.bank_account_name || ""}
                    onChange={(e) => onProfileChange("bank_account_name", e.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>BSB</label>
                  <input
                    className={styles.input}
                    value={profile.bank_bsb || ""}
                    onChange={(e) => onProfileChange("bank_bsb", e.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Account number</label>
                  <input
                    className={styles.input}
                    value={profile.bank_account_number || ""}
                    onChange={(e) => onProfileChange("bank_account_number", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ) : null}

          <div className={styles.actions}>
            <SecondaryButton
              type="button"
              style={{ background: "#ecfdf3", borderColor: "#22c55e", color: "#166534" }}
              onClick={saveProfile}
            >
              Save profile
            </SecondaryButton>
            {profileSaving ? (
              <span className={styles.hint} style={{ color: "#1d4ed8", fontWeight: 700 }}>
                Updating please wait...
              </span>
            ) : null}
            {profileSaveMessage ? (
              <span className={styles.hint} style={{ color: "#b91c1c", fontWeight: 700 }}>
                {profileSaveMessage}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3 style={sectionTitleStyle}>Tickets</h3>
        <p className={styles.hint} style={{ fontWeight: 700 }}>
          White Card (WHS) is required before submitting. Please complete the White Card ticket details and upload front/back images.
        </p>
        {whiteCardError ? <div className={styles.error}>{whiteCardError}</div> : null}
        {ticketForms.map((draft) => {
          const errors = ticketErrors[draft.draft_id] || {};
          return (
            <div className={styles.section} key={draft.draft_id}>
              {draft.update_label ? (
                <div className={styles.hint} style={{ fontWeight: 700, color: "#1d4ed8", marginBottom: "0.5rem" }}>
                  Updating {draft.update_label}. The previous ticket will remain on file.
                </div>
              ) : null}
              <div className={styles.gridFour}>
                <div className={styles.field}>
                  <label className={styles.label}>Ticket type *</label>
                  <select
                    className={`${styles.select} ${errors.type ? styles.errorHighlight : ""}`}
                    value={draft.type}
                    disabled={draft.locked}
                    onChange={(e) => updateTicketDraft(draft.draft_id, { type: e.target.value })}
                  >
                    <option value="">Select...</option>
                    {TICKETS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                  {errors.type ? <div className={styles.error}>{errors.type}</div> : null}
                </div>
                {draft.type === "Other" ? (
                  <div className={styles.field}>
                    <label className={styles.label}>Other ticket type *</label>
                    <input
                      className={`${styles.input} ${errors.other_type ? styles.errorHighlight : ""}`}
                      value={draft.other_type}
                      onChange={(e) => updateTicketDraft(draft.draft_id, { other_type: e.target.value })}
                    />
                    {errors.other_type ? <div className={styles.error}>{errors.other_type}</div> : null}
                  </div>
                ) : null}
                <div className={styles.field}>
                  <label className={styles.label}>Ticket / Card number *</label>
                  <input
                    className={`${styles.input} ${errors.ticket_number ? styles.errorHighlight : ""}`}
                    value={draft.ticket_number}
                    onChange={(e) => updateTicketDraft(draft.draft_id, { ticket_number: e.target.value })}
                  />
                  {errors.ticket_number ? <div className={styles.error}>{errors.ticket_number}</div> : null}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Ticket issue / training date *</label>
                  <input
                    className={`${styles.input} ${errors.issue_date ? styles.errorHighlight : ""}`}
                    type="date"
                    value={draft.issue_date}
                    onChange={(e) => updateTicketDraft(draft.draft_id, { issue_date: e.target.value })}
                  />
                  {errors.issue_date ? <div className={styles.error}>{errors.issue_date}</div> : null}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Expiry date *</label>
                  <input
                    className={`${styles.input} ${errors.expiry_date ? styles.errorHighlight : ""}`}
                    type="date"
                    value={draft.expiry_date}
                    onChange={(e) => updateTicketDraft(draft.draft_id, { expiry_date: e.target.value })}
                  />
                  {errors.expiry_date ? <div className={styles.error}>{errors.expiry_date}</div> : null}
                  {draft.expiry_date ? (
                    <div className={styles.hint} style={{ fontWeight: 700 }}>
                      {calculateExpiryCountdown(draft.expiry_date)}
                    </div>
                  ) : null}
                </div>
              </div>
              <div className={styles.gridThree}>
                <div className={styles.field}>
                  <label className={styles.label}>Total time held ticket</label>
                  <input className={styles.input} readOnly value={calculateTicketDuration(draft.issue_date, ticketClock)} />
                </div>
              </div>
              <div className={styles.gridThree}>
                <div className={styles.field}>
                  <label className={styles.label}>Ticket image (front)</label>
                  <input
                    className={`${styles.input} ${errors.front_image ? styles.errorHighlight : ""}`}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const data = await readFileAsBase64(file);
                      updateTicketDraft(draft.draft_id, {
                        front_image: data.base64,
                        front_image_type: data.type,
                        front_image_name: file.name,
                      });
                    }}
                  />
                  {errors.front_image ? <div className={styles.error}>{errors.front_image}</div> : null}
                  {draft.front_image ? (
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewModal({
                          src: `data:${draft.front_image_type || "image/jpeg"};base64,${draft.front_image}`,
                          alt: "Ticket front",
                        })
                      }
                      style={{ display: "block", marginTop: "0.5rem", padding: 0, border: 0, background: "transparent", width: "100%" }}
                    >
                      <div style={previewBoxStyle}>
                        <img
                          src={`data:${draft.front_image_type || "image/jpeg"};base64,${draft.front_image}`}
                          alt="Ticket front"
                          style={previewImgStyle}
                        />
                      </div>
                    </button>
                  ) : null}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Ticket image (back)</label>
                  <input
                    className={`${styles.input} ${errors.back_image ? styles.errorHighlight : ""}`}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const data = await readFileAsBase64(file);
                      updateTicketDraft(draft.draft_id, {
                        back_image: data.base64,
                        back_image_type: data.type,
                        back_image_name: file.name,
                      });
                    }}
                  />
                  {errors.back_image ? <div className={styles.error}>{errors.back_image}</div> : null}
                  {draft.back_image ? (
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewModal({
                          src: `data:${draft.back_image_type || "image/jpeg"};base64,${draft.back_image}`,
                          alt: "Ticket back",
                        })
                      }
                      style={{ display: "block", marginTop: "0.5rem", padding: 0, border: 0, background: "transparent", width: "100%" }}
                    >
                      <div style={previewBoxStyle}>
                        <img
                          src={`data:${draft.back_image_type || "image/jpeg"};base64,${draft.back_image}`}
                          alt="Ticket back"
                          style={previewImgStyle}
                        />
                      </div>
                    </button>
                  ) : null}
                </div>
                <div className={styles.field} style={{ alignSelf: "end" }}>
                  {ticketSaving[draft.draft_id] ? <div className={styles.hint}>Saving ticket...</div> : null}
                  {ticketSaved[draft.draft_id] ? <div className={styles.hint}>Ticket saved.</div> : null}
                </div>
              </div>
              <div className={styles.actions}>
                <SecondaryButton
                  type="button"
                  style={{ background: "#fff7ed", borderColor: "#f97316", color: "#c2410c" }}
                  onClick={() => addTicket(draft.draft_id)}
                  disabled={ticketSaving[draft.draft_id]}
                >
                  {ticketSaving[draft.draft_id] ? "Saving ticket..." : "Save ticket"}
                </SecondaryButton>
              </div>
            </div>
          );
        })}
        <div className={styles.actions}>
          <SecondaryButton
            type="button"
            style={{ background: "#eff6ff", borderColor: "#3b82f6", color: "#1d4ed8" }}
            onClick={addAnotherTicket}
          >
            Add another ticket
          </SecondaryButton>
        </div>

        {tickets.length === 0 ? (
          <p>No tickets added yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {(() => {
              const latestByType = new Map<string, string>();
              for (const t of tickets) {
                const existing = latestByType.get(t.type);
                if (!existing) {
                  latestByType.set(t.type, t.ticket_id);
                  continue;
                }
                const existingTicket = tickets.find((item) => item.ticket_id === existing);
                const existingStamp = existingTicket?.created_at ?? 0;
                const nextStamp = t.created_at ?? 0;
                if (nextStamp >= existingStamp) {
                  latestByType.set(t.type, t.ticket_id);
                }
              }
              return tickets.map((t) => {
                const latestId = latestByType.get(t.type);
                const isSuperseded = !!latestId && latestId !== t.ticket_id;
              const expiryCountdown = t.expiry_date ? calculateExpiryCountdown(t.expiry_date) : "";
              const isExpired = expiryCountdown === "Expired";
              const match = expiryCountdown.match(/Expires in (\d+)/);
              const daysLeft = match ? Number(match[1]) : null;
              const showExpiryWarning = t.expiry_date && (isExpired || (daysLeft !== null && daysLeft <= 30));
              const showRenewalToggle = !isSuperseded && t.expiry_date && (isExpired || (daysLeft !== null && daysLeft <= 30));
              return (
              <div key={t.ticket_id} className={styles.group}>
                <div className={styles.groupHead}>
                  <div>
                    <strong>{t.type}</strong> ({t.years_experience || 0} yrs)
                  </div>
                  <div>Status: {isSuperseded ? "TICKET NOT VALID" : (t.verification_status || "pending")}</div>
                </div>
                <div>Ticket number: {t.ticket_number || "Not set"}</div>
                <div>Issue date: {t.issue_date || "Not set"}</div>
                <div>
                  Expiry: {t.expiry_date || "Not set"}
                  {expiryCountdown ? (
                    <span
                      style={{
                        marginLeft: "0.5rem",
                        fontWeight: 700,
                        color: expiryCountdown.startsWith("Expires in") ? "#0f172a" : "#b91c1c",
                      }}
                    >
                      {expiryCountdown}
                    </span>
                  ) : null}
                </div>
                {showExpiryWarning ? (
                  <div className={styles.error} style={{ fontWeight: 700 }}>
                    {isExpired ? "Ticket expired. Please upload an updated ticket." : "Ticket expires within 30 days."}
                  </div>
                ) : null}
                {isSuperseded ? (
                  <div className={styles.hint} style={{ fontWeight: 700, color: "#b91c1c" }}>
                    Newer ticket on file. This ticket is kept for reference only.
                  </div>
                ) : null}
                {t.renewal_status === "will_not_renew" ? (
                  <div className={styles.error} style={{ fontWeight: 700 }}>
                    Ticket will not be renewed.
                  </div>
                ) : null}
                {renderTicketPreviewRow({
                  name: t.front_image_name || "Ticket front image",
                  preview: t.front_image_key
                    ? `/api/workers/me/tickets/image?ticket_id=${encodeURIComponent(t.ticket_id)}&side=front`
                    : "",
                  alt: "Ticket front",
                  onDelete: () => deleteTicketImage(t.ticket_id, "front"),
                })}
                {renderTicketPreviewRow({
                  name: t.back_image_name || "Ticket back image",
                  preview: t.back_image_key
                    ? `/api/workers/me/tickets/image?ticket_id=${encodeURIComponent(t.ticket_id)}&side=back`
                    : "",
                  alt: "Ticket back",
                  onDelete: () => deleteTicketImage(t.ticket_id, "back"),
                })}
                <div className={styles.actions}>
                  {showRenewalToggle ? (
                    t.renewal_status === "will_not_renew" ? (
                      <SecondaryButton
                        type="button"
                        style={{ background: "#ecfdf3", borderColor: "#22c55e", color: "#166534" }}
                        onClick={() => setTicketRenewalStatus(t.ticket_id, "active")}
                      >
                        Ticket will be renewed
                      </SecondaryButton>
                    ) : (
                      <SecondaryButton
                        type="button"
                        style={{ background: "#fee2e2", borderColor: "#ef4444", color: "#991b1b" }}
                        onClick={() => setTicketRenewalStatus(t.ticket_id, "will_not_renew")}
                      >
                        Ticket will not be renewed
                      </SecondaryButton>
                    )
                  ) : null}
                  {!isSuperseded ? (
                    <SecondaryButton
                      type="button"
                      style={{ background: "#eff6ff", borderColor: "#3b82f6", color: "#1d4ed8" }}
                      onClick={() => addUpdateTicket(t)}
                    >
                      Update ticket
                    </SecondaryButton>
                  ) : null}
                  <SecondaryButton type="button"  onClick={() => deleteTicket(t.ticket_id)}>
                    Remove
                  </SecondaryButton>
                </div>
              </div>
            );
            });
            })()}
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h3 style={sectionTitleStyle}>Work experience</h3>
        <p className={styles.hint}>
          If you can, please fill in your work experience for the last 2 years or more if possible. Some sites require previous experience proof.
        </p>
        {workExperienceRows.map((row, idx) => (
          <div key={`experience-${idx}`} className={styles.group}>
            <div className={styles.gridFour}>
              <div className={styles.field}>
                <label className={styles.label}>Location or site name</label>
                <input
                  className={styles.input}
                  value={row.site_name}
                  onChange={(e) => {
                    const next = [...workExperienceRows];
                    next[idx] = { ...row, site_name: e.target.value };
                    setWorkExperienceRows(next);
                  }}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Job or position worked as</label>
                <input
                  className={styles.input}
                  value={row.position}
                  onChange={(e) => {
                    const next = [...workExperienceRows];
                    next[idx] = { ...row, position: e.target.value };
                    setWorkExperienceRows(next);
                  }}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Start date</label>
                <input
                  className={styles.input}
                  type="date"
                  value={row.start_date}
                  onChange={(e) => {
                    const next = [...workExperienceRows];
                    next[idx] = { ...row, start_date: e.target.value };
                    setWorkExperienceRows(next);
                  }}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Finish date</label>
                <input
                  className={styles.input}
                  type="date"
                  value={row.end_date}
                  onChange={(e) => {
                    const next = [...workExperienceRows];
                    next[idx] = { ...row, end_date: e.target.value };
                    setWorkExperienceRows(next);
                  }}
                />
              </div>
            </div>
              <div className={styles.gridThree}>
                <div className={styles.field}>
                <label className={styles.label}>Reason why you stopped working at this place</label>
                  <select
                    className={styles.select}
                    value={row.reason}
                  onChange={(e) => {
                    const next = [...workExperienceRows];
                    next[idx] = { ...row, reason: e.target.value, reason_other: "" };
                    setWorkExperienceRows(next);
                  }}
                >
                  <option value="">Select...</option>
                  {EXPERIENCE_REASONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>
              {row.reason === "Other" ? (
                <div className={styles.field}>
                  <label className={styles.label}>Other reason</label>
                  <input
                    className={styles.input}
                    value={row.reason_other || ""}
                    onChange={(e) => {
                      const next = [...workExperienceRows];
                      next[idx] = { ...row, reason_other: e.target.value };
                      setWorkExperienceRows(next);
                    }}
                  />
                </div>
              ) : null}
            </div>
            <div className={styles.gridThree}>
              <div className={styles.field}>
                <label className={styles.label}>Reference name</label>
                <input
                  className={styles.input}
                  value={row.reference_name || ""}
                  onChange={(e) => {
                    const next = [...workExperienceRows];
                    next[idx] = { ...row, reference_name: e.target.value };
                    setWorkExperienceRows(next);
                  }}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Contact position on that site</label>
                <select
                  className={styles.select}
                  value={row.reference_position || ""}
                  onChange={(e) => {
                    const next = [...workExperienceRows];
                    next[idx] = { ...row, reference_position: e.target.value, reference_position_other: "" };
                    setWorkExperienceRows(next);
                  }}
                >
                  <option value="">Select...</option>
                  {POSITION_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Mobile number</label>
                <input
                  className={styles.input}
                  value={row.reference_mobile || ""}
                  onChange={(e) => {
                    const next = [...workExperienceRows];
                    next[idx] = { ...row, reference_mobile: e.target.value };
                    setWorkExperienceRows(next);
                  }}
                />
              </div>
            </div>
            {row.reference_position === "Other" ? (
              <div className={styles.gridThree}>
                <div className={styles.field}>
                  <label className={styles.label}>Contact position (other)</label>
                  <input
                    className={styles.input}
                    value={row.reference_position_other || ""}
                    onChange={(e) => {
                      const next = [...workExperienceRows];
                      next[idx] = { ...row, reference_position_other: e.target.value };
                      setWorkExperienceRows(next);
                    }}
                  />
                </div>
              </div>
            ) : null}
            <div className={styles.gridThree}>
              <div className={styles.field}>
                <label className={styles.label}>Phone number</label>
                <input
                  className={styles.input}
                  value={row.reference_phone || ""}
                  onChange={(e) => {
                    const next = [...workExperienceRows];
                    next[idx] = { ...row, reference_phone: e.target.value };
                    setWorkExperienceRows(next);
                  }}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input
                  className={styles.input}
                  value={row.reference_email || ""}
                  onChange={(e) => {
                    const next = [...workExperienceRows];
                    next[idx] = { ...row, reference_email: e.target.value };
                    setWorkExperienceRows(next);
                  }}
                />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>
                Work notes (write something about the work you did at this place or anything else you want to add)
              </label>
              <textarea
                className={styles.textarea}
                rows={3}
                value={row.notes || ""}
                onChange={(e) => {
                  const next = [...workExperienceRows];
                  next[idx] = { ...row, notes: e.target.value };
                  setWorkExperienceRows(next);
                }}
              />
            </div>
            <div className={styles.section} style={{ marginTop: "0.75rem" }}>
              <h4>Work media (optional)</h4>
              <p className={styles.hint}>Add photos or videos of you working if you wish.</p>
              {(row.work_media || []).map((media, mediaIndex) => (
                <div key={`exp-${idx}-media-${mediaIndex}`} className={styles.gridTwo} style={{ marginBottom: "0.5rem" }}>
                  <div className={styles.field}>
                    <label className={styles.label}>Description</label>
                    <input
                      className={styles.input}
                      value={media.description || ""}
                      onChange={(e) => {
                        const next = [...workExperienceRows];
                        const list = [...(row.work_media || [])];
                        list[mediaIndex] = { ...media, description: e.target.value };
                        next[idx] = { ...row, work_media: list };
                        setWorkExperienceRows(next);
                      }}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Upload file</label>
                    <input
                      className={styles.input}
                      type="file"
                      accept="image/*,video/*"
                      capture="environment"
                      onChange={(e) => handleExperienceMediaChange(idx, mediaIndex, e.target.files?.[0] || null)}
                    />
                    {(() => {
                      const previewSrc = media.content
                        ? `data:${media.type || "image/jpeg"};base64,${media.content}`
                        : media.key
                          ? `/api/workers/me/media?key=${encodeURIComponent(media.key)}`
                          : "";
                      const isImage = (media.type || "").startsWith("image/");
                      return (
                        <>
                          {renderTicketPreviewRow({
                            name: media.name || "Work media",
                            preview: isImage ? previewSrc : "",
                            alt: "Work media",
                            onDelete: () => deleteExperienceMedia(idx, mediaIndex),
                          })}
                          {!isImage && media.name ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.5rem" }}>
                              <span className={styles.hint}>{media.name}</span>
                              <SecondaryButton
                                type="button"
                                style={{ background: "#fee2e2", borderColor: "#ef4444", color: "#991b1b" }}
                                onClick={() => deleteExperienceMedia(idx, mediaIndex)}
                              >
                                Delete
                              </SecondaryButton>
                            </div>
                          ) : null}
                        </>
                      );
                    })()}
                  </div>
                </div>
              ))}
              {workMediaError && <div className={styles.errorSummary}>{workMediaError}</div>}
              <div className={styles.actions}>
                <SecondaryButton
                  type="button"
                  onClick={() => {
                    const next = [...workExperienceRows];
                    const list = [...(row.work_media || [])];
                    list.push({ name: "", type: "", size: 0, content: "" });
                    next[idx] = { ...row, work_media: list };
                    setWorkExperienceRows(next);
                  }}
                >
                  Add media
                </SecondaryButton>
              </div>
            </div>
          </div>
        ))}
        <div className={styles.actions}>
          <SecondaryButton
            type="button"
            onClick={() =>
              setWorkExperienceRows((prev) => [
                ...prev,
                { site_name: "", position: "", start_date: "", end_date: "", reason: "", work_media: [] },
              ])
            }
          >
            Add another job or position
          </SecondaryButton>
          <SecondaryButton
            type="button"
            disabled={workExperienceRows.length <= 1}
            onClick={() => setWorkExperienceRows((prev) => prev.slice(0, -1))}
          >
            Delete this position
          </SecondaryButton>
          <SecondaryButton
            type="button"
            style={{ background: "#ecfdf3", borderColor: "#22c55e", color: "#166534" }}
            onClick={saveWorkExperience}
            disabled={workExperienceSaving}
          >
            {workExperienceSaving ? "Saving..." : "Save work experience"}
          </SecondaryButton>
          {workExperienceMessage ? (
            <span className={styles.hint} style={{ color: "#1d4ed8", fontWeight: 700 }}>
              {workExperienceMessage}
            </span>
          ) : null}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.field}>
          <label className={styles.label}>
            Additional comments (If you would like to add anything else about your work experience or about your self please feel free to write here.)
          </label>
          <textarea
            className={styles.textarea}
            rows={3}
            value={profile.work_comments || ""}
            onChange={(e) => onProfileChange("work_comments", e.target.value)}
          />
        </div>
      </div>

      <div className={styles.section}>
        <h3>Availability</h3>
        <p className={styles.hint}>Click here to edit current availability dates.</p>
        <div className={styles.actions}>
          <SecondaryButton href="/dashboard/worker/working-now">
            Click here
          </SecondaryButton>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Emergency contact person</h3>
        <p className={styles.hint}>
          (In case there is an emergency should we or the site need to contact anyone for you)
        </p>
        <div className={styles.gridFour}>
          <div className={styles.field}>
            <label className={styles.label}>Title</label>
            <select
              className={styles.select}
              value={profile.emergency_contact_title || ""}
              onChange={(e) => onProfileChange("emergency_contact_title", e.target.value)}
            >
              <option value="">Select...</option>
              <option value="Mr">Mr</option>
              <option value="Mrs">Mrs</option>
              <option value="Miss">Miss</option>
              <option value="Ms">Ms</option>
              <option value="Mx">Mx</option>
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>First name</label>
            <input
              className={styles.input}
              value={profile.emergency_contact_first_name || ""}
              onChange={(e) => onProfileChange("emergency_contact_first_name", e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Family name</label>
            <input
              className={styles.input}
              value={profile.emergency_contact_family_name || ""}
              onChange={(e) => onProfileChange("emergency_contact_family_name", e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Mobile phone</label>
            <input
              className={styles.input}
              value={profile.emergency_contact_mobile || ""}
              onChange={(e) => onProfileChange("emergency_contact_mobile", e.target.value)}
            />
          </div>
        </div>
        <div className={styles.gridThree}>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              className={styles.input}
              value={profile.emergency_contact_email || ""}
              onChange={(e) => onProfileChange("emergency_contact_email", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3 style={sectionTitleStyle}>Assignments</h3>
        {assignments.length === 0 ? (
          <p>No assignments yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {assignments.map((a) => (
              <div key={a.assignment_id} className={styles.group}>
                <div>Request: {a.request_id}</div>
                <div>Status: {a.status}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className={styles.section}>
        <div className={styles.field} style={{ fontWeight: 700 }}>
          <label className={styles.label} style={{ fontWeight: 800 }}>
            <input
              type="checkbox"
              checked={!!profile.privacy_agreed}
              onChange={(e) => onProfileChange("privacy_agreed", e.target.checked ? 1 : 0)}
            />{" "}
            I agree to the privacy statement.
          </label>
          <label className={styles.label} style={{ fontWeight: 800 }}>
            <input
              type="checkbox"
              checked={!!profile.indemnity_agreed}
              onChange={(e) => onProfileChange("indemnity_agreed", e.target.checked ? 1 : 0)}
            />{" "}
            I agree to the indemnity statement.
          </label>
          {submitAttempted && (!profile.privacy_agreed || !profile.indemnity_agreed) ? (
            <div className={styles.error} style={{ fontWeight: 700 }}>
              Please agree to the privacy and indemnity statements before submitting for approval.
            </div>
          ) : null}
        </div>
      </div>
      <div className={styles.actions} style={{ paddingBottom: "0" }}>
        <SecondaryButton type="button"  style={{ background: "#ecfdf3", borderColor: "#22c55e", color: "#166534" }} onClick={submitProfile}>
          SUBMIT PROFILE
        </SecondaryButton>
        {submitMessage ? (
          <span
            className={styles.hint}
            style={{
              color: submitStatus === "success" ? "#166534" : submitStatus === "loading" ? "#1d4ed8" : "#b91c1c",
              fontWeight: 700,
            }}
          >
            {submitMessage}
          </span>
        ) : null}
      </div>

      <div className={styles.section}>
        <h3 style={sectionTitleStyle}>Delete account</h3>
        <p className={styles.hint}>
          You can request deletion. An admin must approve before data is removed.
        </p>
        {!profile.delete_requested ? (
          <div className={styles.field}>
            <label className={styles.label}>Reason for account deletion (optional)</label>
            <textarea
              className={styles.textarea}
              rows={3}
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder="Let us know why you're requesting deletion."
            />
          </div>
        ) : null}
        <div className={styles.actions}>
          <SecondaryButton type="button"  onClick={requestDelete} disabled={!!profile.delete_requested}>
            Request deletion
          </SecondaryButton>
          {profile.delete_requested ? (
            <SecondaryButton
              type="button"
              style={{ background: "#fee2e2", borderColor: "#ef4444", color: "#991b1b" }}
              onClick={cancelDelete}
            >
              Undo delete request
            </SecondaryButton>
          ) : null}
        </div>
      </div>

      {message && <div className={styles.hint}>{message}</div>}
      {previewModal ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1.5rem",
          }}
        >
          <div style={{ maxWidth: 720, width: "100%", background: "#fff", borderRadius: 16, padding: "1rem", maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", position: "sticky", top: 0, background: "#fff", zIndex: 1, paddingBottom: "0.5rem" }}>
              <strong>{previewModal.alt}</strong>
              <SecondaryButton
                type="button"
                style={{ background: "#fee2e2", borderColor: "#ef4444", color: "#991b1b" }}
                onClick={() => setPreviewModal(null)}
              >
                Close image
              </SecondaryButton>
            </div>
            <div style={{ width: "100%", borderRadius: 12, overflow: "auto", border: "1px solid #e2e8f0", flex: 1 }}>
              <img src={previewModal.src} alt={previewModal.alt} style={{ width: "100%", height: "auto", display: "block" }} />
            </div>
          </div>
        </div>
      ) : null}
      {tfnNotQuotedOpen ? (
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
            zIndex: 2100,
            padding: "2rem",
          }}
        >
          <div style={{ background: "#fff", borderRadius: 16, maxWidth: 640, width: "100%", padding: "1.5rem" }}>
            <h3 style={{ marginBottom: "0.5rem", fontSize: "1.35rem", fontWeight: 800 }}>TFN not provided</h3>
            <p style={{ marginBottom: "1rem" }}>
              If you do not provide a TFN (and you are not exempt), we are required to withhold tax at the highest rate from
              payments made to you until a TFN is provided or a valid exemption applies. This may reduce your take-home pay.
              Your onboarding and payroll processing may also be delayed until your tax details are complete.
            </p>
            <label className={styles.label} style={{ fontWeight: 700 }}>
              <input
                type="checkbox"
                checked={tfnNotQuotedConfirm}
                onChange={(e) => setTfnNotQuotedConfirm(e.target.checked)}
              />{" "}
              I understand and want to continue.
            </label>
            <div className={styles.actions} style={{ marginTop: "1rem" }}>
              <SecondaryButton
                type="button"
                onClick={() => {
                  setTfnNotQuotedOpen(false);
                  setTfnNotQuotedPendingStatus(null);
                }}
                style={{ fontWeight: 800 }}
              >
                Close
              </SecondaryButton>
              <SecondaryButton
                type="button"
                disabled={!tfnNotQuotedConfirm}
                onClick={() => {
                  if (!tfnNotQuotedConfirm) return;
                  setTaxDeclaration((prev) => ({
                    ...prev,
                    tfn_status: tfnNotQuotedPendingStatus || prev.tfn_status,
                    tfn_not_quoted_ack: true,
                  }));
                  setTfnNotQuotedPendingStatus(null);
                  setTfnNotQuotedOpen(false);
                  setTimeout(() => {
                    saveTaxDeclaration(tfnNotQuotedPendingSubmit, true).catch(() => null);
                  }, 0);
                }}
                style={{ background: "#16a34a", borderColor: "#16a34a", color: "#fff", fontWeight: 800 }}
              >
                Continue
              </SecondaryButton>
            </div>
          </div>
        </div>
      ) : null}
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
