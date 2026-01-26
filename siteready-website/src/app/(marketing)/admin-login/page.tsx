"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/components/booking/BookLabourNowForm.module.css";

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [next, setNext] = useState("/dashboard/admin");
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const n = params.get("next");
    if (n) {
      setNext(n);
    }
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        setError("Login failed. Please try again.");
        return;
      }
      if (typeof window !== "undefined") {
        window.location.assign(next);
        return;
      }
      router.push(next);
    } catch {
      setError("Login failed. Please try again.");
    }
  };

  return (
    <div className={styles.form} style={{ maxWidth: 520, margin: "3rem auto" }}>
      <div className={styles.formHeader}>
        <h2>Admin login</h2>
        <p>Use your admin email and password to access the admin dashboard.</p>
      </div>

      <form onSubmit={onSubmit} className={styles.section}>
        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <input
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Password</label>
          <input
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
          />
        </div>
        <div className="mt-2 text-sm">
          <a className="text-srPrimary hover:text-srAccent" href="/forgot-password">
            Forgot password?
          </a>
        </div>
        {error && <div className={styles.errorSummary}>{error}</div>}
        <div className={styles.actions}>
          <button type="submit" className={styles.pillButton}>
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminLoginPage;
