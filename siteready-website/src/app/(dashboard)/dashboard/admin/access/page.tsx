"use client";

import React from "react";
import styles from "@/components/booking/BookLabourNowForm.module.css";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";

export default function AdminAccessPage() {
  const [error, setError] = React.useState("");
  const [session, setSession] = React.useState<{ adminLevel?: string } | null>(null);
  const [roleEmail, setRoleEmail] = React.useState("");
  const [roleLevel, setRoleLevel] = React.useState<"admin" | "super_admin" | "">("");
  const [roleMessage, setRoleMessage] = React.useState("");
  const [newUserEmail, setNewUserEmail] = React.useState("");
  const [newUserRole, setNewUserRole] = React.useState<"client" | "worker" | "staff">("client");
  const [newUserMessage, setNewUserMessage] = React.useState("");

  React.useEffect(() => {
    fetch("/api/auth/session")
      .then(async (r) => {
        if (!r.ok) throw new Error("no session");
        const json = await r.json();
        setSession(json.session || null);
      })
      .catch(() => setSession(null));
  }, []);

  React.useEffect(() => {
    if (!session) return;
    if (session.adminLevel !== "admin" && session.adminLevel !== "super_admin") {
      setError("Admin access required.");
    }
  }, [session]);

  const updateRole = async () => {
    setRoleMessage("");
    const res = await fetch("/api/admin/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: roleEmail, admin_level: roleLevel || null }),
    });
    if (!res.ok) {
      setRoleMessage("Unable to update role.");
      return;
    }
    setRoleMessage("Role updated.");
    setRoleEmail("");
    setRoleLevel("");
  };

  const createUser = async () => {
    setNewUserMessage("");
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newUserEmail, role: newUserRole }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      setNewUserMessage(json?.error || "Unable to create user.");
      return;
    }
    setNewUserMessage("Invite sent. The user will receive a setup link.");
    setNewUserEmail("");
    setNewUserRole("client");
  };

  if (error) {
    return (
      <div className={styles.form} style={{ maxWidth: 720, margin: "2rem auto" }}>
        <div className={styles.errorSummary}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.form} style={{ maxWidth: 1040, margin: "2rem auto" }}>
      <div className={styles.formHeader}>
        <h2>Access & roles</h2>
        <p>Invite users and manage admin access.</p>
        <div className={styles.formHeaderActions}>
          <SecondaryButton href="/dashboard/admin">Back to dashboard</SecondaryButton>
          <SecondaryButton href="/dashboard/admin/clients">Manage clients</SecondaryButton>
          <SecondaryButton href="/dashboard/admin/requests">View requests</SecondaryButton>
          <SecondaryButton href="/dashboard/admin/workers">Manage workers</SecondaryButton>
          <SecondaryButton href="/logout">Log out</SecondaryButton>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Create user</h3>
        <div className={styles.gridThree}>
          <div className={styles.field}>
            <label className={styles.label}>New user email</label>
            <input className={styles.input} value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>User role</label>
            <select
              className={styles.select}
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value as "client" | "worker" | "staff")}
            >
              <option value="client">Client</option>
              <option value="worker">Worker</option>
              <option value="staff">Staff</option>
            </select>
          </div>
          <div className={styles.field} style={{ alignSelf: "end" }}>
            <PrimaryButton type="button" onClick={createUser}>
              Send setup link
            </PrimaryButton>
          </div>
        </div>
        {newUserMessage && <div className={styles.hint}>{newUserMessage}</div>}
      </div>

      <div className={styles.section}>
        <h3>Admin access</h3>
        <div className={styles.gridThree}>
          <div className={styles.field}>
            <label className={styles.label}>User email</label>
            <input className={styles.input} value={roleEmail} onChange={(e) => setRoleEmail(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Admin level</label>
            <select className={styles.select} value={roleLevel} onChange={(e) => setRoleLevel(e.target.value as "admin" | "super_admin" | "")}>
              <option value="">Remove admin</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super admin</option>
            </select>
          </div>
          <div className={styles.field} style={{ alignSelf: "end" }}>
            <PrimaryButton type="button" onClick={updateRole}>
              Update access
            </PrimaryButton>
          </div>
        </div>
        {roleMessage && <div className={styles.hint}>{roleMessage}</div>}
      </div>
    </div>
  );
}
