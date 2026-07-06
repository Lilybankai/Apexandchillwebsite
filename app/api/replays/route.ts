/**
 * `GET /api/replays` — recent YouTube replays for the community.
 *
 * Query params:
 *  - `league` (optional): `GT7` | `LMU`. Filters to replays classified for that
 *    league (classification is best-effort from the video title/description).
 *  - `limit`  (optional): max number of replays, 1–50. Defaults to 24.
 *
 * Response body: an {@link ApiResult} wrapping a `Replay[]`, so the UI can show
 * a "sample data" badge when the YouTube key is absent. Never throws.
 *
 * @packageDocumentation
 */

import { NextResponse } from 'next/server';
import type { ApiResult, Replay } from '@/lib/types';
import { fetchReplays } from '@/lib/api/youtube';
import { CACHE_TTL_SECONDS } from '@/lib/env';

/**
 * Revalidate this route's cache every 5 minutes. Next.js requires `revalidate`
 * to be a STATIC literal — it cannot reference {@link CACHE_TTL_SECONDS} — so
 * keep the two in sync manually if CACHE_TTL_SECONDS changes.
 */
export const revalidate = 300;

/**
 * Handle GET requests for replays.
 *
 * @param request - The incoming request (used to read `league` / `limit`).
 */
export async function GET(request: Request): Promise<NextResponse<ApiResult<Replay[]>>> {
  const params = new URL(request.url).searchParams;
  const league = params.get('league')?.toUpperCase();
  const limitParam = Number(params.get('limit'));
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 50) : 24;

  const result = await fetchReplays(limit);

  // Apply an optional league filter on the normalised result.
  const filtered: ApiResult<Replay[]> =
    league === 'GT7' || league === 'LMU'
      ? { ...result, data: result.data.filter((r) => r.league === league) }
      : result;

  return NextResponse.json(filtered, {
    headers: {
      'Cache-Control': `s-maxage=${CACHE_TTL_SECONDS}, stale-while-revalidate=${CACHE_TTL_SECONDS * 2}`,
    },
  });
}
