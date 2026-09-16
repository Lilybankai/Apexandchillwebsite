/**
 * `GET /api/aio/download` — the permanent Apex AIO download link.
 *
 * Redirects to the installer asset on the newest GitHub Release, so this URL
 * always hands a visitor the current version and never has to be edited when a
 * release ships. Safe to put in Discord, an email or a QR code.
 *
 * Falls back to the pinned installer in `lib/aio.ts` if GitHub can't be read,
 * so the link always resolves to something that installs. Never throws.
 *
 * @packageDocumentation
 */

import { NextResponse } from "next/server";
import { AIO_RELEASE_TTL_SECONDS, getLatestAioRelease } from "@/lib/aio-release";

/**
 * Keep the route's own cache in step with the release lookup. Next.js requires
 * a static literal here, so this cannot reference
 * {@link AIO_RELEASE_TTL_SECONDS} — keep the two in sync manually.
 */
export const revalidate = 1800;

/** Send the visitor to the newest signed installer. */
export async function GET(): Promise<NextResponse> {
  const release = await getLatestAioRelease();

  // 302, not 301: the target moves with every release and must never be
  // cached permanently by a browser.
  return NextResponse.redirect(release.installerUrl, {
    status: 302,
    headers: {
      "Cache-Control": `public, max-age=0, s-maxage=${AIO_RELEASE_TTL_SECONDS}, stale-while-revalidate=86400`,
      "X-Apex-Aio-Version": release.version,
    },
  });
}
