import { CheckCircle2 } from "lucide-react";
import { AioTrialButton } from "@/components/aio/AioTrialCta";
import { SectionHeading } from "@/components/aio/SectionHeading";
import { AIO_PRODUCT } from "@/lib/aio";

const { priceDisplay: PRICE, trialDays: TRIAL_DAYS } = AIO_PRODUCT;

/** The page's one checkmark list: what the single plan includes. */
const PLAN_POINTS = [
  "Every widget, in OBS and in game",
  "The voice race engineer, bundled",
  "Setup optimiser, team pit wall, leaderboards and StreamBot",
  "Review of every session and every lap you have driven",
  "Team and Solo engineer boards in a browser, on any device",
  "Every update, on the day it ships",
  "Cancel any time, including during the trial",
] as const;

const BILLING: readonly [string, string][] = [
  ["Card entry", "On Stripe's own hosted checkout. The app never sees your card"],
  ["First charge", `Only if you're still subscribed when the ${TRIAL_DAYS} days end`],
  ["Cancelling", "In the app: the subscription card opens Stripe's customer portal for cancelling, cards and invoices"],
  ["Offline", "72 hours of grace on a confirmed subscription, so a weekend without internet isn't a lockout"],
  ["League codes", "League racers and beta testers redeem a code on the subscribe screen instead"],
];

/** Install → on screen. Deliberately short. */
const STEPS: readonly [string, string][] = [
  ["Install and sign in", "One signed Windows installer. Start the trial and the server starts itself."],
  ["Tick the overlays you want", "Each widget has its own switch for OBS and for in-game."],
  ["Paste a URL into OBS", "Or skip OBS and drag widgets over the sim on the in-game layer."],
  ["Stay current", "Updates announce themselves and never install mid-stream."],
];

export function HubPricing({ version, index }: { version: string; index?: string }) {
  return (
    <section id="pricing" aria-labelledby="pricing-heading" className="container-rail scroll-mt-36 py-20">
      <SectionHeading
        index={index}
        id="pricing-heading"
        label="Pricing"
        title="One plan, everything in it"
        lead="The overlays, the race engineer, setups, the pit wall, telemetry review and StreamBot, with every update. There is no second tier."
      />

      <div className="grid gap-px overflow-hidden rounded-card border border-line bg-line lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* The plan */}
        <div className="flex flex-col bg-surface p-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-subtle">The only plan</p>
          <p className="mt-4 font-mono text-6xl font-bold tabular-nums leading-none text-ink">
            {TRIAL_DAYS}
            <span className="ml-2 font-display text-2xl font-bold uppercase tracking-wide text-muted">days free</span>
          </p>
          <p className="mt-3 text-lg text-muted">
            then <strong className="font-mono tabular-nums text-ink">{PRICE}</strong> a month
          </p>
          <ul className="mt-6 flex-1 space-y-2.5">
            {PLAN_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-muted">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" aria-hidden />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <AioTrialButton label="Start the free trial" className="mt-8 w-full" />
          <p className="mt-3 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">
            Windows · v{version} · nothing charged until day {TRIAL_DAYS + 1}
          </p>
        </div>

        {/* Billing, as a spec sheet */}
        <div className="bg-base p-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-subtle">Billing · Stripe only</p>
          <dl className="mt-5 border-t border-line">
            {BILLING.map(([label, value]) => (
              <div
                key={label}
                className="grid gap-1 border-b border-line py-3 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-6"
              >
                <dt className="pt-px font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">{label}</dt>
                <dd className="text-sm text-ink">{value}</dd>
              </div>
            ))}
          </dl>

          <h3 className="mt-10 font-mono text-[11px] uppercase tracking-[0.24em] text-subtle">
            Install to on screen · {STEPS.length} steps, no config files
          </h3>
          <ol className="mt-4 grid gap-5 sm:grid-cols-2">
            {STEPS.map(([title, body], i) => (
              <li key={title} className="flex gap-4">
                <span className="font-mono text-sm tabular-nums text-cyan">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <span className="block font-display text-sm uppercase tracking-wide text-ink">{title}</span>
                  <span className="mt-1 block text-sm text-muted">{body}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
