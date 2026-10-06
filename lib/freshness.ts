/**
 * Real "last changed" dates for pages whose content follows the race calendar
 * or the YouTube channel, so the sitemap and on-page dates reflect when the
 * content actually moved rather than when the page happened to be rendered.
 * Sample (placeholder) data never counts.
 */

import type { ApiResult, League, Replay, Schedule } from "@/lib/types";

/** The most recent completed round date (`YYYY-MM-DD`) across live calendars, if any. */
export function latestCompletedRoundDate(
  schedules: Partial<Record<League, ApiResult<Schedule> | undefined>>,
): string | null {
  const dates = Object.values(schedules)
    .filter((result): result is ApiResult<Schedule> => !!result && result.source !== "sample")
    .flatMap((result) => result.data.rounds)
    .filter((round) => round.status === "completed" && /^\d{4}-\d{2}-\d{2}$/.test(round.date))
    .map((round) => round.date)
    .sort();
  return dates.at(-1) ?? null;
}

/** The newest live replay's publish timestamp, if any. */
export function newestReplayDate(result: ApiResult<Replay[]>): string | null {
  if (result.source === "sample") return null;
  const dates = result.data.map((r) => r.publishedAt).filter(Boolean).sort();
  return dates.at(-1) ?? null;
}

/** "28 September 2026" — for visible "updated" lines. */
export function formatUkDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/London",
  }).format(new Date(iso));
}
