import { D1DatabaseLike } from "./client";
import { WorkerTaxDeclarationRow } from "./types";

export async function getWorkerTaxDeclaration(
  db: D1DatabaseLike,
  worker_id: string,
): Promise<WorkerTaxDeclarationRow | null> {
  const row = await db
    .prepare("SELECT * FROM worker_tax_declarations WHERE worker_id = ? LIMIT 1")
    .bind(worker_id)
    .first();
  return (row as WorkerTaxDeclarationRow | undefined) ?? null;
}

export async function upsertWorkerTaxDeclaration(
  db: D1DatabaseLike,
  data: WorkerTaxDeclarationRow,
) {
  await db
    .prepare(
      `INSERT INTO worker_tax_declarations (
        worker_id,
        tax_residency_status,
        employment_basis,
        claim_tax_free_threshold,
        has_study_training_loan,
        has_sfss_debt,
        tfn_status,
        tfn_not_quoted_ack,
        tfn_encrypted,
        tfn_last4,
        tfn_updated_at,
        tfn_declaration_full_name,
        tfn_declaration_signed,
        tfn_declaration_signed_at,
        tfn_declaration_signed_ip,
        tfn_declaration_signed_user_agent,
        changed_surname_since_ato,
        previous_family_name,
        eligible_to_receive_leave_loading,
        has_student_startup_loan,
        has_trade_support_loan_debt,
        withholding_additional_amount_cents,
        withholding_variation_percent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(worker_id) DO UPDATE SET
        tax_residency_status = excluded.tax_residency_status,
        employment_basis = excluded.employment_basis,
        claim_tax_free_threshold = excluded.claim_tax_free_threshold,
        has_study_training_loan = excluded.has_study_training_loan,
        has_sfss_debt = excluded.has_sfss_debt,
        tfn_status = excluded.tfn_status,
        tfn_not_quoted_ack = excluded.tfn_not_quoted_ack,
        tfn_encrypted = excluded.tfn_encrypted,
        tfn_last4 = excluded.tfn_last4,
        tfn_updated_at = excluded.tfn_updated_at,
        tfn_declaration_full_name = excluded.tfn_declaration_full_name,
        tfn_declaration_signed = excluded.tfn_declaration_signed,
        tfn_declaration_signed_at = excluded.tfn_declaration_signed_at,
        tfn_declaration_signed_ip = excluded.tfn_declaration_signed_ip,
        tfn_declaration_signed_user_agent = excluded.tfn_declaration_signed_user_agent,
        changed_surname_since_ato = excluded.changed_surname_since_ato,
        previous_family_name = excluded.previous_family_name,
        eligible_to_receive_leave_loading = excluded.eligible_to_receive_leave_loading,
        has_student_startup_loan = excluded.has_student_startup_loan,
        has_trade_support_loan_debt = excluded.has_trade_support_loan_debt,
        withholding_additional_amount_cents = excluded.withholding_additional_amount_cents,
        withholding_variation_percent = COALESCE(excluded.withholding_variation_percent, worker_tax_declarations.withholding_variation_percent)`,
    )
    .bind(
      data.worker_id,
      data.tax_residency_status,
      data.employment_basis,
      data.claim_tax_free_threshold,
      data.has_study_training_loan,
      data.has_sfss_debt,
      data.tfn_status,
      data.tfn_not_quoted_ack ?? 0,
      data.tfn_encrypted ?? null,
      data.tfn_last4 ?? null,
      data.tfn_updated_at ?? null,
      data.tfn_declaration_full_name ?? null,
      data.tfn_declaration_signed ?? 0,
      data.tfn_declaration_signed_at ?? null,
      data.tfn_declaration_signed_ip ?? null,
      data.tfn_declaration_signed_user_agent ?? null,
      data.changed_surname_since_ato ?? 0,
      data.previous_family_name ?? null,
      data.eligible_to_receive_leave_loading ?? 0,
      data.has_student_startup_loan ?? 0,
      data.has_trade_support_loan_debt ?? 0,
      data.withholding_additional_amount_cents ?? null,
      data.withholding_variation_percent ?? null,
    )
    .run();
}
