import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge conditional class names and de-duplicate conflicting Tailwind
 * utilities. This is the canonical class-composition helper for the whole
 * app — always prefer `cn(...)` over manual template strings.
 *
 * @example cn("px-2", isActive && "text-accent", className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format an ISO date (or Date) as a human race date, e.g. "Sat 25 Jul 2026".
 * Returns an empty string for missing/invalid input rather than throwing.
 */
export function formatRaceDate(input: string | Date | null | undefined): string {
  if (!input) return "";
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * Ordinal suffix for a finishing position, e.g. 1 -> "1st", 22 -> "22nd".
 */
export function ordinal(n: number): string {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

/**
 * Format a large count compactly for community stat badges,
 * e.g. 1000 -> "1K", 1500 -> "1.5K".
 */
export function compactNumber(n: number): string {
  return new Intl.NumberFormat("en-GB", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

/** Details needed to build a Google Calendar "add event" link for a race. */
export interface RaceCalendarEvent {
  round: number;
  track: string;
  class: string;
  /** ISO date `YYYY-MM-DD`. */
  date: string;
  /** Local start time `HH:MM`. */
  time: string;
  lobbyOpens?: string;
  /** Race length in hours used to compute the end time (default 3). */
  durationHours?: number;
}

/**
 * Build a Google Calendar "create event" URL for a race round. Mirrors the
 * legacy WordPress `next_race_event` shortcode logic (title, +3h duration,
 * class/lobby details, track as location). Returns `null` when date/time are
 * missing so callers can hide the button.
 */
export function googleCalendarUrl(event: RaceCalendarEvent): string | null {
  if (!event.date || !event.time) return null;
  const start = new Date(`${event.date}T${event.time}`);
  if (Number.isNaN(start.getTime())) return null;
  const end = new Date(start.getTime() + (event.durationHours ?? 3) * 60 * 60 * 1000);

  // Google expects a compact UTC-ish stamp: YYYYMMDDTHHMM00 (local, no tz).
  const stamp = (d: Date) =>
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
      d.getDate(),
    ).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}${String(
      d.getMinutes(),
    ).padStart(2, "0")}00`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Round ${event.round}: ${event.track} — Apex & Chill Racing`,
    dates: `${stamp(start)}/${stamp(end)}`,
    details: `Class: ${event.class}${event.lobbyOpens ? ` | Lobby opens: ${event.lobbyOpens}` : ""}`,
    location: event.track,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
