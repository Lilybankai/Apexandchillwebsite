import type { MetadataRoute } from "next";
import { AIO_PAGES } from "@/lib/aio-pages";
import { BUILD_TIME, SITE_URL } from "@/lib/site";
import { loadMergedCatalog } from "@/lib/merch/store";
import { fetchGt7Schedule } from "@/lib/api/gt7";
import { fetchLmuSchedule, fetchThursdaySchedule } from "@/lib/api/simgrid";
import { fetchReplays } from "@/lib/api/youtube";
import { isThursdayConfigured } from "@/lib/leagues";
import { latestCompletedRoundDate, newestReplayDate } from "@/lib/freshness";

/** Re-derive the sitemap hourly so new merch products appear without a redeploy. */
export const revalidate = 3600;

/** Public, indexable routes with crawl hints. `/admin` + `/api` are excluded. */
const STATIC_ROUTES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/live", changeFrequency: "always", priority: 0.8 },
  { path: "/standings", changeFrequency: "daily", priority: 0.9 },
  ...AIO_PAGES.map((page) => ({
    path: page.path,
    changeFrequency: "monthly" as const,
    priority: page.key === "overview" ? 0.9 : 0.8,
  })),
  { path: "/lmu-livery-studio", changeFrequency: "monthly", priority: 0.9 },
  { path: "/merch", changeFrequency: "weekly", priority: 0.8 },
  { path: "/schedule", changeFrequency: "weekly", priority: 0.8 },
  { path: "/replays", changeFrequency: "daily", priority: 0.7 },
  { path: "/lmu-special-events", changeFrequency: "weekly", priority: 0.7 },
  { path: "/andys-man-club-fundraiser", changeFrequency: "weekly", priority: 0.7 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/join", changeFrequency: "monthly", priority: 0.6 },
  { path: "/partners", changeFrequency: "monthly", priority: 0.5 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
];

/** The later of two optional ISO dates. */
function latest(a: string | null, b: string | null): string | null {
  if (!a) return b;
  if (!b) return a;
  return new Date(a) > new Date(b) ? a : b;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // `lastModified` should say when a page's content really changed. Pages that
  // follow the calendar or the YouTube channel take the date of the latest
  // round raced / replay published; everything else changes only on deploy.
  // The data clients never throw — they degrade to sample data, which the
  // freshness helpers ignore — so this can't break the sitemap.
  const [gt7, lmu, thu, replays] = await Promise.all([
    fetchGt7Schedule(),
    fetchLmuSchedule(),
    isThursdayConfigured() ? fetchThursdaySchedule() : Promise.resolve(undefined),
    fetchReplays(6), // same request the home page makes, so it shares its cache
  ]);
  const lastRaced = latestCompletedRoundDate({ GT7: gt7, LMU: lmu, THU: thu });
  const lastReplay = newestReplayDate(replays);
  const contentDates: Record<string, string | null> = {
    "/standings": lastRaced,
    "/schedule": lastRaced,
    "/replays": lastReplay,
    "/": latest(lastRaced, lastReplay),
  };

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    // A deploy can also change these pages, so never report older than the build.
    lastModified: latest(contentDates[r.path] ?? null, BUILD_TIME) ?? BUILD_TIME,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // Merch product detail pages — best-effort. A catalog fetch failure must never
  // break the sitemap, so degrade to just the static routes.
  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const products = await loadMergedCatalog();
    productEntries = products.map((p) => ({
      url: `${SITE_URL}/merch/${p.handle}`,
      lastModified: BUILD_TIME,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch {
    // Ignore — static routes still ship.
  }

  return [...staticEntries, ...productEntries];
}
