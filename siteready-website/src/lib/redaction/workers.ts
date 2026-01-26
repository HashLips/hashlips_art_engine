type WorkerSafe = {
  worker_id: string;
  company_number: string;
  role_id: string;
  years_experience: number;
  tickets: { type: string; verified: boolean; front_image_key?: string | null; back_image_key?: string | null }[];
  availability?: string;
  name?: string | null;
  mobile?: string | null;
};

/**
 * Redact worker data for client views.
 * - Pre-contract: only company_number, role_id, ticket types, years_experience, availability summary.
 * - Post-release (contract_signed && release_to_client): include name, mobile, ticket images.
 * - Staff always see full.
 */
export function redactWorker(
  worker: WorkerSafe,
  opts: { isStaff: boolean; contractSigned: boolean; releaseToClient: boolean },
) {
  if (opts.isStaff) return worker;
  const base = {
    worker_id: worker.worker_id,
    company_number: worker.company_number,
    role_id: worker.role_id,
    years_experience: worker.years_experience,
    tickets: worker.tickets.map((t) => ({ type: t.type, verified: t.verified, front_image_key: null, back_image_key: null })),
    availability: worker.availability,
    name: null as string | null,
    mobile: null as string | null,
  };
  if (opts.contractSigned && opts.releaseToClient) {
    return {
      ...base,
      name: worker.name ?? null,
      mobile: worker.mobile ?? null,
      tickets: worker.tickets, // include images post-release
    };
  }
  return base;
}
