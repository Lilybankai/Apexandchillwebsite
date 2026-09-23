import Link from "next/link";
import {
  ArrowUpDown,
  CheckCircle2,
  Download,
  FolderLock,
  Gauge,
  LockKeyhole,
  RotateCcw,
  Settings2,
  SlidersHorizontal,
  Star,
  Tags,
  Trophy,
} from "lucide-react";
import { AioFaq } from "@/components/aio/AioFaq";
import { AioPageHero } from "@/components/aio/AioPageHero";
import { AioRelatedPages } from "@/components/aio/AioRelatedPages";
import { AioTrialCta } from "@/components/aio/AioTrialCta";
import { JsonLd } from "@/components/aio/JsonLd";
import { SetupBrowserMock } from "@/components/aio/setups/SetupBrowserMock";
import { SetupOptimiserMock } from "@/components/overlay/SetupOptimiserMock";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { AIO_PRODUCT } from "@/lib/aio";
import { getAioFaq, type AioFaqItem } from "@/lib/aio-faq";
import { buildAioBreadcrumbJsonLd, buildAioPageMetadata } from "@/lib/aio-seo";

export const metadata = buildAioPageMetadata("setups");

/** The trial buttons read the live release. */
export const revalidate = 1800;

const { priceDisplay, trialDays } = AIO_PRODUCT;

const PAGE_FAQ: AioFaqItem[] = [
  {
    q: "Where can I get free LMU setups?",
    page: "setups",
    a: `Inside Apex AIO. Community setups are part of the app — publishing and downloading them carries no per-setup charge, so there is no separate setup pack to buy. Each shared Le Mans Ultimate setup is tagged with its track, car, class and handling, and can carry the fastest verified clean lap driven on it. The app itself is ${priceDisplay} a month after a ${trialDays}-day free trial, and the trial includes everything.`,
  },
  {
    q: "How do I install LMU setups?",
    page: "setups",
    a: "Open the setup workshop in Apex AIO, find a community setup for your track, car and class, and press Get setup — it is sent straight into LMU's own setup screen, so there is nothing to copy by hand. Your own setups go into the private library as named, tagged copies of the real .svm files, kept where LMU can't overwrite them.",
  },
  {
    q: "Are the lap times on community setups real?",
    page: "setups",
    a: "They are the fastest verified clean lap driven on that exact setup, linked to it when it was published — not a figure typed in by the author. The browser also shows how far that lap is from the board's best, so you can judge a setup on pace it has already proved. Ratings only open once a driver has downloaded the setup, so the stars come from people who have actually driven it.",
  },
  {
    q: "Will the setup editor overwrite my LMU setups?",
    page: "setups",
    a: "Not without you. Edits you make by hand in the live garage editor land in the car instantly, as they would in the garage. Race engineer changes are different: they are staged first, every proposed value is shown, and nothing reaches LMU until you press Apply — Revert throws the preview away. Settings fixed by the ruleset are skipped, and the setup library keeps your named copies somewhere LMU can't overwrite them.",
  },
  {
    q: "Do the setup tools work in rFactor 2?",
    page: "setups",
    a: "No — the setup features are LMU-only, because they depend on data rFactor 2 doesn't publish. On rF2 they read \"no data\" rather than showing something plausible-looking. The overlays that rF2 does support, such as standings, relative, radar and the track map, still work there.",
  },
];

const OPTIMISER_POINTS = [
  "Ten intent sliders — front turn-in, rear traction, braking stability, kerb compliance and more — turn handling feedback into balanced changes.",
  "Changes are spread across the real setup keys available on the car you are driving, not a generic template.",
  "Every proposed value is staged and shown before anything reaches the car.",
  "Ruleset-locked or unavailable settings are skipped rather than forced.",
] as const;

const EDITOR_POINTS = [
  "Every garage setting in one panel, following all six LMU garage pages.",
  "Changes you make by hand land in the car instantly.",
  "Settings fixed by the ruleset are marked and left alone.",
  "The optimiser works on the same screen, so staged changes sit beside the live values.",
] as const;

const COMMUNITY_FEATURES = [
  {
    icon: Trophy,
    title: "Verified lap times",
    body: "Each shared setup can carry the fastest verified clean lap driven on that exact setup, with its gap to the board best.",
  },
  {
    icon: Tags,
    title: "Tagged for your car",
    body: "Track, car, class and handling tags — low drag, endurance, kerb-friendly — so the list narrows to what you actually drive.",
  },
  {
    icon: ArrowUpDown,
    title: "Five ways to sort",
    body: "Fastest verified lap, recommendation, rating, downloads or newest.",
  },
  {
    icon: Star,
    title: "Ratings that mean something",
    body: "Ratings open only after a driver has downloaded the setup, so every star comes from someone who ran it.",
  },
] as const;

const CLASSES = [
  {
    name: "Hypercar",
    body: "Look for the Hypercar class tag and sort by fastest verified lap to find a baseline proved on the track you are about to race — endurance and kerb-friendly tags help for long stints.",
  },
  {
    name: "LMP2",
    body: "LMP2 setups carry their own class tag. Where the ruleset fixes a setting, the optimiser skips it, so staged changes only touch keys you are allowed to change.",
  },
  {
    name: "LMGT3",
    body: "GT3 setups are tagged with their car and track, each with the clean lap it was driven on and a rating from people who downloaded it.",
  },
] as const;

const INSTALL_STEPS = [
  {
    icon: Settings2,
    title: "Open the setup workshop",
    body: "It lives in the Apex AIO control panel, beside the live garage editor and your setup library.",
  },
  {
    icon: Tags,
    title: "Find a setup",
    body: "Narrow community setups by track, car, class and handling tags, then sort by fastest verified lap or rating.",
  },
  {
    icon: Download,
    title: "Get setup",
    body: "One press sends it straight into LMU's own setup screen. No hunting for folders, no copying .svm files by hand.",
  },
  {
    icon: Star,
    title: "Drive it, then rate it",
    body: "Ratings open once you have downloaded it — and if it needs tuning for your style, the optimiser is on the same screen.",
  },
] as const;

function Points({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-6 space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-muted">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function LmuSetupsPage() {
  return (
    <>
      <JsonLd data={buildAioBreadcrumbJsonLd("setups")} />

      <AioPageHero
        kicker="Apex AIO · Setup workshop"
        title={
          <>
            LMU Setups with <span className="text-gradient">real lap times</span>
          </>
        }
        lead={
          <>
            Free Le Mans Ultimate community setups, ranked by the verified clean lap each one was
            actually driven on — plus a live LMU setup editor and a setup optimiser that turns
            &ldquo;more turn-in&rdquo; into real changes for your car. Download LMU setups straight
            into the game&apos;s own setup screen, keep your .svm files safe in a private library,
            and never pay per setup.
          </>
        }
        points={[
          "Community setups included — no per-setup charge",
          "Verified clean lap on every listed tune",
          "Nothing applied until you press Apply",
        ]}
        visual={<SetupOptimiserMock />}
      />

      {/* ── Community setups ─────────────────────────────────────────────── */}
      <section id="community-setups" className="scroll-mt-36 border-b border-line bg-surface/30 py-16">
        <div className="container-rail grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <Reveal>
            <span className="kicker mb-4">Community setups · Included</span>
            <h2 className="text-4xl font-bold text-ink sm:text-5xl">
              Free LMU community setups, ranked by{" "}
              <span className="text-gradient">real lap times</span>
            </h2>
            <p className="mt-5 text-lg text-muted">
              Instead of paying separately for a blind setup pack, start from tunes other LMU
              drivers have proved on track. Apex AIO&apos;s community setups are shared by other LMU drivers and linked to the fastest verified
              clean lap driven on that exact setup — so before you download anything you can see
              what it has already achieved, and choose a credible baseline rather than a hopeful
              one.
            </p>
            <p className="mt-4 text-muted">
              Publishing your own is the same flow in reverse: share an .svm setup with its track,
              car, class and handling tags attached, and your clean lap goes with it. Publishing and
              downloading are part of the app — there is no per-setup charge.
            </p>
          </Reveal>
          <Reveal delay={140}>
            <SetupBrowserMock />
          </Reveal>
        </div>

        <div className="container-rail mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COMMUNITY_FEATURES.map((item, i) => (
            <Reveal key={item.title} delay={i * 90} className="h-full">
              <Card variant="default" className="flex h-full flex-col gap-3 p-6">
                <item.icon size={22} className="text-cyan" aria-hidden />
                <h3 className="text-lg font-bold text-ink">{item.title}</h3>
                <p className="text-sm text-muted">{item.body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Setups for every class ──────────────────────────────────────── */}
      <section id="classes" className="container-rail scroll-mt-36 py-16">
        <div className="mb-10 max-w-3xl">
          <span className="kicker mb-4">Hypercar · LMP2 · LMGT3</span>
          <h2 className="text-4xl font-bold text-ink sm:text-5xl">
            LMU setups for <span className="text-gradient">every class</span>
          </h2>
          <p className="mt-5 text-lg text-muted">
            Every community setup carries its class, car and track as tags, so LMU Hypercar
            setups, LMU LMP2 setups and LMU GT3 setups aren&apos;t separate hunts — they are
            one tagged list. And because the optimiser works from the setup keys available on the car you
            are sitting in, it adapts to whichever class you race.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {CLASSES.map((c, i) => (
            <Reveal key={c.name} delay={i * 90} className="h-full">
              <Card variant="default" interactive className="flex h-full flex-col gap-3 p-7">
                <span className="chip w-fit border-accent/40 text-xs text-accent-2">{c.name}</span>
                <h3 className="text-2xl font-bold text-ink">LMU {c.name} setups</h3>
                <p className="text-muted">{c.body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Optimiser ───────────────────────────────────────────────────── */}
      <section id="optimiser" className="scroll-mt-36 border-y border-line bg-surface/30 py-16">
        <div className="container-rail grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
          <Reveal>
            <span className="kicker mb-4">Setup optimiser · Race engineer</span>
            <h2 className="text-4xl font-bold text-ink sm:text-5xl">
              The LMU setup optimiser: tell it what the{" "}
              <span className="text-gradient">car should do</span>
            </h2>
            <p className="mt-5 text-lg text-muted">
              You know how the car feels; you shouldn&apos;t need to know which five clicks fix it.
              Ask for more front turn-in, better rear traction, braking stability or compliance over
              the kerbs, and the Race engineer translates that intent into balanced setup changes
              for the car you are driving — without silently overwriting the garage.
            </p>
            <Points items={OPTIMISER_POINTS} />
            <div className="mt-6 flex items-center gap-2 rounded-card border border-cyan/25 bg-cyan/5 p-4 text-sm text-subtle">
              <SlidersHorizontal aria-hidden size={18} className="shrink-0 text-cyan" />
              This is intent-based setup engineering, not a black-box lap-time promise.
            </div>
          </Reveal>

          <div className="grid gap-4">
            <Reveal delay={100}>
              <Card variant="glow" className="p-7">
                <div className="flex items-center gap-3">
                  <Gauge size={22} className="text-cyan" aria-hidden />
                  <h3 className="text-2xl font-bold text-ink">Ten engineer macros</h3>
                </div>
                <p className="mt-3 text-muted">
                  Each slider is an intent, not a single setting. Move front turn-in up and the
                  engineer stages a set of related changes across the real keys on your car, so the
                  balance moves the way you asked rather than one value lurching on its own.
                </p>
              </Card>
            </Reveal>
            <Reveal delay={160}>
              <Card variant="default" className="p-7">
                <div className="flex items-center gap-3">
                  <RotateCcw size={22} className="text-accent" aria-hidden />
                  <h3 className="text-2xl font-bold text-ink">Apply or Revert</h3>
                </div>
                <p className="mt-3 text-muted">
                  Nothing is applied until you say so. Staged values sit beside the live ones; Apply
                  sends the staged setup to LMU, Revert removes the preview and leaves the car
                  exactly as it was.
                </p>
              </Card>
            </Reveal>
            <Reveal delay={220}>
              <Card variant="default" className="p-7">
                <div className="flex items-center gap-3">
                  <LockKeyhole size={22} className="text-flag-amber" aria-hidden />
                  <h3 className="text-2xl font-bold text-ink">Ruleset-aware</h3>
                </div>
                <p className="mt-3 text-muted">
                  Settings the ruleset fixes, or that the current car doesn&apos;t have, are skipped
                  — the preview tells you how many were staged and how many were left alone.
                </p>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Live editor + library ───────────────────────────────────────── */}
      <section id="editor" className="container-rail scroll-mt-36 py-16">
        <div className="grid gap-10 lg:grid-cols-2">
          <Reveal>
            <span className="kicker mb-4">Setup editor · Live</span>
            <h2 className="text-4xl font-bold text-ink sm:text-5xl">
              A live <span className="text-gradient">LMU setup editor</span>
            </h2>
            <p className="mt-5 text-lg text-muted">
              Every garage setting in an editor where changes land in the car instantly. Brake
              balance, ducts, wing, anti-roll bars — edit them from the Apex AIO panel instead of
              clicking through the garage menus, with the optimiser&apos;s staged changes shown
              right beside the live values.
            </p>
            <Points items={EDITOR_POINTS} />
          </Reveal>

          <Reveal delay={120}>
            <span className="kicker mb-4">Setup library · Private</span>
            <h2 className="text-4xl font-bold text-ink sm:text-5xl">
              Your own <span className="text-gradient">setup library</span>
            </h2>
            <p className="mt-5 text-lg text-muted">
              The setups you trust deserve somewhere safe. The library keeps named, tagged copies
              of real .svm files where LMU can&apos;t overwrite them — your qualifying tune, your
              wet race setup, the one that finally stopped the rear stepping out at Spa.
            </p>
            <Card variant="default" className="mt-6 flex items-start gap-4 p-6">
              <FolderLock size={22} className="mt-0.5 shrink-0 text-cyan" aria-hidden />
              <p className="text-sm text-muted">
                <strong className="text-ink">Real files, not a proprietary format.</strong> The
                library holds genuine LMU .svm setups, so what you save is a genuine LMU setup —
                and one you can publish to the community with its clean lap attached.
              </p>
            </Card>
          </Reveal>
        </div>
      </section>

      {/* ── How to install ──────────────────────────────────────────────── */}
      <section id="install" className="scroll-mt-36 border-y border-line bg-surface/30 py-16">
        <div className="container-rail">
          <div className="mb-10 text-center">
            <span className="kicker mb-4">Download → in the garage</span>
            <h2 className="text-4xl font-bold text-ink sm:text-5xl">
              How to install LMU setups <span className="text-gradient">in one click</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted">
              Installing a Le Mans Ultimate setup usually means downloading an .svm file and working
              out where it goes. With Apex AIO the setup is sent straight into LMU&apos;s own setup
              screen from the app.
            </p>
          </div>

          <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {INSTALL_STEPS.map((step, i) => (
              <li key={step.title}>
                <Card variant="default" className="flex h-full flex-col gap-4 p-6">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-4xl font-bold text-line">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <step.icon size={24} className="text-accent" aria-hidden />
                  </div>
                  <h3 className="text-xl font-bold text-ink">{step.title}</h3>
                  <p className="text-sm text-muted">{step.body}</p>
                </Card>
              </li>
            ))}
          </ol>

          <p className="mx-auto mt-8 max-w-3xl text-center text-sm text-subtle">
            The setup tools are part of the same app as the{" "}
            <Link href="/lmu-overlays" className="text-cyan hover:underline">
              LMU overlays
            </Link>
            , the{" "}
            <Link href="/lmu-race-engineer" className="text-cyan hover:underline">
              voice race engineer
            </Link>
            , the{" "}
            <Link href="/lmu-pit-wall" className="text-cyan hover:underline">
              team pit wall
            </Link>{" "}
            and{" "}
            <Link href="/lmu-telemetry" className="text-cyan hover:underline">
              lap-by-lap telemetry review
            </Link>{" "}
            — one subscription,{" "}
            <Link href="/apex-overlay-system#pricing" className="text-cyan hover:underline">
              {priceDisplay} a month
            </Link>
            , everything included. Setup features are LMU-only; rFactor 2 doesn&apos;t publish the
            data they need.
          </p>
        </div>
      </section>

      <AioFaq items={[...getAioFaq("setups"), ...PAGE_FAQ]} heading="LMU setups: questions" />

      <AioRelatedPages current="setups" />

      <AioTrialCta
        body={`Download community setups with verified lap times, tune them with the optimiser and keep them safe in your library — the whole setup workshop is in the ${trialDays}-day free trial.`}
      />
    </>
  );
}
