/**
 * SimGrid (GridOS) API client — the data source for SimGrid-hosted leagues:
 * full championship standings, the season schedule, and the next scheduled race.
 * Today that means the **LMU** (Le Mans Ultimate) league, but the helpers are
 * championship-id driven so additional SimGrid leagues (e.g. the Thursday
 * league) are a config-only addition — see {@link fetchSimgridStandings}.
 *
 * Real endpoints (verified against a live token):
 *  - `GET /championships/{id}`            → metadata + `races[]` + `upcoming_race`
 *  - `GET /championships/{id}/standings`  → entries grouped by car class
 *
 * Auth is `Authorization: Bearer <SIMGRID_API_KEY>` and the base URL is
 * `https://www.thesimgrid.com/api/v1` (configurable via `SIMGRID_API_BASE_URL`).
 *
 * When the token / championship id are missing, or the upstream call fails,
 * every function resolves to a well-shaped {@link ApiResult} carrying bundled
 * sample data with `source: 'sample'`, so dependent pages always render.
 *
 * @packageDocumentation
 */

import type {
  ApiResult,
  DataSource,
  League,
  NextRace,
  Schedule,
  ScheduleRound,
  StandingRow,
  Standings,
} from '@/lib/types';
import { simgrid as cfg, CACHE_TTL_SECONDS } from '@/lib/env';

/** Default team accent colour when the source doesn't provide one. */
const DEFAULT_TEAM_COLOR = '#00d4ff';

/** The class label the LMU league runs. */
const LMU_CLASS = 'LMGT3';

/**
 * Bundled sample LMU standings, used when live credentials are absent.
 * Representative of a Le Mans Ultimate LMGT3 grid.
 */
const SAMPLE_LMU_STANDINGS: StandingRow[] = [
  { position: 1, driver: 'M. Verhoeven', team: 'Ferrari 296 LMGT3', teamColor: '#ff2d55', points: 184, wins: 4, podiums: 7, avgQuali: 2.1, avgFinish: 2.4, penalties: 0, class: LMU_CLASS, league: 'LMU' },
  { position: 2, driver: 'R. Castellano', team: 'Porsche 911 LMGT3', teamColor: '#00d4ff', points: 171, wins: 3, podiums: 8, avgQuali: 2.8, avgFinish: 3.0, penalties: 2, class: LMU_CLASS, league: 'LMU' },
  { position: 3, driver: 'K. Andersson', team: 'BMW M4 LMGT3', teamColor: '#9b59b6', points: 158, wins: 2, podiums: 6, avgQuali: 3.4, avgFinish: 3.6, penalties: 0, class: LMU_CLASS, league: 'LMU' },
  { position: 4, driver: 'J. Okafor', team: 'Corvette Z06 LMGT3', teamColor: '#2ecc71', points: 140, wins: 1, podiums: 5, avgQuali: 4.2, avgFinish: 4.1, penalties: 5, class: LMU_CLASS, league: 'LMU' },
  { position: 5, driver: 'L. Moreau', team: 'Aston Martin LMGT3', teamColor: '#f5a623', points: 129, wins: 1, podiums: 4, avgQuali: 5.0, avgFinish: 4.8, penalties: 0, class: LMU_CLASS, league: 'LMU' },
  { position: 6, driver: 'D. Ellwood', team: 'Lexus RC F LMGT3', teamColor: '#e74c3c', points: 118, wins: 0, podiums: 3, avgQuali: 5.6, avgFinish: 5.5, penalties: 3, class: LMU_CLASS, league: 'LMU' },
  { position: 7, driver: 'S. Nakamura', team: 'McLaren 720S LMGT3', teamColor: '#e67e22', points: 97, wins: 1, podiums: 3, avgQuali: 6.1, avgFinish: 6.4, penalties: 0, class: LMU_CLASS, league: 'LMU' },
  { position: 8, driver: 'A. Rossi', team: 'Ferrari 296 LMGT3', teamColor: '#c0392b', points: 88, wins: 0, podiums: 2, avgQuali: 7.0, avgFinish: 6.9, penalties: 4, class: LMU_CLASS, league: 'LMU' },
  { position: 9, driver: 'T. Bauer', team: 'BMW M4 LMGT3', teamColor: '#3498db', points: 74, wins: 0, podiums: 1, avgQuali: 8.2, avgFinish: 8.0, penalties: 1, class: LMU_CLASS, league: 'LMU' },
  { position: 10, driver: 'G. Fernández', team: 'Porsche 911 LMGT3', teamColor: '#00d4ff', points: 61, wins: 0, podiums: 1, avgQuali: 9.1, avgFinish: 9.3, penalties: 0, class: LMU_CLASS, league: 'LMU' },
];

/** Bundled sample next LMU race. */
const SAMPLE_LMU_NEXT_RACE: NextRace = {
  league: 'LMU',
  round: 5,
  track: 'Fuji Speedway (WEC)',
  class: LMU_CLASS,
  date: '2026-07-25',
  time: '20:00',
  lobbyOpens: '',
  source: 'sample',
};

/** Bundled sample LMU schedule. */
const SAMPLE_LMU_SCHEDULE: ScheduleRound[] = [
  { league: 'LMU', round: 1, track: 'Sebring (WEC)', class: LMU_CLASS, date: '2026-05-30', time: '20:00', status: 'completed' },
  { league: 'LMU', round: 2, track: 'Imola (ELMS)', class: LMU_CLASS, date: '2026-06-06', time: '20:00', status: 'completed' },
  { league: 'LMU', round: 3, track: 'Spa-Francorchamps (WEC)', class: LMU_CLASS, date: '2026-06-20', time: '20:00', status: 'completed' },
  { league: 'LMU', round: 4, track: 'Fuji Speedway (WEC)', class: LMU_CLASS, date: '2026-07-25', time: '20:00', status: 'upcoming' },
  { league: 'LMU', round: 5, track: 'Monza (WEC)', class: LMU_CLASS, date: '2026-08-08', time: '20:00', status: 'upcoming' },
  { league: 'LMU', round: 6, track: 'Le Mans (WEC)', class: LMU_CLASS, date: '2026-09-05', time: '20:00', status: 'upcoming' },
];

/* ------------------------------------------------------------------------- *
 * Low-level fetch + parsing helpers (shared by every SimGrid league)
 * ------------------------------------------------------------------------- */

/** Format an ISO timestamp as `{ date: 'YYYY-MM-DD', time: 'HH:mm' }` in UK time. */
const LONDON_DATE = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/London',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
const LONDON_TIME = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/London',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});
function splitLondon(iso: string | undefined): { date: string; time: string } {
  if (!iso) return { date: '', time: '' };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: '', time: '' };
  return { date: LONDON_DATE.format(d), time: LONDON_TIME.format(d) };
}

/** Derive a `Season N` label from a championship name, else a sensible default. */
function seasonLabelFrom(name: unknown): string {
  if (typeof name === 'string') {
    const m = name.match(/season\s+(\d+)/i);
    if (m) return `Season ${m[1]}`;
  }
  return 'Current Season';
}

/** Numeric season from a `Season N` label (defaults to 1). */
function seasonNumberFrom(label: string): number {
  const m = label.match(/(\d+)/);
  return m ? Number(m[1]) : 1;
}

/** Minimal shape of a SimGrid race entry we consume. */
interface SgTrack {
  name?: string;
  composite_name?: string;
}
interface SgRace {
  race_name?: string;
  display_name?: string;
  track?: SgTrack;
  starts_at?: string;
  ended?: boolean;
}
/** Minimal shape of the `GET /championships/{id}` payload we consume. */
interface SgChampionship {
  name?: string;
  round_number?: number;
  races?: SgRace[];
  upcoming_race?: SgRace | null;
}

/**
 * GET against the SimGrid API with auth + Next.js caching.
 * @throws When the response is not ok, so the caller can fall back.
 */
async function simgridGet<T>(path: string): Promise<T> {
  const url = `${cfg.baseUrl.replace(/\/$/, '')}${path}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      Accept: 'application/json',
    },
    // Cache upstream responses; standings/schedule don't need to be real-time.
    next: { revalidate: CACHE_TTL_SECONDS },
  });
  if (!res.ok) {
    throw new Error(`SimGrid ${path} responded ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

/** Track display name from a race entry. */
function trackName(race: SgRace | null | undefined): string {
  return race?.track?.composite_name || race?.track?.name || 'TBC';
}

/**
 * Map the grouped SimGrid standings payload into flat {@link StandingRow}s,
 * ranked overall by championship points. The payload is an array of car-class
 * groups; each group is an array of entries (either may contain nulls).
 */
function mapStandingsRows(groups: unknown, league: League): StandingRow[] {
  const num = (v: unknown, fallback = 0): number =>
    typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) || fallback : fallback;
  const str = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback);

  const flat: Record<string, unknown>[] = Array.isArray(groups)
    ? groups.flatMap((g) => (Array.isArray(g) ? g : []))
    : [];

  const rows = flat
    .filter((e): e is Record<string, unknown> => Boolean(e) && typeof e === 'object')
    .filter((e) => str(e.display_name).trim() !== '')
    .map((e) => {
      const carClass = e.championship_car_class as { display_name?: string } | undefined;
      return {
        // position is assigned after the overall points sort below.
        position: 0,
        driver: str(e.display_name, 'Unknown Driver'),
        // No team concept (teams disabled) — surface the car instead.
        team: str(e.car),
        teamColor: DEFAULT_TEAM_COLOR,
        points: num(e.championship_points ?? e.championship_score),
        wins: 0,
        podiums: 0,
        avgQuali: 0,
        avgFinish: 0,
        penalties: num(e.championship_penalties),
        class: str(e.class ?? carClass?.display_name, ''),
        league,
      } satisfies StandingRow;
    });

  rows.sort((a, b) => b.points - a.points);
  rows.forEach((r, i) => {
    r.position = i + 1;
  });
  return rows;
}

/* ------------------------------------------------------------------------- *
 * Generic SimGrid fetchers (parameterised by championship id + league)
 * ------------------------------------------------------------------------- */

/** Options describing how to present a SimGrid league's data + its sample fallbacks. */
interface SimgridLeagueOptions {
  /** Championship id to fetch (undefined ⇒ always sample). */
  championshipId: string | undefined;
  /** Car-class label shown on next-race / schedule cards. */
  classLabel: string;
  /** Sample rows used when live data is unavailable. */
  sampleStandings: StandingRow[];
  /** Sample next race used when live data is unavailable. */
  sampleNextRace: NextRace;
  /** Sample schedule used when live data is unavailable. */
  sampleSchedule: ScheduleRound[];
}

/** Whether a given SimGrid league can make live calls. */
function canFetch(championshipId: string | undefined): boolean {
  return Boolean(cfg.token && championshipId);
}

/**
 * Fetch one SimGrid league's championship standings.
 * @returns Live standings when configured, otherwise sample data. Never throws.
 */
export async function fetchSimgridStandings(
  league: League,
  opts: SimgridLeagueOptions,
): Promise<ApiResult<Standings>> {
  const sample = (error: string | null, source: DataSource = 'sample'): ApiResult<Standings> => ({
    ok: true,
    source,
    error,
    data: {
      league,
      season: 1,
      seasonLabel: 'Current Season',
      source,
      updatedAt: new Date(0).toISOString(),
      rows: opts.sampleStandings,
    },
  });

  if (!canFetch(opts.championshipId)) {
    return sample(`SimGrid not configured — showing sample ${league} standings.`);
  }
  try {
    const [groups, champ] = await Promise.all([
      simgridGet<unknown>(`/championships/${opts.championshipId}/standings`),
      simgridGet<SgChampionship>(`/championships/${opts.championshipId}`).catch(() => null),
    ]);
    const rows = mapStandingsRows(groups, league);
    if (rows.length === 0) {
      return sample(`SimGrid returned no ${league} standings — showing sample data.`);
    }
    const seasonLabel = seasonLabelFrom(champ?.name);
    return {
      ok: true,
      source: 'simgrid',
      error: null,
      data: {
        league,
        season: seasonNumberFrom(seasonLabel),
        seasonLabel,
        source: 'simgrid',
        updatedAt: new Date().toISOString(),
        rows,
      },
    };
  } catch (err) {
    return sample(
      `SimGrid request failed (${err instanceof Error ? err.message : 'unknown error'}) — showing sample data.`,
    );
  }
}

/**
 * Fetch one SimGrid league's next scheduled race.
 * @returns Live next-race when configured, otherwise sample data. Never throws.
 */
export async function fetchSimgridNextRace(
  league: League,
  opts: SimgridLeagueOptions,
): Promise<ApiResult<NextRace>> {
  const sample = (error: string | null): ApiResult<NextRace> => ({
    ok: true,
    source: 'sample',
    error,
    data: opts.sampleNextRace,
  });

  if (!canFetch(opts.championshipId)) {
    return sample(`SimGrid not configured — showing sample ${league} next race.`);
  }
  try {
    const champ = await simgridGet<SgChampionship>(`/championships/${opts.championshipId}`);
    const next = champ.upcoming_race;
    if (!next) return sample(`No upcoming ${league} race from SimGrid — showing sample data.`);
    const { date, time } = splitLondon(next.starts_at);
    return {
      ok: true,
      source: 'simgrid',
      error: null,
      data: {
        league,
        round: typeof champ.round_number === 'number' ? champ.round_number : 0,
        track: trackName(next),
        class: opts.classLabel,
        date,
        time,
        lobbyOpens: '',
        source: 'simgrid',
      },
    };
  } catch (err) {
    return sample(
      `SimGrid request failed (${err instanceof Error ? err.message : 'unknown error'}) — showing sample data.`,
    );
  }
}

/**
 * Fetch one SimGrid league's full season schedule from `races[]`.
 * @returns Live schedule when configured, otherwise sample data. Never throws.
 */
export async function fetchSimgridSchedule(
  league: League,
  opts: SimgridLeagueOptions,
): Promise<ApiResult<Schedule>> {
  const sample = (error: string | null): ApiResult<Schedule> => ({
    ok: true,
    source: 'sample',
    error,
    data: { league, seasonLabel: 'Current Season', source: 'sample', rounds: opts.sampleSchedule },
  });

  if (!canFetch(opts.championshipId)) {
    return sample(`SimGrid not configured — showing sample ${league} schedule.`);
  }
  try {
    const champ = await simgridGet<SgChampionship>(`/championships/${opts.championshipId}`);
    const races = Array.isArray(champ.races) ? champ.races : [];
    if (races.length === 0) {
      return sample(`SimGrid returned no ${league} races — showing sample data.`);
    }
    // Chronological order → round number (matches SimGrid's own round_number).
    const rounds: ScheduleRound[] = races
      .map((r) => ({ r, ts: new Date(r.starts_at ?? 0).getTime() }))
      .sort((a, b) => a.ts - b.ts)
      .map(({ r }, i): ScheduleRound => {
        const { date, time } = splitLondon(r.starts_at);
        return {
          league,
          round: i + 1,
          track: trackName(r),
          class: opts.classLabel,
          date,
          time: time || undefined,
          status: r.ended ? 'completed' : 'upcoming',
        };
      });
    return {
      ok: true,
      source: 'simgrid',
      error: null,
      data: { league, seasonLabel: seasonLabelFrom(champ.name), source: 'simgrid', rounds },
    };
  } catch (err) {
    return sample(
      `SimGrid request failed (${err instanceof Error ? err.message : 'unknown error'}) — showing sample data.`,
    );
  }
}

/* ------------------------------------------------------------------------- *
 * LMU league — thin wrappers over the generic SimGrid fetchers
 * ------------------------------------------------------------------------- */

/** Presentation + sample config for the LMU league. */
const LMU_OPTIONS: SimgridLeagueOptions = {
  championshipId: cfg.championships.LMU ?? cfg.championshipId,
  classLabel: LMU_CLASS,
  sampleStandings: SAMPLE_LMU_STANDINGS,
  sampleNextRace: SAMPLE_LMU_NEXT_RACE,
  sampleSchedule: SAMPLE_LMU_SCHEDULE,
};

/** Fetch the current LMU championship standings (SimGrid). Never throws. */
export function fetchLmuStandings(): Promise<ApiResult<Standings>> {
  return fetchSimgridStandings('LMU', LMU_OPTIONS);
}

/** Fetch the next scheduled LMU race (SimGrid). Never throws. */
export function fetchLmuNextRace(): Promise<ApiResult<NextRace>> {
  return fetchSimgridNextRace('LMU', LMU_OPTIONS);
}

/** Fetch the full LMU season schedule (SimGrid). Never throws. */
export function fetchLmuSchedule(): Promise<ApiResult<Schedule>> {
  return fetchSimgridSchedule('LMU', LMU_OPTIONS);
}
