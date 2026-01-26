import { z } from "zod";
import {
  COMPANY_STRUCTURES,
  CONTACT_TITLES,
  CRANE_CAPACITIES,
  DURATION_UNITS,
  EWP_HEIGHTS,
  EXCAVATOR_SIZES,
  EXPERIENCE,
  OT_OPTIONS,
  RIG_LEVELS,
  ROLES,
  SCAFF_LEVELS,
  STATES,
  TELEHANDLER_ATTACH,
  TICKETS,
} from "./datasets";

const enumFrom = (values: readonly string[]) => z.enum(values as [string, ...string[]]);

const optionalUrl = z.preprocess(
  (val) => {
    if (typeof val !== "string") return val;
    const trimmed = val.trim();
    if (!trimmed) return undefined;
    if (!/^https?:\/\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  },
  z.string().url().optional(),
);

const telehandlerAttachmentSchema = z.preprocess(
  (val) => {
    if (typeof val === "string") {
      return val ? [val] : [];
    }
    return val;
  },
  z.array(enumFrom(TELEHANDLER_ATTACH)).optional().default([]),
);

const optionalNumber = z.preprocess(
  (val) => {
    if (val === "" || val == null) return undefined;
    return val;
  },
  z.coerce.number().nonnegative().optional(),
);

const roleGroupSchema = z.object({
  count: z.coerce.number().int().positive(),
  role: enumFrom(ROLES),
  tickets: z.array(enumFrom(TICKETS)).optional().default([]),
  experience: enumFrom(EXPERIENCE),
  startDate: z.string().min(1),
  startTime: z.string().min(1),
  hoursPerDay: z.coerce.number().positive(),
  expectedDurationValue: z.coerce.number().positive(),
  expectedDurationUnit: enumFrom(DURATION_UNITS),
  otOptions: z.array(enumFrom(OT_OPTIONS)).optional().default([]),
  baseRateOffer: optionalNumber,
  travelAllowance: optionalNumber,
  craneCapacity: enumFrom(CRANE_CAPACITIES).optional(),
  ewpHeight: enumFrom(EWP_HEIGHTS).optional(),
  telehandlerAttachment: telehandlerAttachmentSchema,
  riggingLevel: enumFrom(RIG_LEVELS).optional(),
  scaffoldingLevel: enumFrom(SCAFF_LEVELS).optional(),
  excavatorSize: enumFrom(EXCAVATOR_SIZES).optional(),
});

export const bookingSchema = z.object({
  company: z.object({
    name: z.string().min(1),
    structure: enumFrom(COMPANY_STRUCTURES),
    contactTitle: enumFrom(CONTACT_TITLES),
    acn: z
      .string()
      .transform((v) => v.replace(/\D/g, ""))
      .refine((v) => v.length === 9, "ACN must be 9 digits"),
    abn: z
      .string()
      .transform((v) => v.replace(/\D/g, ""))
      .refine((v) => v.length === 11, "ABN must be 11 digits"),
    website: optionalUrl,
    contactJobTitle: z.string().min(1, "Job title is required"),
    contactName: z.string().min(1, "Contact name is required"),
    contactEmail: z.string().email("Valid contact email required"),
    contactMobile: z.string().min(1, "Mobile is required"),
    contactLandline: z.string().optional().or(z.literal("")),
    preferredContactTime: z.string().optional().or(z.literal("")),
    contactOnBehalf: z.coerce.boolean().optional(),
  }),
  registeredAddress: z.object({
    street: z.string().min(1),
    state: enumFrom(STATES),
    postcode: z
      .string()
      .transform((v) => v.replace(/\D/g, ""))
      .refine((v) => v.length === 4, "Postcode must be 4 digits"),
  }),
  siteAddress: z.object({
    siteName: z.string().optional().or(z.literal("")).transform((v) => (v?.trim() ? v : undefined)),
    formattedAddress: z.string().min(1, "Site address required"),
    lat: z
      .union([z.string(), z.number()])
      .optional()
      .transform((v) => (v === undefined || v === "" ? null : Number(v)))
      .nullable(),
    lng: z
      .union([z.string(), z.number()])
      .optional()
      .transform((v) => (v === undefined || v === "" ? null : Number(v)))
      .nullable(),
    placeId: z.string().optional().nullable(),
    mapUrl: z.string().optional().nullable(),
  }),
  roles: z.array(roleGroupSchema).min(1, "At least one role group is required"),
  notes: z.string().optional().default(""),
  attachments: z
    .array(
      z.object({
        name: z.string(),
        type: z.string().optional(),
        size: z.number().optional(),
        content: z.string().optional(),
        description: z.string().optional(),
      }),
    )
    .optional()
    .default([]),
  attachmentsLink: optionalUrl,
  submittedAt: z.string().datetime().optional(),
});

export type BookingPayload = z.infer<typeof bookingSchema> & { bookingId?: string };

export function buildSubmittedBooking(input: unknown): BookingPayload {
  const base = typeof input === "object" && input !== null ? input : {};
  const parsed = bookingSchema.parse({
    ...base,
    submittedAt: new Date().toISOString(),
  });
  return {
    ...parsed,
    bookingId: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
  };
}
