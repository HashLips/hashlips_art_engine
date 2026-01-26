"use client";

import { useRouter } from "next/navigation";
import styles from "@/components/booking/BookLabourNowForm.module.css";

type Props = {
  title: string;
  body: string[];
};

export default function LegalPage({ title, body }: Props) {
  const router = useRouter();
  return (
    <div className={styles.form} style={{ maxWidth: 920, margin: "2rem auto" }}>
      <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "1rem" }}>
        <button type="button" className={styles.pillButton} onClick={() => router.back()} style={{ fontWeight: 800 }}>
          Back
        </button>
      </div>
      <div className={styles.formHeader}>
        <h2>{title}</h2>
      </div>
      <div className={styles.section} style={{ whiteSpace: "pre-wrap" }}>
        {body.map((line, index) => (
          <p key={`${index}-${line.slice(0, 10)}`}>{line}</p>
        ))}
      </div>
    </div>
  );
}
