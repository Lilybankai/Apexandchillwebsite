/**
 * ── OPERATOR: THE HERO GAMEPLAY LOOP ────────────────────────────────────────
 * The hub's broadcast frame draws a quiet dark "sim viewport" behind the
 * overlays until real footage exists. To put gameplay behind them instead:
 *
 *   1. Export a 1080p (1920×1080) loop of LMU in-car footage with NO overlays
 *      burnt in and no audio track. 10–20 s, H.264 MP4, ideally under 6 MB.
 *   2. Save it as `public/aio/hero-loop.mp4`, plus a still of its first frame
 *      as `public/aio/hero-loop.jpg` (the poster, shown until it plays).
 *   3. Replace `null` below with:
 *        { src: "/aio/hero-loop.mp4", poster: "/aio/hero-loop.jpg" }
 *
 * The video only plays muted, looped and inline, and never for visitors who
 * have asked their OS for reduced motion (they get the poster).
 */
export const HERO_VIDEO: { src: string; poster: string } | null = null;
