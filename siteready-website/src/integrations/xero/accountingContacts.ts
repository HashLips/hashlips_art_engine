import { ContractorCompanyRow } from "@/lib/db/types";
import { decryptString } from "@/lib/crypto";
import { getXeroContactMap, upsertXeroContactMap } from "@/lib/db/xeroAccounting";
import { xeroAccountingFetch } from "./accountingApi";

type XeroContact = {
  ContactID?: string;
  Name?: string;
};

type ContactResponse = {
  Contacts?: XeroContact[];
};

function addressFromJson(json: string) {
  try {
    const parsed = JSON.parse(json) as Record<string, string>;
    const line1 =
      parsed.company_address ||
      [parsed.company_address_number, parsed.company_address_street].filter(Boolean).join(" ").trim();
    return {
      AddressType: "STREET",
      AddressLine1: line1 || undefined,
      AddressLine2: parsed.company_address_building || undefined,
      PostalCode: parsed.company_address_postcode || undefined,
    };
  } catch {
    return { AddressType: "STREET" };
  }
}

export async function upsertContractorContact({
  db,
  tenantId,
  accessToken,
  contractor,
}: {
  db: Parameters<typeof getXeroContactMap>[0];
  tenantId: string;
  accessToken: string;
  contractor: ContractorCompanyRow;
}) {
  const existing = await getXeroContactMap(db, "CONTRACTOR_COMPANY", contractor.worker_id).catch(() => null);
  const decryptedAccount = await decryptString(contractor.bank_account_number_encrypted);
  if (!decryptedAccount) {
    throw new Error("Missing contractor bank account for Xero contact.");
  }

  const baseContactNumber = `SRW-CONTRACTOR-${contractor.worker_id}`;
  const abnSuffix = contractor.abn ? `-${contractor.abn}` : "";
  const abnChanged = !!(existing?.abn && contractor.abn && existing.abn !== contractor.abn);
  const contactNumber = abnChanged ? `${baseContactNumber}${abnSuffix}` : baseContactNumber;

  const contactPayload = {
    Contacts: [
      {
        Name: contractor.company_name,
        TaxNumber: contractor.abn,
        BankAccountDetails: `${contractor.bank_bsb} ${decryptedAccount}`,
        ContactNumber: contactNumber,
        IsSupplier: true,
        Addresses: [addressFromJson(contractor.address_json)],
      },
    ],
  };

  let contactId = existing?.xero_contact_id;
  if (abnChanged) {
    contactId = undefined;
  }
  if (!contactId || abnChanged) {
    const lookupByContactNumber = async (value: string) => {
      const query = encodeURIComponent(`ContactNumber=="${value}"`);
      const lookup = await xeroAccountingFetch<ContactResponse>(
        "GET",
        `/api.xro/2.0/Contacts?where=${query}`,
        { tenantId, accessToken },
      );
      return lookup.Contacts?.find((c) => c.ContactID)?.ContactID;
    };
    try {
      contactId = await lookupByContactNumber(contactNumber);
    } catch {
      contactId = contactId ?? undefined;
    }
    if (!contactId && contractor.abn) {
      try {
        const query = encodeURIComponent(`TaxNumber=="${contractor.abn}"`);
        const lookup = await xeroAccountingFetch<ContactResponse>(
          "GET",
          `/api.xro/2.0/Contacts?where=${query}`,
          { tenantId, accessToken },
        );
        contactId = lookup.Contacts?.find((c) => c.ContactID)?.ContactID;
      } catch {
        contactId = contactId ?? undefined;
      }
    }
  }

  const idempotencyKey = `contact:${tenantId}:contractor:${contractor.worker_id}${abnChanged ? abnSuffix : ""}`;
  const requestPayload = contactId
    ? { ...contactPayload, Contacts: [{ ...contactPayload.Contacts[0], ContactID: contactId }] }
    : contactPayload;
  const created = await xeroAccountingFetch<ContactResponse>(
    "POST",
    "/api.xro/2.0/Contacts",
    { tenantId, accessToken, idempotencyKey },
    requestPayload,
  );
  contactId = created.Contacts?.[0]?.ContactID ?? contactId;

  if (!contactId) {
    throw new Error("Unable to create contractor contact in Xero.");
  }

  await upsertXeroContactMap(db, {
    id: existing?.id || crypto.randomUUID(),
    entity_type: "CONTRACTOR_COMPANY",
    local_entity_id: contractor.worker_id,
    xero_contact_id: contactId,
    abn: contractor.abn,
    last_synced_at: new Date().toISOString(),
    sync_status: "synced",
    sync_error: null,
  });

  return contactId;
}
