/**
 * YouTube Data API v3 client — powers the replays gallery.
 *
 * Fetches the channel's uploads (via its uploads playlist), then enriches them
 * with statistics (view counts) and content details (durations). Env-driven
 * ({@link module:lib/env}); when the API key / channel are absent, or the call
 * fails, resolves to sample replays with `source: 'sample'`.
 *
 * @packageDocumentation
 */

import type { ApiResult, League, Replay } from '@/lib/types';
import { youtube as cfg, isConfigured, CACHE_TTL_SECONDS } from '@/lib/env';

const API_ROOT = 'https://www.googleapis.com/youtube/v3';

/** Bundled sample replays, used when live credentials are absent. */
const SAMPLE_REPLAYS: Replay[] = [
  {
    videoId: 'dQw4w9WgXcQ',
    title: 'GT7 League S3 R6 — Nürburgring GP | Full Race Broadcast',
    description: 'Round 6 of the Apex & Chill GT7 championship from the Nürburgring GP circuit.',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    publishedAt: '2026-06-30T19:00:00Z',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    viewCount: 4210,
    duration: 'PT1H48M',
    league: 'GT7',
    series: 'Round 6',
  },
  {
    videoId: 'M7lc1UVf-VE',
    title: 'LMU League S3 R5 — Spa-Francorchamps | Hypercar Thriller',
    description: 'The Hypercar field goes wheel-to-wheel through Eau Rouge in Round 5.',
    thumbnail: 'https://i.ytimg.com/vi/M7lc1UVf-VE/maxresdefault.jpg',
    publishedAt: '2026-06-23T19:00:00Z',
    url: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
    viewCount: 3860,
    duration: 'PT2H03M',
    league: 'LMU',
    series: 'Round 5',
  },
  {
    videoId: 'ScMzIvxBSi4',
    title: 'GT7 League S3 R5 — Suzuka | Race Highlights',
    description: 'The best overtakes and battles from Round 5 at Suzuka.',
    thumbnail: 'https://i.ytimg.com/vi/ScMzIvxBSi4/maxresdefault.jpg',
    publishedAt: '2026-06-16T19:00:00Z',
    url: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    viewCount: 5120,
    duration: 'PT18M',
    league: 'GT7',
    series: 'Round 5',
  },
  {
    videoId: 'kJQP7kiw5Fk',
    title: 'LMU League S3 R4 — Monza | Full Race Broadcast',
    description: 'Slipstream battles down the Monza straights in Round 4.',
    thumbnail: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/maxresdefault.jpg',
    publishedAt: '2026-06-09T19:00:00Z',
    url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    viewCount: 2990,
    duration: 'PT1H55M',
    league: 'LMU',
    series: 'Round 4',
  },
  {
    videoId: '9bZkp7q19f0',
    title: 'Apex & Chill — Season 3 Midseason Review',
    description: 'A look back at the first half of the season across both leagues.',
    thumbnail: 'https://i.ytimg.com/vi/9bZkp7q19f0/maxresdefault.jpg',
    publishedAt: '2026-06-02T19:00:00Z',
    url: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
    viewCount: 6740,
    duration: 'PT24M',
    league: null,
    series: null,
  },
  {
    videoId: 'e-ORhEE9VVg',
    title: 'GT7 League S3 R4 — Interlagos | Full Race Broadcast',
    description: 'Championship pressure builds at Interlagos in Round 4.',
    thumbnail: 'https://i.ytimg.com/vi/e-ORhEE9VVg/maxresdefault.jpg',
    publishedAt: '2026-05-26T19:00:00Z',
    url: 'https://www.youtube.com/watch?v=e-ORhEE9VVg',
    viewCount: 3510,
    duration: 'PT1H42M',
    league: 'GT7',
    series: 'Round 4',
  },
];

/**
 * Best-effort classification of a replay's league from its title/description.
 *
 * @param text - Title (and optionally description) to inspect.
 * @returns `'GT7'`, `'LMU'`, or `null` when it can't be determined.
 */
export function inferLeague(text: string): League | null {
  const t = text.toUpperCase();
  if (/\bLMU\b|LE MANS ULTIMATE/.test(t)) return 'LMU';
  if (/\bGT7\b|GRAN TURISMO/.test(t)) return 'GT7';
  return null;
}

/**
 * Best-effort extraction of a round/series label from a title, e.g. `Round 6`.
 *
 * @param text - Title to inspect.
 * @returns A series label such as `Round 6`, or `null`.
 */
export function inferSeries(text: string): string | null {
  const round = text.match(/\bR(?:ound)?\s*\.?\s*(\d{1,2})\b/i);
  if (round) return `Round ${round[1]}`;
  return null;
}

/** Pick the highest-resolution thumbnail available from a snippet. */
function bestThumbnail(thumbnails: Record<string, { url?: string }> | undefined, videoId: string): string {
  if (thumbnails) {
    for (const key of ['maxres', 'standard', 'high', 'medium', 'default']) {
      const url = thumbnails[key]?.url;
      if (url) return url;
    }
  }
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

/** Minimal typing of the YouTube playlistItems response we consume. */
interface PlaylistItemsResponse {
  items?: Array<{
    snippet?: {
      title?: string;
      description?: string;
      publishedAt?: string;
      thumbnails?: Record<string, { url?: string }>;
      resourceId?: { videoId?: string };
    };
  }>;
}

/** Minimal typing of the YouTube videos response we consume. */
interface VideosResponse {
  items?: Array<{
    id?: string;
    statistics?: { viewCount?: string };
    contentDetails?: { duration?: string };
  }>;
}

/** Call the YouTube API and parse JSON. @throws on a non-ok response. */
async function ytGet<T>(path: string, params: Record<string, string>): Promise<T> {
  const search = new URLSearchParams({ ...params, key: cfg.apiKey ?? '' });
  const res = await fetch(`${API_ROOT}${path}?${search.toString()}`, {
    next: { revalidate: CACHE_TTL_SECONDS },
  });
  if (!res.ok) {
    throw new Error(`YouTube ${path} responded ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

/**
 * Resolve the uploads playlist id. Uses the explicit override when configured,
 * otherwise derives it from the channel id (channels.contentDetails).
 */
async function resolveUploadsPlaylistId(): Promise<string | null> {
  if (cfg.uploadsPlaylistId) return cfg.uploadsPlaylistId;
  if (!cfg.channelId) return null;
  const data = await ytGet<{
    items?: Array<{ contentDetails?: { relatedPlaylists?: { uploads?: string } } }>;
  }>('/channels', { part: 'contentDetails', id: cfg.channelId });
  return data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads ?? null;
}

/** The sample fallback result (shared by success + error paths). */
function sampleReplays(error: string | null): ApiResult<Replay[]> {
  return { ok: true, source: 'sample', error, data: SAMPLE_REPLAYS };
}

/**
 * Fetch the channel's most recent replays.
 *
 * @param maxResults - How many uploads to fetch (1–50). Defaults to 24.
 * @returns Live replays when configured, otherwise sample data. Never throws.
 */
export async function fetchReplays(maxResults = 24): Promise<ApiResult<Replay[]>> {
  if (!isConfigured('youtube')) {
    return sampleReplays('YouTube not configured — showing sample replays.');
  }
  try {
    const playlistId = await resolveUploadsPlaylistId();
    if (!playlistId) {
      return sampleReplays('Could not resolve YouTube uploads playlist — showing sample replays.');
    }

    const limit = Math.min(Math.max(maxResults, 1), 50);
    const playlist = await ytGet<PlaylistItemsResponse>('/playlistItems', {
      part: 'snippet',
      playlistId,
      maxResults: String(limit),
    });

    const items = (playlist.items ?? [])
      .map((item) => {
        const snip = item.snippet;
        const videoId = snip?.resourceId?.videoId;
        if (!videoId || !snip) return null;
        const title = snip.title ?? 'Untitled replay';
        return {
          videoId,
          title,
          description: (snip.description ?? '').slice(0, 280),
          thumbnail: bestThumbnail(snip.thumbnails, videoId),
          publishedAt: snip.publishedAt ?? new Date(0).toISOString(),
          url: `https://www.youtube.com/watch?v=${videoId}`,
          league: inferLeague(`${title} ${snip.description ?? ''}`),
          series: inferSeries(title),
        } satisfies Replay;
      })
      .filter((r): r is Replay => r !== null);

    if (items.length === 0) {
      return sampleReplays('YouTube returned no uploads — showing sample replays.');
    }

    // Enrich with view counts + durations in a single videos.list call.
    try {
      const stats = await ytGet<VideosResponse>('/videos', {
        part: 'statistics,contentDetails',
        id: items.map((r) => r.videoId).join(','),
      });
      const byId = new Map(
        (stats.items ?? []).map((v) => [v.id, { views: v.statistics?.viewCount, duration: v.contentDetails?.duration }]),
      );
      for (const replay of items) {
        const extra = byId.get(replay.videoId);
        if (extra?.views !== undefined) replay.viewCount = Number(extra.views) || undefined;
        if (extra?.duration) replay.duration = extra.duration;
      }
    } catch {
      // Enrichment is best-effort; keep base replays if stats fail.
    }

    return { ok: true, source: 'youtube', error: null, data: items };
  } catch (err) {
    return sampleReplays(
      `YouTube request failed (${err instanceof Error ? err.message : 'unknown error'}) — showing sample replays.`,
    );
  }
}
