import Link from "next/link";
import { AioFaq } from "@/components/aio/AioFaq";
import { AioPageHero } from "@/components/aio/AioPageHero";
import { AioRelatedPages } from "@/components/aio/AioRelatedPages";
import { AioTrialCta } from "@/components/aio/AioTrialCta";
import { JsonLd } from "@/components/aio/JsonLd";
import { SectionHeading } from "@/components/aio/SectionHeading";
import { AnnotatedFigure, type Callout } from "@/components/aio/setups/AnnotatedFigure";
import { SetupBrowserMock } from "@/components/aio/setups/SetupBrowserMock";
import { SetupOptimiserMock } from "@/components/overlay/SetupOptimiserMock";
import { Reveal } from "@/components/ui/Reveal";
import { AIO_PRODUCT, AIO_REVIEWS } from "@/lib/aio";
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
    a: `Inside Apex AIO. Community setups are part of the app: publishing and downloading them carries no per-setup charge, so there is no separate setup pack to buy. Each shared Le Mans Ultimate setup is tagged with its track, car, class and handling, and can carry the fastest verified clean lap driven on it. The app is ${priceDisplay} a month after a ${trialDays}-day free trial, and the trial includes everything.`,
  },
  {
    q: "How do I install LMU setups?",
    page: "setups",
    a: "Open the setup workshop in Apex AIO, find a community setup for your track, car and class, and press Get setup. It goes straight into LMU's own setup screen, so there is nothing to copy by hand. Your own setups go into the private library as named, tagged copies of the real .svm files, kept where LMU can't overwrite them.",
  },
  {
    q: "Are the lap times on community setups real?",
    page: "setups",
    a: "They are the fastest verified clean lap driven on that exact setup, linked to it when it was published. The author doesn't type them in. The browser also shows how far that lap is from the board's best, so you can judge a setup on pace it has already shown. Ratings open only once a driver has downloaded the setup, so the stars come from people who have driven it.",
  },
  {
    q: "Will the setup editor overwrite my LMU setups?",
    page: "setups",
    a: "Not without you. Edits you make by hand in the live garage editor land in the car instantly, as they would in the garage. Race engineer changes are staged first: every proposed value is shown, and nothing reaches LMU until you press Apply. Revert throws the preview away. Settings fixed by the ruleset are skipped, and the setup library keeps your named copies where LMU can't overwrite them.",
  },
  {
    q: "Do the setup tools work in rFactor 2?",
    page: "setups",
    a: 'No. The setup features are LMU-only because they depend on data rFactor 2 doesn\'t publish. On rF2 they read "no data" rather than showing something plausible-looking. The overlays rF2 does support, such as standings, relative, radar and the track map, still work there.',
  },
];

/**
 * Pins on the community browser mock, measured against its layout at `xl`
 * (both gutters, two setup cards side by side). Re-check them if
 * SetupBrowserMock's spacing changes.
 */
const BROWSER_CALLOUTS: Callout[] = [
  {
    x: 30.7,
    y: "143px",
    labelY: "130px",
    side: "left",
    label: "Verified lap",
    note: "The fastest clean lap driven on this exact setup.",
  },
  {
    x: 21.7,
    y: "240px",
    labelY: "210px",
    side: "left",
    label: "Handling tags",
    note: "Low drag, endurance, kerb-friendly, plus track, car and class.",
  },
  {
    x: 4.5,
    y: "269px",
    labelY: "290px",
    side: "left",
    label: "Rating",
    note: "Opens only after a download, so every star comes from a driver who ran it.",
  },
  {
    x: 3.9,
    y: "336px",
    labelY: "392px",
    side: "left",
    label: "Publish",
    note: "Share your own .svm. Your clean lap goes with it.",
  },
  {
    x: 62.8,
    y: "49px",
    labelY: "30px",
    side: "right",
    label: "Five sorts",
    note: "Fastest lap, recommended, rating, downloads, newest.",
  },
  {
    x: 93.4,
    y: "143px",
    labelY: "160px",
    side: "right",
    label: "Gap to best",
    note: "How far this setup's lap is from the board best.",
  },
  {
    x: 91.6,
    y: "269px",
    labelY: "288px",
    side: "right",
    label: "Get setup",
    note: "One press, straight into LMU's own setup screen.",
  },
];

const CLASSES = [
  {
    name: "Hypercar",
    body: "Look for the Hypercar tag and sort by fastest verified lap for a baseline proved on the track you are about to race. The endurance and kerb-friendly tags help for long stints.",
  },
  {
    name: "LMP2",
    body: "LMP2 setups carry their own class tag. Where the ruleset fixes a setting, the optimiser skips it, so staged changes only touch keys you are allowed to change.",
  },
  {
    name: "LMGT3",
    body: "GT3 setups are tagged with their car and track, each with the clean lap it was driven on and a rating from drivers who downloaded it.",
  },
] as const;

const OPTIMISER_STEPS = [
  {
    title: "Move a slider",
    body: "Each of the ten sliders is an intent, not a single setting. Ask for more front turn-in and the engineer stages a set of related changes, so the balance moves the way you asked instead of one value lurching on its own.",
  },
  {
    title: "Read the preview",
    body: "Every proposed value is staged beside the live one. The preview counts how many settings were staged and how many were left alone.",
  },
  {
    title: "Apply or Revert",
    body: "Apply sends the staged setup to LMU. Revert throws the preview away and leaves the car exactly as it was.",
  },
] as const;

const OPTIMISER_SPEC = [
  ["Intent sliders", "10"],
  ["Examples", "Turn-in · traction · braking · kerbs"],
  ["Works on", "Real keys on the current car"],
  ["Ruleset-fixed settings", "Skipped"],
  ["Not on this car", "Skipped"],
  ["Reaches LMU", "On Apply only"],
  ["Revert", "Discards the preview"],
] as const;

const INSTALL_STEPS = [
  {
    title: "Open the setup workshop",
    body: "It is in the Apex AIO control panel, beside the live garage editor and your setup library.",
  },
  {
    title: "Find a setup",
    body: "Community setups are tagged by track, car, class and handling. Sort by fastest verified lap or rating.",
  },
  {
    title: "Get setup",
    body: "One press sends it into LMU's own setup screen. Nothing to copy into a folder by hand.",
  },
  {
    title: "Drive it, then rate it",
    body: "Ratings open once you have downloaded it. If it needs tuning for your style, the optimiser is on the same screen.",
  },
] as const;

const SETUPS_REVIEW = AIO_REVIEWS.find((review) => review.author === "Timmy P");

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
            driven on. Alongside them: a live LMU setup editor, and a setup optimiser that turns
            &ldquo;more turn-in&rdquo; into real changes for the car you are in. Setups go straight
            into the game&apos;s own setup screen, your .svm files stay in a private library, and
            there is no per-setup charge.
          </>
        }
        stats={[
          { value: "10", label: "Intent sliders" },
          { value: "6", label: "Garage pages, one panel" },
          { value: "5", label: "Ways to sort" },
        ]}
        points={[
          "Community setups included",
          "Ranked by verified clean lap",
          "Nothing applied until you press Apply",
        ]}
        visual={<SetupOptimiserMock />}
        frame={false}
      />

      {/* 01 · Community setups: the browser, drawn up as a teardown */}
      <section id="community-setups" className="container-rail scroll-mt-36 py-20">
        <SectionHeading
          index="01"
          label="Community setups"
          title="Free LMU community setups, ranked by verified lap"
          lead="Start from a setup another LMU driver has already proved on track instead of buying a pack blind. Each shared setup is linked to the fastest verified clean lap driven on it, so you can see what it has done before you download it."
        />

        <Reveal>
          <AnnotatedFigure callouts={BROWSER_CALLOUTS}>
            <SetupBrowserMock />
          </AnnotatedFigure>
        </Reveal>

        <div className="mt-12 grid gap-6 border-t border-line pt-8 text-muted lg:grid-cols-2 lg:gap-12">
          <p>
            Publishing is the same flow in reverse. Share an .svm setup with its track, car, class
            and handling tags, and the clean lap you drove on it goes with it.
          </p>
          <p>
            Publishing and downloading are part of the app. There is no per-setup charge and no
            separate pack to buy.
          </p>
        </div>
      </section>

      {/* 02 · Classes: a spec sheet, one row per class */}
      <section id="classes" className="scroll-mt-36 border-y border-line bg-surface/30 py-20">
        <div className="container-rail">
          <SectionHeading
            index="02"
            label="Hypercar · LMP2 · LMGT3"
            title="LMU setups for every class"
            lead="Class, car and track are tags on every community setup, so LMU Hypercar setups, LMP2 setups and GT3 setups come from one tagged list. The optimiser works from the setup keys on the car you are sitting in, so it follows whichever class you race."
          />
          <div className="border-t border-line">
            {CLASSES.map((c) => (
              <Reveal key={c.name}>
                <div className="grid gap-3 border-b border-line py-7 md:grid-cols-[16rem_1fr] md:gap-10">
                  <p
                    aria-hidden
                    className="font-mono text-3xl font-semibold uppercase tracking-wider text-ink sm:text-4xl"
                  >
                    {c.name}
                  </p>
                  <div>
                    <h3 className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan">
                      LMU {c.name} setups
                    </h3>
                    <p className="mt-2 max-w-2xl text-muted">{c.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 03 · Optimiser: the sequence on the left, the spec on the right */}
      <section id="optimiser" className="container-rail scroll-mt-36 py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <SectionHeading
              index="03"
              label="Setup optimiser"
              title="The LMU setup optimiser: tell it what the car should do"
              lead="You know how the car feels. You shouldn't need to know which five clicks fix it."
            />
            <p className="-mt-4 max-w-2xl text-lg leading-relaxed text-muted">
              Ask for more front turn-in, better rear traction, braking stability or compliance over
              the kerbs. The Race engineer turns that into balanced setup changes across the real
              setup keys on the car you are driving, and stages them for you to check before
              anything reaches the garage.
            </p>

            <ol className="mt-10 space-y-8">
              {OPTIMISER_STEPS.map((step, i) => (
                <li key={step.title} className="grid grid-cols-[3rem_1fr] gap-4">
                  <span className="font-mono text-2xl font-semibold tabular-nums text-subtle">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="border-t border-line pt-3">
                    <h3 className="font-display text-xl font-bold uppercase tracking-wide text-ink">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-muted">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <Reveal delay={120} className="lg:col-span-5 lg:pt-24">
            <div className="border border-line bg-base/60">
              <p className="border-b border-line px-4 py-3 font-mono text-[10px] uppercase tracking-[0.24em] text-subtle">
                Optimiser · spec
              </p>
              <dl>
                {OPTIMISER_SPEC.map(([label, value]) => (
                  <div
                    key={label}
                    className="grid grid-cols-[1fr_auto] items-baseline gap-4 border-b border-line/70 px-4 py-3 last:border-0"
                  >
                    <dt className="text-sm text-muted">{label}</dt>
                    <dd className="text-right font-mono text-sm tabular-nums text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <p className="mt-4 text-sm text-subtle">
              This is intent-based setup engineering. It makes no promise about lap time.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 04 · Editor and library: one big number, then two columns of prose */}
      <section id="editor" className="scroll-mt-36 border-y border-line bg-surface/30 py-20">
        <div className="container-rail grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-4">
            <div className="border-l-2 border-cyan pl-6">
              <p className="font-mono text-[8rem] font-semibold leading-none tabular-nums text-ink sm:text-[10rem]">
                6
              </p>
              <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.24em] text-subtle">
                LMU garage pages, in one panel
              </p>
            </div>
          </Reveal>

          <div className="lg:col-span-8">
            <SectionHeading
              index="04"
              label="Editor · Library"
              title="A live LMU setup editor, and your own setup library"
            />
            <div className="grid gap-10 md:grid-cols-2">
              <div>
                <h3 className="font-display text-xl font-bold uppercase tracking-wide text-ink">
                  Live garage editor
                </h3>
                <p className="mt-3 text-muted">
                  Brake balance, ducts, wing, anti-roll bars: every garage setting, edited from the
                  Apex AIO panel instead of the garage menus. Changes you make by hand land in the
                  car instantly.
                </p>
                <p className="mt-3 text-muted">
                  Settings fixed by the ruleset are marked and left alone. The optimiser works on
                  the same screen, so its staged changes sit beside the live values.
                </p>
              </div>
              <div>
                <h3 className="font-display text-xl font-bold uppercase tracking-wide text-ink">
                  Private setup library
                </h3>
                <p className="mt-3 text-muted">
                  Named, tagged copies of real .svm files, kept where LMU can&apos;t overwrite them.
                  A qualifying setup, a wet race setup, the Spa setup that stopped the rear stepping
                  out.
                </p>
                <p className="mt-3 text-muted">
                  They are genuine LMU setups, not a proprietary format, so any of them can be
                  published to the community with its clean lap attached.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* A member, in their own words */}
      {SETUPS_REVIEW && (
        <section aria-label="Member review" className="container-rail py-20">
          <figure className="grid gap-6 lg:grid-cols-12">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-subtle lg:col-span-3 lg:pt-3">
              Member review
            </p>
            <div className="lg:col-span-9">
              <blockquote className="font-display text-3xl font-bold uppercase leading-tight tracking-wide text-ink sm:text-4xl">
                &ldquo;{SETUPS_REVIEW.body}&rdquo;
              </blockquote>
              <figcaption className="mt-5 font-mono text-xs uppercase tracking-[0.2em] text-subtle">
                {SETUPS_REVIEW.author} · {SETUPS_REVIEW.context}
              </figcaption>
            </div>
          </figure>
        </section>
      )}

      {/* 05 · Install: four steps on one line */}
      <section id="install" className="scroll-mt-36 border-t border-line py-20">
        <div className="container-rail">
          <SectionHeading
            index="05"
            label="Install"
            title="How to install LMU setups in one click"
            lead="Installing an LMU setup usually means downloading an .svm file and working out which folder it belongs in. Apex AIO sends it straight into LMU's own setup screen."
          />

          <ol className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {INSTALL_STEPS.map((step, i) => (
              <li key={step.title} className="relative border-t border-line pt-6">
                <span
                  aria-hidden
                  className="absolute -top-[5px] left-0 h-[9px] w-[9px] rounded-full border border-cyan bg-base"
                />
                <span className="font-mono text-[11px] tabular-nums tracking-[0.24em] text-cyan">
                  STEP {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-xl font-bold uppercase tracking-wide text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-muted">{step.body}</p>
              </li>
            ))}
          </ol>

          <p className="mt-14 max-w-3xl text-sm text-subtle">
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
            </Link>
            . One subscription,{" "}
            <Link href="/apex-overlay-system#pricing" className="text-cyan hover:underline">
              {priceDisplay} a month
            </Link>
            , everything included. Setup features are LMU-only, because rFactor 2 doesn&apos;t
            publish the data they need.
          </p>
        </div>
      </section>

      <AioFaq items={[...getAioFaq("setups"), ...PAGE_FAQ]} heading="LMU setups: questions" />

      <AioRelatedPages current="setups" />

      <AioTrialCta
        body={`Download community setups with verified lap times, tune them with the optimiser and keep them in your library. The whole setup workshop is in the ${trialDays}-day free trial.`}
      />
    </>
  );
}
