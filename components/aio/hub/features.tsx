import type { ReactNode } from "react";
import { ArrowUp } from "lucide-react";
import {
  DamagePredictorMock,
  MfdMock,
  RefPaceMock,
  TrackLimitsMock,
} from "@/components/overlay/OverlayMocks";
import { ReviewLapMock } from "@/components/overlay/ReviewMocks";
import { SetupOptimiserMock } from "@/components/overlay/SetupOptimiserMock";
import { TeamPitWallMock } from "@/components/overlay/TeamPitWallMock";
import { RadioCallsCard, StreamBotCard } from "@/components/aio/hub/HubCards";
import { getAioPage, type AioPageKey } from "@/lib/aio-pages";

/**
 * The hub's feature explorer, as data. One entry is one tab: add a feature
 * here and it gets a tab, a panel, its copy in the server HTML and a link to
 * its topic page. Nothing else to edit.
 *
 * Built on the server so the mocks render there; the explorer itself only
 * receives finished ReactNodes and strings.
 *
 * SVG ids: every panel is in the DOM with inactive ones `hidden`, and a
 * gradient defined inside a hidden subtree stops painting for any other copy
 * of the same id. So the id-bearing mocks stay out of this list: the track
 * map and speedo are in the hero's broadcast frame and the radar is in the
 * stint story. The Review mock (id `rvRoad`) appears here and nowhere else on
 * the hub.
 */
export type HubFeature = {
  /** Also the URL fragment: /apex-overlay-system#feature-<id> opens this tab. */
  id: string;
  /** The tab label. Short. */
  label: string;
  /** A few words in mono above the H3. */
  tag: string;
  /** The panel's H3, written in the words people search. */
  title: string;
  summary: string;
  /** Label | value rows, printed as a spec table. */
  specs: readonly (readonly [string, string])[];
  /** A small print line under the specs, where a feature needs one. */
  note?: string;
  visual: ReactNode;
  /** Resolved from the page registry, so a renamed path follows. */
  link?: { href: string; label: string };
};

type FeatureSource = Omit<HubFeature, "link"> & { page?: AioPageKey };

/** For widgets already on screen higher up the page: point at them. */
function InFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-y border-line py-5">
      <p className="max-w-xl text-sm text-muted">{children}</p>
      <a
        href="#broadcast"
        className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.18em] text-cyan hover:underline"
      >
        Back to the frame
        <ArrowUp size={14} aria-hidden />
      </a>
    </div>
  );
}

const SOURCES: FeatureSource[] = [
  {
    id: "overlays",
    label: "LMU overlays",
    tag: "OBS + in-game",
    title: "LMU overlays for OBS and over the sim",
    summary:
      "Every widget has two destinations, an OBS Browser Source and the in-game layer, and each is switched on its own. On stream the widgets are plain HTML drawn by the Chromium that OBS already runs, so nothing new starts.",
    specs: [
      ["Widgets", "Standings, relative, radar, speedo, tyres, fuel, weather and more, each with its own switch"],
      ["Renderer", "OBS's own browser source. No second browser"],
      ["Overhead", "No web fonts and no live blur. Built to cost the sim nothing"],
      ["LMU", "No plugin needed"],
      ["rFactor 2", "The plugin installs itself in one click"],
    ],
    visual: (
      <InFrame>
        Standings, race control, relative, speedo and track map are in the stream frame at the top
        of this page, placed where a broadcast puts them.
      </InFrame>
    ),
    page: "overlays",
  },
  {
    id: "race-engineer",
    label: "Voice race engineer",
    tag: "Push-to-talk",
    title: "A voice race engineer on push-to-talk",
    summary:
      "Bind one wheel button, press it and ask out loud: gap behind, fuel to the end, who's ahead, what the weather is doing. The answer comes back over radio effects in under a second, from your live telemetry.",
    specs: [
      ["Offline", "28 questions answered on your PC, free"],
      ["Free-form", "Sent to an AI engineer; your voice is transcribed locally"],
      ["Proactive calls", "A dial you set: off, essential or standard"],
    ],
    visual: <RadioCallsCard />,
    page: "race-engineer",
  },
  {
    id: "mfd",
    label: "Working MFD",
    tag: "LMU only",
    title: "The LMU pit menu, driven from your wheel",
    summary:
      "The pit menu itself, readable row by row and changeable from a wheel button, a Stream Deck or a hotkey: tyres, fuel, pressures, ducts, wing, brake bias, TC, ABS and motor map.",
    specs: [
      ["Transport", "LMU's own REST API. The in-game MFD never has to be on screen"],
      ["Read-back", "Every value is read back from the game, so you see what LMU kept"],
      ["Key binding", "Unbound keys found and bound in one click, with a backup and an undo"],
    ],
    visual: <MfdMock />,
    page: "overlays",
  },
  {
    id: "reference-pace",
    label: "Pace vs the aliens",
    tag: "Ohne Speed's numbers",
    title: "Your LMU pace, measured against the aliens",
    summary:
      "Your best lap as a live percentage of alien pace for your exact class and layout, on Ohne Speed's reference times, which are the ones the community trusts.",
    specs: [
      ["Bands", "Six, from Alien to Offline"],
      ["Scope", "Per class and layout. A Good in GT3 at Spa means Good, in GT3, at Spa"],
      ["Updates", "Live, as you improve"],
      ["League", "Feeds your Pace rank on the league board"],
    ],
    visual: <RefPaceMock />,
    page: "telemetry",
  },
  {
    id: "setups",
    label: "Setups & optimiser",
    tag: "The garage, in a panel",
    title: "LMU setups: live editor, optimiser and community tunes",
    summary:
      "Every garage setting in an editor where changes land in the car instantly. Ask for more turn-in or rear stability and the engineer stages balanced, car-specific changes. Nothing is applied until you say so.",
    specs: [
      ["Optimiser", "Ten intent sliders; every change staged, reviewable and revertible"],
      ["Library", "Your real .svm files, kept where LMU can't overwrite them"],
      ["Community", "Setups sorted by proven pace, downloaded straight into the game"],
    ],
    visual: <SetupOptimiserMock />,
    page: "setups",
  },
  {
    id: "pit-wall",
    label: "Team pit wall",
    tag: "Endurance teams",
    title: "A live LMU pit wall for the whole crew",
    summary:
      "Timing, track map, live fuel strategy, per-corner tyres and brakes, weather and lap trends on one board. Team relay follows whoever is driving, and marks stale data as stale before anyone acts on it.",
    specs: [
      ["Strategy", "Replans from real consumption, with pit windows and the save target to reach them"],
      ["Layouts", "Engineer, Strategist and Car, one click apart"],
      ["Devices", "Team and Solo boards open in any browser: a phone, a tablet or another PC"],
    ],
    note: "Team relay needs each crew member to run Apex AIO on their own active subscription.",
    visual: <TeamPitWallMock />,
    page: "pit-wall",
  },
  {
    id: "review",
    label: "Review & lap compare",
    tag: "Every lap you drove",
    title: "LMU telemetry review of every lap you've driven",
    summary:
      "Apex writes a file for every lap from the day you install it, and Review reads them all back without an account or an upload. A report per session shows your optimal lap and the time left on the table.",
    specs: [
      ["Traces", "Speed, pedals, gear and steering against distance, with a second lap underneath"],
      ["Per 500 m", "A chip saying what that stretch of road cost"],
      ["Consistency", "A spread in seconds, not a percentage score"],
    ],
    visual: <ReviewLapMock />,
    page: "telemetry",
  },
  {
    id: "track-map",
    label: "3D track maps",
    tag: "32 bundled",
    title: "3D LMU track maps with every car on them",
    summary:
      "The circuit as a raised 2.5-D ribbon lit by a single light, with a dot for every car in its class colour. Thirty-two LMU and WEC circuits ship in the box. Anywhere else is built from your first lap and cached.",
    specs: [
      ["Bundled", "32 LMU and WEC circuits"],
      ["Elsewhere", "Built from your first lap, so it works at circuits that don't exist yet"],
      ["Positions", "True world coordinates. A car running wide is drawn running wide"],
      ["Size", "About 40 KB a circuit, drawn once and blitted each frame"],
    ],
    visual: <InFrame>The track map is bottom right in the stream frame at the top of this page.</InFrame>,
    page: "overlays",
  },
  {
    id: "track-limits",
    label: "Track limits & pit timer",
    tag: "The sim's own numbers",
    title: "LMU track limits and pit-stop countdowns",
    summary:
      "Track limits in the stewards' own points: allowance left, what each cut was charged, and penalties named as they land. When the car stops in its box, a live countdown to release, built from the sim's own repair estimate.",
    specs: [
      ["Headline", "Counts down, because that's the number you act on"],
      ["Penalties", "DRIVE THROUGH, STOP-GO 10S and PENALTY SERVED"],
      ["Pit timer", "Repair and tyre time side by side, never guessed into one figure"],
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
    tag: "Stream + league",
    title: "A Twitch & YouTube StreamBot and league leaderboards",
    summary:
      "A bot that types in your Twitch and YouTube chat, and a league board built from every clean lap you drive. Practice and qualifying count, logged locally with the app's own clean-lap rule.",
    specs: [
      ["Commands", "Up to 50, plus timed messages, editable alerts and on-screen goals"],
      ["YouTube quota", "Tracked in a ledger, so a long stream can't run dry without warning"],
      ["League board", "Every member's best clean lap, filtered by track, class and car"],
    ],
    visual: <StreamBotCard />,
  },
];

export const HUB_FEATURES: readonly HubFeature[] = SOURCES.map(({ page, ...feature }) => {
  if (!page) return feature;
  const target = getAioPage(page);
  return { ...feature, link: { href: target.path, label: `More on ${target.breadcrumb}` } };
});
