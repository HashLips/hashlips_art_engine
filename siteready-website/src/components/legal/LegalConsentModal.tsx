"use client";

import React from "react";
import styles from "@/components/booking/BookLabourNowForm.module.css";
import { LegalDocument } from "@/lib/legal/documents";

type Props = {
  open: boolean;
  document: LegalDocument | null;
  onAccept: () => void;
  onClose: () => void;
};

export default function LegalConsentModal({ open, document, onAccept, onClose }: Props) {
  const [checked, setChecked] = React.useState(false);

  React.useEffect(() => {
    setChecked(false);
  }, [document?.type, open]);

  if (!open || !document) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        padding: "2rem",
      }}
    >
      <div style={{ background: "#fff", borderRadius: 16, maxWidth: 760, width: "100%", padding: "1.5rem" }}>
        <h3 style={{ marginBottom: "0.5rem", fontSize: "1.35rem", fontWeight: 800 }}>{document.title}</h3>
        <div style={{ maxHeight: "45vh", overflow: "auto", border: "1px solid #e2e8f0", borderRadius: 12, padding: "1rem", marginBottom: "1rem" }}>
          {document.body.map((line, index) => (
            <p key={`${document.type}-${index}`} style={{ marginBottom: "0.75rem" }}>
              {line}
            </p>
          ))}
        </div>
        <div className={styles.field} style={{ marginBottom: "1rem" }}>
          <label className={styles.label} style={{ fontWeight: 700 }}>
            <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} /> I have read and agree.
          </label>
          <div className={styles.hint} style={{ fontWeight: 900, fontSize: "1.08rem" }}>
            Read more:
            {" "}
            <a href="/legal/privacy" style={{ fontWeight: 900 }}>Privacy</a>,{" "}
            <a href="/legal/collection-notice" style={{ fontWeight: 900 }}>Collection notice</a>,{" "}
            <a href="/legal/terms" style={{ fontWeight: 900 }}>Terms</a>,{" "}
            <a href="/legal/xero-consent" style={{ fontWeight: 900 }}>Xero consent</a>
          </div>
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.pillButton} onClick={onClose} style={{ fontWeight: 800 }}>
            Close
          </button>
          <button
            type="button"
            className={styles.pillButton}
            onClick={onAccept}
            disabled={!checked}
            style={{ fontWeight: 800, background: "#16a34a", borderColor: "#16a34a", color: "#fff" }}
          >
            Agree
          </button>
        </div>
      </div>
    </div>
  );
}
