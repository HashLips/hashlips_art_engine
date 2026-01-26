import { WorkerRow } from "@/lib/db/types";

export type XeroEmployeePayload = {
  FirstName?: string;
  LastName?: string;
  DateOfBirth?: string;
  Email?: string;
  Mobile?: string;
  HomeAddress?: {
    AddressLine1?: string;
    AddressLine2?: string;
    City?: string;
    Region?: string;
    PostalCode?: string;
    Country?: string;
  };
};

export function mapWorkerToXeroEmployee(worker: WorkerRow): XeroEmployeePayload {
  return {
    FirstName: worker.first_name ?? undefined,
    LastName: worker.last_name ?? undefined,
    DateOfBirth: worker.dob ?? undefined,
    Email: worker.email ?? undefined,
    Mobile: worker.mobile ?? undefined,
    HomeAddress: {
      AddressLine1: worker.address_line1 ?? worker.address_street ?? undefined,
      AddressLine2: worker.address_line2 ?? undefined,
      City: worker.address_suburb ?? worker.address_city ?? undefined,
      Region: worker.address_state ?? undefined,
      PostalCode: worker.address_postcode ?? undefined,
      Country: worker.address_country ?? "Australia",
    },
  };
}
