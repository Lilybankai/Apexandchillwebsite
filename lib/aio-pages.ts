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
  | "telemetry";

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
    title: "LMU Overlays, Race Engineer, Setups & Pit Wall | Apex AIO",
    description:
      "LMU overlays, a voice race engineer, community setups, a team pit wall and lap telemetry in one Windows app for Le Mans Ultimate. Free for 7 days.",
    breadcrumb: "Apex AIO System",
  },
  {
    key: "overlays",
    path: "/lmu-overlays",
    navLabel: "Overlays",
    title: "LMU Overlays for OBS & In-Game | Apex AIO",
    description:
      "20 lightweight Le Mans Ultimate overlays for OBS or in-game: standings, relative, radar, 3D track map, fuel, track limits and a working MFD.",
    breadcrumb: "LMU Overlays",
  },
  {
    key: "race-engineer",
    path: "/lmu-race-engineer",
    navLabel: "Race Engineer",
    title: "LMU Race Engineer: Voice, Push-to-Talk & Offline | Apex AIO",
    description:
      "A voice race engineer for Le Mans Ultimate. Press a wheel button, ask for gaps, fuel or pit windows, and get the answer from live telemetry, offline.",
    breadcrumb: "LMU Race Engineer",
  },
  {
    key: "setups",
    path: "/lmu-setups",
    navLabel: "Setups",
    title: "LMU Setups: Community Setups & Setup Optimiser | Apex AIO",
    description:
      "Le Mans Ultimate community setups ranked by verified lap times, plus a live setup editor and optimiser. Send any setup straight into LMU.",
    breadcrumb: "LMU Setups",
  },
  {
    key: "pit-wall",
    path: "/lmu-pit-wall",
    navLabel: "Pit Wall",
    title: "LMU Pit Wall: Team Engineering Dashboard | Apex AIO",
    description:
      "A live Le Mans Ultimate pit wall for endurance teams: timing, fuel strategy, tyres, weather and the track map, in the app or any browser.",
    breadcrumb: "LMU Pit Wall",
  },
  {
    key: "telemetry",
    path: "/lmu-telemetry",
    navLabel: "Telemetry",
    title: "LMU Telemetry & Lap Comparison | Apex AIO Review",
    description:
      "Le Mans Ultimate telemetry on your own PC: every lap you've driven, your optimal lap, and two laps compared corner by corner.",
    breadcrumb: "LMU Telemetry",
  },
] as const;

export function getAioPage(key: AioPageKey): AioPage {
  const page = AIO_PAGES.find((p) => p.key === key);
  if (!page) throw new Error(`Unknown AIO page: ${key}`);
  return page;
}
