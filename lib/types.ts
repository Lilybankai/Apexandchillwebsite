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
 * The racing leagues Apex & Chill runs.
 *
 * - `GT7`  — Gran Turismo 7 league. Standings & schedule come from Sim League Pro.
 * - `LMU`  — Le Mans Ultimate (Sunday) league. Standings & schedule come from SimGrid.
 * - `THU`  — Midweek Endurance (Thursday) league, also Le Mans Ultimate on SimGrid.
 *
 * `THU` is only surfaced in the UI when its championship id is configured — see
 * `activeLeagues` in {@link module:lib/leagues}.
 */
export type League = 'GT7' | 'LMU' | 'THU';

/** All known leagues, in the order they should be presented in the UI. */
export const LEAGUES: readonly League[] = ['GT7', 'LMU', 'THU'] as const;

/** Human-friendly display names for each league. */
export const LEAGUE_LABELS: Record<League, string> = {
  GT7: 'GT7 League',
  LMU: 'LMU League',
  THU: 'Midweek Endurance',
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
 * rather than silently faking freshness. `tapstitch` / `printify` are the
 * print-on-demand providers behind the merch store.
 */
export type DataSource =
  | 'simgrid'
  | 'simleaguepro'
  | 'youtube'
  | 'cache'
  | 'tapstitch'
  | 'printify'
  | 'sample';

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
 * A single round in a league's season calendar. Aligns with the SimGrid
 * `races[]` payload and the Sim League Pro schedule, so the Schedule page and
 * the `RoundCard` component share one shape.
 */
export interface ScheduleRound {
  /** League this round belongs to. */
  league: League;
  /** Round number within the season (1-based, chronological). */
  round: number;
  /** Circuit / track name. */
  track: string;
  /** Car class / category running this round. */
  class: string;
  /** Race date as an ISO-8601 date (`YYYY-MM-DD`), in UK time. */
  date: string;
  /** Local (UK) start time, e.g. `20:00`. */
  time?: string;
  /** When the lobby opens, e.g. `19:45`. */
  lobbyOpens?: string;
  /** Whether this round runs dynamic / variable weather. */
  variableWeather?: boolean;
  /** Whether the round has already been run. */
  status: 'upcoming' | 'completed';
}

/**
 * A full season calendar for one league.
 */
export interface Schedule {
  /** League these rounds belong to. */
  league: League;
  /** Display label for the season, e.g. `Season 2`. */
  seasonLabel: string;
  /** Where the data came from (`sample` when live keys are missing). */
  source: DataSource;
  /** Rounds, pre-sorted chronologically by round number. */
  rounds: ScheduleRound[];
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
 * A named group of replays sourced from one YouTube playlist. The replays page
 * renders one section per group so the operator can surface several playlists
 * (e.g. "GT7 League", "LMU League", "Highlights") side by side.
 */
export interface ReplayPlaylist {
  /** The YouTube playlist id this group came from. */
  id: string;
  /** Section heading — an operator override, else the playlist's YouTube title. */
  label: string;
  /** Replays in this playlist, newest first. */
  replays: Replay[];
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
 *
 * Supports BOTH leagues: GT7 runs on PlayStation (PSN id) and LMU on PC
 * (gamertag), and the car-class options differ per league.
 */
export interface JoinSubmission {
  /** Which league the driver wants to join. */
  league: League;
  /** Driver's real name or preferred name. */
  driverName: string;
  /** Platform, e.g. `PS5`, `PC (Steam)`. */
  platform: string;
  /** PlayStation Network id (GT7 drivers). Optional for LMU. */
  psn?: string;
  /** Steam name / gamertag (LMU / PC drivers). Optional for GT7. */
  gamertag?: string;
  /** Contact email address. */
  email: string;
  /** Discord username/tag — the community's primary channel. */
  discord: string;
  /**
   * Preferred car class. GT7: `GR.4 (Beginner)` | `GR.3 (Advanced)` | `Both`.
   * LMU: `GT3` | `Hypercar`.
   */
  carClass: string;
  /** Self-described experience level. */
  experience: string;
  /** Input device, e.g. `Wheel` or `Controller`. */
  inputMethod: string;
  /** Confirms the applicant meets the eligibility/clean-racing requirements. */
  eligibilityAck: boolean;
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

/* ------------------------------------------------------------------------- *
 * Merch store
 * ------------------------------------------------------------------------- */

/** Which print-on-demand provider a product came from. */
export type MerchProvider = 'tapstitch' | 'printify' | 'sample';

/**
 * A single buyable variant of a product (a size/colour combination).
 * Prices are in GBP minor-unit-free pounds (e.g. `25.99`).
 */
export interface ProductVariant {
  /** Provider-unique variant id (used as the checkout line reference). */
  id: string;
  /** Human label, e.g. `M / Black`. */
  name: string;
  /** Size token, e.g. `M`, when applicable. */
  size?: string;
  /** Colour name, e.g. `Black`, when applicable. */
  color?: string;
  /** Price in GBP. */
  price: number;
  /** Whether the variant is in stock / orderable. */
  available: boolean;
  /** Optional variant-specific image URL. */
  image?: string;
}

/**
 * A merch product, normalised from a POD provider into a provider-agnostic
 * shape the UI and cart consume.
 */
export interface Product {
  /** Globally-unique id, provider-prefixed, e.g. `printify:123`. */
  id: string;
  /** URL slug used for the product detail route (`/merch/[handle]`). */
  handle: string;
  /** Product title. */
  title: string;
  /** Marketing description. */
  description: string;
  /** Which provider fulfils this product. */
  provider: MerchProvider;
  /** Ordered image URLs; first is the primary. */
  images: string[];
  /** Lowest variant price in GBP, for "from £x" display. */
  priceFrom: number;
  /** ISO-4217 currency code — always `GBP` for this store. */
  currency: 'GBP';
  /** Buyable variants. */
  variants: ProductVariant[];
  /** Category label, e.g. `Hoodies`, `Accessories`. */
  category: string;
  /** Freeform tags, e.g. `amc` for Andy's Man Club items. */
  tags: string[];
}

/**
 * The unified merch catalog returned by `GET /api/merch/products`, merging every
 * POD provider into one product list with per-provider source reporting.
 */
export interface MerchFeed {
  /** `true` when at least one provider (or the sample fallback) returned data. */
  ok: boolean;
  /** All products across providers, deduped by handle. */
  products: Product[];
  /** Where each provider's slice came from (`sample` when its key is absent). */
  providers: Partial<Record<'tapstitch' | 'printify', DataSource>>;
  /** Aggregated note when any provider fell back to sample data. */
  error: string | null;
}

/** A line in the shopping cart (a chosen variant + quantity). */
export interface CartLine {
  /** The parent {@link Product.id}. */
  productId: string;
  /** The chosen {@link ProductVariant.id}. */
  variantId: string;
  /** Product title, denormalised for display without a catalog lookup. */
  title: string;
  /** Variant label, e.g. `M / Black`. */
  variantName: string;
  /** Product handle, for linking back to the detail page. */
  handle: string;
  /** Unit price in GBP. */
  price: number;
  /** Quantity ordered (>= 1). */
  quantity: number;
  /** Optional thumbnail URL. */
  image?: string;
}
