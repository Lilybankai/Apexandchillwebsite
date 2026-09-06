import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Boxes,
  CheckCircle2,
  ChevronDown,
  Cpu,
  Download,
  Layers,
  Map as MapIcon,
  Mic,
  Monitor,
  Radio,
  Repeat,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Timer,
  TrafficCone,
  Trophy,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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
import { AskEngineer } from "@/components/overlay/AskEngineer";
import { AioEngineeringFeatures } from "@/components/overlay/AioEngineeringFeatures";
import { AioReviews } from "@/components/overlay/AioReviews";
import { WidgetCatalogue } from "@/components/overlay/WidgetCatalogue";
import { AIO_PRODUCT } from "@/lib/aio";
import {
  AIO_BREADCRUMB_JSON_LD,
  AIO_METADATA,
  buildAioSoftwareJsonLd,
} from "@/lib/aio-seo";

/**
 * ── OPERATOR: THE LIVE LINKS ─────────────────────────────────────────────────
 * INSTALLER_URL points at a GitHub Release asset so the ~330 MB binary (the
 * voice engineer is bundled and signed inside it) never lands in this repo.
 * To ship a new build: publish the release from the app repo
 * (`npm run release`), then update the product details in `lib/aio.ts`.
 * Existing installs auto-update themselves, so this link only serves new users.
 */
const {
  discordUrl: DISCORD_URL,
  installerFilename: INSTALLER_FILENAME,
  installerUrl: INSTALLER_URL,
  priceDisplay: PRICE,
  trialDays: TRIAL_DAYS,
  version: APP_VERSION,
} = AIO_PRODUCT;

export const metadata = AIO_METADATA;

/** The things no other LMU tool ships. The core sales pitch. */
const EXCLUSIVES: { icon: typeof Sliders; title: string; tag: string; body: string }[] = [
  {
    icon: Mic,
    title: "A voice race engineer",
    tag: "Press, ask, drive",
    body:
      "Bind one wheel button, press it, and ask out loud — gap behind, fuel to the end, who's ahead, what the weather's doing. Twenty-eight questions are answered instantly from live telemetry, on your PC, free and offline. Harder questions go to an AI engineer, with your voice transcribed locally so audio never leaves your machine. Six voices; Alan says \"Say again?\" rather than guessing.",
  },
  {
    icon: Sliders,
    title: "A fully working MFD",
    tag: "Nobody else has this",
    body:
      "Not a picture of the pit menu — the actual menu. Read every row, then change it from a wheel button, a Stream Deck or a hotkey. Tyres, fuel, pressures, ducts, wing, brake bias, TC, ABS and motor map. Pit changes go over LMU's own REST API, so the in-game MFD never has to be on screen and the game doesn't even need to be the focused window.",
  },
  {
    icon: BadgeCheck,
    title: "Pace against the aliens",
    tag: "Ohne Speed's numbers",
    body:
      "Your best lap as a live percentage of alien pace for your exact class and layout, on Ohne Speed's reference times — the ones the community actually trusts. A six-band ladder from Alien to Offline answers the question no delta bar can: not how fast that lap was, but how fast you are.",
  },
  {
    icon: Settings2,
    title: "Live setup engineering",
    tag: "The garage, in a panel",
    body:
      "Every garage setting in an editor where changes land in the car instantly. Ten engineer macros stage balanced changes from an intent — more front turn-in, more rear stability — with nothing applied until you say so. A setup library keeps named, tagged copies of real .svm files where LMU can't overwrite them, and community setups share tunes with ratings gated on actually having driven them.",
  },
  {
    icon: MapIcon,
    title: "3D track maps",
    tag: "32 bundled, the rest learned",
    body:
      "The whole circuit as a raised 2.5-D ribbon lit by a single light, with a dot for every car in the session in its class colour. Thirty-two LMU and WEC circuits ship in the box; anywhere else, the map is built from your own first lap and cached forever — so it works at every LMU and rF2 circuit, including ones that don't exist yet.",
  },
  {
    icon: TrafficCone,
    title: "Corner cuts & pit countdowns",
    tag: "The sim's own numbers",
    body:
      "Track limits in the stewards' own points — how much allowance is left, what each cut was charged, penalties named to your face: DRIVE THROUGH, STOP-GO 10S. And when the car stops in its box, a live countdown to release built from the sim's own repair estimate, which keeps counting past zero rather than freezing on a number it can't promise.",
  },
];

/** Beyond the overlays — the modules that make it an all-in-one. */
const MODULES: { icon: typeof Bot; title: string; body: string }[] = [
  {
    icon: Monitor,
    title: "Team engineering pit wall",
    body:
      "Timing, track map, live fuel strategy, per-corner tyres and brakes, car state, weather and lap trends on one board. Team relay automatically follows whoever is driving and labels stale data before it can mislead the crew.",
  },
  {
    icon: Bot,
    title: "StreamBot",
    body:
      "A bot that types in your chat on Twitch and YouTube: up to 50 commands, timed messages, editable alerts for subs, gifts, memberships and Super Chats, and on-screen goals. YouTube API quota is tracked in a ledger so a long stream never silently runs dry.",
  },
  {
    icon: Trophy,
    title: "League leaderboards",
    body:
      "Every completed lap is logged locally with the app's own clean-lap rule, then synced to the league board — every member's best clean lap, ranked and filterable by track, class and car, with your own row marked. Practice and qualifying count too.",
  },
  {
    icon: Settings2,
    title: "Setup workshop",
    body:
      "The live garage editor, engineer macros, your private setup library and the league's community setups — published tunes sorted by proven pace, downloadable straight into the game's own setup screen, each linked to the lap it was driven on.",
  },
  {
    icon: Radio,
    title: "Proactive radio",
    body:
      "The engineer doesn't only answer — on a dial you control, he calls the things that matter on his own: flags, fuel, penalties and damage on Essential; fastest laps, position changes and rivals' pit stops on Standard. Off means off.",
  },
];

/** Hard, checkable claims. Everything here is measurable in the app. */
const FACTS: { stat: string; label: string; body: string }[] = [
  {
    stat: "28",
    label: "questions answered offline",
    body:
      "The race engineer's core question set is answered locally from live telemetry — no cloud, no per-use cost, works with the internet unplugged. Only free-form questions use AI, and even those transcribe your voice on your own PC.",
  },
  {
    stat: "0",
    label: "extra renderers on stream",
    body:
      "The overlays are plain HTML and JS rendered by the Chromium instance OBS already runs for Browser Sources. No second browser runtime is shipped or started.",
  },
  {
    stat: "1–2 KB",
    label: "per telemetry frame",
    body:
      "Compact JSON over a loopback WebSocket at 30 Hz — around 30–60 KB/s, never leaving your machine. Each frame is serialised once and the same buffer goes to every source.",
  },
  {
    stat: "32",
    label: "circuits bundled in the box",
    body:
      "Le Mans, Spa, Monza, Sebring, Fuji, Imola and the rest of the calendar ship as track maps ready to draw. Anywhere else is learned from your own first lap and cached forever.",
  },
  {
    stat: "72 h",
    label: "offline grace on your subscription",
    body:
      "A confirmed subscription keeps working for three full days with no internet at all — so a LAN, a race weekend away, or an ISP outage never locks you out mid-event.",
  },
  {
    stat: "Signed",
    label: "installer, updates and voice engine",
    body:
      "Every build is code-signed via Azure Trusted Signing under The Lilybank Agency Ltd. No SmartScreen \"unknown publisher\" prompt, and the bundled speech engine is signed too, so antivirus never sees an unsigned download.",
  },
];

/** How you actually get running. Deliberately short. */
const STEPS: { icon: typeof Download; title: string; body: string }[] = [
  {
    icon: Download,
    title: "Install and sign in",
    body:
      "One signed Windows installer, one window, no SmartScreen warnings. Create an account, start the 7-day trial, and the server starts itself the moment the app opens.",
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

const FAQ: { q: string; a: string }[] = [
  {
    q: "Is the race engineer always listening?",
    a: "No, and this is deliberate. The microphone only opens while you hold your bound push-to-talk button — there's no wake word and no open mic. For the 28 core questions everything happens on your PC. For free-form questions your speech is transcribed locally by whisper.cpp, so your audio never leaves your machine; only the transcribed text plus a telemetry summary is sent to be answered. And when he can't make out what you said, he asks \"Say again?\" rather than guessing.",
  },
  {
    q: "Does the race engineer cost extra?",
    a: `No. The engineer — voices, speech recognition and all — is bundled inside the installer, signed, with nothing to download afterwards. The 28 telemetry questions are answered locally and are effectively free forever. Free-form AI questions are included in the ${PRICE} subscription with a generous monthly allowance.`,
  },
  {
    q: "Where do the reference lap times come from?",
    a: "From Ohne Speed, with lap times contributed by beAlien, Go and Hymo — the reference set the LMU community actually benchmarks against. The Reference Pace widget reads those times for your exact class and layout and places your best lap on a six-band ladder from Alien to Offline. The credit is shown in the widget itself, every time a score is on screen — it's their work, and the app only reads it.",
  },
  {
    q: "What makes it lighter than other LMU overlays?",
    a: "Mainly one decision: the overlays are plain HTML and JavaScript rendered by the Chromium instance OBS already starts for Browser Sources. Nothing extra is shipped or launched, whereas an overlay tool built on its own Electron app keeps a second full Chromium and Node process resident for your entire stream. The widgets avoid the expensive things too — no web fonts, no CDN, no blur or backdrop filters — and telemetry is 1–2 KB per frame over a loopback WebSocket at a rate you control.",
  },
  {
    q: "Do I need to install a plugin or edit game files?",
    a: "You don't even need to install the plugin yourself. Le Mans Ultimate works out of the box over LMU's own REST API; the optional shared-memory plugin — which adds pedal inputs and tyre detail for the car you're driving, and is required for plain rFactor 2 — is installed into the game by the app itself, correctly, with one click.",
  },
  {
    q: "Is this only for streamers?",
    a: "No. Every widget has two independent destinations — an OBS Browser Source and an in-game layer that draws over the sim itself. Drivers who never stream use the in-game layer with the layout editor, dragging and resizing each widget exactly where they want it over the cockpit — including onto the side screens of a triple-monitor rig. Streamers use OBS. Plenty of people use both at once.",
  },
  {
    q: "Can I really change my pit strategy from the overlay?",
    a: "Yes, and no other LMU overlay does it. The MFD widget mirrors the sim's own pit menu and driving aids, and every adjustable row can be driven from four bindable buttons — up, down, plus and minus — on a wheel, a Stream Deck or a hotkey. Pit changes go over LMU's REST API, so the in-game MFD never has to be on screen and the game doesn't even need to be the focused window.",
  },
  {
    q: "How do the 3D track maps work?",
    a: "Thirty-two LMU and WEC circuits ship bundled, ready to draw the moment you load in. For anywhere else: LMU packs its circuits into encrypted archives and no API exposes the shape of the road — but the sim does publish where your car is thirty times a second. The first time you drive an unknown track the widget builds the map from your own lap, then caches it locally and draws it instantly, every session, forever. No per-track setup, ever.",
  },
  {
    q: "Are the track-limit points accurate?",
    a: "They're the sim's own numbers, not an estimate. LMU publishes its stewarding to its trace log, which the overlay reads; the reader was validated against a real session-end results file and reproduced every one of that race's charges in order. Penalties are named as the stewards name them — DRIVE THROUGH, STOP-GO 10S — with a PENALTY SERVED confirmation, and a rival's penalty online never touches your own count. The one caveat is timing: LMU flushes that log in blocks, so a charge can arrive up to ~25 seconds after the cut. The total is always right; occasionally it's right late.",
  },
  {
    q: "How does the setup optimiser change the car?",
    a: "The Race engineer uses ten intent sliders — including front turn-in, rear traction, braking stability and kerb compliance — to stage balanced changes across the real setup keys available on your current car. It never applies those changes silently: you see every proposed value first, and ruleset-locked or unavailable settings are skipped. Apply sends the staged setup to LMU; Revert removes the preview.",
  },
  {
    q: "How does the team engineering pit wall follow our car?",
    a: "Each teammate runs Apex AIO while signed in to the same crew. The driving PC relays its live local telemetry once per second, and the Team board automatically follows the freshest source with real tyre data, so a driver swap needs no manual handover. The board visibly marks live, relayed and stale data. Every crew member needs their own active Apex subscription, and up to six members can join a team.",
  },
  {
    q: "Does it work with rFactor 2 as well as Le Mans Ultimate?",
    a: "Yes, though LMU gets the most. The standings, relative, radar, track map, speedo, motion, pedals and fuel widgets all work on both. The MFD, race control, track limits, damage and setup features are LMU-only, because they depend on data rFactor 2 simply doesn't publish — and where that data is missing, those widgets say so rather than showing a plausible-looking zero.",
  },
  {
    q: "What does the free trial include?",
    a: `Everything. The ${TRIAL_DAYS}-day trial is the complete system — every widget, the race engineer, setup optimiser, team pit wall, StreamBot, leaderboards and both overlay destinations. A card is taken at signup through Stripe's hosted checkout (the app never sees it) but nothing is charged until the trial ends, and you can cancel from the in-app subscription card at any point before then and pay nothing.`,
  },
  {
    q: "What if I'm racing somewhere without internet?",
    a: "A confirmed subscription carries a 72-hour offline grace window — the app keeps working for three full days with no connection at all, so a LAN event or a weekend away never locks you out. The engineer's 28 core questions and every overlay keep working offline too; only free-form AI questions and leaderboard sync need the network.",
  },
  {
    q: "Will Windows warn me about the installer?",
    a: "No. Every build is code-signed through Azure Trusted Signing under The Lilybank Agency Ltd, so there's no SmartScreen \"unknown publisher\" prompt on install or update — and the bundled voice engine is signed the same way, so antivirus tools have nothing to quarantine.",
  },
  {
    q: "Will an update interrupt me mid-stream?",
    a: "No. The app checks for new versions on launch and shows a banner, but nothing installs itself. You choose when to download and when to restart, so an update can never land in the middle of a race or a broadcast.",
  },
  {
    q: "Can I cancel?",
    a: "Yes, any time, from the subscription card in the app — it opens Stripe's own customer portal, where you can cancel, change card or download invoices. The subscription is month to month and stops when you tell it to.",
  },
];

export default function ApexAioSystemPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const appJsonLd = buildAioSoftwareJsonLd();

  return (
    <div className="pb-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(AIO_BREADCRUMB_JSON_LD) }}
      />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-line">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-grid-lines bg-grid opacity-25 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-accent/15 blur-[120px]"
        />
        <div className="container-rail relative py-20">
          <span className="kicker mb-4">Le Mans Ultimate · rFactor 2 · Windows</span>
          <h1 className="max-w-4xl text-5xl font-bold text-ink sm:text-6xl lg:text-7xl">
            Apex <span className="text-gradient">AIO System</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">
            Your whole pit wall in one app: <strong className="text-ink">twenty overlays</strong>, a{" "}
            <strong className="text-ink">voice race engineer</strong> on push-to-talk, your pace
            measured <strong className="text-ink">against the aliens</strong>, intent-based setup
            optimisation, a live team engineering board and a stream bot — in OBS, over the game,
            or both at once.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={INSTALLER_URL} size="lg" clip download={INSTALLER_FILENAME}>
              <Download size={18} />
              Start your {TRIAL_DAYS}-day free trial
            </Button>
            <Button href="#widgets" size="lg" variant="outline">
              <Layers size={18} />
              See everything in it
            </Button>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
            {[
              `${PRICE}/month after the trial`,
              "Signed installer — no SmartScreen warning",
              "No plugin needed for LMU",
              "Runs inside OBS's own browser",
              `v${APP_VERSION} · Windows`,
            ].map((point) => (
              <li key={point} className="inline-flex items-center gap-2">
                <CheckCircle2 size={15} className="text-success" />
                {point}
              </li>
            ))}
          </ul>

          {/* The live wall: these are the real widgets rebuilt in HTML/CSS/SVG
              from the app's own rendering code — and they run, because the
              product's whole point is live data. */}
          <div className="relative mt-14">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-x-10 -inset-y-6 rounded-[32px] bg-gradient-to-br from-cyan/5 via-accent/10 to-accent-2/5 blur-2xl"
            />
            <div className="relative grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <StandingsMock />
              <TrackMapMock />
              <div className="grid gap-4">
                <TrackLimitsMock />
                <FuelMock />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trial band ───────────────────────────────────────────────────── */}
      <section className="border-b border-line bg-gradient-to-r from-accent/10 via-accent-2/10 to-cyan/10">
        <div className="container-rail flex flex-wrap items-center justify-between gap-6 py-6">
          <div className="flex items-center gap-4">
            <span className="chip border-accent/50 text-accent-2">Everything included</span>
            <p className="font-display text-xl uppercase tracking-wide text-ink">
              {TRIAL_DAYS} days free, then {PRICE}/month
            </p>
          </div>
          <Button href="#pricing" size="sm" variant="outline">
            See the pricing
            <ArrowRight size={16} />
          </Button>
        </div>
      </section>

      {/* ── Race engineer — the interactive demo ─────────────────────────── */}
      <section className="container-rail py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <span className="kicker mb-4">The race engineer</span>
            <h2 className="text-4xl font-bold text-ink sm:text-5xl">
              An engineer <span className="text-gradient">on the radio</span>
            </h2>
            <p className="mt-5 text-lg text-muted">
              Bind one button on your wheel. Press it, hear the chirp, and ask — out loud, mid-corner,
              hands where they belong. The answer comes back over radio effects, in under a second,
              from your live telemetry. <strong className="text-ink">Try it: pick a question.</strong>
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Push-to-talk, never an open mic — the microphone only opens while you hold the button.",
                "28 questions answered entirely on your PC: gaps, rivals, pace, fuel, tyres, damage, pit windows, flags, weather. Free, offline, forever.",
                "Free-form questions go to an AI engineer — your voice is transcribed locally, so audio never leaves your machine.",
                "Proactive calls on a dial you control: off, essential (flags, fuel, penalties, damage), or standard (adds fastest laps, position moves, rivals' stops).",
                "Six voices, bundled and signed inside the installer — nothing to download, nothing for antivirus to flag.",
              ].map((point) => (
                <li key={point} className="flex items-start gap-3 text-muted">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <AskEngineer />
        </div>
      </section>

      {/* ── Reference pace ───────────────────────────────────────────────── */}
      <section className="border-y border-line bg-surface/30 py-16">
        <div className="container-rail grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <span className="kicker mb-4">Reference pace · the Ohne Speed ladder</span>
            <h2 className="text-4xl font-bold text-ink sm:text-5xl">
              How fast are you, <span className="text-gradient">really?</span>
            </h2>
            <p className="mt-5 text-lg text-muted">
              A delta bar tells you about the lap you just did. This tells you what it means. Your
              best lap becomes a live percentage of <strong className="text-ink">alien pace for
              your exact class and layout</strong>, placed on a six-band ladder — so &ldquo;am I
              actually quick here?&rdquo; finally has a number.
            </p>
            <p className="mt-4 text-lg text-muted">
              The reference times are <strong className="text-ink">Ohne Speed&apos;s</strong> — the
              benchmark set the LMU community actually measures itself against, with laps
              contributed by beAlien, Go and Hymo. The app reads them and credits them in the
              widget, every time a score is on screen.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                ["Six honest bands", "Alien → Competitive → Good → Midpack → Tail-ender → Offline. No participation trophies."],
                ["Class- and layout-specific", "A 'Good' in GT3 at Spa means Good, in GT3, at Spa — not a global average."],
                ["It moves as you do", "Set a better lap and the marker climbs mid-session, live."],
                ["It feeds the league", "The same ladder drives your Pace rank on the dashboard and the league leaderboards."],
              ].map(([title, body]) => (
                <div key={title} className="rounded-card border border-line bg-base/50 p-4">
                  <p className="font-display text-sm uppercase tracking-wide text-ink">{title}</p>
                  <p className="mt-1 text-sm text-muted">{body}</p>
                </div>
              ))}
            </div>
          </div>
          <RefPaceMock large />
        </div>
      </section>

      {/* ── The exclusives ───────────────────────────────────────────────── */}
      <section className="container-rail py-16">
        <div className="mb-10 text-center">
          <span className="kicker mb-4">Nobody else ships these</span>
          <h2 className="text-4xl font-bold text-ink sm:text-5xl">
            Six things you can&apos;t get <span className="text-gradient">anywhere else</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted">
            Plenty of tools will draw you a standings tower. These are the six that took real work,
            and they&apos;re the reason people switch.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {EXCLUSIVES.map((item) => (
            <Card key={item.title} variant="default" interactive className="flex flex-col gap-4 p-7">
              <div className="flex items-start justify-between gap-4">
                <item.icon size={26} className="text-cyan" />
                <span className="chip border-accent/40 text-accent-2">{item.tag}</span>
              </div>
              <h3 className="text-2xl font-bold text-ink">{item.title}</h3>
              <p className="text-muted">{item.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ── MFD deep dive ────────────────────────────────────────────────── */}
      <section className="container-rail py-16">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="order-2 lg:order-1">
            <MfdMock />
          </div>
          <div className="order-1 lg:order-2">
            <span className="kicker mb-4">The MFD · LMU only</span>
            <h2 className="text-4xl font-bold text-ink">
              The pit menu, <span className="text-gradient">driven from your wheel</span>
            </h2>
            <p className="mt-5 text-lg text-muted">
              Every other overlay that mentions an MFD shows you a readout. This one is the menu.
              Race control at the top, LMU&apos;s own pit strategy in the middle — colour-grouped by
              category so tyres, pressures, ducts, aero, fuel and brakes read as blocks rather than a
              wall — and your driving aids underneath.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Bind four buttons — up, down, plus, minus — and every adjustable row is reachable without taking your hands off the wheel.",
                "Pit changes travel over LMU's REST API, so the in-game MFD never has to be on screen and the game needn't even be focused.",
                "The tyre row only offers compounds this car actually has at this event, and clamps at both ends so one blind press can't cancel the tyres you just booked.",
                "Every value is read back from the game before it's shown — if LMU refuses a change, you see what LMU kept, not what you asked for.",
                "Serving a penalty strips the stop back to no service, but leaves your wing, ducts, pressures and fuel ratio alone.",
              ].map((point) => (
                <li key={point} className="flex items-start gap-3 text-muted">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 rounded-card border border-line bg-surface/60 p-4 text-sm text-subtle">
              The overlay presses LMU&apos;s own key bindings, and a wheel-only binding can&apos;t be
              pressed from outside the game — so the app will find what&apos;s unbound and bind it for
              you in one click, using scancodes no keyboard on earth produces. Your existing binds are
              never touched, a timestamped backup is taken first, and there&apos;s an undo.
            </p>
          </div>
        </div>
      </section>

      <AioEngineeringFeatures />

      {/* ── Track map deep dive ──────────────────────────────────────────── */}
      <section className="border-y border-line bg-surface/30 py-16">
        <div className="container-rail grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <span className="kicker mb-4">3D track maps</span>
            <h2 className="text-4xl font-bold text-ink">
              Where <span className="text-gradient">everybody</span> is
            </h2>
            <p className="mt-5 text-lg text-muted">
              The radar answers &ldquo;who is beside me&rdquo;. This answers &ldquo;where is
              everyone&rdquo; — traffic two corners ahead, how far back the car you&apos;re chasing
              really is, whether a yellow is on your part of the circuit.
            </p>
            <p className="mt-4 text-lg text-muted">
              It&apos;s one material lit by one light, not a flat road with a coloured wall glued to
              it. Every segment is shaded from the direction the road actually runs, so a straight
              and the corner it feeds read as two faces of one solid. Elevation is deliberately
              exaggerated and the road is extruded down to a ground plane, so a climb reads as the
              track pulling away from its own base. Two styles ship: the classic red shown here, and
              a brand style whose hue runs cyan at the start line to pink at the end of the lap.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                ["32 circuits in the box", "The LMU and WEC calendar ships bundled, ready to draw."],
                ["Everywhere else, learned", "Built from your first lap, cached locally, drawn instantly forever."],
                ["Cars in true world coordinates", "A car running wide is drawn running wide."],
                ["Your car carries the gradient", "Everyone else in class colour; pit lane faded."],
              ].map(([title, body]) => (
                <div key={title} className="rounded-card border border-line bg-base/50 p-4">
                  <p className="font-display text-sm uppercase tracking-wide text-ink">{title}</p>
                  <p className="mt-1 text-sm text-muted">{body}</p>
                </div>
              ))}
            </div>
          </div>
          <TrackMapMock large />
        </div>
      </section>

      {/* ── Track limits + pit predictor ─────────────────────────────────── */}
      <section className="container-rail py-16">
        <div className="mb-10">
          <span className="kicker mb-4">The two that change how you drive</span>
          <h2 className="text-4xl font-bold text-ink sm:text-5xl">
            Corner cuts and <span className="text-gradient">pit stops</span>
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <TrackLimitsMock large />
            <div className="mt-6">
              <div className="flex items-center gap-3">
                <TrafficCone size={22} className="text-flag-amber" />
                <h3 className="text-2xl font-bold text-ink">Corner-cut warnings</h3>
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

      {/* ── Beyond the overlays ──────────────────────────────────────────── */}
      <section className="border-y border-line bg-surface/30 py-16">
        <div className="container-rail">
          <div className="mb-10 text-center">
            <span className="kicker mb-4">Why it&apos;s called AIO</span>
            <h2 className="text-4xl font-bold text-ink sm:text-5xl">
              More than <span className="text-gradient">overlays</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted">
              The control panel is a full pit-wall app — setups, leaderboards, stream tools and the
              engineer, all in the same window as the overlay switches.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {MODULES.map((m) => (
              <Card key={m.title} variant="default" interactive className="flex flex-col gap-3 p-7">
                <m.icon size={26} className="text-cyan" />
                <h3 className="text-2xl font-bold text-ink">{m.title}</h3>
                <p className="text-muted">{m.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Widget inventory ─────────────────────────────────────────────── */}
      <section id="widgets" className="scroll-mt-24 border-t border-line py-16">
        <div className="container-rail">
          <div className="mb-8 flex items-center gap-3">
            <Layers size={20} className="text-accent" />
            <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-ink">
              Every overlay in the box
            </h2>
            <span className="h-px flex-1 bg-line" />
          </div>
          <p className="mb-8 max-w-3xl text-muted">
            Twenty widgets, each with its own switch and its own two destinations — an OBS Browser
            Source and the in-game layer. A widget can be on in one and off in the other, every one
            has its own background-opacity override, and every one of them is included in the one
            price.
          </p>

          <WidgetCatalogue />

          {/* The widgets that didn't fit the deep dives, rendered live. */}
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <SpeedoMock className="md:col-span-2" />
            <RaceControlMock />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <RelativeMock />
            <RadarMock />
            <TyreTempMock />
          </div>
        </div>
      </section>

      {/* ── Lighter ──────────────────────────────────────────────────────── */}
      <section className="border-t border-line py-16">
        <div className="container-rail grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <span className="kicker mb-4">Weight is a feature</span>
            <h2 className="text-4xl font-bold text-ink sm:text-5xl">
              Lighter than <span className="text-gradient">anything else</span>
            </h2>
            <p className="mt-5 text-lg text-muted">
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
            <p className="mt-4 text-lg text-muted">
              The widgets are then built to stay cheap: <strong className="text-ink">no web fonts</strong>{" "}
              and no CDN, so nothing is fetched at runtime;{" "}
              <strong className="text-ink">no blur or backdrop filters</strong>, which are expensive
              to composite live; and the audio cues are synthesised from an oscillator rather than
              played from sound files. The setup workshop, StreamBot and the engineer live in the
              control panel — not in your stream.
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
      </section>

      {/* ── Facts ────────────────────────────────────────────────────────── */}
      <section className="border-y border-line bg-surface/30 py-16">
        <div className="container-rail">
          <div className="mb-10 text-center">
            <span className="kicker mb-4">Checkable claims</span>
            <h2 className="text-4xl font-bold text-ink sm:text-5xl">
              The <span className="text-gradient">numbers</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted">
              Marketing pages are cheap. These are all things you can verify yourself in the first
              ten minutes of the trial.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FACTS.map((f) => (
              <Card key={f.label} variant="elevated" className="p-6">
                <p className="font-display text-4xl font-bold text-gradient">{f.stat}</p>
                <p className="mt-1 font-mono text-xs uppercase tracking-widest text-cyan">
                  {f.label}
                </p>
                <p className="mt-3 text-sm text-muted">{f.body}</p>
              </Card>
            ))}
          </div>

          <Card variant="default" className="mt-6 flex items-start gap-4 p-6">
            <ShieldAlert size={22} className="mt-0.5 shrink-0 text-flag-amber" />
            <p className="text-sm text-muted">
              <strong className="text-ink">Where the data isn&apos;t there, we say so.</strong> The
              MFD, race control, track-limit, damage and setup features depend on data rFactor 2
              doesn&apos;t publish, so on rF2 they read &ldquo;no data&rdquo; rather than showing a
              plausible zero. Track-limit charges can arrive up to ~25 seconds late because of how
              LMU flushes its log — the total is right, sometimes it&apos;s right late. And repair
              and tyre times are shown side by side rather than added together, because whether they
              overlap hasn&apos;t been verified against a real stop.
            </p>
          </Card>
        </div>
      </section>

      {/* ── Setup ────────────────────────────────────────────────────────── */}
      <section className="container-rail py-16">
        <div className="mb-10 text-center">
          <span className="kicker mb-4">Install → on screen</span>
          <h2 className="text-4xl font-bold text-ink sm:text-5xl">
            Running in <span className="text-gradient">minutes</span>
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

      <AioReviews />

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="container-rail scroll-mt-24 py-8">
        <div className="mb-10 text-center">
          <span className="kicker mb-4">Pricing</span>
          <h2 className="text-4xl font-bold text-ink sm:text-5xl">
            One price, <span className="text-gradient">everything in it</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted">
            There&apos;s no cut-down tier and no feature held back to upsell you later. Every
            overlay, the race engineer, the setup workshop, StreamBot, both destinations, all the
            updates.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2">
          {/* The plan */}
          <Card variant="glow" clip className="relative flex flex-col p-8">
            <span className="kicker mb-3">The only plan</span>
            <p className="font-display text-5xl font-bold text-ink">
              {TRIAL_DAYS} days <span className="text-gradient">free</span>
            </p>
            <p className="mt-3 text-lg text-muted">
              then <strong className="text-ink">{PRICE}</strong> per month
            </p>

            <ul className="mt-6 flex-1 space-y-3">
              {[
                "All 20 widgets, in OBS and in game",
                "The voice race engineer, bundled and included",
                "Setup optimiser, team pit wall, leaderboards and StreamBot",
                "Every update, on the day it ships",
                "Cancel any time — including during the trial",
              ].map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-muted">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <Button href={INSTALLER_URL} size="lg" clip download={INSTALLER_FILENAME} className="mt-8 w-full">
              <Download size={18} />
              Start the free trial
            </Button>
            <p className="mt-3 text-center text-xs text-subtle">
              Windows · v{APP_VERSION} · nothing charged until day {TRIAL_DAYS + 1}
            </p>
          </Card>

          {/* How the billing behaves */}
          <Card variant="default" className="flex flex-col p-8">
            <span className="kicker mb-3">How billing works</span>
            <div className="flex items-center gap-3">
              <ShieldCheck size={24} className="text-cyan" />
              <p className="text-lg font-bold text-ink">Stripe, and only Stripe</p>
            </div>

            <ul className="mt-6 flex-1 space-y-4">
              {[
                [
                  "The app never sees your card",
                  "Checkout and card entry happen on Stripe's own hosted pages, not in the app.",
                ],
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
              ].map(([title, body]) => (
                <li key={title} className="flex items-start gap-3 text-sm text-muted">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" />
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
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="container-rail py-16">
        <div className="mb-8 flex items-center gap-3">
          <Zap size={20} className="text-accent" />
          <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-ink">
            Frequently asked
          </h2>
          <span className="h-px flex-1 bg-line" />
        </div>
        <div className="grid items-start gap-4 md:grid-cols-2">
          {[FAQ.filter((_, i) => i % 2 === 0), FAQ.filter((_, i) => i % 2 === 1)].map((column, c) => (
            <div key={c} className="grid gap-4">
              {column.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-card border border-line bg-surface/50 open:border-accent/40"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 text-lg font-bold text-ink [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <ChevronDown
                      size={18}
                      className="shrink-0 text-subtle transition-transform group-open:rotate-180"
                      aria-hidden
                    />
                  </summary>
                  <p className="px-5 pb-5 text-sm text-muted">{item.a}</p>
                </details>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── Credit ───────────────────────────────────────────────────────── */}
      <section className="container-rail py-4">
        <Card variant="outline" className="p-6">
          <p className="text-sm text-subtle">
            The reference lap times and the Alien → Offline pace bands behind the Reference Pace
            widget are{" "}
            <a
              href="https://www.youtube.com/@ohne_speed"
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

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="container-rail py-8">
        <div className="flex flex-col items-center gap-5 rounded-card border border-accent/40 bg-surface/50 p-10 text-center shadow-glow-soft">
          <h2 className="text-4xl font-bold text-ink">Try it free for {TRIAL_DAYS} days</h2>
          <p className="max-w-xl text-muted">
            The whole pit wall — every widget, the engineer on the radio, your setups and your
            stream, in one app. Install it before your next session and see what you&apos;ve been
            driving without.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button href={INSTALLER_URL} size="lg" clip download={INSTALLER_FILENAME}>
              <Download size={18} />
              Start the free trial
              <ArrowRight size={18} />
            </Button>
            <Button href={DISCORD_URL} size="lg" variant="outline" target="_blank" rel="noopener noreferrer">
              Ask us anything
            </Button>
          </div>
          <p className="text-sm text-subtle">
            Windows · v{APP_VERSION} · {PRICE}/month after the trial · Le Mans Ultimate and rFactor 2
          </p>
        </div>
      </section>
    </div>
  );
}
