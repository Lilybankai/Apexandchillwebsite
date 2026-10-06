/**
 * `/llms.txt` and `/llms-full.txt` — plain-Markdown summaries of the site for
 * AI assistants and answer engines (https://llmstxt.org). The short file is an
 * index of the pages that matter; the full file adds the league's background,
 * the upcoming race calendar and the Apex AIO FAQ so a crawler can answer from
 * one fetch.
 *
 * The Apex AIO entries come from `lib/aio-pages.ts`, so a new topic page shows
 * up here automatically. The league pages are listed below — add a page here
 * when you add it to the sitemap.
 */

import { AIO_PAGES } from "@/lib/aio-pages";
import { AIO_FAQ } from "@/lib/aio-faq";
import type { ApiResult, League, Schedule } from "@/lib/types";
import { LEAGUE_LABELS } from "@/lib/types";
import { CONTACT_EMAIL, DISCORD_URL, SITE_NAME, SITE_URL, YOUTUBE_URL } from "@/lib/site";

type LlmsLink = { title: string; path: string; description: string };

const LEAGUE_PAGES: LlmsLink[] = [
  {
    title: "Standings",
    path: "/standings",
    description: "Live driver championship standings for the GT7 and Le Mans Ultimate leagues: points, wins and podiums.",
  },
  {
    title: "Schedule",
    path: "/schedule",
    description: "Season calendars for every league: rounds, tracks, car classes, dates and UK start times.",
  },
  {
    title: "Live",
    path: "/live",
    description: "Live race broadcasts, with a countdown to the next scheduled stream.",
  },
  {
    title: "Replays",
    path: "/replays",
    description: "Full race broadcasts, highlights and season reviews from the YouTube channel.",
  },
  {
    title: "LMU Special Events",
    path: "/lmu-special-events",
    description: "The Le Mans Ultimate Special Events calendar, from the 6 Hours to the 24 Hours of Le Mans, by class.",
  },
  {
    title: "Andy's Man Club charity race",
    path: "/andys-man-club-fundraiser",
    description: "A Le Mans Ultimate endurance race raising money for the men's mental-health charity Andy's Man Club.",
  },
  {
    title: "Join the League",
    path: "/join",
    description: "Apply to race in the GT7 (PlayStation) or Le Mans Ultimate (PC) leagues.",
  },
  {
    title: "About",
    path: "/about",
    description: "The league's story, values and community, founded in 2025.",
  },
  {
    title: "Partners",
    path: "/partners",
    description: "Sponsors and partners, including MOZA Racing, Rogue Energy, Sim Endurance and Andy's Man Club.",
  },
  {
    title: "Merch",
    path: "/merch",
    description: "Official hoodies, tees and accessories, including the Andy's Man Club charity range. Ships to the UK and Ireland.",
  },
];

const TOOL_PAGES: LlmsLink[] = [
  ...AIO_PAGES.map((page) => ({ title: page.title, path: page.path, description: page.description })),
  {
    title: "LMU Livery Studio",
    path: "/lmu-livery-studio",
    description:
      "A free in-browser livery creator for Le Mans Ultimate (Hypercar, LMP2, LMP3, LMGT3) that exports 4K TGA files.",
  },
];

const POLICY_PAGES: LlmsLink[] = [
  { title: "Privacy Policy", path: "/privacy", description: "How the site handles personal data and cookies." },
  { title: "Terms of Service", path: "/terms", description: "Terms for using the website and its services." },
];

const SUMMARY =
  "Apex & Chill Racing is a UK-based, multi-platform sim racing community, founded in 2025, running competitive Gran Turismo 7 (PlayStation) and Le Mans Ultimate (PC) leagues. It also publishes Apex AIO, a Windows companion app for Le Mans Ultimate.";

const DETAILS = [
  "- 200+ drivers from 12 countries; five seasons and 100+ races run.",
  "- Clean racing first: races are stewarded under a published rulebook.",
  "- Every race is broadcast on YouTube; the community is organised on Discord.",
  "- Exclusive community partner of Andy's Man Club, the UK men's mental-health charity.",
  "- Race times are UK time (Europe/London).",
].join("\n");

const CONTACT = [
  `- Website: ${SITE_URL}`,
  `- Email: ${CONTACT_EMAIL}`,
  `- Discord: ${DISCORD_URL}`,
  `- YouTube: ${YOUTUBE_URL}`,
].join("\n");

function linkList(links: LlmsLink[]): string {
  return links.map((l) => `- [${l.title}](${SITE_URL}${l.path}): ${l.description}`).join("\n");
}

/** The index file served at `/llms.txt`. */
export function buildLlmsTxt(): string {
  return [
    `# ${SITE_NAME}`,
    `> ${SUMMARY}`,
    DETAILS,
    "## League",
    linkList(LEAGUE_PAGES),
    "## Sim racing tools",
    linkList(TOOL_PAGES),
    "## Contact",
    CONTACT,
    "## Optional",
    [
      `- [Full text for AI assistants](${SITE_URL}/llms-full.txt): this index plus the upcoming race calendar and the Apex AIO FAQ.`,
      linkList(POLICY_PAGES),
    ].join("\n"),
  ].join("\n\n") + "\n";
}

/** Upcoming rounds from live calendars only — sample data is never published. */
function upcomingRounds(schedules: Partial<Record<League, ApiResult<Schedule> | undefined>>): string {
  const lines = Object.values(schedules)
    .filter((result): result is ApiResult<Schedule> => !!result && result.source !== "sample")
    .flatMap((result) =>
      result.data.rounds
        .filter((round) => round.status === "upcoming")
        .map((round) => ({
          sort: `${round.date} ${round.time ?? ""}`,
          text: `- ${round.date}${round.time ? ` ${round.time} UK` : ""}: ${LEAGUE_LABELS[round.league]} ${result.data.seasonLabel}, Round ${round.round} at ${round.track}${round.class ? ` (${round.class})` : ""}`,
        })),
    )
    .sort((a, b) => a.sort.localeCompare(b.sort))
    .map((line) => line.text);
  return lines.length
    ? lines.join("\n")
    : `No upcoming rounds are published right now. See ${SITE_URL}/schedule for the latest calendar.`;
}

/** The expanded file served at `/llms-full.txt`. */
export function buildLlmsFullTxt(
  schedules: Partial<Record<League, ApiResult<Schedule> | undefined>>,
): string {
  const faq = AIO_FAQ.map((item) => `### ${item.q}\n\n${item.a}`).join("\n\n");
  return [
    buildLlmsTxt().trimEnd(),
    "## Upcoming races",
    upcomingRounds(schedules),
    "## Apex AIO: frequently asked questions",
    faq,
  ].join("\n\n") + "\n";
}
