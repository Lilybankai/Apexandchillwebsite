import Link from "next/link";
import {
  Boxes,
  CheckCircle2,
  Cpu,
  Download,
  Keyboard,
  Layers,
  Map as MapIcon,
  Monitor,
  MonitorPlay,
  Repeat,
  ShieldAlert,
  Sliders,
  Timer,
  TrafficCone,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import {
  DamagePredictorMock,
  FuelMock,
  MfdMock,
  RaceControlMock,
  RadarMock,
  RefPaceMock,
  RelativeMock,
  SpeedoMock,
  StandingsMock,
  TrackLimitsMock,
  TrackMapMock,
  TyreTempMock,
} from "@/components/overlay/OverlayMocks";
import { WidgetCatalogue } from "@/components/overlay/WidgetCatalogue";
import { AioPageHero } from "@/components/aio/AioPageHero";
import { AioFaq } from "@/components/aio/AioFaq";
import { AioRelatedPages } from "@/components/aio/AioRelatedPages";
import { AioTrialCta } from "@/components/aio/AioTrialCta";
import { JsonLd } from "@/components/aio/JsonLd";
import { AIO_PRODUCT } from "@/lib/aio";
import { getAioFaq, type AioFaqItem } from "@/lib/aio-faq";
import { buildAioBreadcrumbJsonLd, buildAioPageMetadata } from "@/lib/aio-seo";

const { priceDisplay: PRICE, trialDays: TRIAL_DAYS } = AIO_PRODUCT;

/** The trial buttons read the live release; keep in step with its cache TTL. */
export const revalidate = 1800;

export const metadata = buildAioPageMetadata("overlays");

/** Questions only this page answers, phrased the way people search for them. */
const PAGE_FAQ: AioFaqItem[] = [
  {
    q: "What are the best LMU overlays?",
    page: "overlays",
    a: "It depends what you race with, but a good Le Mans Ultimate set covers timing, traffic, the car and strategy. Apex AIO ships twenty widgets that do exactly that — standings, relative, delta, proximity radar, fuel calculator, tyre temps, pedals and a speedo cluster — plus the ones no other LMU tool ships: a fully working MFD you can drive from your wheel, track limits in the stewards' own points, a pit-stop predictor built from the sim's repair estimate, a 3D track map with 32 circuits bundled, and your pace against Ohne Speed's reference times. Every one runs in OBS's own browser or over the game, and all of them are in the one price.",
  },
  {
    q: "How do I add an LMU overlay to OBS?",
    page: "overlays",
    a: "Install Apex AIO, sign in and start the trial — the overlay server starts itself when the app opens. Tick the widgets you want, copy each one's Browser Source URL from its card, and paste it into a Browser Source in your OBS scene. No terminal, no config files and no editing game directories; Le Mans Ultimate works out of the box over its own REST API.",
  },
  {
    q: "Can I change how often the overlays update?",
    page: "overlays",
    a: "Yes. Telemetry is sent at 30 Hz by default, and one slider takes it anywhere from 1 to 120 Hz. Each frame is compact JSON of around 1–2 KB over a loopback WebSocket, so it never leaves your machine, and it is serialised once and shared by every source rather than re-encoded per widget.",
  },
  {
    q: "Are all the LMU overlays included in the subscription?",
    page: "overlays",
    a: `Yes. There is one plan: ${TRIAL_DAYS} days free, then ${PRICE} a month, and it includes all twenty widgets in both destinations — OBS and in-game — along with the race engineer, setup tools, pit wall and every update. There is no cut-down tier and no widget held back as an upsell.`,
  },
];

/** The two places every widget can be sent. */
const DESTINATIONS: { icon: typeof Monitor; title: string; body: string; points: string[] }[] = [
  {
    icon: MonitorPlay,
    title: "OBS Browser Source overlays",
    body:
      "For streaming. Every widget has its own Browser Source URL — copy it from the widget's card and drop it into your scene. The overlays are rendered by the Chromium instance OBS already runs, so nothing new starts on your PC.",
    points: [
      "One URL per widget, so each sits exactly where your scene wants it",
      "Its own background-opacity override on every widget",
      "Stream chat merges YouTube and Twitch into one column, Super Chats included",
    ],
  },
  {
    icon: Monitor,
    title: "In-game HUD layer",
    body:
      "For driving. The in-game layer draws the widgets over the sim itself, and the layout editor lets you drag and resize each one exactly where you want it over the cockpit — including onto the side screens of a triple-monitor rig.",
    points: [
      "A layout editor: drag and resize each widget over the cockpit",
      "Place widgets onto the side screens of a triple-monitor rig",
      "Race control brings start lights, flags and sector yellows into your layout, without the stock HUD",
    ],
  },
];

/** How you actually get running. Deliberately short. */
const STEPS: { icon: typeof Download; title: string; body: string }[] = [
  {
    icon: Download,
    title: "Install and sign in",
    body:
      `One signed Windows installer, one window, no SmartScreen warnings. Create an account, start the ${TRIAL_DAYS}-day trial, and the server starts itself the moment the app opens.`,
  },
  {
    icon: Boxes,
    title: "Tick the overlays you want",
    body:
      "Each widget is a card with its own switch. Every card has two independent destinations: OBS and in-game. A widget can be on in one and off in the other.",
  },
  {
    icon: Monitor,
    title: "Paste a URL into OBS",
    body:
      "Copy each overlay's Browser Source URL from its card and drop it into your scene. Or skip OBS entirely and use the in-game layer, dragging widgets over the sim.",
  },
  {
    icon: Repeat,
    title: "Stay current, quietly",
    body:
      "The telemetry plugin installs itself, and new versions announce themselves in the app but are never installed for you. A live stream is never interrupted by an update you didn't ask for.",
  },
];

function Bullets({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-6 space-y-3">
      {items.map((point) => (
        <li key={point} className="flex items-start gap-3 text-muted">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success" />
          <span>{point}</span>
        </li>
      ))}
    </ul>
  );
}

function FactTiles({ items }: { items: readonly (readonly [string, string])[] }) {
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2">
      {items.map(([title, body]) => (
        <div key={title} className="rounded-card border border-line bg-base/50 p-4">
          <h3 className="font-display text-sm uppercase tracking-wide text-ink">{title}</h3>
          <p className="mt-1 text-sm text-muted">{body}</p>
        </div>
      ))}
    </div>
  );
}

export default function LmuOverlaysPage() {
  return (
    <div className="pb-8">
      <JsonLd data={buildAioBreadcrumbJsonLd("overlays")} />

      <AioPageHero
        kicker="Apex AIO · Le Mans Ultimate · rFactor 2"
        title={
          <>
            LMU Overlays for <span className="text-gradient">OBS &amp; in-game</span>
          </>
        }
        lead={
          <>
            Twenty lightweight <strong className="text-ink">Le Mans Ultimate overlays</strong> in one
            Windows app — standings, relative, radar, a 3D track map, fuel, tyres, track limits and a
            fully working MFD. Send each one to OBS as a Browser Source for your{" "}
            <strong className="text-ink">LMU streaming overlay</strong>, draw it over the sim as an{" "}
            <strong className="text-ink">in-game HUD</strong>, or both at once. They run inside the
            browser OBS already has, need no plugin for LMU, and work with rFactor 2 too.
          </>
        }
        points={[
          "20 widgets, one price",
          "OBS Browser Source + in-game layer",
          "No plugin needed for LMU",
          "Runs inside OBS's own browser",
          "32 track maps bundled",
        ]}
        actions={
          <Button href="#widgets" size="lg" variant="outline">
            <Layers size={18} />
            See every overlay
          </Button>
        }
        visual={
          <div className="relative">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-x-6 -inset-y-4 rounded-[32px] bg-gradient-to-br from-cyan/5 via-accent/10 to-accent-2/5 blur-2xl"
            />
            <div className="relative grid gap-4">
              <StandingsMock />
              <TrackLimitsMock />
            </div>
          </div>
        }
      />

      {/* ── The catalogue ─────────────────────────────────────────────────── */}
      <section id="widgets" className="scroll-mt-36 py-16">
        <div className="container-rail">
          <Reveal>
            <span className="kicker mb-4">The widget catalogue</span>
            <h2 className="text-4xl font-bold text-ink sm:text-5xl">
              Every LMU overlay <span className="text-gradient">in the box</span>
            </h2>
            <p className="mt-5 max-w-3xl text-lg text-muted">
              Twenty widgets, each with its own switch and its own two destinations — an OBS Browser
              Source and the in-game layer. A widget can be on in one and off in the other, every one
              has its own background-opacity override, and every one of them is included in{" "}
              <Link href="/apex-overlay-system#pricing" className="text-cyan hover:underline">
                the one price
              </Link>
              . Filter by what you need: timing and pace, track and traffic, the car, strategy, or
              your stream.
            </p>
          </Reveal>

          <div className="mt-8">
            <WidgetCatalogue />
          </div>

          {/* The widgets rendered live — the real overlays rebuilt from the app's own drawing code. */}
          <div className="mt-14 grid gap-10">
            <div>
              <h3 className="text-2xl font-bold text-ink">Relative, radar and tyre overlays</h3>
              <p className="mt-2 max-w-3xl text-muted">
                The relative shows the nearest cars on track with a live delta, each tagged in its
                class colour. The proximity radar is a spotter&apos;s-eye strip drawn to true scale,
                with the pit-release light built in. Tyre temps give four-corner temperatures in five
                view modes, from core temp to a full tyre map.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <RelativeMock />
                <RadarMock />
                <TyreTempMock />
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-ink">Speedo cluster and race control</h3>
              <p className="mt-2 max-w-3xl text-muted">
                Speed, gear, revs, hybrid battery and aid chips — the panel lights up as revs rise.
                Race control brings start lights, flags, sector yellows and pit confirmations to your
                own layout, so you can turn off the stock HUD.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <SpeedoMock className="md:col-span-2" />
                <RaceControlMock />
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-ink">Fuel calculator and reference pace</h3>
              <p className="mt-2 max-w-3xl text-muted">
                The fuel calculator gives per-lap use, laps remaining, fuel-to-finish and your pit
                window; the crew can follow the same strategy on the{" "}
                <Link href="/lmu-pit-wall" className="text-cyan hover:underline">
                  LMU pit wall
                </Link>
                . Reference pace puts your lap on a six-band ladder as a percentage of alien pace for
                your exact class and layout, on Ohne Speed&apos;s reference times — and{" "}
                <Link href="/lmu-telemetry" className="text-cyan hover:underline">
                  LMU telemetry review
                </Link>{" "}
                shows you where the rest of the time went.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <FuelMock />
                <RefPaceMock />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── OBS vs in-game ────────────────────────────────────────────────── */}
      <section id="obs-and-in-game" className="scroll-mt-36 border-y border-line bg-surface/30 py-16">
        <div className="container-rail">
          <div className="mb-10 max-w-3xl">
            <span className="kicker mb-4">Two destinations per widget</span>
            <h2 className="text-4xl font-bold text-ink sm:text-5xl">
              OBS overlays and in-game HUD — <span className="text-gradient">one switch each</span>
            </h2>
            <p className="mt-5 text-lg text-muted">
              Every widget has two independent destinations, and each has its own switch. Streamers
              use OBS. Drivers who never stream use the in-game layer. Plenty of people use both at
              once — a full standings tower for the viewers, a slim relative and fuel readout for
              yourself.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {DESTINATIONS.map((d) => (
              <Card key={d.title} variant="default" className="flex flex-col p-7">
                <d.icon size={26} className="text-cyan" />
                <h3 className="mt-4 text-2xl font-bold text-ink">{d.title}</h3>
                <p className="mt-3 text-muted">{d.body}</p>
                <Bullets items={d.points} />
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── MFD deep dive ─────────────────────────────────────────────────── */}
      <section id="mfd" className="container-rail scroll-mt-36 py-16">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="order-2 lg:order-1">
            <MfdMock />
          </div>
          <div className="order-1 lg:order-2">
            <span className="kicker mb-4">The MFD · LMU only</span>
            <h2 className="text-4xl font-bold text-ink">
              The LMU MFD, <span className="text-gradient">driven from your wheel</span>
            </h2>
            <p className="mt-5 text-lg text-muted">
              Every other overlay that mentions an MFD shows you a readout. This one is the menu.
              Race control at the top, LMU&apos;s own pit strategy in the middle — colour-grouped by
              category so tyres, pressures, ducts, aero, fuel and brakes read as blocks rather than a
              wall — and your driving aids underneath: brake bias, TC, ABS and motor map.
            </p>
            <Bullets
              items={[
                "Bind four buttons — up, down, plus, minus — on a wheel, a Stream Deck or a hotkey, and every adjustable row is reachable without taking your hands off the wheel.",
                "The tyre row only offers compounds this car actually has at this event, and clamps at both ends so one blind press can't cancel the tyres you just booked.",
                "Every value is read back from the game before it's shown — if LMU refuses a change, you see what LMU kept, not what you asked for.",
                "Serving a penalty strips the stop back to no service, but leaves your wing, ducts, pressures and fuel ratio alone.",
              ]}
            />

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-card border border-line bg-surface/60 p-5">
                <div className="flex items-center gap-2">
                  <Sliders size={18} className="text-cyan" />
                  <h3 className="font-display text-sm font-bold uppercase tracking-wide text-ink">
                    Over LMU&apos;s REST API
                  </h3>
                </div>
                <p className="mt-2 text-sm text-muted">
                  Pit changes travel over LMU&apos;s own REST API, so the in-game MFD never has to be
                  on screen and the game doesn&apos;t even need to be the focused window.
                </p>
              </div>
              <div className="rounded-card border border-line bg-surface/60 p-5">
                <div className="flex items-center gap-2">
                  <Keyboard size={18} className="text-cyan" />
                  <h3 className="font-display text-sm font-bold uppercase tracking-wide text-ink">
                    Key-binding helper
                  </h3>
                </div>
                <p className="mt-2 text-sm text-muted">
                  The overlay presses LMU&apos;s own key bindings, and a wheel-only binding can&apos;t
                  be pressed from outside the game — so the app finds what&apos;s unbound and binds it
                  for you in one click, using scancodes no keyboard on earth produces. Your existing
                  binds are never touched, a timestamped backup is taken first, and there&apos;s an
                  undo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Track map deep dive ───────────────────────────────────────────── */}
      <section id="track-map" className="scroll-mt-36 border-y border-line bg-surface/30 py-16">
        <div className="container-rail grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <span className="kicker mb-4">
              <MapIcon size={14} className="mr-1 inline" aria-hidden />
              32 bundled, the rest learned
            </span>
            <h2 className="text-4xl font-bold text-ink">
              3D track map <span className="text-gradient">overlay</span>
            </h2>
            <p className="mt-5 text-lg text-muted">
              The radar answers &ldquo;who is beside me&rdquo;. The LMU track map overlay answers
              &ldquo;where is everyone&rdquo; — traffic two corners ahead, how far back the car
              you&apos;re chasing really is, whether a yellow is on your part of the circuit. The
              whole circuit is drawn as a raised 2.5-D ribbon with a dot for every car in the session
              in its class colour.
            </p>
            <p className="mt-4 text-lg text-muted">
              It&apos;s one material lit by one light, not a flat road with a coloured wall glued to
              it. Every segment is shaded from the direction the road actually runs, so a straight
              and the corner it feeds read as two faces of one solid. Elevation is deliberately
              exaggerated and the road is extruded down to a ground plane, so a climb reads as the
              track pulling away from its own base. Two styles ship: the classic red shown here, and
              a brand style whose hue runs cyan at the start line to pink at the end of the lap.
            </p>
            <p className="mt-4 text-muted">
              LMU packs its circuits into encrypted archives and no API exposes the shape of the
              road — but the sim does publish where your car is thirty times a second. So the first
              time you drive an unknown track, the widget builds the map from your own lap, caches it
              locally and draws it instantly every session after. No per-track setup, at any LMU or
              rF2 circuit.
            </p>
            <FactTiles
              items={[
                ["32 circuits in the box", "Le Mans, Spa, Monza, Sebring, Fuji, Imola and the rest of the LMU and WEC calendar, ready to draw."],
                ["Everywhere else, learned", "Built from your first lap, cached locally, drawn instantly forever."],
                ["Cars in true world coordinates", "A car running wide is drawn running wide."],
                ["Your car carries the gradient", "Everyone else in class colour; pit lane faded."],
              ]}
            />
          </div>
          <TrackMapMock large />
        </div>
      </section>

      {/* ── Track limits + pit predictor ──────────────────────────────────── */}
      <section id="track-limits" className="container-rail scroll-mt-36 py-16">
        <div className="mb-10 max-w-3xl">
          <span className="kicker mb-4">The sim&apos;s own numbers</span>
          <h2 className="text-4xl font-bold text-ink sm:text-5xl">
            Track limits and <span className="text-gradient">pit-stop overlays</span>
          </h2>
          <p className="mt-5 text-lg text-muted">
            The two LMU overlays that change how you drive: one tells you how many more careless
            kerbs you can afford, the other what the next stop will cost you.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <TrackLimitsMock large />
            <div className="mt-6">
              <div className="flex items-center gap-3">
                <TrafficCone size={22} className="text-flag-amber" />
                <h3 className="text-2xl font-bold text-ink">LMU track limits overlay</h3>
              </div>
              <p className="mt-4 text-muted">
                LMU charges each cut on the time it gained — a quarter-point for a wheel over the
                line, a full point for a cut that actually gained you something — and issues a
                drive-through when your running total hits the session&apos;s allowance. The headline
                number counts <strong className="text-ink">down</strong>, because that&apos;s the one
                you act on: &ldquo;1.75&rdquo; means a couple more careless kerbs and you&apos;re
                walking down the pit lane.
              </p>
              <p className="mt-4 text-muted">
                When a penalty lands, it&apos;s named — <strong className="text-ink">DRIVE
                THROUGH</strong>, <strong className="text-ink">STOP-GO 10S</strong>, even
                &ldquo;serve within 3 laps&rdquo; — and confirmed with{" "}
                <strong className="text-ink">PENALTY SERVED</strong> when you&apos;ve paid it. A
                rival&apos;s penalty online never touches your own count.
              </p>
            </div>
          </div>

          <div>
            <DamagePredictorMock />
            <div className="mt-6">
              <div className="flex items-center gap-3">
                <Timer size={22} className="text-cyan" />
                <h3 className="text-2xl font-bold text-ink">Pit-stop predictor</h3>
              </div>
              <p className="mt-4 text-muted">
                Mid-stint it answers the question you can&apos;t answer from the cockpit: what does
                this damage cost me to fix? The figure is the sim&apos;s own live estimate, read
                straight through and rounded up to the nearest five seconds so the overlay never
                disagrees with the message on your screen. Tyres are priced separately and shown
                beside it, never summed — two honest figures you can add up beat one that might be
                wrong by the whole tyre time.
              </p>
              <p className="mt-4 text-muted">
                The moment the car stops in its box, that slot becomes a countdown to release with a
                progress bar. Past zero it keeps going and says so, because the booked time is a floor
                and not a promise — LMU draws a random delay when the stop happens and publishes only
                the cap. Freezing on zero and hoping would be the one confidently-wrong number this
                widget is careful never to show.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Lighter — and how it compares ─────────────────────────────────── */}
      <section id="performance" className="scroll-mt-36 border-y border-line bg-surface/30 py-16">
        <div className="container-rail grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <span className="kicker mb-4">Weight is a feature</span>
            <h2 className="text-4xl font-bold text-ink sm:text-5xl">
              The lightest LMU overlays <span className="text-gradient">you can run</span>
            </h2>
            <h3 className="mt-8 text-2xl font-bold text-ink">How it compares</h3>
            <p className="mt-3 text-lg text-muted">
              Most overlay tools solve the problem by launching a second browser and drawing your
              telemetry in it. That&apos;s a whole extra renderer competing with the sim for the frames
              you actually paid your GPU for.
            </p>
            <p className="mt-4 text-lg text-muted">
              This one doesn&apos;t. The overlays are plain HTML and JavaScript rendered by the
              Chromium instance <strong className="text-ink">OBS already runs</strong> for Browser
              Sources — so on stream, nothing new starts at all. Telemetry arrives as compact JSON
              over a loopback WebSocket at a rate you set, stringified once and shared across every
              source rather than re-encoded per widget.
            </p>
            <h3 className="mt-8 text-2xl font-bold text-ink">Built to stay cheap</h3>
            <p className="mt-3 text-lg text-muted">
              <strong className="text-ink">No web fonts</strong> and no CDN, so nothing is fetched at
              runtime; <strong className="text-ink">no blur or backdrop filters</strong>, which are
              expensive to composite live; and the audio cues are synthesised from an oscillator
              rather than played from sound files. The{" "}
              <Link href="/lmu-setups" className="text-cyan hover:underline">
                setup workshop
              </Link>
              , StreamBot and the{" "}
              <Link href="/lmu-race-engineer" className="text-cyan hover:underline">
                voice race engineer
              </Link>{" "}
              live in the control panel — not in your stream.
            </p>
          </div>

          <Card variant="glow" className="p-8">
            <div className="flex items-center gap-3">
              <Cpu className="text-cyan" size={22} />
              <h3 className="text-2xl font-bold text-ink">What that buys you</h3>
            </div>
            <ul className="mt-6 space-y-4">
              {[
                ["No second browser", "Nothing launches alongside your game to draw the overlays."],
                ["No runtime downloads", "Native fonts, no CDN, cues generated in code rather than fetched."],
                ["No live blur", "Backdrop filters are the expensive part of a glassy overlay. There aren't any."],
                ["One small map file", "A whole circuit is ~40 KB, drawn once then blitted each frame."],
                ["A rate you control", "30 Hz by default, adjustable from 1 to 120 with one slider."],
              ].map(([title, body]) => (
                <li key={title} className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success" />
                  <span>
                    <strong className="text-ink">{title}</strong>
                    <span className="mt-0.5 block text-sm text-muted">{body}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="container-rail mt-10">
          <Card variant="default" className="flex items-start gap-4 p-6">
            <ShieldAlert size={22} className="mt-0.5 shrink-0 text-flag-amber" />
            <div className="text-sm text-muted">
              <h3 className="font-bold text-ink">rFactor 2 overlays — and where the data isn&apos;t there</h3>
              <p className="mt-2">
                The standings, relative, radar, track map, speedo, motion, pedals and fuel widgets
                work on rFactor 2 as well as LMU. The MFD, race control, track-limit, damage and
                setup features depend on data rFactor 2 doesn&apos;t publish, so on rF2 they read
                &ldquo;no data&rdquo; rather than showing a plausible zero. Track-limit charges can
                arrive up to ~25 seconds late because of how LMU flushes its log — the total is
                right, sometimes it&apos;s right late. And repair and tyre times are shown side by
                side rather than added together, because whether they overlap hasn&apos;t been
                verified against a real stop.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Setup ─────────────────────────────────────────────────────────── */}
      <section id="setup" className="container-rail scroll-mt-36 py-16">
        <div className="mb-10 text-center">
          <span className="kicker mb-4">Install → on screen</span>
          <h2 className="text-4xl font-bold text-ink sm:text-5xl">
            Set up in OBS <span className="text-gradient">in minutes</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted">
            No terminal, no config files, no editing game directories. Open the app, tick what you
            want, paste a URL.
          </p>
        </div>

        <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.title}>
              <Card variant="default" className="flex h-full flex-col gap-4 p-6">
                <div className="flex items-center justify-between">
                  <span className="font-display text-4xl font-bold text-line">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <step.icon size={24} className="text-accent" />
                </div>
                <h3 className="text-xl font-bold text-ink">{step.title}</h3>
                <p className="text-sm text-muted">{step.body}</p>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <AioFaq
        heading="LMU overlay questions"
        className="border-t border-line"
        items={[...getAioFaq("overlays"), ...PAGE_FAQ]}
      />

      <AioRelatedPages current="overlays" />

      <AioTrialCta body="Every LMU overlay — in OBS, over the sim, or both — plus the race engineer, setups, pit wall and Review in the same app. Install it before your next session and see what you've been driving without." />
    </div>
  );
}
