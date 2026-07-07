/**
 * `GET /api/next-race` — the next scheduled race per league.
 *
 * Query params:
 *  - `league` (optional): `GT7` | `LMU`. When omitted, both are returned.
 *
 * Response body:
 * ```json
 * { "GT7": ApiResult<NextRace>, "LMU": ApiResult<NextRace> }
 * ```
 *
 * GT7 is sourced from Sim League Pro, LMU from SimGrid. Never throws.
 *
 * @packageDocumentation
 */

import { NextResponse } from 'next/server';
import type { ApiResult, League, NextRace } from '@/lib/types';
import { fetchGt7NextRace } from '@/lib/api/simleaguepro';
import { fetchLmuNextRace, fetchThursdayNextRace } from '@/lib/api/simgrid';
import { isThursdayConfigured } from '@/lib/leagues';
import { CACHE_TTL_SECONDS } from '@/lib/env';

/**
 * Revalidate this route's cache every 5 minutes. Next.js requires `revalidate`
 * to be a STATIC literal — it cannot reference {@link CACHE_TTL_SECONDS} — so
 * keep the two in sync manually if CACHE_TTL_SECONDS changes.
 */
export const revalidate = 300;

type NextRaceByLeague = Partial<Record<League, ApiResult<NextRace>>>;

/**
 * Handle GET requests for the next race.
 *
 * @param request - The incoming request (used to read the `league` param).
 */
export async function GET(request: Request): Promise<NextResponse<NextRaceByLeague>> {
  const league = new URL(request.url).searchParams.get('league')?.toUpperCase();

  const wantGt7 = !league || league === 'GT7';
  const wantLmu = !league || league === 'LMU';
  const wantThu = (!league || league === 'THU') && isThursdayConfigured();

  const [gt7, lmu, thu] = await Promise.all([
    wantGt7 ? fetchGt7NextRace() : Promise.resolve(undefined),
    wantLmu ? fetchLmuNextRace() : Promise.resolve(undefined),
    wantThu ? fetchThursdayNextRace() : Promise.resolve(undefined),
  ]);

  const body: NextRaceByLeague = {};
  if (gt7) body.GT7 = gt7;
  if (lmu) body.LMU = lmu;
  if (thu) body.THU = thu;

  return NextResponse.json(body, {
    headers: {
      'Cache-Control': `s-maxage=${CACHE_TTL_SECONDS}, stale-while-revalidate=${CACHE_TTL_SECONDS * 2}`,
    },
  });
}
