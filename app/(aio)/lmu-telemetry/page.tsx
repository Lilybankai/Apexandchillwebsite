import Link from "next/link";
import {
  BadgeCheck,
  CheckCircle2,
  Filter,
  Gauge,
  HardDrive,
  History,
  LineChart,
  Map as MapIcon,
  Timer,
  Trophy,
  WifiOff,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { RefPaceMock } from "@/components/overlay/OverlayMocks";
import { ReviewLapMock, ReviewSessionMock } from "@/components/overlay/ReviewMocks";
import { AioPageHero } from "@/components/aio/AioPageHero";
import { AioFaq } from "@/components/aio/AioFaq";
import { AioRelatedPages } from "@/components/aio/AioRelatedPages";
import { AioTrialCta } from "@/components/aio/AioTrialCta";
import { JsonLd } from "@/components/aio/JsonLd";
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
    a: "In Review, your optimal lap is your own best sector 1, 2 and 3 of the session added together — a lap you have already driven, just in pieces. The untapped figure beside it is your best actual lap minus that optimal lap: the time on the table before you change anything about the car.",
  },
  {
    q: "How do I know how fast I am in LMU compared to the aliens?",
    page: "telemetry",
    a: "The Reference Pace widget turns your best lap into a live percentage of alien pace for your exact class and layout, using Ohne Speed's reference times, and places it on a six-band ladder: Alien, Competitive, Good, Midpack, Tail-ender and Offline. A 'Good' in GT3 at Spa means Good, in GT3, at Spa — not a global average — and the marker climbs mid-session as soon as you set a better lap.",
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

const HERO_POINTS = [
  "Every lap since install, already recorded",
  "No account, no upload, works offline",
  "Pace measured against Ohne Speed's alien times",
] as const;

const REPORT_POINTS = [
  "Optimal lap is your own best sector 1, 2 and 3 added together — a lap you have already driven in pieces. Untapped is the time on the table before you change anything about the car.",
  "Consistency leads with the real spread of your clean laps in seconds. ±0.48 s is something you can go and work on; 84% is a score.",
  "Clean driving says what the rest was lost to. A lap that broke the clean rule still appears, with the reason printed on it — “2 laps lost to track limits”, not a percentage that quietly swallowed them.",
  "The report sits at the top of the page rather than behind a button, because it is the thing you came for.",
] as const;

const SESSION_BLOCKS = [
  {
    title: "The lap chart, with stints marked",
    body: "Every lap of the session drawn as one chart, with the stints marked on it, so the shape of the whole session reads at a glance.",
  },
  {
    title: "Your 30-day best",
    body: "Your best here over the last 30 days, so today's session is read against your recent form rather than on its own.",
  },
  {
    title: "Tyre wear, lap by lap",
    body: "Tyre wear lap by lap across the session, so what a stint cost the rubber is a number rather than a guess.",
  },
  {
    title: "A sheet per stint",
    body: "A card for every stint with the full sheet: sectors, lap time, gap to best, fuel, virtual energy, tyre temperatures and wear on every lap. Violet is the session's best, green the stint's best, amber a lap with a real time that broke the clean rule.",
  },
] as const;

const LAP_POINTS = [
  "Speed, throttle and brake, gear and steering, all drawn against distance round the circuit rather than against time — which is what makes two laps line up at the same corner instead of drifting apart.",
  "Pick any other lap of the session and it is laid underneath yours, dashed, in each channel’s own colour, with a delta band captioned slower above, faster below.",
  "One cursor crosses every chart at once, reading out distance, time, speed, both pedals, gear, steering and G at that exact point, while the car moves round the circuit beside it.",
  "Amber and violet ticks under the pedals show where traction control and ABS stepped in. V-max is there too.",
] as const;

const LAP_CALLOUTS = [
  {
    icon: LineChart,
    title: "Against distance",
    body: "Two laps meet at the same corner, so the comparison is a corner, not an average.",
  },
  {
    icon: MapIcon,
    title: "In plan, to scale",
    body: "Both axes of the circuit map share one scale, so two racing lines side by side can actually be believed.",
  },
  {
    icon: Timer,
    title: "Down to 500 m",
    body: "A chip per stretch of road turns “0.7 s slower” into “0.18 s slower into turn 11”.",
  },
] as const;

const PACE_CARDS = [
  ["Six honest bands", "Alien → Competitive → Good → Midpack → Tail-ender → Offline. No participation trophies."],
  ["Class- and layout-specific", "A 'Good' in GT3 at Spa means Good, in GT3, at Spa — not a global average."],
  ["It moves as you do", "Set a better lap and the marker climbs mid-session, live."],
  ["It feeds the league", "The same ladder drives your Pace rank on the dashboard and the league leaderboards."],
] as const;

const HOW_IT_WORKS = [
  {
    icon: HardDrive,
    title: "Already yours",
    body: "Apex has written a file for every lap since the day you installed it. The first time you open Review, every session you have ever driven is already in it — nothing to set up, nothing to import.",
  },
  {
    icon: WifiOff,
    title: "Local and offline",
    body: "Review reads those files off your own disk. No account, no upload, no cloud, and nothing thrown away — the tab works with the internet unplugged.",
  },
  {
    icon: History,
    title: "Your whole career",
    body: "The strip across the top counts everything you have driven on that PC: laps and clean laps, distance, hours at the wheel, circuits, cars and sessions.",
  },
] as const;

function Points({ points }: { points: readonly string[] }) {
  return (
    <ul className="mt-6 space-y-3">
      {points.map((point) => (
        <li key={point} className="flex items-start gap-3 text-muted">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success" />
          <span>{point}</span>
        </li>
      ))}
    </ul>
  );
}

export default function LmuTelemetryPage() {
  return (
    <>
      <JsonLd data={buildAioBreadcrumbJsonLd("telemetry")} />

      <AioPageHero
        kicker="Apex AIO · Review & Reference Pace"
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
        points={HERO_POINTS}
        visual={<RefPaceMock />}
      />

      {/* ── Every lap you've ever driven ─────────────────────────────────── */}
      <section id="review" className="container-rail scroll-mt-36 py-16">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <Reveal>
            <span className="kicker mb-4">Review · How it works</span>
            <h2 className="text-4xl font-bold text-ink sm:text-5xl">
              LMU telemetry analysis — <span className="text-gradient">every lap you&apos;ve ever driven</span>
            </h2>
            <p className="mt-5 text-lg text-muted">
              There is nothing to set up and nothing to wait for. Review is a tab inside Apex AIO
              that reads back the lap files the app has been writing since the day you installed
              it, so the first time you open it your whole history is already there. Sessions down
              the left, and on the right the one you picked.
            </p>
            <p className="mt-4 text-lg text-muted">
              It sits beside the rest of the app rather than replacing it: the{" "}
              <Link href="/lmu-overlays" className="text-cyan hover:underline">
                overlays
              </Link>{" "}
              and the{" "}
              <Link href="/lmu-race-engineer" className="text-cyan hover:underline">
                voice race engineer
              </Link>{" "}
              cover the lap you are driving; Review is where you sit down afterwards and find out
              where the time went.
            </p>
          </Reveal>
          <div className="grid gap-4">
            {HOW_IT_WORKS.map((item, index) => (
              <Reveal key={item.title} delay={index * 90}>
                <Card variant="default" className="flex items-start gap-4 p-5">
                  <item.icon aria-hidden size={22} className="mt-0.5 shrink-0 text-cyan" />
                  <div>
                    <h3 className="font-display text-base uppercase tracking-wide text-ink">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted">{item.body}</p>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Session reports ──────────────────────────────────────────────── */}
      <section id="session-report" className="scroll-mt-36 border-y border-line bg-surface/30 py-16">
        <div className="container-rail">
          <div className="mb-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <Reveal>
              <span className="kicker mb-4">Review · The session</span>
              <h2 className="text-4xl font-bold text-ink sm:text-5xl">
                Session reports: your optimal lap and{" "}
                <span className="text-gradient">the time left on the table</span>
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="text-lg text-muted">
                Pick a session and the report comes first: your best lap, and then the part that
                matters — the optimal lap from your own best sectors, the untapped time between the
                two, how consistent you were and how clean.
              </p>
              <Points points={REPORT_POINTS} />
            </Reveal>
          </div>

          <Reveal>
            <ReviewSessionMock />
          </Reveal>

          <h3 className="mt-12 text-2xl font-bold text-ink">LMU stint analysis, under the report</h3>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {SESSION_BLOCKS.map((block, index) => (
              <Reveal key={block.title} delay={index * 80} className="h-full">
                <div className="h-full rounded-card border border-line bg-base/50 p-5">
                  <h4 className="font-display text-sm uppercase tracking-wide text-ink">{block.title}</h4>
                  <p className="mt-2 text-sm text-muted">{block.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-6 text-sm text-subtle">
            Running an endurance crew? The live side of this — fuel strategy, per-corner tyres and
            lap trends while the stint is still going — is on the{" "}
            <Link href="/lmu-pit-wall" className="text-cyan hover:underline">
              team pit wall
            </Link>
            .
          </p>
        </div>
      </section>

      {/* ── Lap comparison ───────────────────────────────────────────────── */}
      <section id="lap-comparison" className="container-rail scroll-mt-36 py-16">
        <div className="mb-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <Reveal>
            <span className="kicker mb-4">Review · One lap</span>
            <h2 className="text-4xl font-bold text-ink sm:text-5xl">
              Compare two laps, <span className="text-gradient">corner by corner</span>
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-lg text-muted">
              Any lap with telemetry behind it opens into its own view, with a second lap laid
              underneath it. Under the charts, one chip per stretch of road of about 500 m carries
              what that stretch cost or gained — the difference between &ldquo;I was seven tenths
              slower&rdquo; and &ldquo;I was 0.18 s slower into turn 3&rdquo;.
            </p>
            <Points points={LAP_POINTS} />
          </Reveal>
        </div>

        <Reveal>
          <ReviewLapMock />
        </Reveal>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {LAP_CALLOUTS.map((item, index) => (
            <Reveal key={item.title} delay={index * 90} className="h-full">
              <div className="h-full rounded-card border border-line bg-surface/40 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-cyan/40">
                <item.icon aria-hidden size={18} className="text-cyan" />
                <h3 className="mt-3 font-display text-sm uppercase tracking-wide text-ink">{item.title}</h3>
                <p className="mt-1 text-sm text-subtle">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-card border border-cyan/25 bg-cyan/5 p-4 text-sm text-subtle">
          <Gauge aria-hidden size={18} className="mt-0.5 shrink-0 text-cyan" />
          <span>
            The driven line only exists on laps recorded by a build that captures it. An older lap
            still opens — the car simply follows the centreline — and everything driven since draws
            the real line.
          </span>
        </div>

        <p className="mt-6 text-muted">
          Found the corner? If the answer is the car rather than the driver, the{" "}
          <Link href="/lmu-setups" className="text-cyan hover:underline">
            setup optimiser and community setups
          </Link>{" "}
          are in the same app — and every shared setup can carry the fastest verified clean lap
          driven on it.
        </p>
      </section>

      {/* ── Reference pace ───────────────────────────────────────────────── */}
      <section id="reference-pace" className="scroll-mt-36 border-y border-line bg-surface/30 py-16">
        <div className="container-rail grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <span className="kicker mb-4">Reference pace · the Ohne Speed ladder</span>
            <h2 className="text-4xl font-bold text-ink sm:text-5xl">
              How fast are you, really?{" "}
              <span className="text-gradient">LMU reference pace vs the aliens</span>
            </h2>
            <p className="mt-5 text-lg text-muted">
              A delta bar tells you about the lap you just did. This tells you what it means. Your
              best lap becomes a live percentage of <strong className="text-ink">alien pace for
              your exact class and layout</strong>, placed on a six-band ladder — so &ldquo;am I
              actually quick here?&rdquo; finally has a number.
            </p>
            <p className="mt-4 text-lg text-muted">
              The LMU reference lap times are{" "}
              <a
                href={OHNE_SPEED_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-cyan hover:underline"
              >
                Ohne Speed
              </a>
              &apos;s — the benchmark set the LMU community actually measures itself against, with
              laps contributed by beAlien, Go and Hymo. The app reads them and credits them in the
              widget, every time a score is on screen.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {PACE_CARDS.map(([title, body]) => (
                <div key={title} className="rounded-card border border-line bg-base/50 p-4">
                  <h3 className="font-display text-sm uppercase tracking-wide text-ink">{title}</h3>
                  <p className="mt-1 text-sm text-muted">{body}</p>
                </div>
              ))}
            </div>
          </div>
          <Reveal delay={100}>
            <RefPaceMock large />
          </Reveal>
        </div>
      </section>

      {/* ── League leaderboards ──────────────────────────────────────────── */}
      <section id="leaderboards" className="container-rail scroll-mt-36 py-16">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
            <span className="kicker mb-4">League leaderboards</span>
            <h2 className="text-4xl font-bold text-ink sm:text-5xl">
              League leaderboards <span className="text-gradient">from clean laps</span>
            </h2>
            <p className="mt-5 text-lg text-muted">
              Every completed lap is logged locally with the app&apos;s own clean-lap rule, then
              synced to the league board — every member&apos;s best clean lap, ranked, with your own
              row marked. Practice and qualifying count too.
            </p>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: BadgeCheck,
                title: "Clean laps only",
                body: "Laps are judged by the app's own clean-lap rule before they reach the board.",
              },
              {
                icon: Filter,
                title: "Filter it down",
                body: "Filter the board by track, class and car to see exactly the field you race in.",
              },
              {
                icon: Trophy,
                title: "Your Pace rank",
                body: "The reference-pace ladder drives your Pace rank on the dashboard and the leaderboards.",
              },
            ].map((item, index) => (
              <Reveal key={item.title} delay={index * 90} className="h-full">
                <Card variant="default" className="h-full p-5">
                  <item.icon aria-hidden size={22} className="text-cyan" />
                  <h3 className="mt-3 font-display text-sm uppercase tracking-wide text-ink">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted">{item.body}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
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

      <AioTrialCta body="Review, Reference Pace and the league leaderboards come with every widget, the race engineer, setups and the team pit wall — one subscription, everything included." />
    </>
  );
}
