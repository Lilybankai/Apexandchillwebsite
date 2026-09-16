"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BadgeCheck, Copy, Check } from "lucide-react";
import { lookupReferral, normaliseCode, type Referral } from "@/lib/referral";

/**
 * "Craig sent you — 10% off." The banner a partner's link lands on.
 *
 * ## Why this is a client component
 * The page it sits on is statically rendered and revalidated every 30 minutes.
 * Reading `?ref=` in the server component would opt the WHOLE page out of that
 * and make every visitor pay for a fresh render, to personalise one strip at
 * the top. So the page stays static and this one piece resolves in the browser.
 *
 * ## Why the CODE is the loudest thing here
 * The discount cannot ride the link. A visitor clicks here, downloads 285 MB,
 * installs, signs up, and is asked to pay a week later inside a desktop app
 * that has never heard of this browser session. Nothing automatic survives
 * that. The code is the only thing that crosses the gap, and it crosses it
 * inside someone's memory or clipboard — so it is set large, in monospace,
 * with a copy button, and repeated in the sentence that tells them what to do
 * with it. Everything else on this strip is decoration around that.
 *
 * Renders nothing at all without a valid `?ref=` — no empty box, no layout
 * shift for the 99% who arrive normally.
 */
export function ReferralBanner(): React.ReactElement | null {
  const params = useSearchParams();
  const raw = params.get("ref");
  const [referral, setReferral] = useState<Referral | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const code = normaliseCode(raw);
    if (code.length < 3) {
      setReferral(null);
      return;
    }
    let live = true;
    void lookupReferral(code).then((r) => {
      if (live) setReferral(r);
    });
    return () => {
      live = false;
    };
  }, [raw]);

  // Reset the tick if they arrive at a different partner's link in the same
  // session (a stream raid, two tabs) — otherwise it claims the new code is
  // already copied when it is not.
  useEffect(() => setCopied(false), [referral?.code]);

  if (!referral) return null;

  const who = referral.ownerName ? `${referral.ownerName} sent you` : "You were sent here";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(referral.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard blocked (http, permissions, an old browser). The code is on
      // screen in large monospace either way, which is the fallback.
    }
  };

  return (
    <div className="container-rail pt-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-success/40 bg-success/10 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <BadgeCheck size={22} className="mt-0.5 shrink-0 text-success" />
          <div>
            <p className="font-display text-lg font-bold text-ink">
              {who} — {referral.percentOff}% off, for as long as you subscribe.
            </p>
            <p className="mt-1 text-sm text-muted">
              Download below, then enter{" "}
              <strong className="font-mono text-ink">{referral.code}</strong> on the subscribe
              screen when the app asks for a code.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={copy}
          className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-success/50 bg-surface px-4 py-3 font-mono text-lg font-bold tracking-widest text-ink transition hover:border-success"
          aria-label={`Copy the referral code ${referral.code}`}
        >
          {referral.code}
          {copied ? (
            <Check size={16} className="text-success" />
          ) : (
            <Copy size={16} className="text-muted" />
          )}
        </button>
      </div>
    </div>
  );
}
