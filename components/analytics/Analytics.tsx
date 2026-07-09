"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { Button } from "@/components/ui/Button";

/**
 * Consent-gated Google Analytics 4.
 *
 * The site targets GB/IE, so under UK GDPR/PECR analytics cookies need prior
 * consent. This renders a cookie banner and loads GA4 (gtag) ONLY after the
 * visitor clicks "Accept" — a strict opt-in. The choice persists in
 * localStorage so the banner doesn't reappear.
 *
 * Renders nothing at all when NEXT_PUBLIC_GA_MEASUREMENT_ID is unset (no GA, no
 * cookies, so no banner to show). Set that env var to the GA4 Measurement ID
 * (format G-XXXXXXXXXX) to activate.
 */
const CONSENT_KEY = "ac-analytics-consent";
type Consent = "granted" | "denied";

export function Analytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const [consent, setConsent] = useState<Consent | null>(null);
  // Gates the banner so it only renders after mount (server renders nothing →
  // no hydration mismatch, and we've read the stored choice by then).
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (stored === "granted" || stored === "denied") setConsent(stored);
    } catch {
      // localStorage blocked (private mode / cookies off) — treat as no choice.
    }
    setHydrated(true);
  }, []);

  // No GA configured → nothing to load and nothing to consent to.
  if (!measurementId) return null;

  const choose = (value: Consent) => {
    setConsent(value);
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // Best-effort — a failed write just means the banner may show again.
    }
  };

  return (
    <>
      {consent === "granted" && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${measurementId}', { anonymize_ip: true });
            `}
          </Script>
        </>
      )}

      {hydrated && consent === null && (
        <div
          role="dialog"
          aria-label="Cookie consent"
          aria-live="polite"
          className="fixed inset-x-0 bottom-0 z-[80] p-4 sm:p-6"
        >
          <div className="container-rail">
            <div className="glass mx-auto flex max-w-3xl flex-col gap-4 rounded-card p-5 shadow-glow-soft sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted">
                We use Google Analytics cookies to see how the site is used so we can improve it.
                Nothing is sold or shared for ads — you can decline and everything still works.
              </p>
              <div className="flex shrink-0 gap-2">
                <Button onClick={() => choose("denied")} variant="ghost" size="sm">
                  Decline
                </Button>
                <Button onClick={() => choose("granted")} size="sm">
                  Accept
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
