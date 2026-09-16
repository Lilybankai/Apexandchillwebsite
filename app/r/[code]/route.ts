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
  req: NextRequest,
  ctx: { params: Promise<{ code: string }> },
): Promise<NextResponse> {
  const { code: raw } = await ctx.params;
  const code = normaliseCode(raw);

  // Awaited rather than fired and forgotten: a serverless invocation can be
  // frozen the moment the response is returned, which drops in-flight work.
  // It is one round trip and it cannot throw.
  await recordReferralClick(code);

  const target = new URL('/apex-overlay-system', req.nextUrl.origin);
  if (code) target.searchParams.set('ref', code);
  // 302: the destination is a marketing page that will change, and the code
  // must never be cached into someone else's visit.
  return NextResponse.redirect(target, 302);
}
