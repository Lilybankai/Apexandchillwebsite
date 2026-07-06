/**
 * Sim League Pro API client — the data source for the **GT7** (Gran Turismo 7)
 * league: full championship standings and the next scheduled race.
 *
 * Env-driven ({@link module:lib/env}). When the API key / league id are absent,
 * or the upstream call fails, functions resolve to a well-shaped
 * {@link ApiResult} carrying bundled sample data with `source: 'sample'`.
 *
 * NOTE FOR OPERATOR: verify the request paths and JSON field names against your
 * Sim League Pro account docs. The normaliser is defensive, so a mismatch
 * degrades to sample data rather than crashing — adjust
 * {@link normaliseStandingRow} / endpoint paths if your payload differs.
 *
 * @packageDocumentation
 */

import type { ApiResult, NextRace, StandingRow, Standings } from '@/lib/types';
import { simLeaguePro as cfg, isConfigured, CACHE_TTL_SECONDS } from '@/lib/env';

/** Default team accent colour when the source doesn't provide one. */
const DEFAULT_TEAM_COLOR = '#00ff88';

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

/**
 * Perform a GET against the Sim League Pro API with auth + Next.js caching.
 * @throws When the response is not ok, so the caller can fall back.
 */
async function slpGet<T>(path: string): Promise<T> {
  const url = `${cfg.baseUrl.replace(/\/$/, '')}${path}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${cfg.apiKey}`,
      'X-Api-Key': cfg.apiKey ?? '',
      Accept: 'application/json',
    },
    next: { revalidate: CACHE_TTL_SECONDS },
  });
  if (!res.ok) {
    throw new Error(`Sim League Pro ${path} responded ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

/** Build the standings path, optionally scoped to a specific season. */
function standingsPath(): string {
  const base = `/leagues/${cfg.leagueId}/standings`;
  return cfg.seasonId ? `${base}?season=${cfg.seasonId}` : base;
}

/**
 * Normalise one raw Sim League Pro entry into a {@link StandingRow}. Defensive
 * to field-name variance; unknown numeric fields default to 0.
 */
function normaliseStandingRow(raw: Record<string, unknown>, index: number): StandingRow {
  const num = (v: unknown, fallback = 0): number =>
    typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) || fallback : fallback;
  const str = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback);

  return {
    position: num(raw.position ?? raw.rank, index + 1),
    driver: str(raw.driver_name ?? raw.driver ?? raw.psn ?? raw.name, 'Unknown Driver'),
    team: str(raw.team_name ?? raw.team, ''),
    teamColor: str(raw.team_color ?? raw.teamColor, DEFAULT_TEAM_COLOR) || DEFAULT_TEAM_COLOR,
    points: num(raw.points ?? raw.total_points),
    wins: num(raw.wins),
    podiums: num(raw.podiums),
    avgQuali: num(raw.avg_quali ?? raw.average_qualifying),
    avgFinish: num(raw.avg_finish ?? raw.average_finish),
    penalties: num(raw.penalties ?? raw.penalty_points),
    class: str(raw.class ?? raw.category, 'Gr.3'),
    league: 'GT7',
  };
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
    const raw = await slpGet<{ standings?: Record<string, unknown>[]; season?: number }>(standingsPath());
    const entries = Array.isArray(raw.standings) ? raw.standings : [];
    if (entries.length === 0) {
      return sampleStandings('Sim League Pro returned no GT7 standings — showing sample data.');
    }
    const rows = entries.map(normaliseStandingRow);
    const season = typeof raw.season === 'number' ? raw.season : 3;
    return {
      ok: true,
      source: 'simleaguepro',
      error: null,
      data: {
        league: 'GT7',
        season,
        seasonLabel: `Season ${season}`,
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
    const raw = await slpGet<{ races?: Record<string, unknown>[] }>(
      `/leagues/${cfg.leagueId}/races?status=upcoming&limit=1`,
    );
    const next = Array.isArray(raw.races) ? raw.races[0] : undefined;
    if (!next) return sample('No upcoming GT7 race from Sim League Pro — showing sample data.');

    const str = (v: unknown, fb = ''): string => (typeof v === 'string' ? v : fb);
    const num = (v: unknown, fb = 0): number => (typeof v === 'number' ? v : Number(v) || fb);
    return {
      ok: true,
      source: 'simleaguepro',
      error: null,
      data: {
        league: 'GT7',
        round: num(next.round ?? next.round_number),
        track: str(next.track ?? next.track_name, 'TBC'),
        class: str(next.class ?? next.category, 'Gr.3'),
        date: str(next.date ?? next.race_date),
        time: str(next.time ?? next.race_time),
        lobbyOpens: str(next.lobby_opens ?? next.lobbyOpens),
        source: 'simleaguepro',
      },
    };
  } catch (err) {
    return sample(
      `Sim League Pro request failed (${err instanceof Error ? err.message : 'unknown error'}) — showing sample data.`,
    );
  }
}
