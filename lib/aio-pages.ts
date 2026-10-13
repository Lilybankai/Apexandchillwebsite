/**
 * Every page in the Apex AIO section of the site, in product-bar order.
 *
 * The main site header only ever links to the hub (`/apex-overlay-system`).
 * The topic pages below are reached from the product bar that the `(aio)`
 * route group's layout renders under the header, from the hub's feature
 * explorer, and from the footer. Add a page here and it appears in all three
 * and in the sitemap — there is no other list to keep in step.
 */
export type AioPageKey =
  | "overview"
  | "overlays"
  | "race-engineer"
  | "setups"
  | "pit-wall"
  | "telemetry"
  | "incident-review";

export type AioPage = {
  key: AioPageKey;
  path: string;
  /** The short label in the product bar and footer. */
  navLabel: string;
  /** The `<title>`, written for the search result, not the brand. */
  title: string;
  description: string;
  /** Breadcrumb name — what the page is, in the words people search. */
  breadcrumb: string;
};

export const AIO_PAGES: readonly AioPage[] = [
  {
    key: "overview",
    path: "/apex-overlay-system",
    navLabel: "Overview",
    // Brand-led on purpose: the topic pages own "LMU overlays", "LMU race
    // engineer" and the rest, so the hub shouldn't compete with them.
    title: "Apex AIO: The All-in-One App for Le Mans Ultimate",
    description:
      "Apex AIO is the all-in-one Le Mans Ultimate app: overlays, a voice race engineer, setups, a team pit wall and telemetry in one download. 7 days free.",
    breadcrumb: "Apex AIO System",
  },
  {
    key: "overlays",
    path: "/lmu-overlays",
    navLabel: "Overlays",
    title: "LMU Overlays: Le Mans Ultimate HUD & OBS Overlays | Apex AIO",
    description:
      "20 lightweight Le Mans Ultimate overlays for OBS or in-game: standings, relative, radar, 3D track map, fuel, track limits and a working MFD.",
    breadcrumb: "LMU Overlays",
  },
  {
    key: "race-engineer",
    path: "/lmu-race-engineer",
    navLabel: "Race Engineer",
    title: "LMU Race Engineer: Voice Radio for Le Mans Ultimate | Apex AIO",
    description:
      "A voice race engineer for Le Mans Ultimate. Press a wheel button, ask for gaps, fuel or pit windows, and get the answer from live telemetry, offline.",
    breadcrumb: "LMU Race Engineer",
  },
  {
    key: "setups",
    path: "/lmu-setups",
    navLabel: "Setups",
    title: "LMU Setups: Le Mans Ultimate Community Setups | Apex AIO",
    description:
      "Le Mans Ultimate community setups ranked by verified lap times, plus a live setup editor and optimiser. Send any setup straight into LMU.",
    breadcrumb: "LMU Setups",
  },
  {
    key: "pit-wall",
    path: "/lmu-pit-wall",
    navLabel: "Pit Wall",
    title: "LMU Pit Wall: Le Mans Ultimate Team Endurance Dashboard",
    description:
      "A live Le Mans Ultimate pit wall for endurance teams: timing, fuel strategy, tyres, weather and the track map, in the app or any browser.",
    breadcrumb: "LMU Pit Wall",
  },
  {
    key: "telemetry",
    path: "/lmu-telemetry",
    navLabel: "Telemetry",
    title: "LMU Telemetry: Le Mans Ultimate Lap Comparison | Apex AIO",
    description:
      "Le Mans Ultimate telemetry on your own PC: every lap you've driven, your optimal lap, and two laps compared corner by corner.",
    breadcrumb: "LMU Telemetry",
  },
  {
    key: "incident-review",
    path: "/lmu-incident-review",
    navLabel: "Race Log",
    title: "LMU Incident Review: Race Log & Replays | Apex AIO",
    description:
      "Review every LMU race incident: contacts graded light or heavy, track limits, penalties and damage on a timeline, each a click from the game's replay.",
    breadcrumb: "LMU Incident Review",
  },
] as const;

export function getAioPage(key: AioPageKey): AioPage {
  const page = AIO_PAGES.find((p) => p.key === key);
  if (!page) throw new Error(`Unknown AIO page: ${key}`);
  return page;
}
