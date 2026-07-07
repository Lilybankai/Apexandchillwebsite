/**
 * Sim League Pro API client — the data source for the **GT7** (Gran Turismo 7)
 * league: full championship standings, the season schedule, and the next
 * scheduled race.
 *
 * The whole league (metadata + `league_results[]` + `races[]` with per-race
 * `race_results[]`) comes from a single public endpoint:
 *
 * ```
 * GET https://simleaguepro.com/api/v1/leagues/{leagueId}.json?include_results=true
 * ```
 *
 * No auth is required — only the league UUID (`SIMLEAGUEPRO_GT7_LEAGUE_ID`, the
 * id in the league URL). When the league id is absent or the upstream call
 * fails, functions resolve to a well-shaped {@link ApiResult} carrying bundled
 * sample data with `source: 'sample'`.
 *
 * @packageDocumentation
 */

import type { ApiResult, NextRace, Schedule, ScheduleRound, StandingRow, Standings } from '@/lib/types';
import { simLeaguePro as cfg, isConfigured, CACHE_TTL_SECONDS } from '@/lib/env';

/** Default team accent colour when the source doesn't provide one. */
const DEFAULT_TEAM_COLOR = '#00ff88';

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

/** Minimal shapes of the Sim League Pro league payload we consume. */
interface SlpResult {
  username?: string;
  position?: number;
  points?: number;
  penalty_points?: number;
  car?: string;
  constructor?: string;
  vehicle_class?: string;
  wins?: number;
  podiums?: number;
  reserve?: boolean;
}
interface SlpRace {
  race_number?: number;
  track?: string;
  start_datetime?: string;
  race_info?: string;
  race_results?: unknown[];
}
interface SlpLeague {
  name?: string;
  season?: number;
  game?: string;
  vehicle_classes?: string[];
  league_results?: SlpResult[];
  races?: SlpRace[];
}

/**
 * Bundled sample GT7 standings, used when live credentials are absent.
 * Team names mirror the real Season 3 grid so the fallback looks authentic.
 */
const SAMPLE_GT7_STANDINGS: StandingRow[] = [
  { position: 1, driver: 'ApexJake_87', team: 'Apex Originals', teamColor: '#00ff88', points: 212, wins: 6, podiums: 9, avgQuali: 1.8, avgFinish: 2.0, penalties: 0, class: 'Gr.3', league: 'GT7' },
  { position: 2, driver: 'NumptyKing', team: 'GT97 Numpty Squad', teamColor: '#00d4ff', points: 198, wins: 4, podiums: 10, avgQuali: 2.4, avgFinish: 2.6, penalties: 3, class: 'Gr.3', league: 'GT7' },
  { position: 3, driver: 'V10_Sombra', team: 'Chemistry Racing Team', teamColor: '#9b59b6', points: 176, wins: 3, podiums: 7, avgQuali: 3.1, avgFinish: 3.3, penalties: 0, class: 'Gr.3', league: 'GT7' },
  { position: 4, driver: 'DriftKing_204', team: 'Poorez Racing Team', teamColor: '#ff4444', points: 159, wins: 2, podiums: 6, avgQuali: 3.9, avgFinish: 4.0, penalties: 6, class: 'Gr.3', league: 'GT7' },
  { position: 5, driver: 'Nova_Mirai', team: 'Team Papaia', teamColor: '#f5a623', points: 143, wins: 1, podiums: 5, avgQuali: 4.5, avgFinish: 4.7, penalties: 0, class: 'Gr.3', league: 'GT7' },
  { position: 6, driver: 'PSN_Falke', team: 'Team Pane', teamColor: '#3498db', points: 131, wins: 1, podiums: 4, avgQuali: 5.2, avgFinish: 5.1, penalties: 2, class: 'Gr.3', league: 'GT7' },
  { position: 7, driver: 'HoundDog_RJ', team: 'Racing Hounds', teamColor: '#e67e22', points: 121, wins: 1, podiums: 4, avgQuali: 5.7, avgFinish: 5.6, penalties: 1, class: 'Gr.3', league: 'GT7' },
  { position: 8, driver: 'LateBraker99', team: 'GT97 Numpty Squad', teamColor: '#00d4ff', points: 112, wins: 0, podiums: 3, avgQuali: 6.0, avgFinish: 6.2, penalties: 1, class: 'Gr.3', league: 'GT7' },
  { position: 9, driver: 'Kaido_TT', team: 'Apex Originals', teamColor: '#00ff88', points: 98, wins: 1, podiums: 2, avgQuali: 6.8, avgFinish: 6.7, penalties: 4, class: 'Gr.3', league: 'GT7' },
  { position: 10, driver: 'Silverline_RJ', team: 'Poorez Racing Team', teamColor: '#ff4444', points: 84, wins: 0, podiums: 2, avgQuali: 7.9, avgFinish: 7.6, penalties: 0, class: 'Gr.3', league: 'GT7' },
  { position: 11, driver: 'GTP_Wanderer', team: 'Chemistry Racing Team', teamColor: '#9b59b6', points: 76, wins: 0, podiums: 1, avgQuali: 8.3, avgFinish: 8.1, penalties: 3, class: 'Gr.3', league: 'GT7' },
  { position: 12, driver: 'Momenta_Lars', team: 'Team Pane', teamColor: '#3498db', points: 69, wins: 0, podiums: 1, avgQuali: 8.7, avgFinish: 8.9, penalties: 2, class: 'Gr.3', league: 'GT7' },
  { position: 13, driver: 'ChicaneCharlie', team: 'Racing Hounds', teamColor: '#e67e22', points: 58, wins: 0, podiums: 1, avgQuali: 9.4, avgFinish: 9.6, penalties: 0, class: 'Gr.3', league: 'GT7' },
  { position: 14, driver: 'ApexRookie_22', team: 'Team Papaia', teamColor: '#f5a623', points: 44, wins: 0, podiums: 0, avgQuali: 10.8, avgFinish: 10.9, penalties: 5, class: 'Gr.3', league: 'GT7' },
  { position: 15, driver: 'BackmarkerBob', team: 'Apex Originals', teamColor: '#00ff88', points: 31, wins: 0, podiums: 0, avgQuali: 12.1, avgFinish: 12.4, penalties: 1, class: 'Gr.3', league: 'GT7' },
];

/**
 * Bundled sample GT7 schedule used until the Sim League Pro schedule endpoint is
 * wired live. GT7 Season 3 (per Scout) ran on Sundays at 20:00.
 */
const SAMPLE_GT7_SCHEDULE: ScheduleRound[] = [
  { league: 'GT7', round: 1, track: 'Nürburgring GP', class: 'GR.3', date: '2026-01-11', time: '20:00', status: 'completed' },
  { league: 'GT7', round: 2, track: 'Suzuka Circuit', class: 'GR.2', date: '2026-01-18', time: '20:00', status: 'completed' },
  { league: 'GT7', round: 3, track: 'Brands Hatch', class: 'GR.3', date: '2026-01-25', time: '20:00', variableWeather: true, status: 'completed' },
  { league: 'GT7', round: 4, track: 'Autodromo di Monza', class: 'GR.2', date: '2026-02-01', time: '20:00', status: 'completed' },
  { league: 'GT7', round: 5, track: 'Spa-Francorchamps', class: 'GR.3', date: '2026-02-08', time: '20:00', variableWeather: true, status: 'completed' },
  { league: 'GT7', round: 6, track: 'Interlagos', class: 'GR.2', date: '2026-02-15', time: '20:00', status: 'completed' },
  { league: 'GT7', round: 7, track: 'Red Bull Ring', class: 'F3500', date: '2026-02-22', time: '20:00', status: 'completed' },
  { league: 'GT7', round: 8, track: 'Mount Panorama', class: 'GR.3', date: '2026-03-01', time: '20:00', variableWeather: true, status: 'completed' },
  { league: 'GT7', round: 9, track: 'Autopolis', class: 'GR.2', date: '2026-03-08', time: '20:00', status: 'completed' },
  { league: 'GT7', round: 10, track: 'Trial Mountain', class: 'GR.3', date: '2026-03-15', time: '20:00', status: 'completed' },
  { league: 'GT7', round: 11, track: 'Yas Marina', class: 'GR.2', date: '2026-03-22', time: '20:00', status: 'completed' },
  { league: 'GT7', round: 12, track: 'Circuit de la Sarthe', class: 'GR.3', date: '2026-03-29', time: '20:00', variableWeather: true, status: 'completed' },
];

/** Bundled sample next GT7 race. */
const SAMPLE_GT7_NEXT_RACE: NextRace = {
  league: 'GT7',
  round: 7,
  track: 'Nürburgring GP',
  class: 'Gr.3',
  date: '2026-07-14',
  time: '20:00',
  lobbyOpens: '19:45',
  source: 'sample',
};

const num = (v: unknown, fallback = 0): number =>
  typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) || fallback : fallback;
const str = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback);

/**
 * Fetch the whole GT7 league (metadata + `league_results[]` + `races[]`) from
 * the public Sim League Pro endpoint, with Next.js caching. One call powers
 * standings, schedule and next-race.
 * @throws When not configured or the response is not ok, so callers can fall back.
 */
async function fetchLeague(): Promise<SlpLeague> {
  if (!cfg.leagueId) throw new Error('SIMLEAGUEPRO_GT7_LEAGUE_ID is not set');
  const url = `${cfg.baseUrl.replace(/\/$/, '')}/leagues/${cfg.leagueId}.json?include_results=true`;
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      // The endpoint is public; only send a key if the operator set one.
      ...(cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : {}),
    },
    next: { revalidate: CACHE_TTL_SECONDS },
  });
  if (!res.ok) {
    throw new Error(`Sim League Pro league responded ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as SlpLeague;
}

/** `Season N` label from the league payload. */
function seasonLabelOf(league: SlpLeague): string {
  return `Season ${typeof league.season === 'number' ? league.season : 3}`;
}

/** Car-class label for a race — its own `race_info`, else the league classes. */
function classOf(league: SlpLeague, race: SlpRace): string {
  return (
    str(race.race_info) ||
    (Array.isArray(league.vehicle_classes) ? league.vehicle_classes.join(' / ') : '') ||
    'Gr.3'
  );
}

/** Map `league_results[]` into standings rows (drops reserves, sorts by position). */
function mapStandingRows(league: SlpLeague): StandingRow[] {
  const results = Array.isArray(league.league_results) ? league.league_results : [];
  return results
    .filter((r) => r && !r.reserve && str(r.username).trim() !== '')
    .map(
      (r): StandingRow => ({
        position: num(r.position),
        driver: str(r.username, 'Unknown Driver'),
        // No team concept — surface the constructor / car instead.
        team: str(r.constructor || r.car),
        teamColor: DEFAULT_TEAM_COLOR,
        points: num(r.points),
        wins: num(r.wins),
        podiums: num(r.podiums),
        avgQuali: 0,
        avgFinish: 0,
        penalties: num(r.penalty_points),
        class: str(r.vehicle_class),
        league: 'GT7',
      }),
    )
    .sort((a, b) => a.position - b.position);
}

/** Map `races[]` into schedule rounds (chronological; results/past ⇒ completed). */
function mapRounds(league: SlpLeague): ScheduleRound[] {
  const races = Array.isArray(league.races) ? league.races : [];
  const now = Date.now();
  return races
    .map((r) => ({ r, ts: new Date(r.start_datetime ?? 0).getTime() }))
    .sort((a, b) => a.ts - b.ts)
    .map(({ r, ts }): ScheduleRound => {
      const { date, time } = splitLondon(r.start_datetime);
      const hasResults = Array.isArray(r.race_results) && r.race_results.length > 0;
      const past = Number.isFinite(ts) && ts < now;
      return {
        league: 'GT7',
        round: num(r.race_number),
        track: str(r.track, 'TBC'),
        class: classOf(league, r),
        date,
        time: time || undefined,
        status: hasResults || past ? 'completed' : 'upcoming',
      };
    });
}

/** Shape of the sample fallback result (shared by success + error paths). */
function sampleStandings(error: string | null): ApiResult<Standings> {
  return {
    ok: true,
    source: 'sample',
    error,
    data: {
      league: 'GT7',
      season: 3,
      seasonLabel: 'Season 3',
      source: 'sample',
      updatedAt: new Date(0).toISOString(),
      rows: SAMPLE_GT7_STANDINGS,
    },
  };
}

/**
 * Fetch the current GT7 championship standings.
 *
 * @returns Live standings when configured, otherwise sample data. Never throws.
 */
export async function fetchGt7Standings(): Promise<ApiResult<Standings>> {
  if (!isConfigured('simleaguepro')) {
    return sampleStandings('Sim League Pro not configured — showing sample GT7 standings.');
  }
  try {
    const league = await fetchLeague();
    const rows = mapStandingRows(league);
    if (rows.length === 0) {
      return sampleStandings('Sim League Pro returned no GT7 standings — showing sample data.');
    }
    const season = typeof league.season === 'number' ? league.season : 3;
    return {
      ok: true,
      source: 'simleaguepro',
      error: null,
      data: {
        league: 'GT7',
        season,
        seasonLabel: seasonLabelOf(league),
        source: 'simleaguepro',
        updatedAt: new Date().toISOString(),
        rows,
      },
    };
  } catch (err) {
    return sampleStandings(
      `Sim League Pro request failed (${err instanceof Error ? err.message : 'unknown error'}) — showing sample data.`,
    );
  }
}

/**
 * Fetch the next scheduled GT7 race.
 *
 * @returns Live next-race when configured, otherwise sample data. Never throws.
 */
export async function fetchGt7NextRace(): Promise<ApiResult<NextRace>> {
  const sample = (error: string | null): ApiResult<NextRace> => ({
    ok: true,
    source: 'sample',
    error,
    data: SAMPLE_GT7_NEXT_RACE,
  });

  if (!isConfigured('simleaguepro')) {
    return sample('Sim League Pro not configured — showing sample GT7 next race.');
  }
  try {
    const league = await fetchLeague();
    // The soonest round that hasn't run yet (upcoming status = future + no results).
    const next = mapRounds(league)
      .filter((r) => r.status === 'upcoming')
      .sort(
        (a, b) =>
          new Date(`${a.date}T${a.time || '00:00'}`).getTime() -
          new Date(`${b.date}T${b.time || '00:00'}`).getTime(),
      )[0];
    if (!next) {
      // Season complete / nothing upcoming — honest sample so the banner can
      // prefer a live league with a real upcoming race instead.
      return sample('No upcoming GT7 race (season may be complete) — showing sample data.');
    }
    return {
      ok: true,
      source: 'simleaguepro',
      error: null,
      data: {
        league: 'GT7',
        round: next.round,
        track: next.track,
        class: next.class,
        date: next.date,
        time: next.time ?? '',
        lobbyOpens: '',
        source: 'simleaguepro',
      },
    };
  } catch (err) {
    return sample(
      `Sim League Pro request failed (${err instanceof Error ? err.message : 'unknown error'}) — showing sample data.`,
    );
  }
}

/**
 * Fetch the full GT7 season schedule from the league's `races[]`.
 *
 * @returns Live schedule when configured, otherwise sample data. Never throws.
 */
export async function fetchGt7Schedule(): Promise<ApiResult<Schedule>> {
  const sample = (error: string | null): ApiResult<Schedule> => ({
    ok: true,
    source: 'sample',
    error,
    data: { league: 'GT7', seasonLabel: 'Season 3', source: 'sample', rounds: SAMPLE_GT7_SCHEDULE },
  });

  if (!isConfigured('simleaguepro')) {
    return sample('Sim League Pro not configured — showing sample GT7 calendar.');
  }
  try {
    const league = await fetchLeague();
    const rounds = mapRounds(league);
    if (rounds.length === 0) {
      return sample('Sim League Pro returned no GT7 races — showing sample data.');
    }
    return {
      ok: true,
      source: 'simleaguepro',
      error: null,
      data: { league: 'GT7', seasonLabel: seasonLabelOf(league), source: 'simleaguepro', rounds },
    };
  } catch (err) {
    return sample(
      `Sim League Pro request failed (${err instanceof Error ? err.message : 'unknown error'}) — showing sample data.`,
    );
  }
}
