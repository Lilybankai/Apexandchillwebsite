import { CheckCircle2, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { AioTrialButton } from "@/components/aio/AioTrialCta";
import { AIO_PRODUCT } from "@/lib/aio";

const { priceDisplay: PRICE, trialDays: TRIAL_DAYS } = AIO_PRODUCT;

const PLAN_POINTS = [
  "Every widget, in OBS and in game",
  "The voice race engineer, bundled and included",
  "Setup optimiser, team pit wall, leaderboards and StreamBot",
  "Review — every session and every lap you have driven",
  "Team and Solo engineer boards in a browser, on any device",
  "Every update, on the day it ships",
  "Cancel any time — including during the trial",
] as const;

const BILLING: readonly [string, string][] = [
  ["The app never sees your card", "Checkout and card entry happen on Stripe's own hosted pages, not in the app."],
  [
    "A card up front, charged only after the trial",
    `You won't pay a penny unless you're still subscribed when the ${TRIAL_DAYS} days end.`,
  ],
  [
    "Cancel yourself, in the app",
    "The subscription card opens Stripe's customer portal — cancel, change card or grab invoices without asking anyone.",
  ],
  [
    "72 hours of offline grace",
    "A confirmed subscription keeps working for three days with no internet, so a race weekend away is never a lockout.",
  ],
];

/** Install → on screen. Deliberately short. */
const STEPS: readonly [string, string][] = [
  ["Install and sign in", "One signed Windows installer; start the trial and the server starts itself."],
  ["Tick the overlays you want", "Each widget has its own switch for OBS and for in-game."],
  ["Paste a URL into OBS", "Or skip OBS and drag widgets over the sim on the in-game layer."],
  ["Stay current, quietly", "Updates announce themselves and are never installed mid-stream."],
];

export function HubPricing({ version }: { version: string }) {
  return (
    <section id="pricing" className="container-rail scroll-mt-36 py-16">
      <div className="mb-10 text-center">
        <span className="kicker mb-4">Pricing</span>
        <h2 className="text-4xl font-bold text-ink sm:text-5xl">
          One price, <span className="text-gradient">every LMU tool in it</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted">
          No cut-down tier and no feature held back to upsell you later: the overlays, the race
          engineer, setups, the pit wall, telemetry review and StreamBot, with every update.
        </p>
      </div>

      <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2">
        <Card variant="glow" clip className="relative flex flex-col p-8">
          <span className="kicker mb-3">The only plan</span>
          <p className="font-display text-5xl font-bold text-ink">
            {TRIAL_DAYS} days <span className="text-gradient">free</span>
          </p>
          <p className="mt-3 text-lg text-muted">
            then <strong className="text-ink">{PRICE}</strong> per month
          </p>
          <ul className="mt-6 flex-1 space-y-3">
            {PLAN_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-muted">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" aria-hidden />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <AioTrialButton label="Start the free trial" className="mt-8 w-full" />
          <p className="mt-3 text-center text-xs text-subtle">
            Windows · v{version} · nothing charged until day {TRIAL_DAYS + 1}
          </p>
        </Card>

        <Card variant="default" className="flex flex-col p-8">
          <span className="kicker mb-3">How billing works</span>
          <div className="flex items-center gap-3">
            <ShieldCheck size={24} className="text-cyan" aria-hidden />
            <p className="text-lg font-bold text-ink">Stripe, and only Stripe</p>
          </div>
          <ul className="mt-6 flex-1 space-y-4">
            {BILLING.map(([title, body]) => (
              <li key={title} className="flex items-start gap-3 text-sm text-muted">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" aria-hidden />
                <span>
                  <strong className="text-ink">{title}</strong>
                  <span className="mt-0.5 block">{body}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-8 rounded-card border border-line bg-base/50 p-4 text-center text-sm text-subtle">
            League racer or beta tester? Redeem a league code on the subscribe screen instead.
          </p>
        </Card>
      </div>

      <div className="mx-auto mt-10 max-w-4xl">
        <h3 className="mb-4 text-center font-display text-sm uppercase tracking-widest text-subtle">
          Running in minutes — {STEPS.length} steps, no config files
        </h3>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(([title, body], i) => (
            <li key={title} className="rounded-card border border-line bg-surface/40 p-4">
              <span className="font-display text-2xl font-bold text-line">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-1 font-display text-sm uppercase tracking-wide text-ink">{title}</p>
              <p className="mt-1 text-xs text-muted">{body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
