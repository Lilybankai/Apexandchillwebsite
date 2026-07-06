/**
 * Tapstitch merch — MANUAL curated catalog.
 *
 * ── WHY THIS IS A HAND-MAINTAINED FILE ───────────────────────────────────────
 * Tapstitch does NOT offer a public product API or a Next.js integration, so
 * (unlike Printify) products can't sync in automatically. Instead we treat
 * Tapstitch as a manual catalog: you list each product ONCE in the
 * {@link TAPSTITCH_CATALOG} array below and it flows through the exact same
 * provider-agnostic {@link Product} model as everything else — so the storefront,
 * cart and checkout need zero changes.
 *
 * Fulfilment is also manual: Tapstitch can't receive an automated order push, so
 * when a Tapstitch item is bought the Stripe webhook records the order and emails
 * you the details (see app/api/webhooks/stripe) to key into Tapstitch by hand.
 * You review these in the /admin dashboard.
 *
 * ── HOW TO ADD / EDIT A PRODUCT ──────────────────────────────────────────────
 *   1. Add (or edit) an entry in {@link TAPSTITCH_CATALOG}. Give it a stable
 *      `handle` (URL slug), real `images` (drop files in /public/... or use a
 *      hosted URL), a `priceFrom`, and one `variants` entry per buyable
 *      size/colour with its own `price`.
 *   2. Sold out? Set that variant's `available: false` (or the whole product's
 *      variants). Checkout re-checks this server-side and blocks out-of-stock buys.
 *   3. That's it — no rebuild of the store UI needed. Prices are re-derived
 *      server-side at checkout from THIS list, so they can't be tampered with.
 *
 * The return shape stays `ApiResult<Product[]>` for drop-in compatibility with
 * the merge/checkout code; `source` is `'tapstitch'` when the catalog is
 * non-empty, else `'sample'` with a note.
 *
 * @packageDocumentation
 */

import type { ApiResult, Product, ProductVariant } from '@/lib/types';
import { slugify } from '@/lib/merch/catalog';

/** Standard apparel sizes, for the {@link apparelVariants} helper. */
const APPAREL_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

/**
 * Build one variant per apparel size at a flat price. A convenience for tees /
 * hoodies where every size costs the same; for per-variant pricing or non-apparel
 * options, write the `variants` array by hand instead.
 */
function apparelVariants(handle: string, price: number): ProductVariant[] {
  return APPAREL_SIZES.map((size) => ({
    id: `tapstitch:${handle}:${size.toLowerCase()}`,
    name: size,
    size,
    price,
    available: true,
  }));
}

/**
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │  YOUR TAPSTITCH PRODUCTS — edit this array to manage the store.           │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * These start as the Apex & Chill sample items; replace titles/prices/images
 * with your real Tapstitch products. Each becomes a card on /merch automatically.
 */
export const TAPSTITCH_CATALOG: Product[] = [
  {
    id: 'tapstitch:neon-desk-mat',
    handle: 'neon-desk-mat',
    title: 'Neon Circuit Desk Mat',
    description:
      'Oversized neon desk mat with the Apex & Chill circuit artwork. Smooth surface, stitched edges — built for sim rig setups.',
    provider: 'tapstitch',
    images: ['/brand/banner.png'],
    priceFrom: 25.99,
    currency: 'GBP',
    category: 'Accessories',
    tags: ['accessories', 'desk'],
    variants: [
      { id: 'tapstitch:neon-desk-mat:xl', name: 'XL (900×400mm)', price: 25.99, available: true },
    ],
  },
  {
    id: 'tapstitch:tough-phone-case',
    handle: 'tough-phone-case',
    title: 'Tough Phone Case',
    description:
      'Impact-resistant phone case in the Apex & Chill livery. Dual-layer protection with a matte neon finish.',
    provider: 'tapstitch',
    images: ['/brand/standings.png'],
    priceFrom: 24.13,
    currency: 'GBP',
    category: 'Accessories',
    tags: ['accessories', 'phone'],
    variants: [
      { id: 'tapstitch:tough-phone-case:15', name: 'iPhone 15 / Pro', price: 24.13, available: true },
      { id: 'tapstitch:tough-phone-case:14', name: 'iPhone 14 / Pro', price: 24.13, available: true },
      { id: 'tapstitch:tough-phone-case:s24', name: 'Samsung S24', price: 24.13, available: true },
    ],
  },
  {
    id: 'tapstitch:sunfade-tee',
    handle: 'sunfade-tee',
    title: 'Sunfade Racing Tee',
    description:
      'Soft cotton tee with a sunfade neon print. Relaxed fit — race day or rest day.',
    provider: 'tapstitch',
    images: ['/brand/replays.png'],
    priceFrom: 25.92,
    currency: 'GBP',
    category: 'Apparel',
    tags: ['apparel', 'tee'],
    variants: apparelVariants('sunfade-tee', 25.92),
  },
];

/**
 * Return the manual Tapstitch catalog.
 *
 * Async + {@link ApiResult}-shaped purely to stay a drop-in match for the other
 * providers; it does no network I/O. Never throws.
 *
 * @returns The curated catalog (`source: 'tapstitch'`), or an empty sample-style
 *          result with a note when the catalog is empty.
 */
export async function fetchTapstitchProducts(): Promise<ApiResult<Product[]>> {
  // Defensive: guarantee handles are slugs even if an entry was added by hand
  // with an odd handle, so product-detail routing stays stable.
  const products = TAPSTITCH_CATALOG.map((p) => ({ ...p, handle: slugify(p.handle || p.title) }));

  if (products.length === 0) {
    return { ok: true, source: 'sample', error: 'Tapstitch catalog is empty.', data: [] };
  }
  return { ok: true, source: 'tapstitch', error: null, data: products };
}
