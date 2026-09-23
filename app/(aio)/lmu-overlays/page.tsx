import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
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
import { SectionHeading } from "@/components/aio/SectionHeading";
import { Annotated, type Annotation } from "@/components/aio/overlays/Annotated";
import { AIO_PRODUCT, AIO_REVIEWS } from "@/lib/aio";
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
    a: "It depends what you race with, but a good Le Mans Ultimate set covers timing, traffic, the car and strategy. Apex AIO ships twenty widgets for that: standings, relative, delta, proximity radar, fuel calculator, tyre temps, pedals and a speedo cluster. It also has a fully working MFD you can drive from your wheel, track limits in the stewards' own points, a pit-stop predictor built from the sim's repair estimate, a 3D track map with 32 circuits bundled, and your pace against Ohne Speed's reference times. Every one runs in OBS's own browser or over the game, and all of them are in the one price.",
  },
  {
    q: "How do I add an LMU overlay to OBS?",
    page: "overlays",
    a: "Install Apex AIO, sign in and start the trial. The overlay server starts itself when the app opens. Tick the widgets you want, copy each one's Browser Source URL from its card, and paste it into a Browser Source in your OBS scene. There is nothing to set up in a terminal, config file or game directory; Le Mans Ultimate works out of the box over its own REST API.",
  },
  {
    q: "Can I change how often the overlays update?",
    page: "overlays",
    a: "Yes. Telemetry is sent at 30 Hz by default, and one slider takes it anywhere from 1 to 120 Hz. Each frame is compact JSON of around 1–2 KB over a loopback WebSocket, so it never leaves your machine, and it is serialised once and shared by every source rather than re-encoded per widget.",
  },
  {
    q: "Are all the LMU overlays included in the subscription?",
    page: "overlays",
    a: `Yes. There is one plan: ${TRIAL_DAYS} days free, then ${PRICE} a month. It includes all twenty widgets in both destinations (OBS and in-game), the race engineer, setup tools, pit wall and every update. There is no cut-down tier and no widget held back as an upsell.`,
  },
];

/** The two destinations, side by side. `both` spans the two columns. */
const DESTINATIONS: { label: string; obs?: ReactNode; game?: ReactNode; both?: ReactNode }[] = [
  { label: "Made for", obs: "Streaming", game: "Driving" },
  {
    label: "Drawn by",
    obs: "The Chromium instance OBS already runs for Browser Sources. Nothing new starts on your PC.",
    game: "The app, directly over the sim.",
  },
  {
    label: "Placement",
    obs: "One URL per widget, copied from its card, so each one sits exactly where your scene wants it.",
    game: "A layout editor: drag and resize each widget over the cockpit, including onto the side screens of a triple-monitor rig.",
  },
  { label: "Background", both: "Its own opacity override on every widget." },
  {
    label: "Specific to it",
    obs: "Stream chat merges YouTube and Twitch into one column, Super Chats included.",
    game: "Race control brings start lights, flags and sector yellows into your layout, so the stock HUD can go.",
  },
];

/** Teardown notes for the MFD mock. Positions are % of the mock's box. */
const MFD_NOTES: Annotation[] = [
  {
    side: "left",
    x: 30,
    y: 20,
    label: "Race control",
    body: "Serving a penalty strips the stop back to no service, and leaves your wing, ducts, pressures and fuel ratio alone.",
  },
  {
    side: "left",
    x: 2,
    y: 56,
    label: "Colour groups",
    body: "Tyres, pressures, ducts, aero, fuel and brakes each carry a colour, so the menu reads as blocks.",
  },
  {
    side: "left",
    x: 22,
    y: 88,
    label: "Driving aids",
    body: "Brake bias, TC, ABS and motor map, on the same four buttons.",
  },
  {
    side: "right",
    x: 99,
    y: 2,
    label: "Read back",
    body: "Every value is read back from the game before it's shown. If LMU refuses a change, you see what LMU kept.",
  },
  {
    side: "right",
    x: 70,
    y: 51,
    label: "Tyre row",
    body: "Only offers compounds this car has at this event, and clamps at both ends so one blind press can't cancel the tyres you just booked.",
  },
  {
    side: "right",
    x: 93,
    y: 77,
    label: "Four binds",
    body: "Up, down, plus, minus. Put them on a wheel, a Stream Deck or a hotkey and every adjustable row is in reach.",
  },
];

/** The live widgets, laid out like a monitor wall. */
function WallTile({
  name,
  note,
  className,
  children,
}: {
  name: string;
  note: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <figure className={className}>
      {children}
      <figcaption className="mt-3 flex gap-3 border-t border-line pt-3 text-sm text-muted">
        <span className="shrink-0 font-mono text-[10px] uppercase leading-5 tracking-[0.2em] text-cyan">{name}</span>
        <span>{note}</span>
      </figcaption>
    </figure>
  );
}

const STEPS: { title: string; body: string }[] = [
  {
    title: "Install and sign in",
    body: `One signed Windows installer, no SmartScreen warning. Create an account and start the ${TRIAL_DAYS}-day trial. The server starts itself when the app opens.`,
  },
  {
    title: "Tick the overlays",
    body: "Each widget is a card with a switch for OBS and a switch for in-game. One can be on and the other off.",
  },
  {
    title: "Paste a URL into OBS",
    body: "Copy the widget's Browser Source URL from its card into your scene. Or skip OBS and drag widgets over the sim instead.",
  },
  {
    title: "Updates wait for you",
    body: "The telemetry plugin installs itself. New versions are announced in the app and never installed for you, so an update can't interrupt a live stream.",
  },
];

const PERFORMANCE: [string, string][] = [
  ["Second browser", "None. Nothing launches beside the game to draw the overlays."],
  ["Runtime downloads", "None. Native fonts, no CDN."],
  ["Blur and backdrop filters", "None. They are the expensive part of a glassy overlay."],
  ["Audio cues", "Synthesised from an oscillator, not played from files."],
  ["Track map", "~40 KB per circuit, drawn once then blitted each frame."],
  ["Telemetry rate", "30 Hz default, 1–120 Hz on one slider."],
  ["Frame size", "~1–2 KB of JSON over loopback, serialised once for every source."],
];

const quote = AIO_REVIEWS.find((r) => r.author === "Timmy P") ?? AIO_REVIEWS[0];

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
            Twenty <strong className="text-ink">Le Mans Ultimate overlays</strong> in one Windows app:
            standings, relative, radar, a 3D track map, fuel, tyres, track limits and a working MFD.
            Send each one to OBS as a Browser Source for your{" "}
            <strong className="text-ink">LMU streaming overlay</strong>, draw it over the sim as an{" "}
            <strong className="text-ink">in-game HUD</strong>, or both. They run in the browser OBS
            already has, need no plugin for LMU, and work with rFactor 2.
          </>
        }
        stats={[
          { value: "20", label: "Widgets" },
          { value: "32", label: "Track maps bundled" },
          { value: "2", label: "Destinations each" },
          { value: "1–120", label: "Hz, your choice" },
        ]}
        points={["One price, every widget", "No plugin needed for LMU", "Runs in OBS's own browser"]}
        actions={
          <Button href="#widgets" size="lg" variant="outline">
            See every overlay
          </Button>
        }
        visualCaption="Overlay · Standings"
        visual={<StandingsMock />}
      />

      {/* ── 01 The catalogue ──────────────────────────────────────────────── */}
      <section id="widgets" className="scroll-mt-36 py-20">
        <div className="container-rail">
          <Reveal>
            <SectionHeading
              index="01"
              label="Catalogue"
              title="Every LMU overlay in the box"
              lead={
                <>
                  Twenty widgets. Each has its own switch, its own two destinations (an OBS Browser
                  Source and the in-game layer) and its own background-opacity override. All twenty are
                  in{" "}
                  <Link href="/apex-overlay-system#pricing" className="text-cyan hover:underline">
                    the one price
                  </Link>
                  .
                </>
              }
            />
          </Reveal>
          <WidgetCatalogue />
        </div>
      </section>

      {/* ── 02 The monitor wall ───────────────────────────────────────────── */}
      <section id="on-screen" className="scroll-mt-36 border-y border-line bg-surface/30 py-20">
        <div className="container-rail">
          <SectionHeading
            index="02"
            label="On screen"
            title="Relative, radar, fuel and tyre overlays"
            lead="The widgets below are rebuilt from the app's own drawing code. The data is a representative LMU session, not live telemetry."
          />
          <div className="grid gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-12">
            <WallTile name="Relative" note="The nearest cars on track with a live delta, each tagged in its class colour." className="lg:col-span-5">
              <RelativeMock />
            </WallTile>
            <WallTile name="Radar" note="A spotter's-eye strip drawn to true scale, with the pit-release light built in." className="lg:col-span-3">
              <RadarMock />
            </WallTile>
            <WallTile name="Tyres" note="Four-corner temperatures in five view modes, from core temp to a full tyre map." className="md:col-span-2 lg:col-span-4">
              <TyreTempMock />
            </WallTile>
            <WallTile name="Speedo" note="Speed, gear, revs, hybrid battery and aid chips. The panel lights up as revs rise." className="md:col-span-2 lg:col-span-8">
              <SpeedoMock />
            </WallTile>
            <WallTile name="Race control" note="Start lights, flags, sector yellows and pit confirmations in your own layout." className="md:col-span-2 lg:col-span-4">
              <RaceControlMock />
            </WallTile>
            <WallTile
              name="Fuel"
              note={
                <>
                  Per-lap use, laps remaining, fuel to finish and your pit window. The crew can follow
                  the same numbers on the{" "}
                  <Link href="/lmu-pit-wall" className="text-cyan hover:underline">
                    LMU pit wall
                  </Link>
                  .
                </>
              }
              className="lg:col-span-6"
            >
              <FuelMock />
            </WallTile>
            <WallTile
              name="Ref pace"
              note={
                <>
                  Your lap on a six-band ladder, as a percentage of alien pace for your class and
                  layout, on Ohne Speed&apos;s reference times.{" "}
                  <Link href="/lmu-telemetry" className="text-cyan hover:underline">
                    LMU telemetry review
                  </Link>{" "}
                  shows where the rest of the time went.
                </>
              }
              className="lg:col-span-6"
            >
              <RefPaceMock />
            </WallTile>
          </div>
        </div>
      </section>

      {/* ── 03 OBS vs in-game, as a spec sheet ────────────────────────────── */}
      <section id="obs-and-in-game" className="container-rail scroll-mt-36 py-20">
        <SectionHeading
          index="03"
          label="Destinations"
          title="OBS overlays and in-game HUD, one switch each"
          lead="Every widget has two independent destinations. Streamers use OBS, drivers who never stream use the in-game layer, and plenty run both: a full standings tower for the viewers, a slim relative and fuel readout for themselves."
        />
        <div className="border-t border-line">
          <div className="hidden grid-cols-[11rem_1fr_1fr] gap-8 border-b border-line py-3 font-mono text-[10px] uppercase tracking-[0.24em] text-subtle md:grid">
            <span />
            <h3 className="font-mono text-[11px] font-normal tracking-[0.24em] text-cyan">OBS Browser Source</h3>
            <h3 className="font-mono text-[11px] font-normal tracking-[0.24em] text-cyan">In-game HUD layer</h3>
          </div>
          <dl>
            {DESTINATIONS.map((row) => (
              <div key={row.label} className="grid gap-2 border-b border-line py-4 md:grid-cols-[11rem_1fr_1fr] md:gap-8">
                <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">{row.label}</dt>
                {row.both ? (
                  <dd className="text-ink md:col-span-2">{row.both}</dd>
                ) : (
                  <>
                    <dd className="text-ink">
                      <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan md:hidden">OBS</span>
                      {row.obs}
                    </dd>
                    <dd className="text-ink">
                      <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan md:hidden">In-game</span>
                      {row.game}
                    </dd>
                  </>
                )}
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── 04 MFD teardown ───────────────────────────────────────────────── */}
      <section id="mfd" className="scroll-mt-36 border-t border-line py-20">
        <div className="container-rail">
          <SectionHeading
            index="04"
            label="MFD · LMU only"
            title="The LMU MFD, driven from your wheel"
            lead="A working copy of LMU's MFD menu, driven from four buttons: race control at the top, LMU's own pit strategy in the middle, your driving aids underneath."
          />
          <Annotated caption="Overlay · MFD" meta="Teardown" notes={MFD_NOTES} mockWidth={26}>
            <MfdMock />
          </Annotated>

          <div className="mt-12 grid gap-10 md:grid-cols-2">
            <div className="border-l border-line pl-5">
              <h3 className="font-mono text-[11px] font-normal tracking-[0.24em] text-cyan">Over LMU&apos;s REST API</h3>
              <p className="mt-3 text-muted">
                Pit changes travel over LMU&apos;s own REST API. The in-game MFD never has to be on
                screen, and the game doesn&apos;t need to be the focused window.
              </p>
            </div>
            <div className="border-l border-line pl-5">
              <h3 className="font-mono text-[11px] font-normal tracking-[0.24em] text-cyan">Key-binding helper</h3>
              <p className="mt-3 text-muted">
                The overlay presses LMU&apos;s own key bindings, and a wheel-only binding can&apos;t be
                pressed from outside the game. So the app finds what&apos;s unbound and binds it in one
                click, using scancodes no keyboard produces. Your existing binds aren&apos;t touched, a
                timestamped backup is taken first, and there&apos;s an undo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 05 Track map, 7/5 ─────────────────────────────────────────────── */}
      <section id="track-map" className="scroll-mt-36 border-y border-line bg-surface/30 py-20">
        <div className="container-rail">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
            <figure className="border border-line bg-base/60 lg:col-span-7">
              <figcaption className="flex items-center justify-between border-b border-line px-4 py-2 font-mono text-[10px] uppercase tracking-[0.24em] text-subtle">
                <span>Overlay · Track map</span>
                <span className="text-cyan">Classic red</span>
              </figcaption>
              <div className="p-4 sm:p-6">
                <TrackMapMock large />
              </div>
            </figure>

            <div className="lg:col-span-5">
              <SectionHeading
                index="05"
                label="32 bundled, the rest learned"
                title="3D track map overlay"
                lead="The radar tells you who is beside you. The track map shows where everyone is: traffic two corners ahead, the real gap to the car you're chasing, and whether a yellow is on your part of the circuit."
              />
              <ol className="border-t border-line">
                {[
                  ["32 circuits in the box", "Le Mans, Spa, Monza, Sebring, Fuji, Imola and the rest of the LMU and WEC calendar."],
                  ["Everywhere else, learned", "Built from your first lap, cached locally, drawn instantly after that."],
                  ["True world coordinates", "A car running wide is drawn running wide."],
                  ["Your car carries the gradient", "Everyone else is in class colour. Pit lane is faded."],
                ].map(([title, body], i) => (
                  <li key={title} className="grid grid-cols-[2rem_1fr] gap-3 border-b border-line py-3">
                    <span className="font-mono text-xs tabular-nums text-subtle">{String(i + 1).padStart(2, "0")}</span>
                    <span>
                      <span className="block font-semibold text-ink">{title}</span>
                      <span className="text-sm text-muted">{body}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="mt-12 grid gap-8 text-muted md:grid-cols-2">
            <p>
              The circuit is a raised 2.5-D ribbon with a dot for every car in the session, lit as one
              material by one light. Each segment is shaded from the direction the road runs, so a
              straight and the corner it feeds read as two faces of one solid. Elevation is exaggerated
              and the road is extruded down to a ground plane, so a climb reads as the track pulling
              away from its base. Two styles ship: the classic red shown here, and a brand style that
              runs cyan at the start line to pink at the end of the lap.
            </p>
            <p>
              LMU packs its circuits into encrypted archives, and no API exposes the shape of the road.
              The sim does publish where your car is thirty times a second. So the first time you drive
              an unknown track, the widget builds the map from your own lap, caches it locally and
              draws it instantly every session after. There&apos;s no per-track setup, at any LMU or rF2
              circuit.
            </p>
          </div>
        </div>
      </section>

      {/* ── 06 Track limits + pit predictor, double feature ───────────────── */}
      <section id="track-limits" className="container-rail scroll-mt-36 py-20">
        <SectionHeading
          index="06"
          label="The sim's own numbers"
          title="Track limits and pit-stop overlays"
          lead="One tells you how many more careless kerbs you can afford. The other tells you what the next stop will cost."
        />

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-0 lg:divide-x lg:divide-line">
          <div className="lg:pr-12">
            <h3 className="text-2xl font-bold text-ink">LMU track limits overlay</h3>
            <dl className="mt-6 grid grid-cols-2 border-y border-line">
              <div className="flex flex-col-reverse py-4 pr-4">
                <dt className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">A wheel over the line</dt>
                <dd className="font-mono text-4xl font-semibold tabular-nums leading-none text-flag-amber">0.25</dd>
              </div>
              <div className="flex flex-col-reverse border-l border-line py-4 pl-4">
                <dt className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">A cut that gained time</dt>
                <dd className="font-mono text-4xl font-semibold tabular-nums leading-none text-flag-amber">1.00</dd>
              </div>
            </dl>
            <div className="mt-6">
              <TrackLimitsMock large />
            </div>
            <p className="mt-6 text-muted">
              LMU charges each cut on the time it gained and issues a drive-through when your running
              total reaches the session&apos;s allowance. The headline number counts{" "}
              <strong className="text-ink">down</strong>, because that&apos;s the one you act on:
              &ldquo;1.75&rdquo; means a couple more careless kerbs and you&apos;re in the pit lane.
            </p>
            <p className="mt-4 text-muted">
              Penalties are named when they land (<strong className="text-ink">DRIVE THROUGH</strong>,{" "}
              <strong className="text-ink">STOP-GO 10S</strong>, even &ldquo;serve within 3 laps&rdquo;)
              and confirmed with <strong className="text-ink">PENALTY SERVED</strong> once paid. A
              rival&apos;s penalty online never touches your count.
            </p>
          </div>

          <div className="lg:pl-12">
            <h3 className="text-2xl font-bold text-ink">Pit-stop predictor</h3>
            <div className="mt-6">
              <DamagePredictorMock />
            </div>
            <dl className="mt-6 border-t border-line text-sm">
              {[
                ["Repair", "The sim's own live estimate, rounded up to the nearest 5 s so it matches the message on your screen."],
                ["Tyres", "Priced separately and shown beside the repair time. Never summed."],
                ["In the box", "The slot becomes a countdown to release, with a progress bar."],
                ["Past zero", "It keeps counting and says so. The booked time is a floor: LMU adds a random delay at the stop and publishes only the cap."],
              ].map(([term, detail]) => (
                <div key={term} className="grid grid-cols-[6.5rem_1fr] gap-4 border-b border-line py-3">
                  <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">{term}</dt>
                  <dd className="text-muted">{detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ── Pull quote ────────────────────────────────────────────────────── */}
      <section aria-label="What drivers say" className="border-y border-line bg-surface/30 py-16">
        <figure className="container-rail max-w-4xl">
          <blockquote className="font-display text-3xl font-bold uppercase leading-tight text-ink sm:text-4xl">
            &ldquo;{quote.body}&rdquo;
          </blockquote>
          <figcaption className="mt-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-subtle">
            <span aria-hidden className="h-px w-8 bg-line" />
            <span className="text-ink">{quote.author}</span>
            <span>{quote.context}</span>
          </figcaption>
        </figure>
      </section>

      {/* ── 07 Performance, prose + spec sheet ────────────────────────────── */}
      <section id="performance" className="container-rail scroll-mt-36 py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5">
            <SectionHeading index="07" label="Weight" title="The lightest LMU overlays you can run" />
            <h3 className="text-xl font-bold text-ink">How it compares</h3>
            <p className="mt-3 text-muted">
              Most overlay tools launch a second browser and draw your telemetry in it. That is a whole
              extra renderer competing with the sim for GPU frames.
            </p>
            <p className="mt-4 text-muted">
              Apex AIO&apos;s overlays are plain HTML and JavaScript, rendered by the Chromium instance{" "}
              <strong className="text-ink">OBS already runs</strong> for Browser Sources. On stream,
              nothing new starts. The{" "}
              <Link href="/lmu-setups" className="text-cyan hover:underline">
                setup workshop
              </Link>
              , StreamBot and the{" "}
              <Link href="/lmu-race-engineer" className="text-cyan hover:underline">
                voice race engineer
              </Link>{" "}
              live in the control panel, not in your stream.
            </p>
          </div>

          <div className="lg:col-span-7">
            <h3 className="mb-4 font-mono text-[11px] font-normal tracking-[0.24em] text-cyan">Spec sheet</h3>
            <dl className="border-t border-line">
              {PERFORMANCE.map(([term, detail]) => (
                <div key={term} className="grid gap-1 border-b border-line py-3 sm:grid-cols-[13rem_1fr] sm:gap-6">
                  <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">{term}</dt>
                  <dd className="font-mono text-sm tabular-nums text-ink">{detail}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-10 border-l-2 border-flag-amber/70 pl-5">
              <h3 className="text-lg font-bold text-ink">rFactor 2 overlays, and where the data isn&apos;t there</h3>
              <p className="mt-3 text-sm text-muted">
                The standings, relative, radar, track map, speedo, motion, pedals and fuel widgets work
                on rFactor 2 as well as LMU. The MFD, race control, track-limit, damage and setup
                features depend on data rFactor 2 doesn&apos;t publish, so on rF2 they read &ldquo;no
                data&rdquo; rather than showing a plausible zero.
              </p>
              <p className="mt-3 text-sm text-muted">
                Track-limit charges can arrive up to ~25 seconds late because of how LMU flushes its
                log. The total is right, sometimes late. Repair and tyre times are shown side by side
                rather than added, because whether they overlap hasn&apos;t been verified against a real
                stop.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 08 Setup, as a timeline ───────────────────────────────────────── */}
      <section id="setup" className="scroll-mt-36 border-t border-line py-20">
        <div className="container-rail">
          <SectionHeading
            index="08"
            label="Install to on screen"
            title="Set up in OBS in minutes"
            lead="Nothing to configure by hand. Open the app, tick what you want, paste a URL."
            align="center"
          />
          <ol className="relative grid gap-8 md:grid-cols-4 md:gap-6">
            <span aria-hidden className="absolute left-0 right-0 top-[11px] hidden h-px bg-line md:block" />
            {STEPS.map((step, i) => (
              <li key={step.title} className="relative">
                <span className="relative inline-flex items-center gap-3 bg-base pr-3 font-mono text-xs tabular-nums text-cyan">
                  <span aria-hidden className="h-[9px] w-[9px] border border-cyan bg-base" />
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 text-xl font-bold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <AioFaq
        heading="LMU overlay questions"
        index="09"
        className="border-t border-line"
        items={[...getAioFaq("overlays"), ...PAGE_FAQ]}
      />

      <AioRelatedPages current="overlays" />

      <AioTrialCta body="Every LMU overlay, in OBS, over the sim or both, plus the race engineer, setups, pit wall and Review in the same app. Install it before your next session." />
    </div>
  );
}
