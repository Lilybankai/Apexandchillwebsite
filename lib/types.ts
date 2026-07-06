/**
 * Shared domain types for the Apex & Chill Racing website.
 *
 * These types are the contract between the data layer (API clients + route
 * handlers under `app/api/*`) and the UI (pages + components). Every value
 * returned by the `/api/*` endpoints is shaped by the interfaces in this file,
 * so keep them stable and well documented.
 *
 * @packageDocumentation
 */

/**
 * The two racing leagues Apex & Chill runs.
 *
 * - `GT7`  — Gran Turismo 7 league. Standings & schedule come from Sim League Pro.
 * - `LMU`  — Le Mans Ultimate league. Standings & schedule come from SimGrid.
 */
export type League = 'GT7' | 'LMU';

/** All known leagues, in the order they should be presented in the UI. */
export const LEAGUES: readonly League[] = ['GT7', 'LMU'] as const;

/** Human-friendly display names for each league. */
export const LEAGUE_LABELS: Record<League, string> = {
  GT7: 'GT7 League',
  LMU: 'LMU League',
};

/**
 * Where a piece of data actually came from.
 *
 * - `simgrid` / `simleaguepro` / `youtube` — a fresh, live upstream response.
 * - `cache` — served from our own store (e.g. the Supabase replays cache)
 *   because the live call was unavailable; real data, but not this-second fresh.
 * - `sample` — live credentials were not configured (or every source failed) and
 *   we fell back to bundled placeholder data so the site still renders.
 *
 * The UI can surface this to keep the "live vs cached vs waiting" state honest
 * rather than silently faking freshness.
 */
export type DataSource = 'simgrid' | 'simleaguepro' | 'youtube' | 'cache' | 'sample';

/**
 * A single driver's row in a championship standings table.
 *
 * Field names mirror the columns used by the legacy WordPress `wp_race_standings`
 * table so the migration is 1:1, plus a `league` discriminator.
 */
export interface StandingRow {
  /** Championship position (1-based), already sorted by the source. */
  position: number;
  /** Driver display name / gamertag. */
  driver: string;
  /** Team / constructor name. May be empty for privateers. */
  team: string;
  /** Team accent colour as a `#rrggbb` hex string. Defaults to `#ffffff`. */
  teamColor: string;
  /** Championship points. */
  points: number;
  /** Race wins this season. */
  wins: number;
  /** Podium finishes (P1–P3) this season. */
  podiums: number;
  /** Average qualifying position across the season. */
  avgQuali: number;
  /** Average finishing position across the season. */
  avgFinish: number;
  /** Total penalty points accrued (displayed as a negative in the UI). */
  penalties: number;
  /** Car class / category, e.g. `GR.2`, `Hypercar`, `LMGT3`. */
  class: string;
  /** Which league this row belongs to. */
  league: League;
}

/**
 * A full championship standings payload for one league.
 */
export interface Standings {
  /** League these standings belong to. */
  league: League;
  /** Numeric season number (1-based). */
  season: number;
  /** Display label for the season, e.g. `Season 3`. */
  seasonLabel: string;
  /** Where the data came from (`sample` when live keys are missing). */
  source: DataSource;
  /** ISO-8601 timestamp of when this snapshot was produced. */
  updatedAt: string;
  /** Driver rows, pre-sorted by championship position. */
  rows: StandingRow[];
}

/**
 * The next upcoming race for a league. Mirrors the ACF fields used by the
 * legacy `next_race_event` WordPress shortcode.
 */
export interface NextRace {
  /** League this event belongs to. */
  league: League;
  /** Round number within the season. */
  round: number;
  /** Circuit / track name. */
  track: string;
  /** Car class / category running this round. */
  class: string;
  /** Race date as an ISO-8601 date (`YYYY-MM-DD`). */
  date: string;
  /** Local start time, e.g. `20:00`. */
  time: string;
  /** When the lobby opens, e.g. `19:45`. */
  lobbyOpens: string;
  /** Where the data came from (`sample` when live keys are missing). */
  source: DataSource;
}

/**
 * A YouTube replay video, normalised from the YouTube Data API v3.
 */
export interface Replay {
  /** YouTube video id (the `v=` parameter). */
  videoId: string;
  /** Video title. */
  title: string;
  /** Short description snippet (may be truncated). */
  description: string;
  /** Best available thumbnail URL. */
  thumbnail: string;
  /** ISO-8601 publish timestamp. */
  publishedAt: string;
  /** Canonical watch URL. */
  url: string;
  /** Total view count, when available. */
  viewCount?: number;
  /** ISO-8601 duration string (e.g. `PT1H2M`), when available. */
  duration?: string;
  /**
   * Best-effort league classification derived from the title/description, so
   * the replays page can filter by league. `null` when it can't be inferred.
   */
  league?: League | null;
  /** Best-effort series/round label derived from the title, else `null`. */
  series?: string | null;
}

/**
 * Generic envelope every data-layer function and API route returns.
 *
 * Using a discriminated-style envelope (rather than throwing) lets UI code
 * render graceful fallbacks and an honest "live vs sample" indicator without
 * try/catch at every call site.
 *
 * @typeParam T - The payload type on success.
 */
export interface ApiResult<T> {
  /** `true` when `data` is populated (from live source *or* sample fallback). */
  ok: boolean;
  /** The payload. Present whenever `ok` is true. */
  data: T;
  /** Where `data` came from — lets the UI show a "sample data" badge. */
  source: DataSource;
  /**
   * Human-readable note when we fell back to sample data or hit a soft error.
   * `null` on a clean live fetch.
   */
  error: string | null;
}

/**
 * Payload accepted by `POST /api/join` and persisted to Supabase.
 * Owned by the data layer so the Join page and the schema stay in sync.
 */
export interface JoinSubmission {
  /** Which league the driver wants to join. */
  league: League;
  /** Driver's real name or preferred name. */
  driverName: string;
  /** PlayStation Network id (GT7 drivers). Optional for LMU. */
  psn?: string;
  /** Steam / gamertag (LMU / PC drivers). Optional for GT7. */
  gamertag?: string;
  /** Self-described experience level. */
  experience: string;
  /** Platform, e.g. `PS5`, `PC`. */
  platform: string;
  /** Contact handle — Discord tag or email. */
  contact: string;
  /** Optional free-text message. */
  message?: string;
}

/** Result of persisting a {@link JoinSubmission}. */
export interface JoinResult {
  ok: boolean;
  /** Server-generated id of the stored row, when persisted. */
  id?: string;
  error: string | null;
}
