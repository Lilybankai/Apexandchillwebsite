import Link from "next/link";
import { ArrowRight, Globe } from "lucide-react";
import { AioFaq } from "@/components/aio/AioFaq";
import { AioPageHero } from "@/components/aio/AioPageHero";
import { AioRelatedPages } from "@/components/aio/AioRelatedPages";
import { AioTrialCta } from "@/components/aio/AioTrialCta";
import { JsonLd } from "@/components/aio/JsonLd";
import { SectionHeading } from "@/components/aio/SectionHeading";
import { AnnotatedFigure, type Callout } from "@/components/aio/setups/AnnotatedFigure";
import { TeamPitWallMock } from "@/components/overlay/TeamPitWallMock";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { AIO_PRODUCT, AIO_REVIEWS } from "@/lib/aio";
import { getAioFaq, type AioFaqItem } from "@/lib/aio-faq";
import { buildAioBreadcrumbJsonLd, buildAioPageMetadata } from "@/lib/aio-seo";
import { cn } from "@/lib/utils";

export const metadata = buildAioPageMetadata("pit-wall");

/** The trial buttons read the live release. */
export const revalidate = 1800;

const {
  webBoardsUrl: WEB_BOARDS_URL,
  webBoardsLabel: WEB_BOARDS_LABEL,
  priceDisplay: PRICE,
} = AIO_PRODUCT;

/** What sits on the board, panel by panel, in the order the mock lays them out. */
const BOARD_PANELS = [
  "Timing",
  "Track map",
  "Fuel & energy",
  "Strategy to the flag",
  "Tyres, brakes & car state",
  "Weather",
  "Lap trends",
] as const;

/**
 * Pins on the Team board mock. The board is a 12-column grid inside a
 * 12px pad with 12px gaps, so a panel's right edge is (k/12 of the width)
 * minus k px, and each pin sits 16px in from it, in the empty right end of
 * the panel's title bar. The two header pins are measured from the edges.
 * Vertical positions follow the mock's fixed row heights; re-check them if
 * TeamPitWallMock's spacing changes.
 */
const panelEdge = (k: number) => `calc(${((k / 12) * 100).toFixed(3)}% - ${k + 16}px)`;

const BOARD_CALLOUTS: Callout[] = [
  {
    x: "269px",
    y: "48px",
    labelY: "24px",
    side: "right",
    label: "Relay source",
    note: "The driving PC, relaying once a second.",
  },
  {
    x: "calc(100% - 50px)",
    y: "48px",
    labelY: "96px",
    side: "right",
    label: "Board preset",
    note: "Engineer, Strategist or Car layout.",
  },
  {
    x: panelEdge(7),
    y: "138px",
    labelY: "168px",
    side: "right",
    label: "Timing",
    note: "Last, best, interval, and a live “vs me” gap to your team car.",
  },
  {
    x: panelEdge(12),
    y: "138px",
    labelY: "240px",
    side: "right",
    label: "Track map",
    note: "Every car on the circuit, your team car picked out.",
  },
  {
    x: panelEdge(3),
    y: "381px",
    labelY: "312px",
    side: "right",
    label: "Fuel & energy",
    note: "In the tank, per lap, laps it buys, and the figure at the flag.",
  },
  {
    x: panelEdge(8),
    y: "381px",
    labelY: "384px",
    side: "right",
    label: "Strategy",
    note: "Stops to the flag, the pit window and the save target.",
  },
  {
    x: panelEdge(12),
    y: "381px",
    labelY: "456px",
    side: "right",
    label: "Tyres & brakes",
    note: "Per-corner wear and temperature, brake temperature beside it.",
  },
  {
    x: panelEdge(8),
    y: "559px",
    labelY: "528px",
    side: "right",
    label: "Lap times",
    note: "Your car against a rival, charted across the stint.",
  },
  {
    x: panelEdge(12),
    y: "559px",
    labelY: "600px",
    side: "right",
    label: "Weather",
    note: "Air, track, rain now and the outlook ahead.",
  },
];

/** The strategy panel's read-out, exactly as the board above shows it. */
const STRATEGY_READOUT = [
  ["Fuel & energy in the tank", "38.5%"],
  ["Cost of one lap", "4.40%"],
  ["Laps that buys", "≈ 8.8"],
  ["Figure at the flag", "−35.4%"],
  ["Stops to the finish", "2"],
  ["Pit window", "in 6–8 laps"],
  ["Save target", "3.08% / lap"],
] as const;

const STATE_LABELS = [
  {
    label: "LIVE",
    tone: "border-success/40 bg-success/10 text-success",
    body: "Current data from the session, updating now.",
  },
  {
    label: "RELAYED",
    tone: "border-cyan/40 bg-cyan/10 text-cyan",
    body: "Telemetry relayed from the teammate who is driving.",
  },
  {
    label: "STALE",
    tone: "border-flag-amber/40 bg-flag-amber/10 text-flag-amber",
    body: "Data that has stopped updating, marked so it can't mislead the crew.",
  },
] as const;

/** One stint, one stop, one stint: who feeds the board either side of the swap. */
const SWAP_LANES: {
  lane: string;
  before: string;
  after: string;
  beforeMuted?: boolean;
  afterMuted?: boolean;
  board?: boolean;
}[] = [
  {
    lane: "Driver 1 · PC",
    before: "Driving · relaying 1/s",
    after: "Out of the car",
    afterMuted: true,
  },
  {
    lane: "Driver 2 · PC",
    before: "Standing by",
    after: "Driving · relaying 1/s",
    beforeMuted: true,
  },
  {
    lane: "Team board",
    before: "Follows driver 1",
    after: "Follows driver 2",
    board: true,
  },
];

const DEVICES = [
  ["Phone", "Follow the stint from the sofa, the garage or the other side of the country."],
  ["Tablet", "A second pit-wall screen next to the wheel, without a second PC."],
  ["Any other machine", "Mac, Linux, a work laptop. Anything with a browser opens the same board."],
] as const;

const TEAM_VS_SOLO = [
  ["Watches", "The team's active car", "Your own car"],
  ["Opens in", "The app, or any browser", "The app, or any browser"],
  ["Crew", "Up to 6 members", "Just you"],
  ["Follows", "Whoever is driving", "The car you are driving"],
] as const;

const SETUP_STEPS = [
  {
    title: "Everyone runs Apex AIO",
    body: `Each teammate installs the app and signs in. Every crew member needs their own active subscription: ${PRICE} a month after the trial.`,
  },
  {
    title: "Join the same crew",
    body: "Sign in to the same team. Up to six members can join one team, drivers and engineers alike.",
  },
  {
    title: "Drive, and the relay starts itself",
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
    a: "Up to six members can join one team in Apex AIO. Each signs in with their own Apex account and needs their own active subscription. Any of them can drive or engineer: the Team board follows whichever teammate is sending fresh driving data.",
  },
  {
    q: "Can I see Le Mans Ultimate telemetry on my phone or tablet?",
    page: "pit-wall",
    a: `Yes. The Team pit wall and the Solo engineer board open in any browser at ${WEB_BOARDS_LABEL}: phone, tablet, Mac or any other machine. Sign in with the same Apex account as the app. The board goes live as soon as an Apex AIO app is connected to the session and relaying it, because the telemetry itself still comes from the driving PC.`,
  },
  {
    q: "What happens to the pit wall at a driver swap?",
    page: "pit-wall",
    a: "Nothing you have to do. The Team board follows the freshest source with real tyre data, so when the next driver takes the car and their PC starts relaying, the board moves to them on its own. Every panel is labelled live, relayed or stale, so data from the driver who just climbed out never reads as current.",
  },
  {
    q: "How does the LMU fuel strategy on the pit wall work?",
    page: "pit-wall",
    a: "The strategy panel replans from real consumption rather than a fixed estimate. It shows fuel and energy in the tank, the cost per lap, how many laps that buys and the figure at the flag. From those it works out stops to the finish, the pit window and the per-lap save target needed to reach it, and updates them as the race changes.",
  },
  {
    q: "Do I need a team to use the engineer board?",
    page: "pit-wall",
    a: "No. Alongside the Team pit wall there is a Solo engineer board for your own car, in the app and in the browser. Open it on a tablet or phone beside the wheel and you have a second pit-wall screen without a second PC.",
  },
];

/** A compact read of what the board holds, for the hero. */
function HeroBoardSummary() {
  return (
    <div className="border border-line bg-base/70">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-ink">
          Team · The pit wall
        </span>
        <span className="motion-live-pulse inline-flex items-center gap-1.5 rounded-sm border border-success/40 bg-success/10 px-2 py-1 font-mono text-[10px] font-bold text-success">
          RELAY · 1/s
        </span>
      </div>
      <ol className="grid grid-cols-2 gap-x-6 px-5 py-4">
        {BOARD_PANELS.map((panel, i) => (
          <li
            key={panel}
            className="flex items-baseline gap-3 border-b border-line/60 py-2 text-sm text-muted"
          >
            <span className="font-mono text-[10px] tabular-nums text-subtle">
              {String(i + 1).padStart(2, "0")}
            </span>
            {panel}
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap items-center gap-2 border-t border-line px-5 py-3 font-mono text-[11px] font-bold">
        {STATE_LABELS.map((s) => (
          <span key={s.label} className={cn("rounded-sm border px-2 py-1", s.tone)}>
            {s.label}
          </span>
        ))}
        <span className="ml-auto font-mono text-[10px] font-normal uppercase tracking-[0.18em] text-subtle">
          Up to 6 crew · any browser
        </span>
      </div>
    </div>
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
            A live Le Mans Ultimate pit wall for the whole crew. Timing, the track map, fuel
            strategy, per-corner tyres and brakes, car state, weather and lap trends sit on one team
            dashboard that follows whoever is driving, with no handover at the driver swap. Engineer
            your teammate from another PC, or open the same board on a phone or tablet.
          </>
        }
        stats={[
          { value: "6", label: "Crew per team" },
          { value: "1/s", label: "Relay rate" },
          { value: "3", label: "Data states" },
        ]}
        points={[
          "Follows the driver automatically",
          "Live, relayed and stale labelled",
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
        frame={false}
      />

      {/* 01 · Why a pit wall: prose, then Kyle's review at full size */}
      <section id="team-pit-wall" className="container-rail scroll-mt-36 py-20">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <SectionHeading
              index="01"
              label="Endurance · Team engineering"
              title="A live LMU pit wall for your endurance team"
              className="mb-0"
            />
          </div>
          <Reveal delay={100} className="lg:col-span-5 lg:pt-14">
            <p className="text-lg leading-relaxed text-muted">
              In a long Le Mans Ultimate race the driver can&apos;t watch everything, and the
              sim&apos;s own screens don&apos;t tell the crew enough. The Team board lets a teammate
              follow the active car from another PC, a phone, a tablet or any browser, with the same
              fuel, tyre, damage and strategy data the driver sees.
            </p>
          </Reveal>
        </div>

        {PIT_WALL_REVIEW && (
          <Reveal>
            <figure className="mt-16 border-t border-line pt-10 lg:mt-20">
              <blockquote className="max-w-5xl font-display text-3xl font-bold uppercase leading-[1.1] tracking-wide text-ink sm:text-4xl lg:text-5xl">
                <span aria-hidden className="mr-1 text-cyan">
                  &ldquo;
                </span>
                {PIT_WALL_REVIEW.body}
                <span aria-hidden className="text-cyan">
                  &rdquo;
                </span>
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-subtle">
                <span aria-hidden className="h-px w-8 bg-cyan" />
                {PIT_WALL_REVIEW.author} · {PIT_WALL_REVIEW.context}
              </figcaption>
            </figure>
          </Reveal>
        )}
      </section>

      {/* 02 · The board itself, drawn up panel by panel */}
      <section id="dashboard" className="scroll-mt-36 border-y border-line bg-surface/30 py-20">
        <div className="container-rail">
          <SectionHeading
            index="02"
            label="Timing · Strategy · Car"
            title="Everything the engineer needs on one dashboard"
            lead="Every signal that decides a stint is on one screen. The fuel number sits next to the pit window it drives, and the weather next to the tyres it will change."
          />

          <Reveal>
            <AnnotatedFigure
              callouts={BOARD_CALLOUTS}
              pins="always"
              minWidth={900}
              caption="The Team board during a race at the Circuit de la Sarthe. Scroll sideways on a small screen."
            >
              <TeamPitWallMock />
            </AnnotatedFigure>
          </Reveal>

          <div className="mt-12 grid gap-6 border-t border-line pt-8 md:grid-cols-[auto_1fr] md:items-center md:gap-10">
            <div
              role="list"
              aria-label="Board presets"
              className="inline-flex w-fit border border-line font-mono text-[11px] uppercase tracking-[0.2em]"
            >
              {["Engineer", "Strategist", "Car"].map((preset, i) => (
                <span
                  role="listitem"
                  key={preset}
                  className={cn(
                    "px-4 py-2",
                    i > 0 && "border-l border-line",
                    i === 0 ? "bg-cyan/10 text-cyan" : "text-subtle",
                  )}
                >
                  {preset}
                </span>
              ))}
            </div>
            <p className="text-muted">
              <strong className="font-semibold text-ink">Board presets for each role.</strong>{" "}
              Switch layouts depending on who is watching and what they are there to call. Engineer
              puts every decision-making signal on screen at once, so nobody goes hunting through
              tabs.
            </p>
          </div>
        </div>
      </section>

      {/* 03 · Fuel strategy: prose on the left, the panel's read-out on the right */}
      <section id="fuel-strategy" className="container-rail scroll-mt-36 py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <SectionHeading
              index="03"
              label="Fuel · Endurance strategy"
              title="LMU fuel strategy that replans itself"
            />
            <p className="max-w-xl text-lg leading-relaxed text-muted">
              The strategy panel isn&apos;t a calculator you feed. It works from the real
              consumption of the car on track and replans as the race changes: laps remaining, stops
              to the flag, the pit window and the per-lap save target needed to reach it. When the
              plan stops working, the save target tells the driver by how much.
            </p>
            <p className="mt-5 max-w-xl text-muted">
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
          </div>

          <Reveal delay={120} className="lg:col-span-6 lg:pt-16">
            <div className="border border-line bg-base/70">
              <div className="flex items-center justify-between border-b border-line px-4 py-3 font-mono text-[10px] uppercase tracking-[0.24em] text-subtle">
                <span>Strategy · read-out</span>
                <span>1:00:00 to go</span>
              </div>
              <dl>
                {STRATEGY_READOUT.map(([label, value]) => (
                  <div
                    key={label}
                    className="grid grid-cols-[1fr_auto] items-baseline gap-4 border-b border-line/70 px-4 py-3 last:border-0"
                  >
                    <dt className="text-sm text-muted">{label}</dt>
                    <dd className="font-mono text-lg tabular-nums text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <p className="mt-3 text-sm text-subtle">
              The values from the board above. A negative figure at the flag is the shortfall, shown
              long before it becomes a stopped car.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 04 · The relay: one stint, one stop, one stint */}
      <section id="driver-swaps" className="scroll-mt-36 border-y border-line bg-surface/30 py-20">
        <div className="container-rail">
          <SectionHeading
            index="04"
            label="How the team relay works"
            title="Driver swaps without a handover"
            lead="LMU remote telemetry for teammates usually breaks at the stop. Apex AIO doesn't tie the board to one machine: every teammate runs the app, the driving PC relays once per second, and the board goes where the fresh data is."
            align="center"
          />

          <Reveal>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse border border-line bg-base/70 text-left">
                <caption className="sr-only">
                  Who feeds the Team board either side of a driver swap
                </caption>
                <thead>
                  <tr className="border-b border-line font-mono text-[10px] uppercase tracking-[0.24em] text-subtle">
                    <th scope="col" className="w-40 px-4 py-3 font-normal">
                      Source
                    </th>
                    <th scope="col" className="px-4 py-3 font-normal">
                      Stint 1
                    </th>
                    <th
                      scope="col"
                      className="w-20 border-x border-line px-2 py-3 text-center font-normal text-ink"
                    >
                      Swap
                    </th>
                    <th scope="col" className="px-4 py-3 font-normal">
                      Stint 2
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {SWAP_LANES.map((lane) => (
                    <tr
                      key={lane.lane}
                      className={cn(
                        "border-b border-line/70 last:border-0",
                        lane.board && "bg-cyan/[0.05]",
                      )}
                    >
                      <th
                        scope="row"
                        className="px-4 py-4 font-mono text-[11px] font-normal uppercase tracking-[0.18em] text-ink"
                      >
                        {lane.lane}
                      </th>
                      <td
                        className={cn(
                          "px-4 py-4 font-mono text-sm",
                          lane.beforeMuted ? "text-subtle" : "text-cyan",
                        )}
                      >
                        {lane.before}
                      </td>
                      <td className="relative border-x border-line">
                        <span aria-hidden className="absolute inset-y-0 left-1/2 w-px bg-cyan/40" />
                      </td>
                      <td
                        className={cn(
                          "px-4 py-4 font-mono text-sm",
                          lane.afterMuted ? "text-subtle" : "text-cyan",
                        )}
                      >
                        {lane.after}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-4 text-muted">
              <p>
                The Team board follows the freshest source with real tyre data, whoever is in the
                car. Nobody has to switch feeds, re-share a screen or hand over a login at the stop,
                and the teammate who just climbed out never overrides the one in the car.
              </p>
              <p>Every panel carries a state label, so old telemetry never reads as current.</p>
            </div>
            <dl className="border-t border-line">
              {STATE_LABELS.map((s) => (
                <div
                  key={s.label}
                  className="grid grid-cols-[6.5rem_1fr] items-start gap-4 border-b border-line py-4"
                >
                  <dt
                    className={cn(
                      "rounded-sm border px-2 py-1 text-center font-mono text-[11px] font-bold",
                      s.tone,
                    )}
                  >
                    {s.label}
                  </dt>
                  <dd className="pt-0.5 text-sm text-muted">{s.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* 05 · Any browser: the address is the headline */}
      <section id="web-pit-wall" className="container-rail scroll-mt-36 py-20">
        <SectionHeading
          index="05"
          label="LMU telemetry on phone & tablet"
          title="The pit wall in any browser: phone, tablet or laptop"
          lead="The Team pit wall and the Solo engineer board don't only live in the app. Sign in on the web with the same Apex account and the same live dashboard opens on whatever device is in your hand. It follows the session wherever you open it."
        />

        <Reveal>
          <a
            href={WEB_BOARDS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-wrap items-center justify-between gap-4 border-y border-line py-8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan"
          >
            <span className="break-all font-mono text-2xl font-semibold tracking-tight text-ink transition-colors group-hover:text-cyan sm:text-4xl lg:text-5xl">
              {WEB_BOARDS_LABEL}
            </span>
            <ArrowRight
              size={32}
              aria-hidden
              className="shrink-0 text-cyan transition-transform duration-200 group-hover:translate-x-1"
            />
          </a>
        </Reveal>

        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {DEVICES.map(([device, body]) => (
            <div key={device}>
              <h3 className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan">
                {device}
              </h3>
              <p className="mt-2 text-muted">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-5 border-t border-line pt-8 lg:flex-row lg:items-center lg:justify-between">
          <p className="max-w-2xl text-sm text-subtle">
            The web board needs an Apex AIO app connected to the session and relaying it, because
            the telemetry still comes from a driving PC. It goes live the moment that app starts
            relaying.
          </p>
          <Button href={WEB_BOARDS_URL} size="lg" clip target="_blank" rel="noopener noreferrer">
            <Globe size={18} aria-hidden />
            Open your boards
            <ArrowRight size={18} aria-hidden />
          </Button>
        </div>
      </section>

      {/* 06 · Solo: Team and Solo side by side */}
      <section id="solo-board" className="scroll-mt-36 border-y border-line bg-surface/30 py-20">
        <div className="container-rail">
          <div className="mx-auto max-w-4xl">
            <SectionHeading
              index="06"
              label="No crew required"
              title="Solo board: engineer yourself"
              lead="Not every endurance race comes with a crew. The Solo engineer board is the same kind of live board for your own car. Prop a tablet or phone beside the wheel and you have a second pit-wall screen without a second PC: fuel, strategy, tyres and weather at a glance between corners."
            />

            <Reveal>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-line font-mono text-[10px] uppercase tracking-[0.24em] text-subtle">
                      <th scope="col" className="py-3 pr-4 font-normal">
                        <span className="sr-only">Compare</span>
                      </th>
                      <th scope="col" className="px-4 py-3 font-normal text-ink">
                        Team pit wall
                      </th>
                      <th scope="col" className="px-4 py-3 font-normal text-cyan">
                        Solo engineer board
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TEAM_VS_SOLO.map(([label, team, solo]) => (
                      <tr key={label} className="border-b border-line/70">
                        <th
                          scope="row"
                          className="py-4 pr-4 font-mono text-[11px] font-normal uppercase tracking-[0.18em] text-subtle"
                        >
                          {label}
                        </th>
                        <td className="px-4 py-4 text-muted">{team}</td>
                        <td className="px-4 py-4 text-ink">{solo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Reveal>

            <div className="mt-12 border-l-2 border-line pl-6">
              <h3 className="font-display text-xl font-bold uppercase tracking-wide text-ink">
                After the flag
              </h3>
              <p className="mt-3 text-muted">
                The pit wall is for the race as it happens. When it&apos;s over,{" "}
                <Link href="/lmu-telemetry" className="text-cyan hover:underline">
                  Review
                </Link>{" "}
                reads every lap back from your own PC (stint sheets, tyre wear lap by lap and
                lap-vs-lap traces) so you can see where the time went. If the car was the problem,
                the{" "}
                <Link href="/lmu-setups" className="text-cyan hover:underline">
                  setup optimiser and community setups
                </Link>{" "}
                are in the same app.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 07 · Setting up: heading on the left, the four steps down the right */}
      <section id="team-setup" className="container-rail scroll-mt-36 py-20">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <SectionHeading
              index="07"
              label="Four steps"
              title="Setting up a team"
              lead="The relay runs inside the app every teammate already has, so there is nothing to host and nothing to screen-share."
            />
          </div>
          <div className="lg:col-span-8">
            <ol>
              {SETUP_STEPS.map((step, index) => (
                <li
                  key={step.title}
                  className="grid grid-cols-[4rem_1fr] gap-4 border-t border-line py-6 last:border-b sm:grid-cols-[6rem_1fr]"
                >
                  <span className="font-mono text-4xl font-semibold leading-none tabular-nums text-subtle sm:text-5xl">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-bold uppercase tracking-wide text-ink">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-muted">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="pt-6 text-sm text-subtle">
              Team relay requires each crew member to run Apex AIO and have their own active
              subscription.{" "}
              <Link href="/apex-overlay-system#pricing" className="text-cyan hover:underline">
                See pricing
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <AioFaq items={[...getAioFaq("pit-wall"), ...PAGE_FAQ]} />

      <AioRelatedPages current="pit-wall" />

      <AioTrialCta body="The team pit wall, the Solo board and the web boards are all in the free trial, along with every overlay, the race engineer and your setups. Get the crew on it before the next endurance race." />
    </>
  );
}
