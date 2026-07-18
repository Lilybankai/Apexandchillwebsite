/**
 * `GET /api/live` — the channel's current broadcast state.
 *
 * Returns everything live right now plus every scheduled upcoming stream,
 * wrapped in an {@link ApiResult}. The Live section polls this endpoint so a
 * broadcast going live (or ending) appears on the site within about a minute
 * without a full page reload. Never throws — degrades to an empty result.
 *
 * @packageDocumentation
 */

import { NextResponse } from 'next/server';
import type { ApiResult, LiveStreams } from '@/lib/types';
import { fetchLiveStreams } from '@/lib/api/youtube';
import { LIVE_CACHE_TTL_SECONDS } from '@/lib/env';

/**
 * Revalidate this route's cache every 60 seconds. Next.js requires `revalidate`
 * to be a STATIC literal — it cannot reference {@link LIVE_CACHE_TTL_SECONDS} —
 * so keep the two in sync manually if that constant changes.
 */
export const revalidate = 60;

/** Handle GET requests for the live/upcoming broadcast state. */
export async function GET(): Promise<NextResponse<ApiResult<LiveStreams>>> {
  const result = await fetchLiveStreams();
  return NextResponse.json(result, {
    headers: {
      'Cache-Control': `s-maxage=${LIVE_CACHE_TTL_SECONDS}, stale-while-revalidate=${LIVE_CACHE_TTL_SECONDS * 2}`,
    },
  });
}
