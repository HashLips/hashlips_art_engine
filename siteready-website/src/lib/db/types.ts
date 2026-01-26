export type RoleId = string;

export type RequestStatus =
  | "draft"
  | "submitted"
  | "candidates_proposed"
  | "contract_signed"
  | "released"
  | "active"
  | "completed";

export type AssignmentStatus = "proposed" | "contracted" | "released" | "active" | "completed";
export type TimesheetStatus = "pending" | "confirmed" | "queried";
export type VerifiedStatus = "unverified" | "pending" | "verified";
export type IncidentStatus = "logged" | "under_review" | "resolved";

export type AttachmentMeta = {
  name: string;
  description?: string;
  key?: string;
  size?: number;
  type?: string;
};

export interface RequestRow {
  request_id: string;
  client_id: string;
  status: RequestStatus;
  review_status?: string | null;
  status_reason?: string | null;
  role_id: RoleId;
  required_tickets: string[] | string | null;
  min_years_experience: number;
  site_address?: string | null;
  site_name?: string | null;
  site_lat?: number | null;
  site_lng?: number | null;
  site_place_id?: string | null;
  site_map_url?: string | null;
  shift_start_time?: string | null;
  shift_end_time?: string | null;
  headcount: number;
  hours_per_day?: number | null;
  expected_duration_value?: number | null;
  expected_duration_unit?: string | null;
  ot_options?: string[] | string | null;
  base_rate_offer?: number | null;
  travel_allowance?: number | null;
  attachment_list?: string[] | AttachmentMeta[] | string | null;
  start_date?: string | null;
  end_date?: string | null;
  notes?: string | null;
  urgency_level?: string | null;
  contract_signed: number;
  release_to_client: number;
  created_at: number;
  updated_at: number;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface WorkerRow {
  worker_id: string;
  user_id?: string | null;
  company_number: string;
  engagement_type?: "EMPLOYEE_CASUAL" | "CONTRACTOR_ABN" | null;
  name?: string | null;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  title?: string | null;
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
  working_now_status?: string | null;
  working_now_end_date?: string | null;
  working_now_notes?: string | null;
  availability_from_date?: string | null;
  availability_until_date?: string | null;
  holiday_start_date?: string | null;
  holiday_end_date?: string | null;
  consent_at?: string | null;
  drivers_license_front_key?: string | null;
  drivers_license_back_key?: string | null;
  drivers_license_front_name?: string | null;
  drivers_license_back_name?: string | null;
  id_document_type?: string | null;
  id_document_front_key?: string | null;
  id_document_back_key?: string | null;
  id_document_front_name?: string | null;
  id_document_back_name?: string | null;
  id_verification_status?: string | null;
  id_verification_notes?: string | null;
  license_verification_status?: string | null;
  license_verification_notes?: string | null;
  work_experience_json?: string | null;
  work_media_json?: string | null;
  work_comments?: string | null;
  delete_requested?: number | null;
  delete_requested_at?: string | null;
  delete_request_reason?: string | null;
  avatar_key?: string | null;
  role_id: RoleId;
  years_experience: number;
  verified_status: VerifiedStatus;
  last_verification_date?: string | null;
  base_lat?: number | null;
  base_lng?: number | null;
  preferred_radius_km?: number | null;
  created_at: number;
  updated_at: number;
}

export interface ContractorCompanyRow {
  worker_id: string;
  company_name: string;
  company_structure: string;
  abn: string;
  acn?: string | null;
  website?: string | null;
  company_tfn_encrypted?: string | null;
  address_json: string;
  bank_account_name: string;
  bank_bsb: string;
  bank_account_number_encrypted: string;
  bank_account_last4: string;
  contractor_pay_rate_cents?: number | null;
  created_at: string;
  updated_at: string;
}

export interface WorkerTaxDeclarationRow {
  worker_id: string;
  tax_residency_status: "AUSTRALIAN_RESIDENT" | "FOREIGN_RESIDENT" | "WORKING_HOLIDAY_MAKER";
  employment_basis: "FULL_TIME" | "PART_TIME" | "CASUAL" | "LABOUR_HIRE" | "SUPER_INCOME_STREAM";
  claim_tax_free_threshold: number;
  has_study_training_loan: number;
  has_sfss_debt: number;
  tfn_status: "PROVIDED" | "APPLIED_OR_ENQUIRED" | "EXEMPT_UNDER18" | "EXEMPT_PENSION" | "NOT_QUOTED";
  tfn_not_quoted_ack?: number | null;
  tfn_encrypted?: string | null;
  tfn_last4?: string | null;
  tfn_updated_at?: string | null;
  tfn_declaration_full_name?: string | null;
  tfn_declaration_signed?: number | null;
  tfn_declaration_signed_at?: string | null;
  tfn_declaration_signed_ip?: string | null;
  tfn_declaration_signed_user_agent?: string | null;
  changed_surname_since_ato?: number | null;
  previous_family_name?: string | null;
  eligible_to_receive_leave_loading?: number | null;
  has_student_startup_loan?: number | null;
  has_trade_support_loan_debt?: number | null;
  withholding_additional_amount_cents?: number | null;
  withholding_variation_percent?: number | null;
}

export interface WorkerTaxDeclarationDocumentRow {
  doc_id: string;
  worker_id: string;
  doc_type: string;
  file_key: string;
  file_name: string;
  file_type?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkerTicketRow {
  ticket_id: string;
  worker_id: string;
  type: string;
  front_image_key?: string | null;
  back_image_key?: string | null;
  front_image_name?: string | null;
  back_image_name?: string | null;
  ticket_number?: string | null;
  years_experience?: number | null;
  issue_date?: string | null;
  verification_status?: string | null;
  verification_notes?: string | null;
  expiry_date?: string | null;
  renewal_status?: string | null;
  reminder_30_sent_at?: string | null;
  reminder_7_sent_at?: string | null;
  verified: number;
  visible_to_clients: number;
  created_at: number;
  updated_at: number;
}

export interface AssignmentRow {
  assignment_id: string;
  request_id: string;
  worker_id: string;
  client_id: string;
  status: AssignmentStatus;
  created_at: number;
  updated_at: number;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface TimesheetRow {
  timesheet_id: string;
  assignment_id: string;
  date: string;
  hours: number;
  status: TimesheetStatus;
  note?: string | null;
  created_at: number;
  updated_at: number;
  confirmed_at?: string | null;
  queried_at?: string | null;
}

export type TimesheetApprovalStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "rejected"
  | "synced"
  | "sync_failed";

export interface TimesheetHeaderRow {
  timesheet_id: string;
  worker_id: string;
  client_id: string;
  assignment_id?: string | null;
  period_start: string;
  period_end: string;
  status: TimesheetApprovalStatus;
  submitted_at?: string | null;
  approved_at?: string | null;
  approved_by?: string | null;
  approval_comment?: string | null;
  xero_timesheet_id?: string | null;
  xero_synced_at?: string | null;
  created_at: number;
  updated_at: number;
}

export interface TimesheetLineRow {
  line_id: string;
  timesheet_id: string;
  work_date: string;
  hours_decimal: number;
  earnings_code: string;
  site_id?: string | null;
  job_id?: string | null;
  shift_id?: string | null;
  notes?: string | null;
}

export interface XeroConnectionRow {
  connection_id: string;
  tenant_id: string;
  access_token: string;
  refresh_token_encrypted: string;
  expires_at: number;
  scope: string;
  created_at: number;
  updated_at: number;
}

export interface XeroEmployeeMapRow {
  worker_id: string;
  xero_employee_id: string;
  payroll_calendar_id?: string | null;
  ordinary_earnings_rate_id?: string | null;
  super_fund_id?: string | null;
  last_synced_at?: string | null;
  sync_status?: string | null;
  sync_error?: string | null;
}

export interface XeroSettingsRow {
  settings_id: string;
  payroll_calendar_id?: string | null;
  ordinary_earnings_rate_id?: string | null;
  super_fund_id?: string | null;
  updated_at: number;
}

export interface XeroContactMapRow {
  id: string;
  entity_type: "CONTRACTOR_COMPANY" | "CLIENT_COMPANY";
  local_entity_id: string;
  xero_contact_id: string;
  abn?: string | null;
  last_synced_at?: string | null;
  sync_status?: string | null;
  sync_error?: string | null;
}

export interface XeroTransactionMapRow {
  id: string;
  timesheet_id: string;
  xero_payroll_timesheet_id?: string | null;
  xero_bill_invoice_id?: string | null;
  bill_idempotency_key?: string | null;
  sync_state?: "creating" | "synced" | "failed" | null;
  attempts?: number | null;
  last_synced_at?: string | null;
  sync_status?: string | null;
  sync_error?: string | null;
}

export interface XeroAccountingSettingsRow {
  id: number;
  default_purchases_account_code: string;
  bill_status_mode: "DRAFT" | "AUTHORISED";
}

export interface LegalAcceptanceRow {
  acceptance_id: string;
  user_id: string;
  role: string;
  document_type: string;
  document_version: string;
  accepted_at: string;
  ip_address?: string | null;
  user_agent?: string | null;
}

export interface IncidentRow {
  incident_id: string;
  assignment_id: string;
  type?: string | null;
  severity?: string | null;
  date?: string | null;
  description?: string | null;
  evidence_urls?: string | null;
  status: IncidentStatus;
  created_at: number;
  created_by?: string | null;
}

export interface PraiseRow {
  praise_id: string;
  assignment_id: string;
  tag?: string | null;
  note?: string | null;
  date?: string | null;
  created_at: number;
  created_by?: string | null;
}

export interface PerformanceMetricsRow {
  worker_id: string;
  on_time_rate?: number | null;
  safety_score?: number | null;
  teamwork_score?: number | null;
  incident_rate?: number | null;
  reliability_index?: number | null;
  updated_at: number;
}

export interface AuditLogRow {
  audit_id: string;
  actor_id?: string | null;
  actor_role?: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  timestamp: number;
  diff_json?: string | null;
}
