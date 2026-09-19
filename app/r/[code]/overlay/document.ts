/**
 * The overlay document — every byte OBS receives for `/r/<code>/overlay`.
 *
 * Split out of the route handler because this is the part with opinions in it:
 * the route's job is HTTP (params, lookup, caching), this one's job is to paint
 * something legible over live video at whatever resolution the stream runs at.
 *
 * ## Resolution, and why the first version looked soft on a 4K stream
 * An OBS Browser Source renders the page into a bitmap of exactly the Width ×
 * Height typed into its properties — one device pixel per CSS pixel, no device
 * pixel ratio, no way to ask for more from inside the page. Everything after
 * that is compositing. So if the source is 800 × 600 and the operator drags its
 * handles out to cover a third of a 3840-wide canvas, OBS is stretching an
 * 800-pixel bitmap to 1280 and the type goes to mush. Nothing in the CSS can
 * rescue that — the pixels were never rendered.
 *
 * The fix has to be that the source renders at the size it is shown at, so the
 * overlay scales itself to the source instead of being scaled by the scene:
 * every dimension here is a multiple of one custom property, `--u`, and by
 * default `--u` is derived from the viewport. Size the Browser Source to the
 * rectangle you want on the canvas, leave it at 100% in the scene, and the
 * lettering is drawn at native resolution — at 4K that is roughly four times
 * the pixels the same strip got before, which is what "small but sharp" needs.
 *
 * `?fit=0` restores the old fixed-size behaviour, where `?scale=` alone decides
 * how big the card is and the source is just a canvas it sits on.
 *
 * ## Recommended OBS setup
 *   1. Add a Browser Source with the URL.
 *   2. Set Width and Height to the size you want the strip to occupy — on a
 *      3840 × 2160 canvas a lower third of about 1400 × 240 is a good start.
 *   3. Position it, but do NOT resize it in the scene. If it wants to be
 *      bigger or smaller, change the source's Width and Height instead.
 *
 * Downscaling is safe — a source rendered larger than it is shown looks fine,
 * because that is resampling down. It is only upscaling that pixelates.
 *
 * @packageDocumentation
 */

import { AIO_LOCKUP } from './lockup';

/** Which of the two arrangements to draw. */
export type Layout = 'bar' | 'badge';

export interface OverlayOptions {
  /** `bar` is a lower third or top banner; `badge` stacks it for a corner. */
  layout: Layout;
  /** `light` for a bright scene. */
  theme: 'dark' | 'light';
  /**
   * With `fit`, the share of the source the card fills — 1 fills it, 0.6
   * leaves it comfortably inside. Without `fit`, the old multiplier: the
   * design is drawn at `scale` × its natural size and the source is only a
   * canvas.
   */
  scale: number;
  /** Scale to the Browser Source's own size. On by default. */
  fit: boolean;
}

/**
 * The size each layout occupies at `--u: 1px`, in CSS pixels. It is only ever
 * the divisor that turns the viewport into `--u`.
 *
 * Measured from the rendered document rather than added up by hand: the bar is
 * 515 x 92 with a five-character code and 591 x 92 with a ten-character one.
 *
 * The height carries about a tenth of slack, so the glow has somewhere to go
 * rather than being cut off square at the edge of the source. The width does
 * NOT: only the height is the same for every partner, so the height is what
 * should normally decide the scale, and the width is here as the guard that
 * stops a long code overflowing a narrow source. Pad it and it starts winning
 * ties it should lose, which costs pixels on every 4K lower third.
 *
 * None of this has to be exact — coming up a few percent short of the edges
 * costs a few percent of the available pixels, not the sharpness that is the
 * entire point. Re-measure if the design changes shape.
 */
const DESIGN: Record<Layout, { w: number; h: number }> = {
  bar: { w: 600, h: 104 },
  badge: { w: 300, h: 214 },
};

/** Escape anything interpolated into the document. */
export function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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
 *
 * `body` is empty for an unknown or revoked code: an invisible source, never a
 * red box reading "code not found" sitting over somebody's race.
 */
export function overlayDocument(
  referral: { code: string; percentOff: number } | null,
  { layout, theme, scale, fit }: OverlayOptions,
): string {
  const badge = layout === 'badge';
  const light = theme === 'light';
  const body = referral ? markup(referral.code, referral.percentOff, badge) : '';

  const ink = light ? '#12121c' : '#f4f5fa';
  const muted = light ? 'rgba(18,18,28,0.62)' : 'rgba(244,245,250,0.66)';
  const panel = light ? 'rgba(255,255,255,0.88)' : 'rgba(10,11,18,0.82)';
  const edge = light ? 'rgba(18,18,28,0.14)' : 'rgba(255,255,255,0.14)';

  const { w, h } = DESIGN[layout];

  /*
   * The fit unit goes behind @supports, and the fixed unit stays as the plain
   * declaration underneath it, because min() with division is Chrome 91 and
   * OBS 27 shipped CEF 75. On that browser the whole block is skipped and the
   * overlay renders at ?scale= exactly as it always did. A partner on an old
   * OBS gets the old behaviour; nobody gets a broken card mid-stream, which is
   * the only outcome here that actually costs anything.
   */
  const fitUnit = fit
    ? `
  @supports (width: min(1px, 1vw)) {
    :root { --u: calc(min(100vw / ${w}, 100vh / ${h}) * ${scale}); }
    body { min-height: 100vh; display: flex; align-items: center; justify-content: center; }
  }`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="robots" content="noindex, nofollow">
<title>Apex AIO — referral overlay</title>
<style>
  /* Every length in this document is a multiple of --u, so one declaration
     decides the resolution the whole card is drawn at. */
  :root {
    --u: ${scale}px;
    --ink: ${ink};
    --muted: ${muted};
    --panel: ${panel};
    --edge: ${edge};
    /* Hairlines scale with everything else — a 1px border beside 100px
       lettering is a different design, not the same one bigger — but never
       round to nothing. */
    --hair: max(1px, var(--u));
  }
${fitUnit}
  /* Transparent, because OBS composites whatever this paints. */
  html, body { background: transparent; margin: 0; padding: 0; overflow: hidden; }
  body {
    /* Subpixel antialiasing assumes it knows what is behind the glyph. Here
       nothing is: the page is transparent and the real backdrop is video the
       browser cannot see, so the RGB fringes it lays down composite as colour
       noise on the edge of every letter — the thing that reads as "pixelated"
       long before the resolution does. Grayscale AA composites correctly.
       geometricPrecision keeps glyph widths proportional as --u grows instead
       of letting hinting snap them to whole pixels. */
    -webkit-font-smoothing: antialiased;
    text-rendering: geometricPrecision;
  }
  .wrap {
    font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
    display: inline-flex; flex-direction: column; gap: calc(8 * var(--u));
    padding: calc(10 * var(--u)); color: var(--ink);
  }
  .card {
    display: flex; align-items: center; gap: calc(14 * var(--u));
    padding: calc(14 * var(--u)) calc(18 * var(--u));
    border-radius: calc(14 * var(--u));
    background: var(--panel);
    border: var(--hair) solid var(--edge);
    /* A soft glow rather than a hard drop shadow: over moving video a crisp
       shadow reads as a sticker pasted on, a glow reads as part of the show.

       There was a backdrop-filter: blur() here too, and it was removed. It
       never did anything: a backdrop-filter blurs what is behind the element
       IN THE PAGE, and behind this one there is only a transparent document —
       the gameplay underneath belongs to OBS and the browser has never seen a
       frame of it. All it bought was promoting the card to its own composited
       layer, which Chromium is free to rasterise at a lower scale and stretch
       back up, on the one element whose edges have to stay sharp. */
    box-shadow: 0 0 calc(28 * var(--u)) rgba(155,92,255,0.28), 0 calc(4 * var(--u)) calc(18 * var(--u)) rgba(0,0,0,0.35);
  }
  /* Width, not height: the lockup is ~3.96:1 and pinning both axes would
     squash lettering that is going out over live video. The colour property
     is what the artwork's currentColor lettering reads — the symbol keeps
     its own gradient in both themes. (No backticks in here: this comment is
     inside a template literal.) */
  .mark { width: calc(104 * var(--u)); height: auto; display: block; flex: 0 0 auto; color: var(--ink); }
  .body { display: flex; flex-direction: column; gap: calc(2 * var(--u)); }
  .head { margin: 0; display: flex; align-items: baseline; gap: calc(7 * var(--u)); }
  .pct {
    font-size: calc(25 * var(--u)); font-weight: 800; line-height: 1; letter-spacing: -0.01em;
    background: linear-gradient(90deg, #22e3ff, #9b5cff);
    -webkit-background-clip: text; background-clip: text; color: transparent;
  }
  /* Explicit line-heights throughout: the fit unit is derived from the card's
     measured height, so the height has to be the same arithmetic everywhere
     rather than whatever normal resolves to for the font that happened to
     load. */
  .sub { font-size: calc(11.5 * var(--u)); line-height: 1.2; color: var(--muted); white-space: nowrap; }
  .codeblock {
    margin-left: calc(4 * var(--u)); padding-left: calc(14 * var(--u));
    border-left: var(--hair) solid var(--edge);
    display: flex; flex-direction: column; gap: calc(2 * var(--u));
  }
  .codelabel {
    margin: 0; font-size: calc(8.5 * var(--u)); line-height: 1.2;
    letter-spacing: 0.2em; color: var(--muted); font-weight: 700;
  }
  .code {
    margin: 0; font-family: ui-monospace, "Cascadia Mono", Consolas, monospace;
    font-size: calc(23 * var(--u)); font-weight: 700; line-height: 1; letter-spacing: 0.06em;
    color: var(--ink); white-space: nowrap;
  }
  /* The URL lives INSIDE the card, on the panel.
     It sat outside first, as a caption under the card with a text-shadow for
     contrast. Over dark gameplay that read fine; over a bright scene — a snowy
     track, a white menu, a daytime sky — it disappeared completely. And this is
     the one line a viewer has to actually read and type, so it is the last
     thing that may depend on what is behind it. */
  .foot {
    margin: calc(3 * var(--u)) 0 0; font-size: calc(10 * var(--u)); line-height: 1.2;
    color: var(--muted); white-space: nowrap;
  }
  /* Badge: the same content stacked, for a corner rather than a lower third. */
  .badge .card { flex-direction: column; align-items: flex-start; gap: calc(10 * var(--u)); }
  .badge .codeblock {
    margin-left: 0; padding-left: 0; border-left: 0;
    border-top: var(--hair) solid var(--edge); padding-top: calc(10 * var(--u)); width: 100%;
  }
  .badge .mark { width: calc(122 * var(--u)); }
</style>
</head>
<body>${body}</body>
</html>`;
}
