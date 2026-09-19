/**
 * `GET /r/<code>/overlay` — a partner's discount code, as an OBS browser source.
 *
 * A branded strip a partner drops onto their stream: the Apex AIO lockup, the 10%,
 * their code, and the short link to say out loud. No sign-in, no desktop app,
 * no telemetry — a public page keyed by the code, so it works in OBS on a
 * machine that has never installed Apex.
 *
 * ## Why this is a route handler and not a page
 * It was a React page first, and that was wrong. Every page in `app/` is
 * wrapped by the root layout, which renders the site's `<Header>` and
 * `<Footer>` — so the overlay came out with the full site navigation and legal
 * links composited over the partner's gameplay. Escaping a root layout needs a
 * route group with a second `<html>` root, which would fight the existing
 * `/r/[code]` handler for the same path prefix.
 *
 * Returning the document by hand sidesteps all of it and is the better fit
 * anyway: an overlay is a static string of markup that never re-renders, so it
 * has no use for React, hydration, or the ~100 kB of framework a page would
 * pull onto a live stream.
 *
 * ## It must not count a click
 * `/r/<code>` records an open; this deliberately does NOT. An OBS source
 * reloads whenever the scene does, and counting those would fill a partner's
 * funnel with their own stream — making the one number that says whether a
 * partnership works meaningless.
 *
 * ## Options (query string)
 *   ?layout=bar    horizontal strip (default) — a lower third or top banner
 *   ?layout=badge  stacked block — a corner
 *   ?theme=light   for a bright scene; dark is the default
 *   ?fit=0         don't scale to the Browser Source; use ?scale= alone
 *   ?scale=0.8     how much of the source to fill (with fit), or the plain
 *                  size multiplier (with ?fit=0)
 *
 * In OBS: add a Browser Source, paste the URL, and set its Width and Height to
 * the rectangle you want the overlay to occupy — it draws itself to fit, at
 * that resolution. Don't resize it in the scene afterwards; a Browser Source
 * renders at its own Width × Height and stretching it is what makes an overlay
 * look pixelated on a 4K stream. See `document.ts` for the long version.
 *
 * @packageDocumentation
 */

import { NextResponse, type NextRequest } from 'next/server';
import { lookupReferral, normaliseCode } from '@/lib/referral';
import { overlayDocument } from './document';

/**
 * Re-resolved at most every five minutes. An OBS source loads this once and
 * leaves it up for hours, so freshness is nearly free — but a revoked code
 * should still vanish from a stream within a few minutes rather than at the
 * next scene change.
 */
export const revalidate = 300;

/**
 * Clamp the scale so a typo cannot produce a 400×-sized overlay.
 *
 * The missing-parameter guard is `!raw`, not `Number.isFinite`, and that is
 * the whole bug this used to have: `Number(null)` is 0, which is perfectly
 * finite, so a URL with no `?scale=` fell through to the floor of the clamp
 * and every overlay anybody has added so far has been drawn at HALF size.
 * Then OBS stretched those 258 pixels across a 4K lower third. That is most
 * of where the pixelation came from; fit mode is the rest.
 *
 * The ceiling used to be 3, which was the whole design drawn at three times
 * its natural ~515 px — under 1600 px, so on a 3840-wide canvas a partner who
 * wanted a wider strip had no choice but to stretch the source and lose the
 * sharpness. Fit mode makes that the wrong knob to reach for anyway, but the
 * headroom belongs here rather than in a partner's scene transform.
 */
function clampScale(raw: string | null): number {
  const n = Number(raw);
  if (!raw || !Number.isFinite(n) || n <= 0) return 1;
  return Math.min(8, Math.max(0.25, n));
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ code: string }> },
): Promise<NextResponse> {
  const { code: raw } = await ctx.params;
  const q = req.nextUrl.searchParams;

  const referral = await lookupReferral(normaliseCode(raw));
  const fitParam = q.get('fit');

  const document = overlayDocument(referral, {
    layout: q.get('layout') === 'badge' ? 'badge' : 'bar',
    theme: q.get('theme') === 'light' ? 'light' : 'dark',
    scale: clampScale(q.get('scale')),
    // Fit is the default: sizing the Browser Source is how sizing an overlay
    // works in OBS, and it is the only way the page gets told how many pixels
    // it is allowed to draw with. Opt out with ?fit=0 or ?fit=false.
    fit: fitParam !== '0' && fitParam !== 'false',
  });

  return new NextResponse(document, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // Cached at the edge, never in the browser: OBS should pick up a revoked
      // code on its next load rather than holding a stale copy for a week.
      'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}
