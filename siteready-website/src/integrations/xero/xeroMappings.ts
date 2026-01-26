import { WorkerRow, WorkerTaxDeclarationRow } from "@/lib/db/types";

type TaxDeclarationInput = WorkerTaxDeclarationRow & { tfnPlain?: string | null };

const RESIDENCY_MAP: Record<string, string> = {
  AUSTRALIAN_RESIDENT: "AUSTRALIANRESIDENT",
  FOREIGN_RESIDENT: "FOREIGNRESIDENT",
  WORKING_HOLIDAY_MAKER: "WORKINGHOLIDAYMAKER",
};

const EMPLOYMENT_MAP: Record<string, string> = {
  FULL_TIME: "FULLTIME",
  PART_TIME: "PARTTIME",
  CASUAL: "CASUAL",
  LABOUR_HIRE: "LABOURHIRE",
  SUPER_INCOME_STREAM: "SUPERANNUATIONINCOMESTREAM",
};

const TFN_EXEMPTION_MAP: Record<string, string> = {
  EXEMPT_UNDER18: "UNDER18",
  EXEMPT_PENSION: "PENSIONER",
  NOT_QUOTED: "NOTQUOTED",
  APPLIED_OR_ENQUIRED: "APPLIEDORONFILE",
};

function mapTaxDeclaration(tax?: TaxDeclarationInput) {
  if (!tax) return undefined;
  const residencyStatus = RESIDENCY_MAP[tax.tax_residency_status] ?? undefined;
  const employmentBasis = EMPLOYMENT_MAP[tax.employment_basis] ?? undefined;
  const base = {
    ResidencyStatus: residencyStatus,
    AustralianResidentForTaxPurposes: tax.tax_residency_status === "AUSTRALIAN_RESIDENT",
    TaxFreeThresholdClaimed: !!tax.claim_tax_free_threshold,
    HasHELPDebt: !!tax.has_study_training_loan,
    HasSFSSDebt: !!tax.has_sfss_debt,
    HasStudentStartupLoan: !!tax.has_student_startup_loan,
    HasTradeSupportLoanDebt: !!tax.has_trade_support_loan_debt,
    EligibleToReceiveLeaveLoading: !!tax.eligible_to_receive_leave_loading,
    EmploymentBasis: employmentBasis,
  };
  const extras: Record<string, unknown> = {};
  if (typeof tax.withholding_additional_amount_cents === "number") {
    extras.UpwardVariationTaxWithholdingAmount = Math.round(tax.withholding_additional_amount_cents / 100);
  }
  if (typeof tax.withholding_variation_percent === "number") {
    extras.ApprovedWithholdingVariationPercentage = tax.withholding_variation_percent;
  }
  if (tax.tfn_status === "PROVIDED" && tax.tfnPlain) {
    extras.TaxFileNumber = tax.tfnPlain;
  } else if (tax.tfn_status !== "PROVIDED") {
    const exemption = TFN_EXEMPTION_MAP[tax.tfn_status];
    if (exemption) extras.TFNExemptionType = exemption;
  }
  return { ...base, ...extras };
}

export function mapWorkerToXeroEmployee(worker: WorkerRow, tax?: TaxDeclarationInput) {
  const taxDeclaration = mapTaxDeclaration(tax);
  if (taxDeclaration && worker.engagement_type === "EMPLOYEE_CASUAL") {
    taxDeclaration.EligibleToReceiveLeaveLoading = false;
  }
  return {
    FirstName: worker.first_name || "",
    LastName: worker.last_name || "",
    DateOfBirth: worker.dob || undefined,
    Email: worker.email || undefined,
    Mobile: worker.mobile || undefined,
    HomeAddress: {
      AddressLine1: [worker.address_number, worker.address_street].filter(Boolean).join(" "),
      City: worker.address_city || undefined,
      Region: worker.address_state || undefined,
      PostalCode: worker.address_postcode || undefined,
      Country: "Australia",
    },
    TaxDeclaration: taxDeclaration,
  };
}

export function mapTimesheetToXeroPayload(params: {
  employeeId: string;
  payrollCalendarId: string;
  periodStart: string;
  periodEnd: string;
  lines: Array<{ work_date: string; hours_decimal: number; earnings_rate_id?: string }>;
}) {
  return {
    EmployeeID: params.employeeId,
    PayrollCalendarID: params.payrollCalendarId,
    StartDate: params.periodStart,
    EndDate: params.periodEnd,
    TimesheetLines: params.lines.map((line) => ({
      EarningsRateID: line.earnings_rate_id,
      NumberOfUnits: line.hours_decimal,
      Date: line.work_date,
    })),
  };
}
