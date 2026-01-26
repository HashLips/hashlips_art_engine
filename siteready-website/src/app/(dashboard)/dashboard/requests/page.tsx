"use client";

import React from "react";
import styles from "@/components/booking/BookLabourNowForm.module.css";
import SecondaryButton from "@/components/SecondaryButton";
import BookLabourNowForm from "@/components/booking/BookLabourNowForm";
import { COMPANY_STRUCTURES, CONTACT_TITLES, STATES } from "@/lib/bookings/datasets";

type ClientProfile = {
  org_name: string | null;
  structure: string | null;
  acn: string | null;
  abn: string | null;
  tfn: string | null;
  website: string | null;
  contact_title: string | null;
  contact_name: string | null;
  contact_job_title: string | null;
  contact_mobile: string | null;
  contact_landline: string | null;
  preferred_contact_time: string | null;
  contact_email: string | null;
  reg_street: string | null;
  reg_state: string | null;
  reg_postcode: string | null;
  profile_file_name: string | null;
  profile_file_type: string | null;
  profile_file_content: string | null;
};

const emptyProfile: ClientProfile = {
  org_name: "",
  structure: "",
  acn: "",
  abn: "",
  tfn: "",
  website: "",
  contact_title: "",
  contact_name: "",
  contact_job_title: "",
  contact_mobile: "",
  contact_landline: "",
  preferred_contact_time: "",
  contact_email: "",
  reg_street: "",
  reg_state: "",
  reg_postcode: "",
  profile_file_name: "",
  profile_file_type: "",
  profile_file_content: "",
};

export default function RequestsListPage() {
  const [profile, setProfile] = React.useState<ClientProfile>(emptyProfile);
  const [profileStatus, setProfileStatus] = React.useState<"idle" | "saving" | "saved" | "error">("idle");
  const [profileMessage, setProfileMessage] = React.useState("");
  const [profileErrors, setProfileErrors] = React.useState<Partial<Record<keyof ClientProfile, string>>>({});
  const [profileUploadMessage, setProfileUploadMessage] = React.useState("");
  const [mapsKey, setMapsKey] = React.useState<string>("");
  const regStreetRef = React.useRef<HTMLInputElement | null>(null);
  const regStreetAutocomplete = React.useRef<google.maps.places.Autocomplete | null>(null);

  const contactTitles = React.useMemo(
    () => (CONTACT_TITLES.includes("Mx") ? CONTACT_TITLES : [...CONTACT_TITLES, "Mx"]),
    [],
  );

  React.useEffect(() => {
    fetch("/api/clients/me")
      .then(async (r) => {
        if (!r.ok) throw new Error("failed");
        const json = await r.json();
        setProfile((prev) => ({ ...prev, ...(json.profile || {}) }));
      })
      .catch(() => {
        setProfileMessage("Unable to load company profile.");
        setProfileStatus("error");
      });
  }, []);

  React.useEffect(() => {
    let active = true;
    fetch("/api/public-config")
      .then((res) => res.json())
      .then((json) => {
        if (!active) return;
        setMapsKey(json?.mapsKey || "");
      })
      .catch(() => {
        if (!active) return;
        setMapsKey("");
      });
    return () => {
      active = false;
    };
  }, []);

  const abnMismatch =
    (profile.acn || "").length === 9 &&
    (profile.abn || "").length === 11 &&
    !(profile.abn || "").endsWith(profile.acn || "");

  const profileComplete =
    !!profile.org_name &&
    !!profile.structure &&
    /^\d{9}$/.test(profile.acn || "") &&
    /^\d{11}$/.test(profile.abn || "") &&
    !abnMismatch &&
    !!profile.contact_title &&
    !!profile.contact_name &&
    !!profile.contact_job_title &&
    !!profile.contact_mobile &&
    !!profile.contact_email &&
    !!profile.reg_street &&
    !!profile.reg_state &&
    /^\d{4}$/.test(profile.reg_postcode || "");

  const handleProfileChange = React.useCallback((field: keyof ClientProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setProfileErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleProfileFileChange = async (files: FileList | null) => {
    if (!files || !files[0]) return;
    const file = files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setProfileUploadMessage("Profile file exceeds 5MB. Please upload a smaller file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      handleProfileChange("profile_file_name", file.name);
      handleProfileChange("profile_file_type", file.type);
      handleProfileChange("profile_file_content", base64 || "");
      setProfileUploadMessage(`Uploaded: ${file.name}`);
    };
    reader.onerror = () => {
      setProfileUploadMessage("Unable to read file.");
    };
    reader.readAsDataURL(file);
  };

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (regStreetAutocomplete.current || !regStreetRef.current) return;
    if (!mapsKey) return;

    const initAutocomplete = () => {
      if (!regStreetRef.current || !window.google?.maps?.places) return;
      regStreetAutocomplete.current = new google.maps.places.Autocomplete(regStreetRef.current, {
        componentRestrictions: { country: "au" },
        types: ["address"],
      });
      regStreetAutocomplete.current.addListener("place_changed", () => {
        const place = regStreetAutocomplete.current?.getPlace();
        const formatted = place?.formatted_address || regStreetRef.current?.value || "";
        if (formatted) {
          handleProfileChange("reg_street", formatted);
        }
      });
    };

    const existingPromise = (window as typeof window & { __mapScriptPromise?: Promise<void> }).__mapScriptPromise;
    if (window.google?.maps?.places) {
      initAutocomplete();
      return;
    }
    if (existingPromise) {
      existingPromise.then(initAutocomplete);
      return;
    }
    (window as typeof window & { __mapScriptPromise?: Promise<void> }).__mapScriptPromise = new Promise<void>(
      (resolve) => {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${mapsKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => resolve();
        document.head.appendChild(script);
      },
    ).then(() => initAutocomplete());
  }, [handleProfileChange, mapsKey]);

  const fieldClass = (base: string, hasError: boolean) =>
    `${base} ${hasError ? styles.errorHighlight : ""}`;

  const validateProfile = (data: ClientProfile) => {
    const nextErrors: Partial<Record<keyof ClientProfile, string>> = {};
    if (!data.org_name) nextErrors.org_name = "Company name required";
    if (!data.structure) nextErrors.structure = "Structure required";
    if (!/^\d{9}$/.test(data.acn || "")) nextErrors.acn = "ACN must be 9 digits";
    if (!/^\d{11}$/.test(data.abn || "")) nextErrors.abn = "ABN must be 11 digits";
    if (!data.contact_title) nextErrors.contact_title = "Title required";
    if (!data.contact_name) nextErrors.contact_name = "Contact name required";
    if (!data.contact_job_title) nextErrors.contact_job_title = "Job title required";
    if (!data.contact_mobile) nextErrors.contact_mobile = "Mobile required";
    if (!data.contact_email) nextErrors.contact_email = "Email required";
    if (!data.reg_street) nextErrors.reg_street = "Street required";
    if (!data.reg_state) nextErrors.reg_state = "State required";
    if (!/^\d{4}$/.test(data.reg_postcode || "")) nextErrors.reg_postcode = "Postcode must be 4 digits";
    if (abnMismatch) nextErrors.abn = "ABN must be 2 digits followed by your ACN (last 9 digits)";
    return nextErrors;
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileStatus("saving");
    setProfileMessage("");
    try {
      const nextErrors = validateProfile(profile);
      if (Object.keys(nextErrors).length > 0) {
        setProfileErrors(nextErrors);
        setProfileStatus("error");
        setProfileMessage("Please fix the highlighted fields.");
        return;
      }
      const payload: ClientProfile = {
        org_name: profile.org_name || "",
        structure: profile.structure || "",
        acn: profile.acn || "",
        abn: profile.abn || "",
        tfn: profile.tfn || "",
        website: profile.website || "",
        contact_title: profile.contact_title || "",
        contact_name: profile.contact_name || "",
        contact_job_title: profile.contact_job_title || "",
        contact_mobile: profile.contact_mobile || "",
        contact_landline: profile.contact_landline || "",
        preferred_contact_time: profile.preferred_contact_time || "",
        contact_email: profile.contact_email || "",
        reg_street: profile.reg_street || "",
        reg_state: profile.reg_state || "",
        reg_postcode: profile.reg_postcode || "",
        profile_file_name: profile.profile_file_name || "",
        profile_file_type: profile.profile_file_type || "",
        profile_file_content: profile.profile_file_content || "",
      };
      const res = await fetch("/api/clients/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setProfileStatus("error");
        const fieldErrors = json?.details?.fieldErrors as Record<string, string[] | undefined> | undefined;
        const formErrors = json?.details?.formErrors as string[] | undefined;
        const fieldMsg = fieldErrors
          ? Object.entries(fieldErrors)
              .flatMap(([key, messages]) => (messages || []).filter(Boolean).map((msg) => `${key}: ${msg}`))
              .join("; ")
          : "";
        const detailMsg = fieldMsg || (formErrors && formErrors.join("; ")) || "";
        setProfileMessage(detailMsg || json?.error || "Unable to save company profile.");
        return;
      }
      setProfileStatus("saved");
      setProfileMessage("Company details saved.");
    } catch {
      setProfileStatus("error");
      setProfileMessage("Unable to save company profile.");
    }
  };

  const companyForBooking = {
    name: profile.org_name || "",
    structure: profile.structure || "",
    acn: profile.acn || "",
    abn: profile.abn || "",
    website: profile.website || "",
    contactTitle: profile.contact_title || "",
    contactName: profile.contact_name || "",
    contactJobTitle: profile.contact_job_title || "",
    contactMobile: profile.contact_mobile || "",
    contactLandline: profile.contact_landline || "",
    preferredContactTime: profile.preferred_contact_time || "",
    contactEmail: profile.contact_email || "",
    contactOnBehalf: true,
  };

  const registeredAddressForBooking = {
    street: profile.reg_street || "",
    state: profile.reg_state || "",
    postcode: profile.reg_postcode || "",
  };

  return (
    <div className={styles.form} style={{ maxWidth: 960, margin: "2rem auto" }}>
      <div className={styles.formHeader}>
        <h2>Your requests</h2>
        <p>Status overview for submitted labour hire requests.</p>
        <div className={styles.formHeaderActions}>
          <SecondaryButton href="/dashboard">
            Go back to main area
          </SecondaryButton>
        </div>
      </div>

      <div className={styles.section}>
        <h3 style={{ fontSize: "1.35rem", fontWeight: 700 }}>Company details (one-time setup)</h3>
        <p className={styles.hint}>
          Save your company details once. We will auto-fill these for future requests.
        </p>
        <form onSubmit={handleProfileSave} className={styles.section}>
          <div className={styles.gridTwo}>
            <div className={styles.field}>
              <label className={styles.label}>Company name *</label>
              <input
                className={fieldClass(styles.input, !!profileErrors.org_name)}
                value={profile.org_name || ""}
                onChange={(e) => handleProfileChange("org_name", e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Company structure *</label>
              <select
                className={fieldClass(styles.select, !!profileErrors.structure)}
                value={profile.structure || ""}
                onChange={(e) => handleProfileChange("structure", e.target.value)}
              >
                <option value="">Select...</option>
                {COMPANY_STRUCTURES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.gridFour}>
            <div className={styles.field}>
              <label className={styles.label}>ACN (9 digits) *</label>
              <input
                className={fieldClass(styles.input, !!profileErrors.acn)}
                inputMode="numeric"
                maxLength={9}
                value={profile.acn || ""}
                onChange={(e) => handleProfileChange("acn", e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>ABN (11 digits) *</label>
              <input
                className={fieldClass(styles.input, !!profileErrors.abn || abnMismatch)}
                inputMode="numeric"
                maxLength={11}
                value={profile.abn || ""}
                onChange={(e) => handleProfileChange("abn", e.target.value.replace(/\D/g, ""))}
              />
              {abnMismatch && <span className={styles.error}>ABN must be 2 digits followed by your ACN</span>}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>TFN number (optional)</label>
              <input
                className={styles.input}
                value={profile.tfn || ""}
                onChange={(e) => handleProfileChange("tfn", e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Company website</label>
              <input
                className={styles.input}
                value={profile.website || ""}
                onChange={(e) => handleProfileChange("website", e.target.value)}
                placeholder="www.example.com"
              />
            </div>
          </div>

          <div className={styles.gridFour}>
            <div className={styles.field}>
              <label className={styles.label}>Title *</label>
              <select
                className={fieldClass(styles.select, !!profileErrors.contact_title)}
                value={profile.contact_title || ""}
                onChange={(e) => handleProfileChange("contact_title", e.target.value)}
              >
                <option value="">Select...</option>
                {contactTitles.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Contact name *</label>
              <input
                className={fieldClass(styles.input, !!profileErrors.contact_name)}
                value={profile.contact_name || ""}
                onChange={(e) => handleProfileChange("contact_name", e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Job title *</label>
              <input
                className={fieldClass(styles.input, !!profileErrors.contact_job_title)}
                value={profile.contact_job_title || ""}
                onChange={(e) => handleProfileChange("contact_job_title", e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Mobile *</label>
              <input
                className={fieldClass(styles.input, !!profileErrors.contact_mobile)}
                value={profile.contact_mobile || ""}
                onChange={(e) => handleProfileChange("contact_mobile", e.target.value)}
              />
            </div>
          </div>

          <div className={styles.gridThree}>
            <div className={styles.field}>
              <label className={styles.label}>Contact email *</label>
              <input
                className={fieldClass(styles.input, !!profileErrors.contact_email)}
                type="email"
                value={profile.contact_email || ""}
                onChange={(e) => handleProfileChange("contact_email", e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Landline (optional)</label>
              <input
                className={styles.input}
                value={profile.contact_landline || ""}
                onChange={(e) => handleProfileChange("contact_landline", e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Preferred contact time (optional)</label>
              <input
                className={styles.input}
                value={profile.preferred_contact_time || ""}
                onChange={(e) => handleProfileChange("preferred_contact_time", e.target.value)}
              />
            </div>
          </div>

          <div className={styles.gridThree}>
            <div className={styles.field}>
              <label className={styles.label}>Registered street *</label>
              <input
                className={fieldClass(styles.input, !!profileErrors.reg_street)}
                ref={regStreetRef}
                value={profile.reg_street || ""}
                onChange={(e) => handleProfileChange("reg_street", e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>State / Territory *</label>
              <select
                className={fieldClass(styles.select, !!profileErrors.reg_state)}
                value={profile.reg_state || ""}
                onChange={(e) => handleProfileChange("reg_state", e.target.value)}
              >
                <option value="">Select...</option>
                {STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Postcode *</label>
              <input
                className={fieldClass(styles.input, !!profileErrors.reg_postcode)}
                inputMode="numeric"
                maxLength={4}
                value={profile.reg_postcode || ""}
                onChange={(e) => handleProfileChange("reg_postcode", e.target.value.replace(/\D/g, ""))}
              />
            </div>
          </div>

          {profileMessage && (
            <div className={profileStatus === "error" ? styles.errorSummary : styles.hint}>
              {profileMessage}
            </div>
          )}
          <div className={styles.section} style={{ marginTop: "0.75rem" }}>
            <label className={styles.label}>If you have a company profile please upload here (optional)</label>
            <input type="file" className={styles.input} onChange={(e) => handleProfileFileChange(e.target.files)} />
            {profileUploadMessage && <div className={styles.hint}>{profileUploadMessage}</div>}
            {profile.profile_file_name && (
              <div className={styles.hint}>Saved file: {profile.profile_file_name}</div>
            )}
          </div>
          <div className={styles.actions}>
            <SecondaryButton type="submit"  disabled={profileStatus === "saving"}>
              {profileStatus === "saving" ? "Saving..." : "Save company details"}
            </SecondaryButton>
          </div>
        </form>
      </div>

      {!profileComplete ? (
        <div className={styles.section}>
          <p className={`${styles.hint} ${styles.calloutStrong}`}>
            Complete the company details above to start a new labour request.
          </p>
        </div>
      ) : (
        <div className={styles.section}>
          <h3 className={styles.sectionTitleStrong}>Request workers</h3>
          <BookLabourNowForm
            initialValues={{ company: companyForBooking, registeredAddress: registeredAddressForBooking }}
            profileOverrides={{ company: companyForBooking, registeredAddress: registeredAddressForBooking }}
            submitEndpoint="/api/requests/from-booking"
            hideCompanyFields
            hideRegisteredAddress
            onSuccessRedirect="/dashboard/requests"
          />
        </div>
      )}
    </div>
  );
}

