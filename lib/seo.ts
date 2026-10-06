/**
 * Site-wide schema.org builders. Every node that names the league points at the
 * one Organization by `@id`, so search engines and AI crawlers read the home
 * page, the calendar and the replays as one entity rather than several.
 *
 * Only live data is ever marked up: a `sample` fallback is placeholder content,
 * and publishing it as real events or videos would mislead search results.
 */

import type { ApiResult, League, Replay, Schedule } from "@/lib/types";
import { LEAGUE_LABELS } from "@/lib/types";
import { CONTACT_EMAIL, DISCORD_URL, SITE_NAME, SITE_URL, YOUTUBE_URL } from "@/lib/site";

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

const ORG_REF = { "@type": "SportsOrganization", "@id": ORGANIZATION_ID, name: SITE_NAME, url: SITE_URL };

const DESCRIPTION =
  "A multi-platform sim racing community running competitive Gran Turismo 7 and Le Mans Ultimate leagues, with live standings, weekly replays and a Discord community.";

/** The league as an organisation, plus the website it publishes. For the home page. */
export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SportsOrganization",
        "@id": ORGANIZATION_ID,
        name: SITE_NAME,
        alternateName: "Apex and Chill Racing",
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/brand/apex-chill-logo.jpg`,
          width: 150,
          height: 150,
        },
        image: `${SITE_URL}/brand/banner.png`,
        description: DESCRIPTION,
        email: CONTACT_EMAIL,
        foundingDate: "2025",
        sport: "Sim racing",
        sameAs: [YOUTUBE_URL, DISCORD_URL],
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: SITE_URL,
        name: SITE_NAME,
        description: DESCRIPTION,
        inLanguage: "en-GB",
        publisher: { "@id": ORGANIZATION_ID },
      },
    ],
  };
}

/** Home → … → this page. `path` is site-relative, e.g. `/schedule`. */
export function buildBreadcrumbJsonLd(trail: { name: string; path: string }[]) {
  const items = [{ name: "Home", path: "/" }, ...trail];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((entry, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: entry.name,
      item: entry.path === "/" ? SITE_URL : `${SITE_URL}${entry.path}`,
    })),
  };
}

/** Europe/London's UTC offset at an instant, as `Z` or `+01:00`. */
function londonOffset(utcMs: number): string {
  const name =
    new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", timeZoneName: "shortOffset" })
      .formatToParts(utcMs)
      .find((part) => part.type === "timeZoneName")?.value ?? "GMT";
  const match = /GMT([+-])(\d{1,2})(?::(\d{2}))?/.exec(name);
  if (!match) return "Z";
  return `${match[1]}${match[2].padStart(2, "0")}:${match[3] ?? "00"}`;
}

/**
 * A UK-local round date/time as an ISO-8601 timestamp with its offset. Falls
 * back to the bare date when the start time is missing or not `HH:MM`.
 */
export function ukStartDate(date: string, time?: string): string {
  const t = time && /^\d{1,2}:\d{2}$/.test(time) ? time.padStart(5, "0") : null;
  if (!t) return date;
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = t.split(":").map(Number);
  return `${date}T${t}:00${londonOffset(Date.UTC(y, m - 1, d, hh, mm))}`;
}

/** Every upcoming, live-sourced round across the league calendars, as SportsEvents. */
export function buildScheduleEventsJsonLd(
  schedules: Partial<Record<League, ApiResult<Schedule>>>,
) {
  const events = Object.values(schedules)
    .filter((result): result is ApiResult<Schedule> => !!result && result.source !== "sample")
    .flatMap((result) =>
      result.data.rounds
        .filter((round) => round.status === "upcoming" && /^\d{4}-\d{2}-\d{2}$/.test(round.date))
        .map((round) => ({
          "@type": "SportsEvent",
          name: `${SITE_NAME} ${LEAGUE_LABELS[round.league]} ${result.data.seasonLabel} — Round ${round.round}: ${round.track}`,
          description: `Round ${round.round} of the ${SITE_NAME} ${LEAGUE_LABELS[round.league]} (${result.data.seasonLabel}) at ${round.track}${round.class ? `, ${round.class}` : ""}.`,
          startDate: ukStartDate(round.date, round.time),
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
          location: { "@type": "VirtualLocation", url: `${SITE_URL}/live` },
          image: `${SITE_URL}/brand/banner.png`,
          sport: "Sim racing",
          organizer: ORG_REF,
          url: `${SITE_URL}/schedule`,
        })),
    );
  if (!events.length) return null;
  return { "@context": "https://schema.org", "@graph": events };
}

/** Live (non-sample) replays as VideoObjects, de-duplicated by video id. */
export function buildReplaysJsonLd(replays: Replay[]) {
  const seen = new Set<string>();
  const videos = replays
    .filter((r) => r.videoId && !seen.has(r.videoId) && seen.add(r.videoId))
    .map((r) => ({
      "@type": "VideoObject",
      name: r.title,
      description: r.description || r.title,
      thumbnailUrl: r.thumbnail,
      uploadDate: r.publishedAt,
      ...(r.duration ? { duration: r.duration } : {}),
      embedUrl: `https://www.youtube.com/embed/${r.videoId}`,
      url: r.url,
      publisher: ORG_REF,
    }));
  if (!videos.length) return null;
  return { "@context": "https://schema.org", "@graph": videos };
}
