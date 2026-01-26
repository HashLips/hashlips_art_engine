"use client";

import React, { useMemo, useState } from "react";
import { Resolver, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import styles from "./BookLabourNowForm.module.css";
import MapPicker from "./MapPicker";
import WorkersGroupFields from "./WorkersGroupFields";
import { bookingSchema } from "@/lib/bookings/schema";
import { COMPANY_STRUCTURES, CONTACT_TITLES, STATES } from "@/lib/bookings/datasets";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import { z } from "zod";

type FormValues = z.input<typeof bookingSchema>;

const defaultValues: FormValues = {
  company: {
    name: "",
    structure: "",
    contactTitle: "",
    acn: "",
    abn: "",
    website: "",
    contactJobTitle: "",
    contactName: "",
    contactEmail: "",
    contactMobile: "",
    contactLandline: "",
    preferredContactTime: "",
    contactOnBehalf: false,
  },
  registeredAddress: {
    street: "",
    state: "",
    postcode: "",
  },
  siteAddress: {
    siteName: "",
    formattedAddress: "",
    lat: null,
    lng: null,
    placeId: null,
    mapUrl: "",
  },
  roles: [
    {
      count: 1,
      role: "",
      tickets: [],
      experience: "",
      startDate: "",
      startTime: "",
      hoursPerDay: 8,
      expectedDurationValue: 1,
      expectedDurationUnit: "",
      otOptions: [],
      baseRateOffer: undefined,
      travelAllowance: undefined,
      craneCapacity: "",
      ewpHeight: "",
      telehandlerAttachment: [],
      riggingLevel: "",
      scaffoldingLevel: "",
      excavatorSize: "",
    },
  ],
  notes: "",
  attachmentsLink: "",
};

type Status = "idle" | "submitting" | "success" | "error";

type BookLabourNowFormProps = {
  initialValues?: Partial<FormValues>;
  submitEndpoint?: string;
  hideCompanyFields?: boolean;
  hideRegisteredAddress?: boolean;
  profileOverrides?: Pick<FormValues, "company" | "registeredAddress">;
  onSuccessRedirect?: string;
};

const BookLabourNowForm: React.FC<BookLabourNowFormProps> = ({
  initialValues,
  submitEndpoint = "/api/bookings",
  hideCompanyFields = false,
  hideRegisteredAddress = false,
  profileOverrides,
  onSuccessRedirect,
}) => {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");
  const [attachments, setAttachments] = useState<
    { name: string; type: string; size: number; content: string; description?: string }[]
  >([]);
  const [attachmentRows, setAttachmentRows] = useState<
    { name?: string; type?: string; size?: number; content?: string; description: string }[]
  >([{ description: "" }]);
  const mergedDefaults = useMemo(() => {
    return {
      ...defaultValues,
      ...initialValues,
      company: {
        ...defaultValues.company,
        ...(initialValues?.company ?? {}),
      },
      registeredAddress: {
        ...defaultValues.registeredAddress,
        ...(initialValues?.registeredAddress ?? {}),
      },
      siteAddress: {
        ...defaultValues.siteAddress,
        ...(initialValues?.siteAddress ?? {}),
      },
    };
  }, [initialValues]);

  const form = useForm<FormValues>({
    resolver: zodResolver(bookingSchema) as unknown as Resolver<FormValues>,
    defaultValues: mergedDefaults,
    mode: "onBlur",
  });

  const { register, control, handleSubmit, setValue, watch, reset, formState } = form;
  const { errors, submitCount } = formState;

  const { fields, append, remove } = useFieldArray({ control, name: "roles" });

  React.useEffect(() => {
    reset(mergedDefaults);
  }, [mergedDefaults, reset]);

  const acn = watch("company.acn");
  const abn = watch("company.abn");
  const siteAddress = watch("siteAddress");

  const siteAddressValue = useMemo(
    () => ({
      formattedAddress: siteAddress?.formattedAddress || "",
      lat: siteAddress?.lat != null ? Number(siteAddress.lat) : null,
      lng: siteAddress?.lng != null ? Number(siteAddress.lng) : null,
      placeId: siteAddress?.placeId ?? null,
      mapUrl: siteAddress?.mapUrl ?? "",
    }),
    [siteAddress],
  );

  const onSubmit = async (values: FormValues) => {
    setStatus("submitting");
    setMessage("");
    try {
      const nextAttachments = attachmentRows
        .filter((row) => row.content)
        .map((row) => ({
          name: row.name || "Attachment",
          type: row.type || "",
          size: row.size || 0,
          content: row.content || "",
          description: row.description || "",
        }));
      const finalValues = {
        ...values,
        company: profileOverrides?.company ?? values.company,
        registeredAddress: profileOverrides?.registeredAddress ?? values.registeredAddress,
        attachments: nextAttachments,
      };
      const response = await fetch(submitEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalValues),
      });
      const json = await response.json().catch(() => ({}));
      if (response.ok && json.ok) {
          setStatus("success");
          const rid = json.request_id || json.bookingId || "";
          setMessage(
            rid
              ? `Thanks - request received. Request ID: ${rid}`
              : "Thanks - we've received your request and will confirm within business hours.",
          );
          reset(mergedDefaults);
          setAttachments([]);
          setAttachmentRows([{ description: "" }]);
          if (onSuccessRedirect) {
            setTimeout(() => {
              if (typeof window !== "undefined") {
                window.location.assign(onSuccessRedirect);
              }
            }, 1500);
          }
        } else {
        const details = Array.isArray(json.error)
          ? json.error.map((e: { message?: string }) => e.message).filter(Boolean).join("; ")
          : json.error;
        setStatus("error");
        setMessage(details || json.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  const abnMatchesAcn = useMemo(() => {
    return acn && abn && acn.length === 9 && abn.length === 11 && abn.endsWith(acn);
  }, [abn, acn]);

  const collectErrorMessages = (input: unknown, acc: string[]) => {
    if (!input) return acc;
    if (typeof input === "object") {
      if ("message" in (input as { message?: unknown }) && typeof (input as { message?: unknown }).message === "string") {
        acc.push((input as { message: string }).message);
      }
      for (const value of Object.values(input as Record<string, unknown>)) {
        collectErrorMessages(value, acc);
      }
    }
    return acc;
  };

  const errorSummary =
    submitCount > 0 && Object.keys(errors).length > 0
      ? Array.from(new Set(collectErrorMessages(errors, []).filter(Boolean)))
      : [];

  const readFileAsBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === "string" ? reader.result : "";
        const base64 = result.includes(",") ? result.split(",")[1] : result;
        resolve(base64 || "");
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const buildAttachments = (
    rows: { name?: string; type?: string; size?: number; content?: string; description: string }[],
  ) =>
    rows
      .filter((row) => row.content)
      .map((row) => ({
        name: row.name || "Attachment",
        type: row.type || "",
        size: row.size || 0,
        content: row.content || "",
        description: row.description || "",
      }));

  const handleAttachmentFileChange = async (index: number, files: FileList | null) => {
    if (!files || !files[0]) return;
    const file = files[0];
    const maxTotal = 10 * 1024 * 1024; // 10MB
    const nextRows = attachmentRows.map((row, idx) => (idx === index ? { ...row } : row));
    nextRows[index] = {
      ...nextRows[index],
      name: file.name,
      type: file.type,
      size: file.size,
    };
    const total = nextRows.reduce((sum, row) => sum + (row.size || 0), 0);
    if (total > maxTotal) {
      setMessage("Attachments exceed 10MB total. Please reduce file sizes.");
      setStatus("error");
      return;
    }
    const base64 = await readFileAsBase64(file);
    nextRows[index].content = base64;
    setAttachmentRows(nextRows);
    setStatus("idle");
    setMessage("");
    setAttachments(buildAttachments(nextRows));
  };

  const fieldClass = (base: string, hasError: boolean) =>
    `${base} ${hasError ? styles.errorHighlight : ""}`;
  const renderChooseError = (hasError: boolean) =>
    hasError ? <span className={styles.error}>Please answer or choose</span> : null;
  const renderFillError = (hasError: boolean) =>
    hasError ? <span className={styles.error}>Please answer or choose</span> : null;
  const renderMsg = (hasError: boolean, msg: string) =>
    hasError ? <span className={styles.error}>{msg}</span> : null;

  const onInvalid = (formErrors: typeof errors) => {
    const messages = collectErrorMessages(formErrors, []);
    setStatus("error");
    setMessage(messages[0] || "Please fix the highlighted fields and try again.");
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
      <div className={styles.formHeader}>
        <h2>Book labour now</h2>
        <p>Send your request and we will confirm within business hours.</p>
      </div>

      {errorSummary.length > 0 && (
        <div className={styles.errorSummary} role="alert" aria-live="assertive">
          <strong>Please fix the highlighted fields.</strong>
          <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
            {errorSummary.slice(0, 4).map((err, idx) => (
              <li key={idx}>{(err as { message?: string })?.message || "Check required fields"}</li>
            ))}
          </ul>
        </div>
      )}

      {!hideCompanyFields && (
        <div className={styles.gridTwo}>
          <div className={styles.field}>
            <label className={styles.label}>Company name *</label>
            <input className={fieldClass(styles.input, !!errors.company?.name)} {...register("company.name")} />
            {renderFillError(!!errors.company?.name)}
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Company structure *</label>
            <select className={fieldClass(styles.select, !!errors.company?.structure)} {...register("company.structure")}>
              <option value="">Select...</option>
              {COMPANY_STRUCTURES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {renderChooseError(!!errors.company?.structure)}
          </div>
        </div>
      )}

      {!hideCompanyFields && (
        <div className={styles.section}>
          <h3>Contact (acting for / on behalf of the company)</h3>
          <div className={styles.gridFour}>
            <div className={styles.field}>
              <label className={styles.label}>Title *</label>
              <select
                className={fieldClass(styles.select, !!errors.company?.contactTitle)}
                {...register("company.contactTitle")}
              >
                <option value="">Select...</option>
                {CONTACT_TITLES.map((t) => (
                  <option key={t} value={t}>
                  {t}
                </option>
                ))}
              </select>
              {renderChooseError(!!errors.company?.contactTitle)}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Contact name *</label>
              <input
                className={fieldClass(styles.input, !!errors.company?.contactName)}
                {...register("company.contactName")}
              />
              {renderFillError(!!errors.company?.contactName)}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Job title *</label>
              <input
                className={fieldClass(styles.input, !!errors.company?.contactJobTitle)}
                {...register("company.contactJobTitle")}
              />
              {renderFillError(!!errors.company?.contactJobTitle)}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Mobile *</label>
              <input
                className={fieldClass(styles.input, !!errors.company?.contactMobile)}
                {...register("company.contactMobile")}
              />
              {renderFillError(!!errors.company?.contactMobile)}
            </div>
          </div>
          <div className={styles.gridThree}>
            <div className={styles.field}>
              <label className={styles.label}>Contact email *</label>
              <input
                className={fieldClass(styles.input, !!errors.company?.contactEmail)}
                type="email"
                {...register("company.contactEmail")}
              />
              {renderFillError(!!errors.company?.contactEmail)}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Landline (optional)</label>
              <input className={styles.input} {...register("company.contactLandline")} />
            </div>
            <div className={styles.field}>
              <label className={`${styles.label} ${styles.inline} ${styles.onBehalf}`}>
                <input type="checkbox" {...register("company.contactOnBehalf")} /> Contact is acting for / on behalf of the
                company listed above
              </label>
              {errors.company?.contactOnBehalf && (
                <span className={styles.error}>{errors.company.contactOnBehalf.message as string}</span>
              )}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Preferred contact time (optional)</label>
              <input className={styles.input} placeholder="e.g. Weekdays 8:00-10:00" {...register("company.preferredContactTime")} />
            </div>
          </div>
        </div>
      )}

      {!hideCompanyFields && (
        <div className={styles.gridThree}>
        <div className={styles.field}>
          <label className={styles.label}>ACN (9 digits) *</label>
          <input
            className={fieldClass(styles.input, !!errors.company?.acn)}
            inputMode="numeric"
            maxLength={9}
            {...register("company.acn", { setValueAs: (v) => (v ?? "").replace(/\D/g, "") })}
          />
          {renderMsg(!!errors.company?.acn, "9 digits")}
        </div>
        <div className={styles.field}>
          <label className={styles.label}>ABN (11 digits) *</label>
          <input
            className={styles.input}
            inputMode="numeric"
            maxLength={11}
            {...register("company.abn", { setValueAs: (v) => (v ?? "").replace(/\D/g, "") })}
          />
          {abnMatchesAcn && <span className={styles.hint}>ABN ends with ACN ✔</span>}
          {errors.company?.abn && <span className={styles.error}>{errors.company.abn.message as string}</span>}
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Website (optional)</label>
          <input className={styles.input} type="url" placeholder="https://example.com" {...register("company.website")} />
          {errors.company?.website && (
            <span className={styles.error}>{errors.company.website.message as string}</span>
          )}
        </div>
        </div>
      )}

      {!hideRegisteredAddress && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitleStrong}>Registered address (company registered address)</h3>
          <div className={styles.gridThree}>
            <div className={styles.field}>
              <label className={styles.label}>Street incl. property number *</label>
              <input className={fieldClass(styles.input, !!errors.registeredAddress?.street)} {...register("registeredAddress.street")} />
              {renderMsg(!!errors.registeredAddress?.street, "Must contain at least 1 character(s)")}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>State / Territory *</label>
              <select className={fieldClass(styles.select, !!errors.registeredAddress?.state)} {...register("registeredAddress.state")}>
                <option value="">Select...</option>
                {STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {renderChooseError(!!errors.registeredAddress?.state)}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Postcode (4 digits) *</label>
              <input
                className={styles.input}
                inputMode="numeric"
                maxLength={4}
                {...register("registeredAddress.postcode", { setValueAs: (v) => (v ?? "").replace(/\D/g, "") })}
              />
              {errors.registeredAddress?.postcode && (
                <span className={styles.error}>{errors.registeredAddress.postcode.message as string}</span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className={styles.section}>
        <h3>Site address (location of site that workers need to go to)</h3>
        <div className={styles.field}>
          <label className={styles.label}>Site name (if you have one / add site name for your reference)</label>
          <input
            className={styles.input}
            placeholder="e.g. Western Sydney Logistics Hub"
            {...register("siteAddress.siteName")}
          />
        </div>
        <MapPicker
          value={siteAddressValue}
          onChange={(val) => {
            setValue("siteAddress", val, { shouldValidate: true });
          }}
          error={errors.siteAddress?.formattedAddress?.message as string}
        />
      </div>

      <div className={styles.section}>
        <h3>Attachments (optional)</h3>
        <p className={`${styles.hint} ${styles.hintStrong}`}>
          Upload scope, induction, or other supporting documents (PDFs preferred, max ~10MB total).
        </p>
        {attachmentRows.map((row, idx) => (
          <div key={`attachment-${idx}`} className={styles.gridTwo} style={{ marginBottom: "0.5rem" }}>
            <div className={styles.field}>
              <label className={styles.label}>Attachment description</label>
              <input
                className={styles.input}
                placeholder="Attachment description write here"
                value={row.description}
                onChange={(e) => {
                  const next = attachmentRows.map((r, i) => (i === idx ? { ...r, description: e.target.value } : r));
                  setAttachmentRows(next);
                  setAttachments(buildAttachments(next));
                }}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Upload file</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
                onChange={(e) => handleAttachmentFileChange(idx, e.target.files)}
                className={styles.input}
              />
            </div>
          </div>
        ))}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.pillButton}
            onClick={() => setAttachmentRows((prev) => [...prev, { description: "" }])}
          >
            Add another attachment
          </button>
        </div>
        <p className={styles.hint}>If files are larger than 10MB, paste a link to them below.</p>
        <input
          className={styles.input}
          type="url"
          placeholder="Link to larger documents (SharePoint, Google Drive, etc.)"
          {...register("attachmentsLink")}
        />
        {attachments.length > 0 && (
          <ul className={styles.attachList}>
            {attachments.map((f) => (
              <li key={f.name}>
                {f.name} ({Math.round(f.size / 1024)} KB)
                {f.description ? ` - ${f.description}` : ""}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={`${styles.section} ${styles.highlightSection}`}>
        <div className={styles.groupHead}>
          <h3 className={styles.workersTitle}>Workers needed</h3>
          <div className={styles.actions}>
            <button type="button" className={`${styles.pillButton}`} onClick={() => append(defaultValues.roles[0])}>
              Add role group
            </button>
          </div>
        </div>
        <p className={`${styles.hint} ${styles.emphasis}`}>
          (If need different types of workers please click Next role needed or Add role group button to add more)
        </p>
        {fields.map((field, index) => (
          <WorkersGroupFields
            key={field.id}
            index={index}
            control={control}
            setValue={setValue}
            register={register}
            remove={remove}
            onNextRole={() => append(defaultValues.roles[0])}
            errors={errors}
          />
        ))}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Notes (optional)</label>
        <textarea className={styles.textarea} rows={3} {...register("notes")} />
      </div>

      <div className={styles.actions}>
        <PrimaryButton type="submit">
          {status === "submitting" ? "Submitting..." : "Submit booking"}
        </PrimaryButton>
        <SecondaryButton href="/contact">Talk to us</SecondaryButton>
        {status === "success" && <span className="text-green-700 font-semibold">{message}</span>}
        {status === "error" && <span className="text-red-600 font-semibold">{message || "Submission failed."}</span>}
      </div>
    </form>
  );
};

export default BookLabourNowForm;
