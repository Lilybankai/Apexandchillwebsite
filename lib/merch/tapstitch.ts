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

/** Build a Tapstitch product-mockup URL from its asset id. */
const tsImg = (id: string): string =>
  `https://files.tapstitch.com/hugepod/material/custom_printing/${id}.png?x-oss-process=style/hugepod-product-webp`;

/** A colourway with its front/back mockup asset ids. */
interface Colourway {
  color: string;
  /** Front mockup asset id (used as the variant thumbnail). */
  front: string;
  /** Back mockup asset id. */
  back: string;
}

/**
 * Build one buyable variant per colour×size combo at a flat price — each carries
 * both `size` and `color` so the operator knows the exact SKU to fulfil, and the
 * colour's front mockup as its thumbnail. Use for apparel offered in several
 * colours; for size-only items write the `variants` array by hand.
 */
function colourSizeVariants(
  handle: string,
  price: number,
  colours: Colourway[],
  sizes: string[],
): ProductVariant[] {
  const variants: ProductVariant[] = [];
  for (const c of colours) {
    for (const size of sizes) {
      variants.push({
        id: `tapstitch:${handle}:${slugify(c.color)}-${size.toLowerCase()}`,
        name: `${c.color} / ${size}`,
        size,
        color: c.color,
        price,
        available: true,
        image: tsImg(c.front),
      });
    }
  }
  return variants;
}

/** Gather every colourway's front then back mockup into one product gallery. */
function galleryOf(colours: Colourway[]): string[] {
  return colours.flatMap((c) => [tsImg(c.front), tsImg(c.back)]);
}

/** Sizes offered on the fleece hoodies. */
const HOODIE_SIZES = ['S', 'M', 'L', 'XL', '2XL'];

/** Andy's Man Club Oversize Fleeced Hoodie colourways (front/back mockups). */
const AMC_HOODIE_COLOURS: Colourway[] = [
  { color: 'Black', front: '7dfa6155981842e184c057dcd3b88450', back: '1f68aaaa82f44183b3dfda20988be69f' },
  { color: 'Gray', front: '78305b0fc9f4413591636cd16893dca4', back: 'bfcb831246b4409f9ec47c6f8019a9d4' },
  { color: 'Brown', front: 'e58866ab87554fce8c79017a9ec8bac1', back: '1bc67fb59363492eb9a09ebfa0229c60' },
  { color: 'Coffee', front: 'b66010c52eab4f48ae5b741044a42dd6', back: '05419372ccbd46109aabca7503c10adf' },
  { color: 'Navy Blue', front: 'b263868a2b3540b9aaf5b9918d6312d6', back: 'd8d8c5fc75b3452388361100f6dd5c8f' },
];

/**
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │  YOUR TAPSTITCH PRODUCTS — edit this array to manage the store.           │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * Products are added here as the operator supplies real artwork + prices. Each
 * becomes a card on /merch automatically.
 */
export const TAPSTITCH_CATALOG: Product[] = [
  {
    id: 'tapstitch:andys-man-club-oversize-fleeced-hoodie',
    handle: 'andys-man-club-oversize-fleeced-hoodie',
    title: "Andy's Man Club Oversize Fleeced Hoodie",
    description:
      "The official Andy's Man Club oversize fleeced hoodie — a heavyweight, relaxed fit with the Andy's Man Club design printed across the front, back and left sleeve. A share of every sale supports men's mental health. It's okay to talk. #ITSOKAYTOTALK",
    provider: 'tapstitch',
    images: galleryOf(AMC_HOODIE_COLOURS),
    priceFrom: 18.22,
    currency: 'GBP',
    category: 'Hoodies',
    tags: ['apparel', 'hoodie', 'amc'],
    variants: colourSizeVariants(
      'andys-man-club-oversize-fleeced-hoodie',
      18.22,
      AMC_HOODIE_COLOURS,
      HOODIE_SIZES,
    ),
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
