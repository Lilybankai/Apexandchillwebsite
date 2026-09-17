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
 *   ?scale=1.4     multiplies everything, for a 4K canvas
 *
 * In OBS: add a Browser Source and paste the URL. The background is
 * transparent; size the source to taste.
 *
 * @packageDocumentation
 */

import { NextResponse, type NextRequest } from 'next/server';
import { lookupReferral, normaliseCode } from '@/lib/referral';
import { AIO_LOCKUP } from './lockup';

/**
 * Re-resolved at most every five minutes. An OBS source loads this once and
 * leaves it up for hours, so freshness is nearly free — but a revoked code
 * should still vanish from a stream within a few minutes rather than at the
 * next scene change.
 */
export const revalidate = 300;

/** Escape anything interpolated into the document. */
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Clamp the scale so a typo cannot produce a 400×-sized overlay. */
function clampScale(raw: string | null): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 1;
  return Math.min(3, Math.max(0.5, n));
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ code: string }> },
): Promise<NextResponse> {
  const { code: raw } = await ctx.params;
  const q = req.nextUrl.searchParams;

  const code = normaliseCode(raw);
  const referral = await lookupReferral(code);
  const badge = q.get('layout') === 'badge';
  const light = q.get('theme') === 'light';
  const s = clampScale(q.get('scale'));

  /*
   * An unknown or revoked code renders an EMPTY transparent document — not an
   * error page, not a placeholder. This is live in front of an audience: the
   * failure mode has to be an invisible source, never a red box reading "code
   * not found" sitting over somebody's race.
   */
  const body = referral
    ? markup(referral.code, referral.percentOff, badge)
    : '';

  return new NextResponse(html(body, s, light), {
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

/** The visible part. Only ever given an already-normalised A-Z0-9 code. */
function markup(code: string, pct: number, badge: boolean): string {
  return `
  <div class="wrap${badge ? ' badge' : ''}">
    <div class="card">
      ${AIO_LOCKUP}
      <div class="body">
        <p class="head"><span class="pct">${esc(String(pct))}% OFF</span><span class="sub">your subscription</span></p>
        <p class="foot">apexandchillracing.co.uk/r/${esc(code)}</p>
      </div>
      <div class="codeblock">
        <p class="codelabel">CODE</p>
        <p class="code">${esc(code)}</p>
      </div>
    </div>
  </div>`;
}

/**
 * The whole document.
 *
 * Self-contained by necessity as much as by preference: this is composited over
 * live video by a browser we do not control, at whatever size an operator drags
 * the source to. No external stylesheet, no font request, no script — nothing
 * that can be slow, blocked, or fail to arrive and leave a half-styled overlay
 * on screen mid-race.
 */
function html(bodyMarkup: string, s: number, light: boolean): string {
  const ink = light ? '#12121c' : '#f4f5fa';
  const muted = light ? 'rgba(18,18,28,0.62)' : 'rgba(244,245,250,0.66)';
  const panel = light ? 'rgba(255,255,255,0.88)' : 'rgba(10,11,18,0.82)';
  const edge = light ? 'rgba(18,18,28,0.14)' : 'rgba(255,255,255,0.14)';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="robots" content="noindex, nofollow">
<title>Apex AIO — referral overlay</title>
<style>
  /* Transparent, because OBS composites whatever this paints. */
  html, body { background: transparent; margin: 0; padding: 0; overflow: hidden; }
  .wrap {
    font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
    display: inline-flex; flex-direction: column; gap: ${8 * s}px;
    padding: ${10 * s}px; color: ${ink};
  }
  .card {
    display: flex; align-items: center; gap: ${14 * s}px;
    padding: ${14 * s}px ${18 * s}px;
    border-radius: ${14 * s}px;
    background: ${panel};
    border: 1px solid ${edge};
    /* A soft glow rather than a hard drop shadow: over moving video a crisp
       shadow reads as a sticker pasted on, a glow reads as part of the show. */
    box-shadow: 0 0 ${28 * s}px rgba(155,92,255,0.28), 0 ${4 * s}px ${18 * s}px rgba(0,0,0,0.35);
    -webkit-backdrop-filter: blur(${6 * s}px);
    backdrop-filter: blur(${6 * s}px);
  }
  /* Width, not height: the lockup is ~3.96:1 and pinning both axes would
     squash lettering that is going out over live video. The colour property
     is what the artwork's currentColor lettering reads — the symbol keeps
     its own gradient in both themes. (No backticks in here: this comment is
     inside a template literal.) */
  .mark { width: ${104 * s}px; height: auto; display: block; flex: 0 0 auto; color: ${ink}; }
  .body { display: flex; flex-direction: column; gap: ${2 * s}px; }
  .head { margin: 0; display: flex; align-items: baseline; gap: ${7 * s}px; }
  .pct {
    font-size: ${25 * s}px; font-weight: 800; line-height: 1; letter-spacing: -0.01em;
    background: linear-gradient(90deg, #22e3ff, #9b5cff);
    -webkit-background-clip: text; background-clip: text; color: transparent;
  }
  .sub { font-size: ${11.5 * s}px; color: ${muted}; white-space: nowrap; }
  .codeblock {
    margin-left: ${4 * s}px; padding-left: ${14 * s}px;
    border-left: 1px solid ${edge};
    display: flex; flex-direction: column; gap: ${2 * s}px;
  }
  .codelabel { margin: 0; font-size: ${8.5 * s}px; letter-spacing: 0.2em; color: ${muted}; font-weight: 700; }
  .code {
    margin: 0; font-family: ui-monospace, "Cascadia Mono", Consolas, monospace;
    font-size: ${23 * s}px; font-weight: 700; line-height: 1; letter-spacing: 0.06em;
    color: ${ink}; white-space: nowrap;
  }
  /* The URL lives INSIDE the card, on the panel.
     It sat outside first, as a caption under the card with a text-shadow for
     contrast. Over dark gameplay that read fine; over a bright scene — a snowy
     track, a white menu, a daytime sky — it disappeared completely. And this is
     the one line a viewer has to actually read and type, so it is the last
     thing that may depend on what is behind it. */
  .foot {
    margin: ${3 * s}px 0 0; font-size: ${10 * s}px; color: ${muted};
    white-space: nowrap;
  }
  /* Badge: the same content stacked, for a corner rather than a lower third. */
  .badge .card { flex-direction: column; align-items: flex-start; gap: ${10 * s}px; }
  .badge .codeblock {
    margin-left: 0; padding-left: 0; border-left: 0;
    border-top: 1px solid ${edge}; padding-top: ${10 * s}px; width: 100%;
  }
  .badge .mark { width: ${122 * s}px; }
</style>
</head>
<body>${bodyMarkup}</body>
</html>`;
}
