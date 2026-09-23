import type { ReactNode } from "react";
import {
  BadgeCheck,
  Bot,
  History,
  Layers,
  Map as MapIcon,
  Mic,
  Monitor,
  Settings2,
  Sliders,
  TrafficCone,
} from "lucide-react";
import {
  DamagePredictorMock,
  MfdMock,
  RadarMock,
  RefPaceMock,
  SpeedoMock,
  TrackLimitsMock,
  TrackMapMock,
  TyreTempMock,
} from "@/components/overlay/OverlayMocks";
import { ReviewLapMock } from "@/components/overlay/ReviewMocks";
import { SetupOptimiserMock } from "@/components/overlay/SetupOptimiserMock";
import { TeamPitWallMock } from "@/components/overlay/TeamPitWallMock";
import { RadioCallsCard, StreamBotCard } from "@/components/aio/hub/HubCards";
import { getAioPage, type AioPageKey } from "@/lib/aio-pages";

/**
 * The hub's feature explorer, as data. One entry is one tab: add a feature
 * here and it gets a tab, a panel, its copy in the server HTML and a link to
 * its topic page — nothing else to edit.
 *
 * Built on the server so the mocks render there; the explorer itself only
 * receives finished ReactNodes and strings.
 *
 * Each id-bearing SVG mock (track map, radar, speedo) appears ONCE in this
 * list: every panel is in the DOM with inactive ones `hidden`, and a gradient
 * defined inside a hidden subtree stops painting for any other copy of the
 * same id.
 */
export type HubFeature = {
  /** Also the URL fragment: /apex-overlay-system#feature-<id> opens this tab. */
  id: string;
  /** The tab label — short. */
  label: string;
  icon: ReactNode;
  tag: string;
  /** The panel's H3, written in the words people search. */
  title: string;
  summary: string;
  bullets: readonly string[];
  /** A small print line under the bullets, where a feature needs one. */
  note?: string;
  visual: ReactNode;
  /** Resolved from the page registry, so a renamed path follows. */
  link?: { href: string; label: string };
};

type FeatureSource = Omit<HubFeature, "link"> & { page?: AioPageKey };

const ICON = "shrink-0";

const SOURCES: FeatureSource[] = [
  {
    id: "overlays",
    label: "LMU overlays",
    icon: <Layers size={18} className={ICON} aria-hidden />,
    tag: "OBS + in-game",
    title: "LMU overlays for OBS and over the sim",
    summary:
      "Every widget has two independent destinations — an OBS Browser Source and the in-game layer — so it can be on in one and off in the other. They're plain HTML drawn by the Chromium OBS already runs, so on stream nothing new starts at all.",
    bullets: [
      "Standings, relative, radar, speedo, tyres, fuel, weather and more — each with its own switch",
      "No second browser, no web fonts, no live blur: built to cost the sim nothing",
      "No plugin needed for LMU; the rF2 plugin installs itself in one click",
    ],
    visual: (
      <div className="grid gap-4 md:grid-cols-2">
        <SpeedoMock className="md:col-span-2" />
        <RadarMock />
        <TyreTempMock />
      </div>
    ),
    page: "overlays",
  },
  {
    id: "race-engineer",
    label: "Voice race engineer",
    icon: <Mic size={18} className={ICON} aria-hidden />,
    tag: "Press, ask, drive",
    title: "A voice race engineer on push-to-talk",
    summary:
      "Bind one wheel button, press it and ask out loud — gap behind, fuel to the end, who's ahead, what the weather's doing. The answer comes back over radio effects in under a second, from your live telemetry.",
    bullets: [
      "28 questions answered on your PC — free, offline, forever",
      "Free-form questions go to an AI engineer, with your voice transcribed locally",
      "Proactive calls on a dial you control: off, essential or standard",
    ],
    visual: <RadioCallsCard />,
    page: "race-engineer",
  },
  {
    id: "mfd",
    label: "Working MFD",
    icon: <Sliders size={18} className={ICON} aria-hidden />,
    tag: "Nobody else has this",
    title: "The LMU pit menu, driven from your wheel",
    summary:
      "Not a picture of the pit menu — the actual menu. Read every row, then change it from a wheel button, a Stream Deck or a hotkey: tyres, fuel, pressures, ducts, wing, brake bias, TC, ABS and motor map.",
    bullets: [
      "Pit changes go over LMU's own REST API — the in-game MFD never has to be on screen",
      "Every value is read back from the game, so you see what LMU kept, not what you asked for",
      "Unbound keys are found and bound for you in one click, with a backup and an undo",
    ],
    visual: <MfdMock />,
    page: "overlays",
  },
  {
    id: "reference-pace",
    label: "Pace vs the aliens",
    icon: <BadgeCheck size={18} className={ICON} aria-hidden />,
    tag: "Ohne Speed's numbers",
    title: "Your LMU pace, measured against the aliens",
    summary:
      "Your best lap as a live percentage of alien pace for your exact class and layout, on Ohne Speed's reference times — the ones the community actually trusts. Not how fast that lap was, but how fast you are.",
    bullets: [
      "Six honest bands, Alien to Offline — no participation trophies",
      "Class- and layout-specific: a Good in GT3 at Spa means Good, in GT3, at Spa",
      "Climbs live as you improve, and feeds your Pace rank on the league board",
    ],
    visual: <RefPaceMock large />,
    page: "telemetry",
  },
  {
    id: "setups",
    label: "Setups & optimiser",
    icon: <Settings2 size={18} className={ICON} aria-hidden />,
    tag: "The garage, in a panel",
    title: "LMU setups: live editor, optimiser and community tunes",
    summary:
      "Every garage setting in an editor where changes land in the car instantly. Ask for more turn-in or rear stability and the engineer stages balanced, car-specific changes — nothing is applied until you say so.",
    bullets: [
      "Ten intent sliders; every change staged, reviewable and revertible",
      "A private library of real .svm files, kept where LMU can't overwrite them",
      "Community setups sorted by proven pace, downloaded straight into the game",
    ],
    visual: <SetupOptimiserMock />,
    page: "setups",
  },
  {
    id: "pit-wall",
    label: "Team pit wall",
    icon: <Monitor size={18} className={ICON} aria-hidden />,
    tag: "Endurance teams",
    title: "A live LMU pit wall for the whole crew",
    summary:
      "Timing, track map, live fuel strategy, per-corner tyres and brakes, weather and lap trends on one board. Team relay follows whoever is driving, and labels stale data before it can mislead anyone.",
    bullets: [
      "Strategy replans from real consumption, with pit windows and the save target to reach them",
      "Engineer, Strategist and Car layouts, one click apart",
      "The Team and Solo boards open in any browser — a phone, a tablet or another PC",
    ],
    note: "Team relay requires each crew member to run Apex AIO with their own active subscription.",
    visual: <TeamPitWallMock />,
    page: "pit-wall",
  },
  {
    id: "review",
    label: "Review & lap compare",
    icon: <History size={18} className={ICON} aria-hidden />,
    tag: "Every lap you ever drove",
    title: "LMU telemetry review of every lap you've driven",
    summary:
      "Apex has written a file for every lap since the day you installed it, and Review reads them all back — no account, no upload, nothing thrown away. A report per session shows your optimal lap and the time left on the table.",
    bullets: [
      "Speed, pedals, gear and steering against distance, with a second lap laid underneath",
      "A chip per 500 m saying exactly what each stretch of road cost",
      "Consistency as a real spread in seconds, not a percentage score",
    ],
    visual: <ReviewLapMock />,
    page: "telemetry",
  },
  {
    id: "track-map",
    label: "3D track maps",
    icon: <MapIcon size={18} className={ICON} aria-hidden />,
    tag: "32 bundled, the rest learned",
    title: "3D LMU track maps with every car on them",
    summary:
      "The whole circuit as a raised 2.5-D ribbon lit by a single light, with a dot for every car in its class colour. Thirty-two LMU and WEC circuits ship in the box; anywhere else is built from your first lap and cached forever.",
    bullets: [
      "Works at every LMU and rF2 circuit — including ones that don't exist yet",
      "Cars drawn in true world coordinates: a car running wide is drawn running wide",
      "A whole circuit is ~40 KB, drawn once and then blitted each frame",
    ],
    visual: <TrackMapMock large />,
    page: "overlays",
  },
  {
    id: "track-limits",
    label: "Track limits & pit timer",
    icon: <TrafficCone size={18} className={ICON} aria-hidden />,
    tag: "The sim's own numbers",
    title: "LMU track limits and pit-stop countdowns",
    summary:
      "Track limits in the stewards' own points — how much allowance is left, what each cut was charged, and penalties named to your face. When the car stops in its box, a live countdown to release built from the sim's own repair estimate.",
    bullets: [
      "The headline counts down, because that's the number you act on",
      "DRIVE THROUGH, STOP-GO 10S and PENALTY SERVED, named as they land",
      "Repair and tyre time shown side by side, never guessed into one figure",
    ],
    visual: (
      <div className="grid gap-4 md:grid-cols-2">
        <TrackLimitsMock />
        <DamagePredictorMock />
      </div>
    ),
    page: "overlays",
  },
  {
    id: "streambot",
    label: "StreamBot & leaderboards",
    icon: <Bot size={18} className={ICON} aria-hidden />,
    tag: "Stream + league",
    title: "A Twitch & YouTube StreamBot and league leaderboards",
    summary:
      "A bot that types in your Twitch and YouTube chat, and a league board built from every clean lap you drive — practice and qualifying included, logged locally with the app's own clean-lap rule.",
    bullets: [
      "Up to 50 commands, timed messages, editable alerts and on-screen goals",
      "YouTube API quota tracked in a ledger, so a long stream never silently runs dry",
      "Every member's best clean lap, filterable by track, class and car",
    ],
    visual: <StreamBotCard />,
  },
];

export const HUB_FEATURES: readonly HubFeature[] = SOURCES.map(({ page, ...feature }) => {
  if (!page) return feature;
  const target = getAioPage(page);
  return { ...feature, link: { href: target.path, label: `More on ${target.breadcrumb}` } };
});
