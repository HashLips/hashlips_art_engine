"use client";

import React from "react";
import { useRouter } from "next/navigation";
import SecondaryButton from "@/components/SecondaryButton";

type PolicyKey = "worker_terms" | "client_terms" | "privacy_policy" | "frontend_terms";

export default function PolicyAcceptPanel({ policyKey, version }: { policyKey: PolicyKey; version: number }) {
  const router = useRouter();
  const [checked, setChecked] = React.useState(false);
  const [status, setStatus] = React.useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = React.useState("");
  const [showDeclineModal, setShowDeclineModal] = React.useState(false);

  const acceptPolicy = async () => {
    if (!checked) {
      setMessage("Please tick the box to confirm acceptance.");
      return;
    }
    setStatus("saving");
    setMessage("");
    const res = await fetch("/api/policies/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ policy_key: policyKey }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      setStatus("error");
      setMessage(json?.error || "Unable to record acceptance.");
      return;
    }
    setStatus("saved");
    setMessage("Acceptance recorded.");
    const next =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("next")
        : null;
    if (next && policyKey === "frontend_terms") {
      router.push(next);
    }
  };

  return (
    <div className="mt-8 rounded-2xl border border-srBorder bg-white p-5 text-srText">
      <div className="text-sm font-semibold">Policy acceptance</div>
      <div className="mt-2 text-sm text-srMuted">
        You are agreeing to the latest published version (v{version}).
      </div>
      <label className="mt-4 flex items-start gap-3 text-sm text-srText">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="mt-1 h-4 w-4"
        />
        <span>I have read and agree to this policy.</span>
      </label>
      {message ? (
        <div className={`mt-3 text-sm ${status === "error" ? "text-red-600" : "text-srMuted"}`}>{message}</div>
      ) : null}
      <div className="mt-4">
        <SecondaryButton type="button" onClick={acceptPolicy} disabled={status === "saving" || status === "saved"}>
          {status === "saving" ? "Saving..." : status === "saved" ? "Accepted" : "Accept policy"}
        </SecondaryButton>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <SecondaryButton href="/dashboard/requests">Back to requests</SecondaryButton>
        {policyKey === "client_terms" ? (
          <SecondaryButton type="button" onClick={() => setShowDeclineModal(true)}>
            I do not accept
          </SecondaryButton>
        ) : null}
      </div>

      {showDeclineModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xl rounded-2xl border border-srBorder bg-white p-5 text-srText shadow-lg">
            <div className="text-base font-semibold">Policy not accepted</div>
            <p className="mt-2 text-sm text-srMuted">
              Unfortunately we will not be able to offer our services unless you accept our terms, conditions, and policies.
              You may save your details and come back at another time if you wish.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <SecondaryButton
                type="button"
                onClick={() => {
                  setShowDeclineModal(false);
                  router.push("/dashboard/requests?policy_declined=1");
                }}
              >
                Save and return later
              </SecondaryButton>
              <SecondaryButton type="button" onClick={() => setShowDeclineModal(false)}>
                Continue reviewing
              </SecondaryButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
