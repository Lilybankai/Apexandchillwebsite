import { CheckCircle2, Gauge, HardDrive, LineChart, Map as MapIcon, Timer } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { ReviewLapMock, ReviewSessionMock } from "@/components/overlay/ReviewMocks";

/**
 * Review — the newest module, and the one that needs showing rather than
 * describing. Two sections: the session, and then one lap inside it, each
 * against a working rebuild of the tab's own panels.
 */

const SESSION_POINTS = [
  "Apex has written a file for every lap since the day you installed it. Nothing is uploaded, nothing needs an account, and nothing is thrown away.",
  "Optimal lap is your own best sector 1, 2 and 3 added together — a lap you have already driven in pieces. Untapped is the time on the table before you change anything about the car.",
  "Consistency leads with the real spread in seconds. ±0.48 s is something you can go and work on; 84% is a score.",
  "A lap that broke the clean rule still appears, with the reason printed on it — “2 laps lost to track limits”, not a percentage that quietly swallowed them.",
] as const;

const LAP_POINTS = [
  "Speed, throttle and brake, gear and steering, all drawn against distance round the circuit rather than against time — which is what makes two laps line up at the same corner instead of drifting apart.",
  "One cursor crosses every chart at once, reading out distance, time, speed, both pedals, gear, steering and G at that exact point, while the car moves round the circuit beside it.",
  "Pick any other lap of the session and it is laid underneath yours, dashed, in each channel’s own colour, with a delta band captioned slower above, faster below.",
  "Amber and violet ticks under the pedals show where traction control and ABS stepped in. V-max is there too, which nothing in Apex could tell you before.",
] as const;

const CALLOUTS = [
  {
    icon: HardDrive,
    title: "Already yours",
    body: "Every session you have ever driven is in it the first time you open the tab — the files were always there.",
  },
  {
    icon: LineChart,
    title: "Against distance",
    body: "Two laps meet at the same corner, so the comparison is a corner, not an average.",
  },
  {
    icon: MapIcon,
    title: "In plan, to scale",
    body: "Both axes share one scale, so two racing lines side by side can actually be believed.",
  },
  {
    icon: Timer,
    title: "Down to 500 m",
    body: "A chip per stretch of road turns “0.7 s slower” into “0.18 s slower into turn 11”.",
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

export function AioReviewTab() {
  return (
    <>
      {/* ── The session ──────────────────────────────────────────────────── */}
      <section id="review" className="scroll-mt-24 border-y border-line bg-surface/30 py-16">
        <div className="container-rail">
          <div className="mb-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <Reveal>
              <span className="kicker mb-4">Review · New</span>
              <h2 className="text-4xl font-bold text-ink sm:text-5xl">
                Every session you have driven is{" "}
                <span className="text-gradient">already in here</span>
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="text-lg text-muted">
                A new tab that reads back the lap files Apex has been writing since the day you
                installed it. Sessions down the left, and on the right the one you picked — the
                report at the top of the page rather than behind a button, because it is the thing
                you came for.
              </p>
              <Points points={SESSION_POINTS} />
            </Reveal>
          </div>

          <Reveal>
            <ReviewSessionMock />
          </Reveal>

          <p className="mt-4 text-center text-xs text-subtle">
            Local, offline and free of accounts — the tab works with the internet unplugged.
          </p>
        </div>
      </section>

      {/* ── One lap ──────────────────────────────────────────────────────── */}
      <section className="container-rail py-16">
        <div className="mb-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <Reveal>
            <span className="kicker mb-4">Review · One lap</span>
            <h2 className="text-4xl font-bold text-ink sm:text-5xl">
              And the lap you are <span className="text-gradient">chasing</span>
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-lg text-muted">
              Any lap with telemetry behind it opens into its own view, with a second lap laid
              underneath it. Under the charts, one chip per stretch of road of about 500 m carries
              what that stretch cost or gained — which is the difference between knowing you were
              slower and knowing where.
            </p>
            <Points points={LAP_POINTS} />
          </Reveal>
        </div>

        <Reveal>
          <ReviewLapMock />
        </Reveal>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CALLOUTS.map((item, index) => (
            <Reveal key={item.title} delay={index * 90} className="h-full">
              <div className="h-full rounded-card border border-line bg-surface/40 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-cyan/40">
                <item.icon aria-hidden size={18} className="text-cyan" />
                <p className="mt-3 font-display text-sm uppercase tracking-wide text-ink">
                  {item.title}
                </p>
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
      </section>
    </>
  );
}
