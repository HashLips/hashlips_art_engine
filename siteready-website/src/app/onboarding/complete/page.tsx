"use client";

import React from "react";
import { useRouter } from "next/navigation";
import styles from "@/components/booking/BookLabourNowForm.module.css";

export default function OnboardingCompletePage() {
  const router = useRouter();
  const [message, setMessage] = React.useState("Finalising your onboarding...");

  React.useEffect(() => {
    const finish = async () => {
      try {
        const res = await fetch("/api/onboarding/complete", { method: "POST" });
        if (!res.ok) {
          setMessage("We could not complete onboarding. Please contact support.");
          return;
        }
        router.replace("/dashboard/onboarding");
      } catch {
        setMessage("We could not complete onboarding. Please contact support.");
      }
    };
    finish();
  }, [router]);

  return (
    <div className={styles.form} style={{ maxWidth: 520, margin: "3rem auto" }}>
      <div className={styles.formHeader}>
        <h2>Setting up your account</h2>
        <p>{message}</p>
      </div>
    </div>
  );
}
