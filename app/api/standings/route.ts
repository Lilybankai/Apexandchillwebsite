/**
 * `GET /api/standings` — championship standings for both leagues.
 *
 * Query params:
 *  - `league` (optional): `GT7` | `LMU`. When omitted, both are returned.
 *
 * Response body:
 * ```json
 * { "GT7": ApiResult<Standings>, "LMU": ApiResult<Standings> }
 * ```
 * (Only the requested league key is present when `league` is supplied.)
 *
 * GT7 is sourced from Sim League Pro, LMU from SimGrid. Each is an
 * {@link ApiResult}, so the UI can render a "sample data" badge when live keys
 * are absent. Never throws — a provider failure degrades to sample data.
 *
 * @packageDocumentation
 */

import { NextResponse } from 'next/server';
import type { ApiResult, League, Standings } from '@/lib/types';
import { fetchGt7Standings } from '@/lib/api/simleaguepro';
import { fetchLmuStandings, fetchThursdayStandings } from '@/lib/api/simgrid';
import { isThursdayConfigured } from '@/lib/leagues';
import { CACHE_TTL_SECONDS } from '@/lib/env';

/**
 * Revalidate this route's cache every 5 minutes. Next.js requires `revalidate`
 * to be a STATIC literal — it cannot reference {@link CACHE_TTL_SECONDS} — so
 * keep the two in sync manually if CACHE_TTL_SECONDS changes.
 */
export const revalidate = 300;

type StandingsByLeague = Partial<Record<League, ApiResult<Standings>>>;

/**
 * Handle GET requests for standings.
 *
 * @param request - The incoming request (used to read the `league` param).
 */
export async function GET(request: Request): Promise<NextResponse<StandingsByLeague>> {
  const league = new URL(request.url).searchParams.get('league')?.toUpperCase();

  // When a specific league is requested, only fetch that one; otherwise all.
  const wantGt7 = !league || league === 'GT7';
  const wantLmu = !league || league === 'LMU';
  const wantThu = (!league || league === 'THU') && isThursdayConfigured();

  const [gt7, lmu, thu] = await Promise.all([
    wantGt7 ? fetchGt7Standings() : Promise.resolve(undefined),
    wantLmu ? fetchLmuStandings() : Promise.resolve(undefined),
    wantThu ? fetchThursdayStandings() : Promise.resolve(undefined),
  ]);

  const body: StandingsByLeague = {};
  if (gt7) body.GT7 = gt7;
  if (lmu) body.LMU = lmu;
  if (thu) body.THU = thu;

  return NextResponse.json(body, {
    headers: {
      'Cache-Control': `s-maxage=${CACHE_TTL_SECONDS}, stale-while-revalidate=${CACHE_TTL_SECONDS * 2}`,
    },
  });
}
