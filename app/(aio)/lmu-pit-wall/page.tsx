import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CloudSun,
  Fuel,
  Gauge,
  Globe,
  Laptop,
  LineChart,
  Map,
  Quote,
  Radio,
  SlidersHorizontal,
  Smartphone,
  Tablet,
  Timer,
  User,
  Users,
  Wifi,
  Wrench,
} from "lucide-react";
import { AioFaq } from "@/components/aio/AioFaq";
import { AioPageHero } from "@/components/aio/AioPageHero";
import { AioRelatedPages } from "@/components/aio/AioRelatedPages";
import { AioTrialCta } from "@/components/aio/AioTrialCta";
import { JsonLd } from "@/components/aio/JsonLd";
import { TeamPitWallMock } from "@/components/overlay/TeamPitWallMock";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { AIO_PRODUCT, AIO_REVIEWS } from "@/lib/aio";
import { getAioFaq, type AioFaqItem } from "@/lib/aio-faq";
import { buildAioBreadcrumbJsonLd, buildAioPageMetadata } from "@/lib/aio-seo";

export const metadata = buildAioPageMetadata("pit-wall");

/** The trial buttons read the live release. */
export const revalidate = 1800;

const { webBoardsUrl: WEB_BOARDS_URL, webBoardsLabel: WEB_BOARDS_LABEL, priceDisplay: PRICE } =
  AIO_PRODUCT;

/** What sits on the board, panel by panel, as the mock shows it. */
const BOARD_PANELS = [
  {
    icon: Radio,
    title: "Timing",
    body: "The class timing table — last and best laps, the interval ahead and a live “vs me” interval to your own team car, so you can see who you are racing, not just who is on track.",
  },
  {
    icon: Map,
    title: "Track map",
    body: "Every car placed on the circuit, your team car picked out, so the gap in the timing table has a place on the road.",
  },
  {
    icon: Fuel,
    title: "Fuel & energy",
    body: "What is in the tank, what one lap costs and how many laps that buys — and the figure at the flag, so a shortfall shows up as a number long before it shows up as a stopped car.",
  },
  {
    icon: Wrench,
    title: "Strategy to the flag",
    body: "Stops to the finish, the pit window and the save target needed to hit it, replanned from real consumption as the race changes.",
  },
  {
    icon: Gauge,
    title: "Tyres, brakes & car state",
    body: "Per-corner tyre wear and temperatures with brake temperatures beside them, and the fuel, tyre and damage state the driver sees.",
  },
  {
    icon: CloudSun,
    title: "Weather",
    body: "Air and track temperature, rain now and the outlook ahead — the call that decides the next tyre, in the same view as the fuel that decides the next stop.",
  },
  {
    icon: LineChart,
    title: "Lap trends",
    body: "Lap times charted across the stint, your car against a rival, so a fading tyre or a driver finding pace shows as a line, not a feeling.",
  },
] as const;

const PRESETS = [
  {
    icon: Users,
    title: "Engineer",
    body: "Every decision-making signal visible together — no tab hunting.",
  },
  {
    icon: Timer,
    title: "Strategist",
    body: "A preset layout of the same live board.",
  },
  {
    icon: SlidersHorizontal,
    title: "Car",
    body: "A preset layout of the same live board.",
  },
] as const;

const RELAY_POINTS = [
  "The driving PC relays its live local telemetry once per second.",
  "The Team board automatically follows the freshest source with real tyre data — whoever is in the car.",
  "A driver swap needs no manual handover: nobody has to switch feeds, re-share a screen or hand over a login.",
  "Every panel is marked live, relayed or stale, so old telemetry never reads as current.",
] as const;

const DEVICES = [
  {
    icon: Smartphone,
    title: "On a phone",
    body: "Follow the stint from the sofa, the garage or the other side of the country.",
  },
  {
    icon: Tablet,
    title: "On a tablet",
    body: "A second pit-wall screen next to the wheel without a second PC.",
  },
  {
    icon: Laptop,
    title: "On any other machine",
    body: "Mac, Linux, a work laptop — anything with a browser opens the same board.",
  },
] as const;

const SETUP_STEPS = [
  {
    title: "Everyone runs Apex AIO",
    body: `Each teammate installs the app and signs in. Every crew member needs their own active subscription — ${PRICE} a month after the trial.`,
  },
  {
    title: "Join the same crew",
    body: "Sign in to the same team. Up to six members can join one team — drivers and engineers alike.",
  },
  {
    title: "Drive — the relay starts itself",
    body: "Whoever is driving relays the session once per second, and the Team board follows them. At the swap it moves to the next driver on its own.",
  },
  {
    title: "Open the board anywhere",
    body: `In the app on another PC, or in any browser at ${WEB_BOARDS_LABEL} with the same Apex account.`,
  },
] as const;

const PAGE_FAQ: AioFaqItem[] = [
  {
    q: "How many people can be on an LMU pit wall team?",
    page: "pit-wall",
    a: "Up to six members can join one team in Apex AIO. Each of them signs in with their own Apex account and needs their own active subscription, and any of them can drive or engineer — the Team board follows whichever teammate is sending fresh driving data.",
  },
  {
    q: "Can I see Le Mans Ultimate telemetry on my phone or tablet?",
    page: "pit-wall",
    a: `Yes. The Team pit wall and the Solo engineer board open in any browser at ${WEB_BOARDS_LABEL} — phone, tablet, Mac or any other machine. Sign in with the same Apex account as the app. The board goes live as soon as an Apex AIO app is connected to the session and relaying it, because the telemetry itself still comes from the driving PC.`,
  },
  {
    q: "What happens to the pit wall at a driver swap?",
    page: "pit-wall",
    a: "Nothing you have to do. The Team board automatically follows the freshest source with real tyre data, so when the next driver takes the car and their PC starts relaying, the board moves to them on its own. Every panel is labelled live, relayed or stale, so data from the driver who just climbed out never reads as current.",
  },
  {
    q: "How does the LMU fuel strategy on the pit wall work?",
    page: "pit-wall",
    a: "The strategy panel replans from real consumption rather than a fixed estimate. It shows fuel and energy in the tank, the cost per lap, how many laps that buys and the figure at the flag, then turns that into stops to the finish, the pit window and the per-lap save target needed to reach it — updating as the race changes.",
  },
  {
    q: "Do I need a team to use the engineer board?",
    page: "pit-wall",
    a: "No. Alongside the Team pit wall there is a Solo engineer board for your own car, in the app and in the browser. Open it on a tablet or phone beside the wheel and you have a second pit-wall screen without a second PC.",
  },
];

function Points({ points }: { points: readonly string[] }) {
  return (
    <ul className="mt-6 space-y-3">
      {points.map((point) => (
        <li key={point} className="flex items-start gap-3 text-muted">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success" aria-hidden />
          <span>{point}</span>
        </li>
      ))}
    </ul>
  );
}

/** A compact read of what the board holds, for the hero. */
function HeroBoardSummary() {
  return (
    <Card variant="glow" clip className="p-6">
      <div className="flex items-center justify-between gap-3 border-b border-line pb-4">
        <span className="font-display text-sm font-semibold uppercase tracking-widest text-ink">
          Team · The pit wall
        </span>
        <span className="motion-live-pulse inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-success/10 px-2 py-1 font-mono text-[10px] font-bold text-success">
          <Radio size={10} aria-hidden /> RELAY · 1/s
        </span>
      </div>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {BOARD_PANELS.map((panel) => (
          <li key={panel.title} className="flex items-center gap-3 text-sm text-muted">
            <panel.icon size={16} className="shrink-0 text-cyan" aria-hidden />
            {panel.title}
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4 font-mono text-[11px] font-bold">
        <span className="rounded border border-success/40 bg-success/10 px-2 py-1 text-success">LIVE</span>
        <span className="rounded border border-cyan/40 bg-cyan/10 px-2 py-1 text-cyan">RELAYED</span>
        <span className="rounded border border-flag-amber/40 bg-flag-amber/10 px-2 py-1 text-flag-amber">
          STALE
        </span>
        <span className="ml-auto self-center font-sans text-xs font-normal text-subtle">
          Up to 6 crew · any browser
        </span>
      </div>
    </Card>
  );
}

const PIT_WALL_REVIEW = AIO_REVIEWS.find((review) => review.featured);

export default function LmuPitWallPage() {
  return (
    <>
      <JsonLd data={buildAioBreadcrumbJsonLd("pit-wall")} />

      <AioPageHero
        kicker="Apex AIO · Team engineering"
        title={
          <>
            The LMU <span className="text-gradient">pit wall</span> for endurance teams
          </>
        }
        lead={
          <>
            A live Le Mans Ultimate pit wall for your whole crew. Timing, the track map, live fuel
            strategy, per-corner tyres and brakes, car state, weather and lap trends sit on one team
            dashboard that follows whoever is driving — no handover at the driver swap. Engineer
            your teammate from another PC, or open the same board on a phone or tablet in any
            browser.
          </>
        }
        points={[
          "Follows the driver automatically",
          "Live, relayed & stale labelled",
          "Phone, tablet or any browser",
        ]}
        actions={
          <Button
            href={WEB_BOARDS_URL}
            size="lg"
            variant="outline"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Globe size={18} aria-hidden />
            Open the web pit wall
          </Button>
        }
        visual={<HeroBoardSummary />}
      />

      {/* 1 — the board itself */}
      <section id="team-pit-wall" className="container-rail scroll-mt-36 py-16">
        <div className="mb-10 grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <Reveal>
            <span className="kicker mb-4">Endurance · Team engineering</span>
            <h2 className="text-4xl font-bold text-ink sm:text-5xl">
              A live LMU pit wall for your <span className="text-gradient">endurance team</span>
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-lg text-muted">
              In a long Le Mans Ultimate race the driver can&apos;t watch everything, and the
              sim&apos;s own screens don&apos;t tell the crew enough. The Team board lets a teammate
              follow the active car from another PC — or from a phone, a tablet or any browser at
              all — with the same fuel, tyre, damage and strategy data the driver sees, so someone
              is always engineering the stint.
            </p>
          </Reveal>
        </div>

        <Reveal>
          <TeamPitWallMock />
        </Reveal>
        <p className="mt-3 text-center text-xs text-subtle">
          The Team board during a race at the Circuit de la Sarthe. Scroll sideways on a small
          screen.
        </p>

        {PIT_WALL_REVIEW && (
          <Reveal>
            <figure className="mx-auto mt-10 max-w-3xl rounded-card border border-line bg-surface/40 p-6">
              <Quote size={20} className="text-accent" aria-hidden />
              <blockquote className="mt-3 text-lg text-ink">
                &ldquo;{PIT_WALL_REVIEW.body}&rdquo;
              </blockquote>
              <figcaption className="mt-3 text-sm text-subtle">
                {PIT_WALL_REVIEW.author} · {PIT_WALL_REVIEW.context}
              </figcaption>
            </figure>
          </Reveal>
        )}
      </section>

      {/* 2 — what's on it */}
      <section id="dashboard" className="scroll-mt-36 border-y border-line bg-surface/30 py-16">
        <div className="container-rail">
          <Reveal>
            <span className="kicker mb-4">Timing · Strategy · Car</span>
            <h2 className="max-w-3xl text-4xl font-bold text-ink sm:text-5xl">
              Everything the engineer needs on <span className="text-gradient">one dashboard</span>
            </h2>
            <p className="mt-5 max-w-3xl text-lg text-muted">
              Every signal that decides a stint sits on the same screen. The fuel number is next to
              the pit window it drives; the weather is next to the tyres it will change.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BOARD_PANELS.map((panel, index) => (
              <Reveal key={panel.title} delay={(index % 3) * 80} className="h-full">
                <Card variant="elevated" className="h-full p-5">
                  <panel.icon size={20} className="text-cyan" aria-hidden />
                  <h3 className="mt-3 font-display text-lg font-bold uppercase tracking-wide text-ink">
                    {panel.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted">{panel.body}</p>
                </Card>
              </Reveal>
            ))}
          </div>

          <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:items-start">
            <Reveal>
              <h3 className="text-2xl font-bold text-ink">LMU fuel and endurance strategy that replans itself</h3>
              <p className="mt-4 text-muted">
                The strategy panel isn&apos;t a calculator you feed. It works from the real
                consumption of the car on track and replans as the race changes — laps remaining,
                stops to the flag, the pit window and the per-lap save target needed to reach it.
                When the plan stops working, the save target tells the driver by how much.
              </p>
              <p className="mt-4 text-muted">
                Want the same numbers in the driver&apos;s ear? The{" "}
                <Link href="/lmu-race-engineer" className="text-cyan hover:underline">
                  voice race engineer
                </Link>{" "}
                answers fuel to the end and pit windows on a button press, and the{" "}
                <Link href="/lmu-overlays" className="text-cyan hover:underline">
                  MFD overlay
                </Link>{" "}
                changes the pit strategy without opening the in-game menu.
              </p>
            </Reveal>
            <Reveal delay={120}>
              <h3 className="text-2xl font-bold text-ink">Board presets for each role</h3>
              <p className="mt-4 text-muted">
                Switch between board layouts depending on who is watching and what they are there
                to call.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {PRESETS.map((preset) => (
                  <div
                    key={preset.title}
                    className="rounded-card border border-line bg-base/60 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan/40"
                  >
                    <preset.icon size={18} className="text-cyan" aria-hidden />
                    <p className="mt-2 font-display text-sm uppercase tracking-wide text-ink">
                      {preset.title}
                    </p>
                    <p className="mt-1 text-sm text-subtle">{preset.body}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 3 — the relay */}
      <section id="driver-swaps" className="container-rail scroll-mt-36 py-16">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <Reveal>
            <span className="kicker mb-4">How the team relay works</span>
            <h2 className="text-4xl font-bold text-ink sm:text-5xl">
              Driver swaps <span className="text-gradient">without a handover</span>
            </h2>
            <p className="mt-5 text-lg text-muted">
              LMU remote telemetry for teammates usually breaks at the worst moment: the stop. Apex
              AIO doesn&apos;t tie the board to one machine. Every teammate runs the app, the driving PC
              relays, and the board goes where the fresh data is.
            </p>
            <Points points={RELAY_POINTS} />
          </Reveal>
          <Reveal delay={140}>
            <Card variant="elevated" className="p-6">
              <p className="font-display text-sm font-semibold uppercase tracking-widest text-ink">
                What each label means
              </p>
              <dl className="mt-5 space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <dt className="w-24 shrink-0 rounded border border-success/40 bg-success/10 px-2 py-1 text-center font-mono text-[11px] font-bold text-success">
                    LIVE
                  </dt>
                  <dd className="text-muted">Current data from the session, updating now.</dd>
                </div>
                <div className="flex items-start gap-3">
                  <dt className="w-24 shrink-0 rounded border border-cyan/40 bg-cyan/10 px-2 py-1 text-center font-mono text-[11px] font-bold text-cyan">
                    RELAYED
                  </dt>
                  <dd className="text-muted">Telemetry relayed from the teammate who is driving.</dd>
                </div>
                <div className="flex items-start gap-3">
                  <dt className="w-24 shrink-0 rounded border border-flag-amber/40 bg-flag-amber/10 px-2 py-1 text-center font-mono text-[11px] font-bold text-flag-amber">
                    STALE
                  </dt>
                  <dd className="text-muted">
                    Data that has stopped updating — marked so it can&apos;t mislead the crew.
                  </dd>
                </div>
              </dl>
              <p className="mt-6 border-t border-line pt-4 text-xs text-subtle">
                The board follows the freshest source with real tyre data, so the teammate who
                just climbed out never overrides the one in the car.
              </p>
            </Card>
          </Reveal>
        </div>
      </section>

      {/* 4 — any browser */}
      <section
        id="web-pit-wall"
        className="scroll-mt-36 border-y border-accent/40 bg-gradient-to-r from-accent/15 via-accent-2/10 to-cyan/15"
      >
        <div className="container-rail py-16">
          <Reveal>
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div>
                <span className="kicker mb-4">LMU telemetry on phone & tablet</span>
                <h2 className="text-4xl font-bold text-ink sm:text-5xl">
                  The pit wall in any browser —{" "}
                  <span className="text-gradient">phone, tablet or laptop</span>
                </h2>
                <p className="mt-5 text-lg text-muted">
                  The Team pit wall and the Solo engineer board don&apos;t only live in the app.
                  Sign in on the web with the same Apex account and the same live dashboard — timing,
                  fuel and strategy, per-corner tyres and brakes, car state, weather, the track map
                  and lap trends — opens on whatever device is in your hand. Stand in the garage,
                  sit on the sofa or engineer your teammate from another country: the board follows
                  the session, not the machine.
                </p>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Button href={WEB_BOARDS_URL} size="lg" clip target="_blank" rel="noopener noreferrer">
                    <Globe size={18} aria-hidden />
                    Open your boards
                    <ArrowRight size={18} aria-hidden />
                  </Button>
                  <a
                    href={WEB_BOARDS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center justify-center gap-2 rounded-card border border-cyan/40 bg-base/60 px-5 py-4 font-mono text-base font-semibold tracking-tight text-cyan transition-all duration-200 hover:border-cyan hover:bg-base/80 hover:shadow-glow-cyan sm:text-lg"
                  >
                    {WEB_BOARDS_LABEL}
                    <ArrowRight
                      size={16}
                      aria-hidden
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </a>
                </div>

                <p className="mt-4 flex items-start gap-2 text-sm text-subtle">
                  <Wifi size={16} aria-hidden className="mt-0.5 shrink-0 text-cyan" />
                  The web board needs an Apex AIO app connected to the session and relaying it —
                  the telemetry still comes from a driving PC. It goes live the moment that app
                  starts relaying.
                </p>
              </div>

              <ul className="grid gap-3">
                {DEVICES.map((device) => (
                  <li
                    key={device.title}
                    className="flex items-start gap-4 rounded-card border border-line bg-base/60 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan/40"
                  >
                    <device.icon size={22} aria-hidden className="mt-0.5 shrink-0 text-cyan" />
                    <div>
                      <h3 className="font-display text-sm uppercase tracking-wide text-ink">
                        {device.title}
                      </h3>
                      <p className="mt-1 text-sm text-subtle">{device.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 5 — solo */}
      <section id="solo-board" className="container-rail scroll-mt-36 py-16">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <Reveal>
            <span className="kicker mb-4">No crew required</span>
            <h2 className="text-4xl font-bold text-ink sm:text-5xl">
              Solo board: <span className="text-gradient">engineer yourself</span>
            </h2>
            <p className="mt-5 text-lg text-muted">
              Not every endurance race comes with a crew. The Solo engineer board is the same
              kind of live board for your own car, in the app or in the browser. Prop a tablet or
              phone beside the wheel and you have a second pit-wall screen without a second PC —
              fuel, strategy, tyres and weather at a glance between corners.
            </p>
            <Points
              points={[
                "The same live board, for the car you are driving.",
                `In the app, or in any browser at ${WEB_BOARDS_LABEL}.`,
                "A second screen by the wheel without a second PC.",
              ]}
            />
          </Reveal>
          <Reveal delay={120}>
            <Card variant="elevated" className="p-6">
              <User size={22} className="text-cyan" aria-hidden />
              <h3 className="mt-3 text-2xl font-bold text-ink">After the flag</h3>
              <p className="mt-3 text-muted">
                The pit wall is for the race as it happens. When it&apos;s over,{" "}
                <Link href="/lmu-telemetry" className="text-cyan hover:underline">
                  Review
                </Link>{" "}
                reads every lap back from your own PC — the stint sheets, tyre wear lap by lap and
                lap-vs-lap traces — so you can see where the time went. And if the car was the
                problem, the{" "}
                <Link href="/lmu-setups" className="text-cyan hover:underline">
                  setup optimiser and community setups
                </Link>{" "}
                are in the same app.
              </p>
            </Card>
          </Reveal>
        </div>
      </section>

      {/* 6 — setting up */}
      <section id="team-setup" className="scroll-mt-36 border-y border-line bg-surface/30 py-16">
        <div className="container-rail">
          <Reveal>
            <span className="kicker mb-4">Four steps</span>
            <h2 className="text-4xl font-bold text-ink sm:text-5xl">
              Setting up a <span className="text-gradient">team</span>
            </h2>
            <p className="mt-5 max-w-3xl text-lg text-muted">
              No server to host and no screen to share — the relay runs inside the app every teammate already has.
            </p>
          </Reveal>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SETUP_STEPS.map((step, index) => (
              <li key={step.title} className="h-full list-none">
                <Reveal delay={index * 90} className="h-full">
                  <Card variant="elevated" className="h-full p-5">
                    <span className="font-display text-3xl font-bold text-gradient">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-2 font-display text-lg font-bold uppercase tracking-wide text-ink">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted">{step.body}</p>
                  </Card>
                </Reveal>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-center text-sm text-subtle">
            Team relay requires each crew member to run Apex AIO and have their own active
            subscription.{" "}
            <Link href="/apex-overlay-system#pricing" className="text-cyan hover:underline">
              See pricing
            </Link>
            .
          </p>
        </div>
      </section>

      <AioFaq items={[...getAioFaq("pit-wall"), ...PAGE_FAQ]} />

      <AioRelatedPages current="pit-wall" />

      <AioTrialCta body="The team pit wall, the Solo board and the web boards are all in the free trial — along with every overlay, the race engineer and your setups. Get the crew on it before the next endurance race." />
    </>
  );
}
