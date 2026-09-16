/**
 * `GET /r/<code>` — a partner's referral link.
 *
 * The short, shareable address a partner puts on a stream, in a video
 * description or in Discord. It counts the open, then hands the visitor to the
 * Apex AIO landing page carrying the code, where the banner says who sent them
 * and what they get.
 *
 * A route handler rather than a page, for two reasons:
 *
 *   - the click has to be counted server-side, before anything renders, and
 *   - the canonical product page should stay at one URL. Redirecting means the
 *     landing page is never duplicated under `/r/...`, so it keeps its own SEO
 *     and its own metadata instead of competing with a hundred partner copies.
 *
 * An unknown code still redirects, to the ordinary page with no banner. Someone
 * who followed a link from a stream came to download a product, and a typo in
 * somebody else's link is not their problem to solve.
 *
 * @packageDocumentation
 */

import { NextResponse, type NextRequest } from 'next/server';
import { normaliseCode, recordReferralClick } from '@/lib/referral';

/**
 * Always run this fresh: it records a click. A cached response would count the
 * first visitor and silently ignore everyone after them.
 */
export const dynamic = 'force-dynamic';

/** Count the open, then send them to the product page carrying the code. */
export async function GET(
  // Unused: the redirect is relative on purpose, so nothing about the incoming
  // request's host is read. See the note below.
  _req: NextRequest,
  ctx: { params: Promise<{ code: string }> },
): Promise<NextResponse> {
  const { code: raw } = await ctx.params;
  const code = normaliseCode(raw);

  // Awaited rather than fired and forgotten: a serverless invocation can be
  // frozen the moment the response is returned, which drops in-flight work.
  // It is one round trip and it cannot throw.
  await recordReferralClick(code);

  /*
   * A RELATIVE Location, and deliberately not an absolute one.
   *
   * The obvious version — `new URL('/apex-overlay-system', req.nextUrl.origin)`
   * — sent real visitors to `https://localhost:3000/apex-overlay-system`. Behind
   * a reverse proxy, `nextUrl.origin` is the origin Next itself is listening on,
   * not the one the visitor typed; the public host only survives in the
   * forwarded headers. It looks perfect in local development, which is exactly
   * why it shipped.
   *
   * Rebuilding the origin from `x-forwarded-host` would work and would also be
   * the second bug: that header is attacker-controlled, so trusting it turns
   * every partner link into an open redirect pointed wherever a crafted request
   * asks. This route must never be able to send someone off-site.
   *
   * A relative Location has neither problem. RFC 7231 §7.1.2 allows it, every
   * browser resolves it against the request URL, and it is therefore correct on
   * any host, behind any proxy, in development and in production, with nothing
   * to configure and nothing to trust.
   *
   * `NextResponse.redirect()` insists on an absolute URL, so the response is
   * built by hand.
   */
  // Three characters is the shortest a code can be, so anything under that
  // cannot resolve and the `?ref=` would only be noise in the address bar.
  const location =
    code.length >= 3
      ? `/apex-overlay-system?ref=${encodeURIComponent(code)}`
      : '/apex-overlay-system';

  // 302, and explicitly uncacheable: the destination is a marketing page that
  // will change, and a cached redirect would carry one partner's code into
  // another visitor's session — silently misattributing them.
  return new NextResponse(null, {
    status: 302,
    headers: {
      Location: location,
      'Cache-Control': 'no-store',
    },
  });
}
