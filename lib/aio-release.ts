/**
 * Resolves the newest published Apex AIO installer from the public releases
 * repo, so the download button never has to be edited by hand again.
 *
 * `npm run release` in the app repo publishes a GitHub Release carrying the
 * signed `.exe`; this module reads that release and hands the landing page the
 * version and asset URL that came with it. Every lookup falls back to the
 * pinned details in {@link AIO_PRODUCT}, so a GitHub outage or a rate-limited
 * API downgrades the page to the last known-good installer rather than
 * breaking the download.
 *
 * @packageDocumentation
 */

import { AIO_PRODUCT } from "@/lib/aio";

/** The installer a visitor should be given right now. */
export type AioRelease = {
  /** Semver without the leading `v`, e.g. `0.99.11`. */
  version: string;
  /** Direct link to the signed installer asset on GitHub. */
  installerUrl: string;
  /** Asset filename, used for the anchor's `download` attribute. */
  installerFilename: string;
  /** `false` when the pinned fallback was served instead of a live lookup. */
  resolved: boolean;
};

/**
 * Re-check GitHub every 30 minutes. Releases are cut a few times a week at
 * most, so this is far more often than it needs to be while keeping the
 * unauthenticated API well inside its 60-requests-per-hour budget.
 */
export const AIO_RELEASE_TTL_SECONDS = 1800;

const LATEST_RELEASE_URL = `https://api.github.com/repos/${AIO_PRODUCT.releasesRepo}/releases/latest`;

/** The pinned installer, used whenever GitHub cannot be read. */
export const AIO_FALLBACK_RELEASE: AioRelease = {
  version: AIO_PRODUCT.version,
  installerUrl: AIO_PRODUCT.installerUrl,
  installerFilename: AIO_PRODUCT.installerFilename,
  resolved: false,
};

/** The slice of GitHub's release payload this module actually reads. */
type GitHubRelease = {
  tag_name?: string;
  name?: string;
  assets?: { name?: string; browser_download_url?: string }[];
};

/**
 * Fetch the latest release. Never throws — any failure returns
 * {@link AIO_FALLBACK_RELEASE}.
 *
 * The result is cached by Next's data cache for
 * {@link AIO_RELEASE_TTL_SECONDS}, so the page and the `/api/aio/download`
 * route share one lookup rather than each calling GitHub.
 */
export async function getLatestAioRelease(): Promise<AioRelease> {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      // GitHub rejects unidentified API clients.
      "User-Agent": "apexandchillracing.co.uk",
    };

    // Optional. A token only raises the rate limit; the repo is public.
    const token = process.env.GITHUB_TOKEN;
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(LATEST_RELEASE_URL, {
      headers,
      next: { revalidate: AIO_RELEASE_TTL_SECONDS },
    });
    if (!response.ok) return AIO_FALLBACK_RELEASE;

    const release = (await response.json()) as GitHubRelease;

    // `.exe.blockmap` sits next to the installer and must never be offered.
    const installer = release.assets?.find(
      (asset) =>
        typeof asset?.name === "string" &&
        asset.name.toLowerCase().endsWith(".exe") &&
        typeof asset.browser_download_url === "string",
    );
    if (!installer?.browser_download_url || !installer.name) return AIO_FALLBACK_RELEASE;

    const tag = release.tag_name ?? release.name ?? "";
    const version = tag.replace(/^v/i, "").trim() || AIO_PRODUCT.version;

    return {
      version,
      installerUrl: installer.browser_download_url,
      installerFilename: installer.name,
      resolved: true,
    };
  } catch {
    return AIO_FALLBACK_RELEASE;
  }
}
