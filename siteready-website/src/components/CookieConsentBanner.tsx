"use client";

import React from "react";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";

const STORAGE_KEY = "sr_cookie_consent_v1";

const CookieConsentBanner: React.FC = () => {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const consent = window.localStorage.getItem(STORAGE_KEY);
    if (consent !== "accepted") {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "accepted");
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-0 right-0 z-50 px-4"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3 rounded-2xl border border-srBorder bg-srCard p-4 text-sm text-srText shadow-lg md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="font-semibold text-srPrimary">We use cookies</p>
          <p className="text-srMuted">
            We use cookies to run the site and improve your experience. Read our{" "}
            <a className="underline text-srPrimary" href="/legal/privacy">
              Privacy Policy
            </a>{" "}
            and{" "}
            <a className="underline text-srPrimary" href="/legal/cookies">
              Cookie Policy
            </a>
            .
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <PrimaryButton type="button" onClick={accept}>
            Accept
          </PrimaryButton>
          <SecondaryButton href="/legal/cookies">Learn more</SecondaryButton>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
