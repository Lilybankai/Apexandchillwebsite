/**
 * Fixed cache windows for upstream API calls.
 *
 * `fetch(url, { next: { revalidate } })` is stale-while-revalidate: once an
 * entry is stale Next.js serves it and refetches in the background, but it only
 * replaces the entry when that refetch returns HTTP 200. If the upstream starts
 * failing (expired key, rate limit, outage) the old response is served forever,
 * silently — our code never sees the error. That is how the standings froze.
 *
 * Sending the current window number as a header puts it in the fetch cache key,
 * so each window starts with a real request. Within a window calls are still
 * cached and de-duplicated; when a window's request fails, the caller gets the
 * error and can log it and fall back, instead of a frozen copy.
 */

/** Header carrying the window number; upstream APIs ignore it. */
const HEADER = 'X-Cache-Window';

/**
 * Headers that pin a fetch to the current `ttlSeconds` window.
 * @param ttlSeconds - Window length; match the fetch's `revalidate`.
 */
export function cacheWindowHeaders(ttlSeconds: number): Record<string, string> {
  const windowMs = Math.max(ttlSeconds, 1) * 1000;
  return { [HEADER]: String(Math.floor(Date.now() / windowMs)) };
}
