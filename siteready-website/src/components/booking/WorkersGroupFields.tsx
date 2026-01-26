import React from "react";
import { Control, FieldErrors, UseFieldArrayRemove, UseFormRegister, UseFormSetValue, useWatch } from "react-hook-form";
import MultiSelectDropdown from "./MultiSelectDropdown";
import styles from "./BookLabourNowForm.module.css";
import {
  CRANE_CAPACITIES,
  DURATION_UNITS,
  EWP_HEIGHTS,
  EXPERIENCE,
  OT_OPTIONS,
  EXCAVATOR_SIZES,
  RIG_LEVELS,
  ROLES,
  SCAFF_LEVELS,
  TELEHANDLER_ATTACH,
  TICKETS,
} from "@/lib/bookings/datasets";
import { bookingSchema } from "@/lib/bookings/schema";
import { z } from "zod";

type BookingFormValues = z.input<typeof bookingSchema>;
export type WorkersGroupFormValues = Pick<BookingFormValues, "roles">;

interface WorkersGroupFieldsProps {
  index: number;
  control: Control<BookingFormValues>;
  setValue: UseFormSetValue<BookingFormValues>;
  register: UseFormRegister<BookingFormValues>;
  remove: UseFieldArrayRemove;
  onNextRole: () => void;
  errors: FieldErrors<BookingFormValues>;
}

const WorkersGroupFields: React.FC<WorkersGroupFieldsProps> = ({
  index,
  control,
  setValue,
  register,
  remove,
  onNextRole,
  errors,
}) => {
  const tickets = useWatch({ control, name: `roles.${index}.tickets` }) || [];
  const otOptions = useWatch({ control, name: `roles.${index}.otOptions` }) || [];
  const roleValue = useWatch({ control, name: `roles.${index}.role` }) || "";
  const craneCapacity = useWatch({ control, name: `roles.${index}.craneCapacity` }) || "";
  const ewpHeight = useWatch({ control, name: `roles.${index}.ewpHeight` }) || "";
  const telehandlerAttachment = (useWatch({ control, name: `roles.${index}.telehandlerAttachment` }) as string[] | undefined) || [];
  const scaffoldingLevel = useWatch({ control, name: `roles.${index}.scaffoldingLevel` }) || "";
  const riggingLevel = useWatch({ control, name: `roles.${index}.riggingLevel` }) || "";
  const excavatorSize = useWatch({ control, name: `roles.${index}.excavatorSize` }) || "";

  const err = (field: keyof (WorkersGroupFormValues["roles"][number])) =>
    errors?.roles?.[index]?.[field]?.message as string | undefined;

  const renderErr = (field: keyof (WorkersGroupFormValues["roles"][number]), custom?: string) => {
    const msg = err(field);
    if (!msg) return null;
    return <span className={styles.error}>{custom ?? msg}</span>;
  };

  const roleLower = roleValue.toLowerCase();
  const ticketLower = tickets.join(" ").toLowerCase();

  const roleCrane = roleLower.includes("crane");
  const roleEwp = roleLower.includes("ewp");
  const roleTele = roleLower.includes("tele");
  const roleScaff = roleLower.includes("scaff");
  const roleRig = roleLower.includes("rig");
  const roleExcavator = roleLower.includes("excavator");
  const roleForklift = roleLower.includes("forklift");
  const roleSkidSteer = roleLower.includes("skid steer");

  const ticketCrane = ticketLower.includes("crane operation");
  const ticketEwp = ticketLower.includes("ewp");
  const ticketTele = ticketLower.includes("telehandler");
  const ticketScaff = ticketLower.includes("scaffolding");
  const ticketRig = ticketLower.includes("rigger");
  const ticketExcavator = ticketLower.includes("excavator");
  const ticketForklift = ticketLower.includes("forklift");
  const ticketSkidSteer = ticketLower.includes("skid steer");

  const primaryType = (() => {
    if (roleCrane || ticketCrane) return "crane";
    if (roleEwp || ticketEwp) return "ewp";
    if (roleTele || ticketTele) return "tele";
    if (roleScaff || ticketScaff) return "scaff";
    if (roleRig || ticketRig) return "rig";
    if (roleExcavator || ticketExcavator) return "excavator";
    if (roleForklift || ticketForklift) return "forklift";
    if (roleSkidSteer || ticketSkidSteer) return "skid";
    return null;
  })();

  const teleGold = TICKETS.find((t) => t.toLowerCase().includes("telehandler - gold card"));
  const teleCraneJib = TICKETS.find((t) => t.toLowerCase().includes("crane jib"));
  const teleWp = TICKETS.find((t) => t.toLowerCase().includes("work platform"));

  const teleTicketMap: Record<string, string | undefined> = {
    "Forks": teleGold,
    "Bucket": teleGold,
    "Crane Jib": teleCraneJib,
    "Work Platform": teleWp,
  };

  const craneTicketMap: Record<string, string> = {
    "Non-slewing >3t (CN)": "Crane Operation - CN (Non-slewing >3t)",
    "Vehicle Loading (CV)": "Crane Operation - CV (Vehicle Loading >=10mt)",
    "<=20t (C2)": "Crane Operation - C2 (<=20t)",
    "<=60t (C6)": "Crane Operation - C6 (<=60t)",
    "<=100t (C1)": "Crane Operation - C1 (<=100t)",
    ">100t (C0)": "Crane Operation - C0 (>100t)",
    "Tower Crane (CT)": "Crane Operation - CT (Tower Crane)",
    "Self-Erecting Tower Crane (CS)": "Crane Operation - CS (Self-Erecting Tower Crane)",
  };

  const autoTicketMap: Record<string, string[]> = {
    crane: Object.values(craneTicketMap),
    ewp: ["EWP - WP (>11m)"],
    tele: Object.values(teleTicketMap).filter(Boolean) as string[],
    scaff: ["Scaffolding - SB (Basic)", "Scaffolding - SI (Intermediate)", "Scaffolding - SA (Advanced)"],
    rig: ["Rigger - RB (Basic)", "Rigger - RI (Intermediate)", "Rigger - RA (Advanced)"],
    excavator: ["Excavator (LE)"],
    forklift: ["Forklift - LF (Forklift HRWL)"],
    skid: ["Skid Steer (LS)"],
  };
  const allAutoTickets = Object.values(autoTicketMap).flat();

  // When primary type changes, strip auto-added tickets that don't belong to the current primary.
  React.useEffect(() => {
    const current = tickets as string[];
    const filtered = current.filter((t) => {
      if (!allAutoTickets.includes(t)) return true;
      if (!primaryType) return false;
      const keepSet = autoTicketMap[primaryType] || [];
      return keepSet.includes(t);
    });
    if (filtered.length !== current.length) {
      setValue(`roles.${index}.tickets`, Array.from(new Set(filtered)) as string[], { shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [primaryType]);

  React.useEffect(() => {
    if (primaryType !== "crane") setValue(`roles.${index}.craneCapacity`, undefined);
    if (primaryType !== "ewp") setValue(`roles.${index}.ewpHeight`, undefined);
    if (primaryType !== "tele") setValue(`roles.${index}.telehandlerAttachment`, []);
    if (primaryType !== "scaff") setValue(`roles.${index}.scaffoldingLevel`, undefined);
    if (primaryType !== "rig") setValue(`roles.${index}.riggingLevel`, undefined);
    if (primaryType !== "excavator") setValue(`roles.${index}.excavatorSize`, undefined);
  }, [primaryType, index, setValue]);

  // Auto-apply relevant ticket when a capacity/level is chosen.
  React.useEffect(() => {
    const current = tickets as string[];
    const ensureTicket = (ticket: string | undefined) => {
      if (!ticket) return;
      if (!current.includes(ticket)) {
        const next = [...current, ticket];
        setValue(`roles.${index}.tickets`, next as string[], { shouldValidate: true });
      }
    };

    if (craneCapacity) {
      const craneTicket = craneTicketMap[craneCapacity];
      ensureTicket(craneTicket);
    }
    if (ewpHeight) {
      ensureTicket("EWP - WP (>11m)");
    }
    if (telehandlerAttachment.length) {
      const nextTickets = telehandlerAttachment
        .map((t) => teleTicketMap[t])
        .filter(Boolean) as string[];
      nextTickets.forEach((t) => ensureTicket(t));
    }
    if (scaffoldingLevel) {
      const scaffTicket =
        scaffoldingLevel.includes("SB") ? "Scaffolding - SB (Basic)" :
        scaffoldingLevel.includes("SI") ? "Scaffolding - SI (Intermediate)" :
        scaffoldingLevel.includes("SA") ? "Scaffolding - SA (Advanced)" : undefined;
      ensureTicket(scaffTicket);
    }
    if (riggingLevel) {
      const rigTicket =
        riggingLevel.includes("RB") ? "Rigger - RB (Basic)" :
        riggingLevel.includes("RI") ? "Rigger - RI (Intermediate)" :
        riggingLevel.includes("RA") ? "Rigger - RA (Advanced)" : undefined;
      ensureTicket(rigTicket);
    }
    if (excavatorSize) {
      const exTicket = TICKETS.find((t) => t.toLowerCase().includes("excavator"));
      ensureTicket(exTicket);
    }
    if (roleForklift) {
      ensureTicket("Forklift - LF (Forklift HRWL)");
    }
    if (roleSkidSteer) {
      ensureTicket("Skid Steer (LS)");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [craneCapacity, ewpHeight, telehandlerAttachment, scaffoldingLevel, riggingLevel, excavatorSize, roleForklift, roleSkidSteer, index]);

  return (
    <div className={styles.group}>
      <div className={styles.groupHead}>
        <h3>Role group {index + 1}</h3>
        <button type="button" className="secondary" onClick={() => remove(index)}>
          Remove
        </button>
      </div>

      <div className={styles.gridThree}>
        <div className={styles.field}>
          <label className={styles.label}>Number of workers</label>
          <input
            type="number"
            min={1}
            className={styles.input}
            {...register(`roles.${index}.count`, { valueAsNumber: true })}
          />
          {renderErr("count")}
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Role needed</label>
          <select className={styles.select} {...register(`roles.${index}.role`)}>
            <option value="">Select...</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          {renderErr("role", "Please answer or choose")}
        </div>
      </div>

      {primaryType && (
        <div className={styles.gridThree}>
          {primaryType === "crane" && (
            <div className={styles.field}>
              <label className={styles.label}>Crane capacity / type</label>
              <select className={styles.select} {...register(`roles.${index}.craneCapacity`)}>
                <option value="">Select...</option>
                {CRANE_CAPACITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}
          {primaryType === "ewp" && (
            <div className={styles.field}>
              <label className={styles.label}>EWP height</label>
              <select className={styles.select} {...register(`roles.${index}.ewpHeight`)}>
                <option value="">Select...</option>
                {EWP_HEIGHTS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
          )}
          {primaryType === "tele" && (
            <div className={styles.field}>
              <label className={styles.label}>Telehandler attachment</label>
              <MultiSelectDropdown
                className={styles.ticketsField}
                label=""
                options={TELEHANDLER_ATTACH.slice()}
                selected={telehandlerAttachment as string[]}
                onChange={(vals) => {
                  const unique = Array.from(new Set(vals));
                  setValue(`roles.${index}.telehandlerAttachment`, unique as string[]);
                }}
              />
            </div>
          )}
          {primaryType === "scaff" && (
            <div className={styles.field}>
              <label className={styles.label}>Scaffolding level</label>
              <select className={styles.select} {...register(`roles.${index}.scaffoldingLevel`)}>
                <option value="">Select...</option>
                {SCAFF_LEVELS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}
          {primaryType === "rig" && (
            <div className={styles.field}>
              <label className={styles.label}>Rigging level</label>
              <select className={styles.select} {...register(`roles.${index}.riggingLevel`)}>
                <option value="">Select...</option>
                {RIG_LEVELS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          )}
          {primaryType === "excavator" && (
            <div className={styles.field}>
              <label className={styles.label}>Excavator size (max)</label>
              <select className={styles.select} {...register(`roles.${index}.excavatorSize`)}>
                <option value="">Select...</option>
                {EXCAVATOR_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <span className={styles.hint}>Please confirm maximum size of excavators.</span>
            </div>
          )}
        </div>
      )}

      <div className={styles.gridThree}>
        <div className={styles.field}>
          <label className={styles.label}>Tickets (optional) (Open and close drop down press SELECT)</label>
          <MultiSelectDropdown
            className={styles.ticketsField}
            label=""
            options={TICKETS.slice()}
            selected={tickets}
            onChange={(vals) => {
              const unique = Array.from(new Set(vals));
              setValue(`roles.${index}.tickets`, unique as string[]);
            }}
          />
        </div>
      </div>

      <div className={styles.gridThree}>
        <div className={styles.field}>
          <label className={styles.label}>Minimum years&apos; experience</label>
          <select className={styles.select} {...register(`roles.${index}.experience`)}>
            <option value="">Select...</option>
            {EXPERIENCE.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
          {renderErr("experience", "Please answer or choose")}
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Expected start date</label>
          <input type="date" className={styles.input} {...register(`roles.${index}.startDate`)} />
          {renderErr("startDate", "Please answer or choose")}
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Daily start time</label>
          <input type="time" className={styles.input} {...register(`roles.${index}.startTime`)} />
          {renderErr("startTime", "Please answer or choose")}
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Estimated hours per day</label>
          <input type="number" step="0.1" min="0" className={styles.input} {...register(`roles.${index}.hoursPerDay`, { valueAsNumber: true })} />
          {err("hoursPerDay") && <span className={styles.error}>{err("hoursPerDay")}</span>}
        </div>
      </div>

      <div className={styles.gridThree}>
        <div className={styles.field}>
          <label className={styles.label}>Expected duration (value)</label>
          <input type="number" min="1" className={styles.input} {...register(`roles.${index}.expectedDurationValue`, { valueAsNumber: true })} />
          {err("expectedDurationValue") && <span className={styles.error}>{err("expectedDurationValue")}</span>}
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Expected duration (unit)</label>
          <select className={styles.select} {...register(`roles.${index}.expectedDurationUnit`)}>
            <option value="">Select...</option>
            {DURATION_UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          {renderErr("expectedDurationUnit", "Please answer or choose")}
        </div>
        <div className={`${styles.field} ${styles.inlineCheckbox}`}>
          <label className={styles.label}>
            <input type="checkbox" onChange={() => onNextRole()} />{" "}
            <span className={styles.nextRole}>Next role needed (auto add)</span>
          </label>
        </div>
      </div>

      <div className={styles.gridTwo}>
        <MultiSelectDropdown
          label="OT / weekend expected? (optional)"
          options={OT_OPTIONS.slice()}
          selected={otOptions}
          onChange={(vals) => {
            const unique = Array.from(new Set(vals));
            setValue(`roles.${index}.otOptions`, unique as string[]);
          }}
          error={err("otOptions")}
        />
      </div>
      <div className={styles.gridTwo}>
        <div className={styles.field}>
          <label className={styles.label}>Expected base pay rate offer (AUD hourly rate, excl. GST)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className={styles.input}
            {...register(`roles.${index}.baseRateOffer`, { valueAsNumber: true })}
          />
          <span className={styles.hint}>(We will see if we can offer this rate or not and will make an offer.)</span>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Travel allowance (NSW rate)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className={styles.input}
            {...register(`roles.${index}.travelAllowance`, { valueAsNumber: true })}
          />
          <span className={styles.hint}>(We will see if we can offer this rate or not and will make an offer.)</span>
        </div>
      </div>
    </div>
  );
};

export default WorkersGroupFields;
