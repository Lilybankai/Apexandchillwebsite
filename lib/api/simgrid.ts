/**
 * SimGrid API client — the data source for the **LMU** (Le Mans Ultimate)
 * league: full championship standings and the next scheduled race.
 *
 * The client is env-driven ({@link module:lib/env}). When the SimGrid token /
 * championship id are missing, or the upstream call fails, every function
 * resolves to a well-shaped {@link ApiResult} carrying bundled sample data with
 * `source: 'sample'`, so dependent pages always render.
 *
 * NOTE FOR OPERATOR: the request paths and JSON field names below are SimGrid's
 * documented shapes at time of writing but should be verified against your
 * account's API docs. Because the normaliser is defensive (optional chaining +
 * fallbacks), a field-name mismatch degrades to sample data rather than
 * crashing. Adjust {@link normaliseStandingRow} / the endpoint paths if your
 * payload differs.
 *
 * @packageDocumentation
 */

import type { ApiResult, NextRace, StandingRow, Standings } from '@/lib/types';
import { simgrid as cfg, isConfigured, CACHE_TTL_SECONDS } from '@/lib/env';

/** Default team accent colour when the source doesn't provide one. */
const DEFAULT_TEAM_COLOR = '#00d4ff';

/**
 * Bundled sample LMU standings, used when live credentials are absent.
 * Representative of a Le Mans Ultimate Hypercar/LMGT3 grid.
 */
const SAMPLE_LMU_STANDINGS: StandingRow[] = [
  { position: 1, driver: 'M. Verhoeven', team: 'Apex Hypercar', teamColor: '#ff2d55', points: 184, wins: 4, podiums: 7, avgQuali: 2.1, avgFinish: 2.4, penalties: 0, class: 'Hypercar', league: 'LMU' },
  { position: 2, driver: 'R. Castellano', team: 'Chill Motorsport', teamColor: '#00d4ff', points: 171, wins: 3, podiums: 8, avgQuali: 2.8, avgFinish: 3.0, penalties: 2, class: 'Hypercar', league: 'LMU' },
  { position: 3, driver: 'K. Andersson', team: 'Nordic Endurance', teamColor: '#9b59b6', points: 158, wins: 2, podiums: 6, avgQuali: 3.4, avgFinish: 3.6, penalties: 0, class: 'Hypercar', league: 'LMU' },
  { position: 4, driver: 'J. Okafor', team: 'Meridian Racing', teamColor: '#2ecc71', points: 140, wins: 1, podiums: 5, avgQuali: 4.2, avgFinish: 4.1, penalties: 5, class: 'Hypercar', league: 'LMU' },
  { position: 5, driver: 'L. Moreau', team: 'Sarthe Collective', teamColor: '#f5a623', points: 129, wins: 1, podiums: 4, avgQuali: 5.0, avgFinish: 4.8, penalties: 0, class: 'Hypercar', league: 'LMU' },
  { position: 6, driver: 'D. Ellwood', team: 'Apex Hypercar', teamColor: '#ff2d55', points: 118, wins: 0, podiums: 3, avgQuali: 5.6, avgFinish: 5.5, penalties: 3, class: 'Hypercar', league: 'LMU' },
  { position: 7, driver: 'S. Nakamura', team: 'Rising Sun GT3', teamColor: '#e74c3c', points: 97, wins: 1, podiums: 3, avgQuali: 6.1, avgFinish: 6.4, penalties: 0, class: 'LMGT3', league: 'LMU' },
  { position: 8, driver: 'A. Rossi', team: 'Corsa Rossa', teamColor: '#c0392b', points: 88, wins: 0, podiums: 2, avgQuali: 7.0, avgFinish: 6.9, penalties: 4, class: 'LMGT3', league: 'LMU' },
  { position: 9, driver: 'T. Bauer', team: 'Bavarian Sim Works', teamColor: '#3498db', points: 74, wins: 0, podiums: 1, avgQuali: 8.2, avgFinish: 8.0, penalties: 1, class: 'LMGT3', league: 'LMU' },
  { position: 10, driver: 'G. Fernández', team: 'Chill Motorsport', teamColor: '#00d4ff', points: 61, wins: 0, podiums: 1, avgQuali: 9.1, avgFinish: 9.3, penalties: 0, class: 'LMGT3', league: 'LMU' },
];

/** Bundled sample next LMU race. */
const SAMPLE_LMU_NEXT_RACE: NextRace = {
  league: 'LMU',
  round: 6,
  track: 'Circuit de la Sarthe',
  class: 'Hypercar / LMGT3',
  date: '2026-07-19',
  time: '20:00',
  lobbyOpens: '19:40',
  source: 'sample',
};

/**
 * Perform a GET against the SimGrid API with auth + Next.js caching.
 * @throws When the response is not ok, so the caller can fall back.
 */
async function simgridGet<T>(path: string): Promise<T> {
  const url = `${cfg.baseUrl.replace(/\/$/, '')}${path}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      Accept: 'application/json',
    },
    // Cache upstream responses; standings don't need to be real-time.
    next: { revalidate: CACHE_TTL_SECONDS },
  });
  if (!res.ok) {
    throw new Error(`SimGrid ${path} responded ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

/**
 * Normalise one raw SimGrid entry into a {@link StandingRow}. Defensive to
 * field-name variance; unknown numeric fields default to 0.
 */
function normaliseStandingRow(raw: Record<string, unknown>, index: number): StandingRow {
  const num = (v: unknown, fallback = 0): number =>
    typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) || fallback : fallback;
  const str = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback);

  return {
    position: num(raw.position ?? raw.rank, index + 1),
    driver: str(raw.driver_name ?? raw.driver ?? raw.name, 'Unknown Driver'),
    team: str(raw.team_name ?? raw.team, ''),
    teamColor: str(raw.team_color ?? raw.teamColor, DEFAULT_TEAM_COLOR) || DEFAULT_TEAM_COLOR,
    points: num(raw.points ?? raw.total_points),
    wins: num(raw.wins),
    podiums: num(raw.podiums),
    avgQuali: num(raw.avg_quali ?? raw.average_qualifying),
    avgFinish: num(raw.avg_finish ?? raw.average_finish),
    penalties: num(raw.penalties ?? raw.penalty_points),
    class: str(raw.class ?? raw.category, 'Hypercar'),
    league: 'LMU',
  };
}

/** Shape of the sample fallback result (shared by success + error paths). */
function sampleStandings(error: string | null): ApiResult<Standings> {
  return {
    ok: true,
    source: 'sample',
    error,
    data: {
      league: 'LMU',
      season: 3,
      seasonLabel: 'Season 3',
      source: 'sample',
      updatedAt: new Date(0).toISOString(),
      rows: SAMPLE_LMU_STANDINGS,
    },
  };
}

/**
 * Fetch the current LMU championship standings.
 *
 * @returns Live standings when configured, otherwise sample data. Never throws.
 */
export async function fetchLmuStandings(): Promise<ApiResult<Standings>> {
  if (!isConfigured('simgrid')) {
    return sampleStandings('SimGrid not configured — showing sample LMU standings.');
  }
  try {
    const raw = await simgridGet<{ standings?: Record<string, unknown>[]; season?: number }>(
      `/championships/${cfg.championshipId}/standings`,
    );
    const entries = Array.isArray(raw.standings) ? raw.standings : [];
    if (entries.length === 0) {
      return sampleStandings('SimGrid returned no LMU standings — showing sample data.');
    }
    const rows = entries.map(normaliseStandingRow);
    const season = typeof raw.season === 'number' ? raw.season : 3;
    return {
      ok: true,
      source: 'simgrid',
      error: null,
      data: {
        league: 'LMU',
        season,
        seasonLabel: `Season ${season}`,
        source: 'simgrid',
        updatedAt: new Date().toISOString(),
        rows,
      },
    };
  } catch (err) {
    return sampleStandings(
      `SimGrid request failed (${err instanceof Error ? err.message : 'unknown error'}) — showing sample data.`,
    );
  }
}

/**
 * Fetch the next scheduled LMU race.
 *
 * @returns Live next-race when configured, otherwise sample data. Never throws.
 */
export async function fetchLmuNextRace(): Promise<ApiResult<NextRace>> {
  const sample = (error: string | null): ApiResult<NextRace> => ({
    ok: true,
    source: 'sample',
    error,
    data: SAMPLE_LMU_NEXT_RACE,
  });

  if (!isConfigured('simgrid')) {
    return sample('SimGrid not configured — showing sample LMU next race.');
  }
  try {
    const raw = await simgridGet<{ races?: Record<string, unknown>[] }>(
      `/championships/${cfg.championshipId}/races?status=upcoming&limit=1`,
    );
    const next = Array.isArray(raw.races) ? raw.races[0] : undefined;
    if (!next) return sample('No upcoming LMU race from SimGrid — showing sample data.');

    const str = (v: unknown, fb = ''): string => (typeof v === 'string' ? v : fb);
    const num = (v: unknown, fb = 0): number => (typeof v === 'number' ? v : Number(v) || fb);
    return {
      ok: true,
      source: 'simgrid',
      error: null,
      data: {
        league: 'LMU',
        round: num(next.round ?? next.round_number),
        track: str(next.track ?? next.track_name, 'TBC'),
        class: str(next.class ?? next.category, 'Hypercar / LMGT3'),
        date: str(next.date ?? next.race_date),
        time: str(next.time ?? next.race_time),
        lobbyOpens: str(next.lobby_opens ?? next.lobbyOpens),
        source: 'simgrid',
      },
    };
  } catch (err) {
    return sample(
      `SimGrid request failed (${err instanceof Error ? err.message : 'unknown error'}) — showing sample data.`,
    );
  }
}
