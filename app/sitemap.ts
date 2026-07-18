import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { loadMergedCatalog } from "@/lib/merch/store";

/** Re-derive the sitemap hourly so new merch products appear without a redeploy. */
export const revalidate = 3600;

/** Public, indexable routes with crawl hints. `/admin` + `/api` are excluded. */
const STATIC_ROUTES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/live", changeFrequency: "always", priority: 0.8 },
  { path: "/standings", changeFrequency: "daily", priority: 0.9 },
  { path: "/lmu-livery-studio", changeFrequency: "monthly", priority: 0.9 },
  { path: "/merch", changeFrequency: "weekly", priority: 0.8 },
  { path: "/schedule", changeFrequency: "weekly", priority: 0.8 },
  { path: "/replays", changeFrequency: "daily", priority: 0.7 },
  { path: "/lmu-special-events", changeFrequency: "weekly", priority: 0.7 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/join", changeFrequency: "monthly", priority: 0.6 },
  { path: "/partners", changeFrequency: "monthly", priority: 0.5 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
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
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch {
    // Ignore — static routes still ship.
  }

  return [...staticEntries, ...productEntries];
}
