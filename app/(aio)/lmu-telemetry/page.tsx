import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { RefPaceMock } from "@/components/overlay/OverlayMocks";
import { ReviewLapMock, ReviewSessionMock } from "@/components/overlay/ReviewMocks";
import { RV_ABS, RV_CURSOR, RV_MICRO, RV_SAMPLES } from "@/components/overlay/reviewTraces";
import { AioPageHero } from "@/components/aio/AioPageHero";
import { AioFaq } from "@/components/aio/AioFaq";
import { AioRelatedPages } from "@/components/aio/AioRelatedPages";
import { AioTrialCta } from "@/components/aio/AioTrialCta";
import { JsonLd } from "@/components/aio/JsonLd";
import { SectionHeading } from "@/components/aio/SectionHeading";
import { AnnotatedFigure, type Callout } from "@/components/aio/setups/AnnotatedFigure";
import { getAioFaq, type AioFaqItem } from "@/lib/aio-faq";
import { buildAioBreadcrumbJsonLd, buildAioPageMetadata } from "@/lib/aio-seo";

export const metadata = buildAioPageMetadata("telemetry");

/** The trial buttons read the live release, so the page refreshes with it. */
export const revalidate = 1800;

const OHNE_SPEED_URL = "https://www.youtube.com/@ohne_speed";

/** New questions this page answers, on top of the ones it owns in the bank. */
const PAGE_FAQ: AioFaqItem[] = [
  {
    q: "What is the optimal lap in LMU telemetry?",
    page: "telemetry",
    a: "In Review, your optimal lap is your own best sector 1, 2 and 3 of the session added together: a lap you have already driven, in pieces. The untapped figure beside it is your best actual lap minus that optimal lap, which is the time on the table before you change anything about the car.",
  },
  {
    q: "How do I know how fast I am in LMU compared to the aliens?",
    page: "telemetry",
    a: "The Reference Pace widget turns your best lap into a live percentage of alien pace for your exact class and layout, using Ohne Speed's reference times, and places it on a six-band ladder: Alien, Competitive, Good, Midpack, Tail-ender and Offline. A 'Good' in GT3 at Spa means Good, in GT3, at Spa, not a global average. The marker climbs mid-session as soon as you set a better lap.",
  },
  {
    q: "Which laps count on the LMU league leaderboards?",
    page: "telemetry",
    a: "Every completed lap is logged locally with the app's own clean-lap rule, then synced to the league board, which ranks every member's best clean lap and can be filtered by track, class and car, with your own row marked. Practice and qualifying laps count too. Leaderboard sync is one of the few things that needs the network; Review itself works offline.",
  },
  {
    q: "Can I see where traction control and ABS stepped in on a lap?",
    page: "telemetry",
    a: "Yes. In a lap's view, amber and violet ticks under the pedal trace show where traction control and ABS intervened, and V-max is shown too. One cursor crosses every chart at once, reading out distance, time, speed, both pedals, gear, steering and G at that exact point, while the car moves round the circuit map beside it.",
  },
];

const REVIEW_SPEC = [
  ["Recorded", "Every lap since install"],
  ["Set-up needed", "None"],
  ["Stored", "Your own disk"],
  ["Account", "Not needed"],
  ["Upload", "None"],
  ["Network", "Works offline"],
] as const;

/** The session report's four readings, in the order the report sets them. */
const REPORT_TERMS = [
  {
    term: "Optimal lap",
    body: "Your own best sector 1, 2 and 3 added together. A lap you have already driven, in pieces.",
  },
  {
    term: "Untapped",
    body: "Best lap minus optimal lap: the time on the table before you change anything about the car.",
  },
  {
    term: "Consistency",
    body: "Leads with the real spread of your clean laps in seconds (±0.48 s, say) rather than a percentage score.",
  },
  {
    term: "Clean driving",
    body: "What the rest was lost to. A lap that broke the clean rule still appears, with the reason printed on it: “2 laps lost to track limits”.",
  },
] as const;

const STINT_BLOCKS = [
  {
    title: "The lap chart, stints marked",
    body: "Every lap of the session drawn as one chart with the stints marked, so the shape of the session reads at a glance.",
  },
  {
    title: "Your 30-day best",
    body: "Today's session read against your best here over the last 30 days, not on its own.",
  },
  {
    title: "Tyre wear, lap by lap",
    body: "What a stint cost the rubber, as a number per lap.",
  },
  {
    title: "A sheet per stint",
    body: "Sectors, lap time, gap to best, fuel, virtual energy, tyre temperatures and wear on every lap.",
  },
] as const;

/** Timing-screen colours, as the stint sheet uses them. */
const SHEET_KEY = [
  { swatch: "bg-flag-purple", text: "text-flag-purple", label: "Session best" },
  { swatch: "bg-success", text: "text-success", label: "Stint best" },
  { swatch: "bg-flag-amber", text: "text-flag-amber", label: "Real time, broke the clean rule" },
] as const;

/*
 * Pins on the lap-study mock, measured against its layout at `xl`, where the
 * figure is always 1024px wide (the 1216px rail less one 192px gutter). The
 * three header rows come to 120px; under them the channel bands have fixed
 * heights (54, 86, 72, 46 and 50px, each with a 1px rule). Horizontal
 * positions on the charts come from the same traces the mock draws, so the
 * cursor, ABS and chip pins land on the real marks.
 */
const pct = (i: number) => (i / (RV_SAMPLES - 1)) * 100;
const FIRST_ABS = Math.max(
  0,
  RV_ABS.findIndex((on) => on === 1),
);
const WORST_CHIP = RV_MICRO.reduce(
  (worst, seg, i) => (seg.delta > RV_MICRO[worst].delta ? i : worst),
  0,
);
const CHIP_WIDTH = (1000 - (RV_MICRO.length - 1) * 4) / RV_MICRO.length;

const LAP_CALLOUTS: Callout[] = [
  {
    x: "185px",
    y: "44px",
    labelY: "30px",
    side: "right",
    label: "Compare lap",
    note: "Any other lap of the session, laid under yours, dashed.",
  },
  {
    x: "40px",
    y: "87px",
    labelY: "104px",
    side: "right",
    label: "Readout",
    note: "Distance, time, speed, both pedals, gear, steering and G.",
  },
  {
    x: 40,
    y: "147px",
    labelY: "178px",
    side: "right",
    label: "Delta",
    note: "Slower above the line, faster below.",
  },
  {
    x: pct(RV_CURSOR),
    y: "186px",
    labelY: "248px",
    side: "right",
    label: "One cursor",
    note: "Crosses every chart at the same point, and moves the car on the map.",
  },
  {
    x: pct(FIRST_ABS),
    y: "314px",
    labelY: "322px",
    side: "right",
    label: "TC and ABS",
    note: "Amber ticks for traction control, violet for ABS.",
  },
  {
    x: `${(12 + WORST_CHIP * (CHIP_WIDTH + 4) + CHIP_WIDTH / 2).toFixed(1)}px`,
    y: "432px",
    labelY: "420px",
    side: "right",
    label: "500 m chips",
    note: "What each stretch of road cost or gained.",
  },
  {
    x: "152px",
    y: "843px",
    labelY: "824px",
    side: "right",
    label: "To scale",
    note: "Both axes of the map share one scale, so two lines side by side can be believed.",
  },
];

const PACE_SPEC = [
  ["Bands", "6 · Alien to Offline"],
  ["Measured against", "Your class and layout"],
  ["Updates", "Live, mid-session"],
  ["Feeds", "Pace rank · league boards"],
  ["Reference times", "Ohne Speed"],
] as const;

const LEAGUE_STEPS = [
  {
    title: "Logged",
    body: "Every completed lap is logged on your PC and judged by the app's own clean-lap rule.",
  },
  {
    title: "Synced",
    body: "Clean laps sync to the league board. Practice and qualifying count too. This is one of the few parts that needs the network.",
  },
  {
    title: "Ranked",
    body: "Every member's best clean lap, filterable by track, class and car, with your own row marked. The reference-pace ladder sets your Pace rank.",
  },
] as const;

export default function LmuTelemetryPage() {
  return (
    <>
      <JsonLd data={buildAioBreadcrumbJsonLd("telemetry")} />

      <AioPageHero
        kicker="Apex AIO · Review · Reference Pace"
        title={
          <>
            LMU Telemetry <span className="text-gradient">&amp; Lap Comparison</span>
          </>
        }
        lead={
          <>
            Le Mans Ultimate telemetry analysis that is already waiting for you. Apex AIO writes a
            file for every lap you drive, and its Review tab reads them all back: a session report
            with your <strong className="text-ink">optimal lap</strong> and the time left on the
            table, <strong className="text-ink">lap comparison</strong> traces of speed, pedals,
            gear and steering against distance, and your pace measured against LMU reference lap
            times from the aliens. All on your own PC.
          </>
        }
        stats={[
          { value: "6", label: "Pace bands" },
          { value: "~500 m", label: "Per delta chip" },
          { value: "0", label: "Uploads" },
        ]}
        points={[
          "Every lap since install, already recorded",
          "Local and offline, no account",
          "Pace measured against Ohne Speed's alien times",
        ]}
        visual={<RefPaceMock />}
        visualCaption="Overlay · Reference Pace"
      />

      {/* 01 · Review: prose on the left, the facts as a spec sheet on the right */}
      <section id="review" className="container-rail scroll-mt-36 py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <SectionHeading
              index="01"
              label="Review · How it works"
              title="LMU telemetry analysis of every lap you've driven"
            />
            <div className="max-w-2xl space-y-4 text-lg leading-relaxed text-muted">
              <p>
                Review is a tab inside Apex AIO. It reads back the lap files the app has written
                since the day you installed it, so the first time you open it your whole history is
                already there. Sessions run down the left; the one you picked fills the right.
              </p>
              <p>
                The strip across the top counts everything you have driven on that PC: laps and
                clean laps, distance, hours at the wheel, circuits, cars and sessions.
              </p>
              <p>
                The{" "}
                <Link href="/lmu-overlays" className="text-cyan hover:underline">
                  overlays
                </Link>{" "}
                and the{" "}
                <Link href="/lmu-race-engineer" className="text-cyan hover:underline">
                  voice race engineer
                </Link>{" "}
                cover the lap you are driving. Review is where you sit down afterwards and find out
                where the time went.
              </p>
            </div>
          </div>

          <Reveal delay={120} className="lg:col-span-5 lg:pt-24">
            <div className="border border-line bg-base/70">
              <p className="border-b border-line px-4 py-3 font-mono text-[10px] uppercase tracking-[0.24em] text-subtle">
                Review · spec
              </p>
              <dl>
                {REVIEW_SPEC.map(([label, value]) => (
                  <div
                    key={label}
                    className="grid grid-cols-[1fr_auto] items-baseline gap-4 border-b border-line/70 px-4 py-3 last:border-0"
                  >
                    <dt className="text-sm text-muted">{label}</dt>
                    <dd className="text-right font-mono text-sm text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 02 · Session report: the mock wide, then the four readings and the sheet */}
      <section
        id="session-report"
        className="scroll-mt-36 border-y border-line bg-surface/30 py-20"
      >
        <div className="container-rail">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-4">
              <SectionHeading
                index="02"
                label="Review · The session"
                title="Session reports: your optimal lap and the time left on the table"
                lead="Pick a session and the report comes first, at the top of the page rather than behind a button."
              />
              <dl className="border-t border-line">
                {REPORT_TERMS.map((item) => (
                  <div key={item.term} className="border-b border-line py-4">
                    <dt className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan">
                      {item.term}
                    </dt>
                    <dd className="mt-1.5 text-sm text-muted">{item.body}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <Reveal className="lg:col-span-8 lg:pt-2">
              <ReviewSessionMock />
            </Reveal>
          </div>

          <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-ink">
                LMU stint analysis, under the report
              </h3>
              <ul className="mt-5 space-y-3 font-mono text-xs uppercase tracking-[0.18em]">
                {SHEET_KEY.map((key) => (
                  <li key={key.label} className="flex items-center gap-3">
                    <span aria-hidden className={`h-3 w-3 rounded-sm ${key.swatch}`} />
                    <span className={key.text}>{key.label}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-subtle">
                The sheet colours laps and sectors the way a timing screen does.
              </p>
            </div>
            <ol className="lg:col-span-7">
              {STINT_BLOCKS.map((block, i) => (
                <li
                  key={block.title}
                  className="grid grid-cols-[2.5rem_1fr] gap-3 border-t border-line py-4 last:border-b"
                >
                  <span className="font-mono text-xs tabular-nums text-subtle">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h4 className="font-display text-base font-semibold uppercase tracking-wide text-ink">
                      {block.title}
                    </h4>
                    <p className="mt-1 text-sm text-muted">{block.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <p className="mt-10 text-sm text-subtle">
            Running an endurance crew? The live side of this (fuel strategy, per-corner tyres and
            lap trends while the stint is still going) is on the{" "}
            <Link href="/lmu-pit-wall" className="text-cyan hover:underline">
              team pit wall
            </Link>
            .
          </p>
        </div>
      </section>

      {/* 03 · Lap comparison: the lap view, drawn up as a teardown */}
      <section id="lap-comparison" className="container-rail scroll-mt-36 py-20">
        <SectionHeading
          index="03"
          label="Review · One lap"
          title="LMU lap comparison, corner by corner"
          lead={
            <>
              Any lap with telemetry behind it opens into its own view, with a second lap laid
              underneath. Every channel is drawn against distance round the circuit rather than
              against time, so two laps meet at the same corner. Under the charts, one chip per
              stretch of road of about 500 m carries what that stretch cost or gained: the
              difference between &ldquo;seven tenths slower&rdquo; and &ldquo;0.18 s slower into
              turn 3&rdquo;.
            </>
          }
        />

        <Reveal>
          <AnnotatedFigure callouts={LAP_CALLOUTS}>
            <ReviewLapMock />
          </AnnotatedFigure>
        </Reveal>

        <div className="mt-12 grid gap-6 border-t border-line pt-8 text-muted lg:grid-cols-2 lg:gap-12">
          <p className="text-sm text-subtle">
            The driven line only exists on laps recorded by a build that captures it. An older lap
            still opens and the car follows the centreline; everything driven since draws the real
            line.
          </p>
          <p>
            Found the corner? If the answer is the car rather than the driver, the{" "}
            <Link href="/lmu-setups" className="text-cyan hover:underline">
              setup optimiser and community setups
            </Link>{" "}
            are in the same app, and every shared setup can carry the fastest verified clean lap
            driven on it.
          </p>
        </div>
      </section>

      {/* 04 · Reference pace: prose and spec on the left, the widget large on the right */}
      <section
        id="reference-pace"
        className="scroll-mt-36 border-y border-line bg-surface/30 py-20"
      >
        <div className="container-rail grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-7">
            <SectionHeading
              index="04"
              label="Reference pace · The Ohne Speed ladder"
              title="How fast are you, really? LMU reference pace against the aliens"
            />
            <div className="max-w-2xl space-y-4 text-lg leading-relaxed text-muted">
              <p>
                A delta bar tells you about the lap you just did. Reference Pace tells you what it
                means. Your best lap becomes a live percentage of{" "}
                <strong className="text-ink">alien pace for your exact class and layout</strong>,
                placed on a six-band ladder from Alien to Offline. A &lsquo;Good&rsquo; in GT3 at
                Spa means Good, in GT3, at Spa.
              </p>
              <p>
                The LMU reference lap times are{" "}
                <a
                  href={OHNE_SPEED_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-cyan hover:underline"
                >
                  Ohne Speed
                </a>
                &apos;s: the benchmark set the LMU community measures itself against, with laps
                contributed by beAlien, Go and Hymo. The app reads them and credits them in the
                widget whenever a score is on screen.
              </p>
            </div>

            <dl className="mt-8 max-w-2xl border-t border-line">
              {PACE_SPEC.map(([label, value]) => (
                <div
                  key={label}
                  className="grid grid-cols-[1fr_auto] items-baseline gap-4 border-b border-line py-3"
                >
                  <dt className="text-sm text-muted">{label}</dt>
                  <dd className="text-right font-mono text-sm text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <Reveal delay={100} className="lg:col-span-5">
            <RefPaceMock large />
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">
              The marker climbs mid-session as soon as you set a better lap.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 05 · Leaderboards: three stages, left to right */}
      <section id="leaderboards" className="container-rail scroll-mt-36 py-20">
        <SectionHeading
          index="05"
          label="League leaderboards"
          title="League leaderboards from clean laps"
          lead="Every completed lap is logged locally with the app's own clean-lap rule, then synced to the league board: every member's best clean lap, ranked, with your own row marked."
        />
        <ol className="grid gap-px overflow-hidden border border-line bg-line md:grid-cols-3">
          {LEAGUE_STEPS.map((step, i) => (
            <li key={step.title} className="bg-base p-6">
              <div className="flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.24em]">
                <span className="tabular-nums text-cyan">{String(i + 1).padStart(2, "0")}</span>
                {i < LEAGUE_STEPS.length - 1 && (
                  <span aria-hidden className="hidden text-subtle md:inline">
                    →
                  </span>
                )}
              </div>
              <h3 className="mt-4 font-display text-2xl font-bold uppercase tracking-wide text-ink">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <AioFaq items={[...getAioFaq("telemetry"), ...PAGE_FAQ]} className="border-t border-line" />

      {/* ── Credit ───────────────────────────────────────────────────────── */}
      <section className="container-rail py-4">
        <Card variant="outline" className="p-6">
          <p className="text-sm text-subtle">
            The reference lap times and the Alien → Offline pace bands behind the Reference Pace
            widget are{" "}
            <a
              href={OHNE_SPEED_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan hover:underline"
            >
              Ohne Speed
            </a>
            &apos;s work, with lap times contributed by beAlien, Go and Hymo. The Apex AIO System
            only reads them, and credits them in the app wherever a score is shown.
          </p>
        </Card>
      </section>

      <AioRelatedPages current="telemetry" />

      <AioTrialCta body="Review, Reference Pace and the league leaderboards come with every widget, the race engineer, setups and the team pit wall. One subscription, everything included." />
    </>
  );
}
