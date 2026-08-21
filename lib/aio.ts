/**
 * Apex AIO System — launch gate.
 *
 * ── OPERATOR: flip this when the product goes public ────────────────────────
 * Set `AIO_COMING_SOON` to `false` and redeploy. That single change:
 *   • restores the full landing page (installer, pricing, widgets, FAQ)
 *   • drops the "Soon" badge from the Apps nav
 *   • restores the live-product metadata
 *
 * Leave `components/overlay/AioComingSoon.tsx` in place; with the flag off it
 * is unused and can be deleted in a later tidy-up if you want.
 */
export const AIO_COMING_SOON = true;
