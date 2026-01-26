"use client";

import React from "react";
import { useParams } from "next/navigation";
import styles from "@/components/booking/BookLabourNowForm.module.css";
import SecondaryButton from "@/components/SecondaryButton";

type RequestItem = {
  request_id: string;
  status: string;
  review_status?: string | null;
  status_reason?: string | null;
  role_id: string;
  headcount: number;
  min_years_experience?: number;
  required_tickets?: string[];
  site_address?: string | null;
  site_lat?: number | null;
  site_lng?: number | null;
  site_map_url?: string | null;
  shift_start_time?: string | null;
  shift_end_time?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  hours_per_day?: number | null;
  expected_duration_value?: number | null;
  expected_duration_unit?: string | null;
  ot_options?: string[] | null;
  base_rate_offer?: number | null;
  travel_allowance?: number | null;
  notes?: string | null;
  attachment_list?: { name: string; description?: string }[];
};

export default function RequestDetailPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const [item, setItem] = React.useState<RequestItem | null>(null);
  const [error, setError] = React.useState("");
  const [notFound, setNotFound] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!id) {
      setLoading(false);
      setNotFound(true);
      return;
    }
    setLoading(true);
    setError("");
    setNotFound(false);
    fetch(`/api/requests/${encodeURIComponent(id)}`)
      .then(async (r) => {
        if (!r.ok) throw new Error("failed");
        const json = await r.json();
        const found = json.request || null;
        if (!found) {
          setItem(null);
          setNotFound(true);
          return;
        }
        setItem(found);
      })
      .catch(() => setError("Unable to load request (not configured or not authenticated)."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p style={{ padding: "2rem" }}>Loading...</p>;

  if (error) {
    return (
      <div className={styles.form} style={{ maxWidth: 720, margin: "2rem auto" }}>
        <div className={styles.errorSummary}>{error}</div>
        <SecondaryButton href="/dashboard/requests/status">Back to requests</SecondaryButton>
      </div>
    );
  }

  if (notFound || !item) {
    return (
      <div className={styles.form} style={{ maxWidth: 720, margin: "2rem auto" }}>
        <div className={styles.errorSummary}>Request not found.</div>
        <SecondaryButton href="/dashboard/requests/status">Back to requests</SecondaryButton>
      </div>
    );
  }

  return (
    <div className={styles.form} style={{ maxWidth: 960, margin: "2rem auto" }}>
      <div className={styles.formHeader}>
        <h2>Request detail</h2>
        <p>ID: {id}</p>
      </div>
      <div className={styles.section}>
        <div className={styles.group} style={{ background: "#f0f5ff" }}>
          <p>
            <strong>Status:</strong>{" "}
            <span
              className={`${styles.statusBadge} ${styles[`status-${(item.review_status || item.status || "submitted").toLowerCase()}`]}`}
            >
              {(item.review_status || item.status || "submitted").replace("_", " ")}
            </span>
          </p>
          <p><strong>Role:</strong> {item.role_id}</p>
          <p><strong>Headcount:</strong> {item.headcount}</p>
          <p><strong>Min years experience:</strong> {item.min_years_experience}</p>
          <p><strong>Required tickets:</strong> {(item.required_tickets || []).join(", ")}</p>
        </div>
        <div className={styles.group} style={{ background: "#f8f3ff" }}>
          <p><strong>Site address:</strong> {item.site_address || "Not provided"}</p>
          {item.site_map_url ? (
            <div className={styles.mapWrapper}>
              <div className={styles.mapArea}>
                <iframe
                  title="Site map"
                  width="100%"
                  height="280"
                  loading="lazy"
                  style={{ border: 0 }}
                  referrerPolicy="no-referrer-when-downgrade"
                  src={
                    item.site_lat != null && item.site_lng != null
                      ? `https://www.google.com/maps?q=${item.site_lat},${item.site_lng}&z=15&output=embed`
                      : `https://www.google.com/maps?q=${encodeURIComponent(item.site_address || "")}&z=15&output=embed`
                  }
                />
              </div>
              <div className={styles.actions}>
                <SecondaryButton href={item.site_map_url} target="_blank" rel="noreferrer">
                  Open in Google Maps
                </SecondaryButton>
              </div>
            </div>
          ) : (
            <p>Map: Not provided</p>
          )}
        </div>
        <div className={styles.group} style={{ background: "#f2fbf6" }}>
          <p><strong>Start date:</strong> {item.start_date || "Not provided"}</p>
          <p><strong>Start time:</strong> {item.shift_start_time || "Not provided"}</p>
          <p>
            <strong>Duration:</strong>{" "}
            {item.expected_duration_value && item.expected_duration_unit
              ? `${item.expected_duration_value} ${item.expected_duration_unit}`
              : "Not provided"}
          </p>
          <p><strong>Hours per day:</strong> {item.hours_per_day ?? "Not provided"}</p>
          <p>
            <strong>Overtime needed:</strong>{" "}
            {item.ot_options && item.ot_options.length ? item.ot_options.join(", ") : "None"}
          </p>
          <p><strong>Base rate offer:</strong> {item.base_rate_offer ?? "Not provided"}</p>
          <p><strong>Travel allowance:</strong> {item.travel_allowance ?? "Not provided"}</p>
          <p><strong>Notes:</strong> {item.notes || "None"}</p>
        </div>
        <div className={styles.group} style={{ background: "#fff7ed" }}>
          <strong>Attachments:</strong>
          {item.attachment_list && item.attachment_list.length ? (
            <ul className={styles.attachList}>
              {item.attachment_list.map((a, idx) => (
                <li key={`${a.name}-${idx}`}>
                  {a.name}
                  {a.description ? ` - ${a.description}` : ""}
                </li>
              ))}
            </ul>
          ) : (
            <span> None</span>
          )}
        </div>
      </div>
      <div className={styles.actions}>
        <SecondaryButton href="/dashboard/requests/status">Back to requests</SecondaryButton>
      </div>
    </div>
  );
}
