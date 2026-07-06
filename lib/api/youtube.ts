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

import type { ApiResult, League, Replay, ReplayPlaylist } from '@/lib/types';
import { youtube as cfg, isConfigured, CACHE_TTL_SECONDS, type YoutubePlaylistConfig } from '@/lib/env';
import { getSupabaseAdminClient } from '@/lib/supabase';

const API_ROOT = 'https://www.googleapis.com/youtube/v3';

/** Supabase table used as a best-effort replays cache. */
const CACHE_TABLE = 'replays_cache';

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

/** Minimal typing of the YouTube playlists response we consume (for titles). */
interface PlaylistsResponse {
  items?: Array<{
    id?: string;
    snippet?: { title?: string };
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

/**
 * Fetch and normalise the items of a single playlist, enriched with view counts
 * and durations. This is the shared core behind both the flat replays feed and
 * the grouped multi-playlist view. Returns an empty array for an empty/unknown
 * playlist; @throws only on a transport/HTTP failure of the initial call.
 *
 * @param playlistId - The playlist to read.
 * @param limit - Max items to fetch (clamped to YouTube's 1–50 page size).
 */
async function fetchPlaylistItems(playlistId: string, limit: number): Promise<Replay[]> {
  const max = Math.min(Math.max(limit, 1), 50);
  const playlist = await ytGet<PlaylistItemsResponse>('/playlistItems', {
    part: 'snippet',
    playlistId,
    maxResults: String(max),
  });

  const items = (playlist.items ?? [])
    .map((item) => {
      const snip = item.snippet;
      const videoId = snip?.resourceId?.videoId;
      if (!videoId || !snip) return null;
      const title = snip.title ?? 'Untitled replay';
      const replay: Replay = {
        videoId,
        title,
        description: (snip.description ?? '').slice(0, 280),
        thumbnail: bestThumbnail(snip.thumbnails, videoId),
        publishedAt: snip.publishedAt ?? new Date(0).toISOString(),
        url: `https://www.youtube.com/watch?v=${videoId}`,
        league: inferLeague(`${title} ${snip.description ?? ''}`),
        series: inferSeries(title),
      };
      return replay;
    })
    .filter((r): r is Replay => r !== null);

  if (items.length === 0) return items;

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

  return items;
}

/**
 * Resolve display labels for a set of configured playlists. Any playlist with an
 * operator-supplied label keeps it; the rest are looked up in one `playlists`
 * call and named after their YouTube title. Never throws — on failure the
 * missing labels simply fall back to a generic heading at the call site.
 *
 * @returns A map of playlist id → resolved label.
 */
async function resolvePlaylistLabels(configs: YoutubePlaylistConfig[]): Promise<Map<string, string>> {
  const labels = new Map<string, string>();
  for (const c of configs) {
    if (c.label) labels.set(c.id, c.label);
  }
  const missing = configs.filter((c) => !c.label).map((c) => c.id);
  if (missing.length === 0) return labels;
  try {
    const data = await ytGet<PlaylistsResponse>('/playlists', {
      part: 'snippet',
      id: missing.join(','),
      maxResults: String(Math.min(missing.length, 50)),
    });
    for (const item of data.items ?? []) {
      if (item.id && item.snippet?.title) labels.set(item.id, item.snippet.title);
    }
  } catch {
    // Best-effort; unresolved ids get a generic label at the call site.
  }
  return labels;
}

/** The sample fallback result (shared by success + error paths). */
function sampleReplays(error: string | null): ApiResult<Replay[]> {
  return { ok: true, source: 'sample', error, data: SAMPLE_REPLAYS };
}

/** The sample fallback for the grouped view: sample replays as a single group. */
function sampleGroups(error: string | null): ApiResult<ReplayPlaylist[]> {
  return {
    ok: true,
    source: 'sample',
    error,
    data: [{ id: 'sample', label: 'Latest Replays', replays: SAMPLE_REPLAYS }],
  };
}

/**
 * Best-effort read of the replays cache from Supabase. Never throws.
 * @returns Cached replays, or `null` when the cache is unavailable/empty.
 */
async function readReplaysCache(): Promise<Replay[] | null> {
  const admin = getSupabaseAdminClient();
  if (!admin) return null;
  try {
    const { data, error } = await admin
      .from(CACHE_TABLE)
      .select('*')
      .order('published_at', { ascending: false });
    if (error || !data || data.length === 0) return null;
    return data.map((row) => ({
      videoId: row.video_id as string,
      title: row.title as string,
      description: (row.description as string) ?? '',
      thumbnail: (row.thumbnail as string) ?? '',
      publishedAt: (row.published_at as string) ?? new Date(0).toISOString(),
      url: (row.url as string) ?? `https://www.youtube.com/watch?v=${row.video_id}`,
      viewCount: row.view_count == null ? undefined : Number(row.view_count),
      duration: (row.duration as string) ?? undefined,
      league: (row.league as League | null) ?? null,
      series: (row.series as string | null) ?? null,
    }));
  } catch {
    return null;
  }
}

/**
 * Best-effort upsert of freshly-fetched replays into the Supabase cache.
 * Fire-and-forget: failures are swallowed so they never break the request.
 */
async function writeReplaysCache(replays: Replay[]): Promise<void> {
  const admin = getSupabaseAdminClient();
  if (!admin) return;
  try {
    await admin.from(CACHE_TABLE).upsert(
      replays.map((r) => ({
        video_id: r.videoId,
        title: r.title,
        description: r.description,
        thumbnail: r.thumbnail,
        published_at: r.publishedAt,
        url: r.url,
        view_count: r.viewCount ?? null,
        duration: r.duration ?? null,
        league: r.league ?? null,
        series: r.series ?? null,
        cached_at: new Date().toISOString(),
      })),
      { onConflict: 'video_id' },
    );
  } catch {
    // Cache writes are best-effort; ignore failures.
  }
}

/**
 * Fetch the channel's most recent replays.
 *
 * On a successful live fetch the result is upserted into the Supabase
 * `replays_cache` table (best-effort). When YouTube is unconfigured or fails,
 * the cache is consulted before falling back to bundled sample data.
 *
 * @param maxResults - How many uploads to fetch (1–50). Defaults to 24.
 * @returns Live replays when configured, otherwise cached or sample data.
 *          Never throws.
 */
export async function fetchReplays(maxResults = 24): Promise<ApiResult<Replay[]>> {
  if (!isConfigured('youtube')) {
    const cached = await readReplaysCache();
    if (cached) {
      return { ok: true, source: 'cache', error: 'YouTube not configured — serving cached replays.', data: cached };
    }
    return sampleReplays('YouTube not configured — showing sample replays.');
  }
  try {
    // Prefer the explicitly-configured playlists; otherwise the uploads feed.
    const ids = cfg.playlists.length > 0 ? cfg.playlists.map((p) => p.id) : [await resolveUploadsPlaylistId()];
    const playlistIds = ids.filter((id): id is string => Boolean(id));
    if (playlistIds.length === 0) {
      return sampleReplays('Could not resolve YouTube uploads playlist — showing sample replays.');
    }

    // Fetch every source playlist, then merge into one newest-first feed,
    // de-duping videos that appear in more than one playlist.
    const perPlaylist = Math.min(Math.max(maxResults, 1), 50);
    const fetched = await Promise.all(playlistIds.map((id) => fetchPlaylistItems(id, perPlaylist)));
    const seen = new Set<string>();
    const items = fetched
      .flat()
      .filter((r) => (seen.has(r.videoId) ? false : (seen.add(r.videoId), true)))
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .slice(0, Math.max(maxResults, 1));

    if (items.length === 0) {
      return sampleReplays('YouTube returned no uploads — showing sample replays.');
    }

    // Refresh the cache in the background; don't block the response on it.
    void writeReplaysCache(items);

    return { ok: true, source: 'youtube', error: null, data: items };
  } catch (err) {
    const cached = await readReplaysCache();
    if (cached) {
      return {
        ok: true,
        source: 'cache',
        error: `YouTube request failed (${err instanceof Error ? err.message : 'unknown error'}) — serving cached replays.`,
        data: cached,
      };
    }
    return sampleReplays(
      `YouTube request failed (${err instanceof Error ? err.message : 'unknown error'}) — showing sample replays.`,
    );
  }
}

/**
 * Fetch replays grouped by playlist — one {@link ReplayPlaylist} per configured
 * `YOUTUBE_PLAYLISTS` entry, in declared order. When no explicit playlists are
 * configured, returns a single group from the uploads feed so the page still
 * renders. Section labels come from the operator's override, else the playlist's
 * own YouTube title. Never throws; falls back to sample data on failure.
 *
 * @param perPlaylist - Max replays to fetch per playlist (1–50). Defaults to 12.
 * @returns The playlist groups, or a single sample group when unavailable.
 */
export async function fetchReplayGroups(perPlaylist = 12): Promise<ApiResult<ReplayPlaylist[]>> {
  if (!isConfigured('youtube')) {
    return sampleGroups('YouTube not configured — showing sample replays.');
  }
  try {
    // Explicit playlists win; otherwise fall back to a single uploads group.
    const configs: YoutubePlaylistConfig[] =
      cfg.playlists.length > 0
        ? [...cfg.playlists]
        : await (async () => {
            const uploads = await resolveUploadsPlaylistId();
            return uploads ? [{ label: null, id: uploads }] : [];
          })();

    if (configs.length === 0) {
      return sampleGroups('Could not resolve YouTube uploads playlist — showing sample replays.');
    }

    const labels = await resolvePlaylistLabels(configs);
    const groups = await Promise.all(
      configs.map(async (c) => ({
        id: c.id,
        label: c.label ?? labels.get(c.id) ?? 'Replays',
        replays: await fetchPlaylistItems(c.id, perPlaylist),
      })),
    );

    const nonEmpty = groups.filter((g) => g.replays.length > 0);
    if (nonEmpty.length === 0) {
      return sampleGroups('YouTube returned no replays — showing sample replays.');
    }

    // Refresh the flat cache (used by the API route) in the background.
    void writeReplaysCache(nonEmpty.flatMap((g) => g.replays));

    return { ok: true, source: 'youtube', error: null, data: nonEmpty };
  } catch (err) {
    return sampleGroups(
      `YouTube request failed (${err instanceof Error ? err.message : 'unknown error'}) — showing sample replays.`,
    );
  }
}
