import { COACH_DAVE } from "./coach-dave";
import { CREW_CHIEF } from "./crew-chief";
import { RACELAB } from "./racelab";
import { SIMHUB } from "./simhub";
import type { ComparePageData } from "./types";

/**
 * Every "Apex AIO vs X" page, in the order the index and footer list them.
 * Add a page here and it joins the index, the footer, every other comparison
 * page's "Other comparisons" list and the sitemap.
 *
 * They aren't in the AIO product bar on purpose: that bar is the product's own
 * navigation, and four competitor names in it would read as an advert.
 */
export const COMPARE_PAGES: readonly ComparePageData[] = [RACELAB, SIMHUB, CREW_CHIEF, COACH_DAVE];

/** The index of the comparisons, at /lmu-apps-compared. */
export const COMPARE_INDEX = {
  key: "index",
  path: "/lmu-apps-compared",
  title: "Best LMU Apps Compared: Overlays, Spotters & Setups (2026)",
  description:
    "Le Mans Ultimate apps compared honestly: RaceLab, SimHub, Crew Chief, Coach Dave Delta and Apex AIO. What each one is best at, what it costs, and which to run together.",
  breadcrumb: "LMU apps compared",
  checked: "2026-11-26",
} as const;

export type { ComparePageData } from "./types";
