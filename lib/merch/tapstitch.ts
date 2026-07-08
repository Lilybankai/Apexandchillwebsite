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

/** Standard size run offered on the apparel (hoodies, tees). */
const APPAREL_SIZES = ['S', 'M', 'L', 'XL', '2XL'];

/** Andy's Man Club Oversize Fleeced Hoodie colourways (front/back mockups). */
const AMC_HOODIE_COLOURS: Colourway[] = [
  { color: 'Black', front: '7dfa6155981842e184c057dcd3b88450', back: '1f68aaaa82f44183b3dfda20988be69f' },
  { color: 'Gray', front: '78305b0fc9f4413591636cd16893dca4', back: 'bfcb831246b4409f9ec47c6f8019a9d4' },
  { color: 'Brown', front: 'e58866ab87554fce8c79017a9ec8bac1', back: '1bc67fb59363492eb9a09ebfa0229c60' },
  { color: 'Coffee', front: 'b66010c52eab4f48ae5b741044a42dd6', back: '05419372ccbd46109aabca7503c10adf' },
  { color: 'Navy Blue', front: 'b263868a2b3540b9aaf5b9918d6312d6', back: 'd8d8c5fc75b3452388361100f6dd5c8f' },
];

/** Oversize Fleeced Hoodie Summer Addition colourways (front/back mockups). */
const SUMMER_HOODIE_COLOURS: Colourway[] = [
  { color: 'Black', front: '2124f4f9b4dc4144aa244307359eab8c', back: '3b95758c3d82467db5f5ceff144f42b1' },
  { color: 'Gray', front: '62d3fb8d14744a35b8fad9aa1334c25d', back: '99c66b82815842ff984d728be3649680' },
  { color: 'Brown', front: '5094c9d63a134a94ad453fff644a725e', back: '75636d5d1a5047898950f7cf12afc980' },
  { color: 'Coffee', front: '87058c627f034976a1169cab4548b0d5', back: '798e2600a85242dfbbb188c4dd73350b' },
  { color: 'Navy Blue', front: 'c899b092cb6b47abba69a48087eb5e79', back: '3d1ab48a36f343959db27668c8298c16' },
];

/** Apex Woody Addition Hoodie colourways (front/back mockups). */
const WOODY_HOODIE_COLOURS: Colourway[] = [
  { color: 'Black', front: '61bcbeee470d4b68ac386a8d3cb30da7', back: 'f78ee8d966814b08b8b2004190be8ca5' },
  { color: 'Gray', front: '36eb734c5ed24b26ab78db5899803d7e', back: 'a2aca0146d274dc996e30b78eaa7d5e1' },
  { color: 'Brown', front: 'a8f41ebf7af340f4ad66076896bb8e68', back: 'fc20a6f588234378a5072657f211bb57' },
  { color: 'Coffee', front: 'c75c36a75e854c30b95c40eb23ac7570', back: '4d90cbeb996c4ba182366e8d2af98256' },
  { color: 'Navy Blue', front: '4fe893718a7e46b5ae40c91251b5b5b4', back: '4886736005884ec28564a06f61d16e9e' },
];

/** Sunfade Vintage Washed T-Shirt colourways (front/back mockups). */
const SUNFADE_TEE_COLOURS: Colourway[] = [
  { color: 'Black', front: '1219b0bc87524f50a679d0904a356ca8', back: '9dc9e2f9615645cd8b5da88cbbf1b63a' },
];

/** Andy's Man Club Unisex Seamless Cotton T-Shirt colourways (front/back mockups). */
const AMC_TEE_COLOURS: Colourway[] = [
  { color: 'Black', front: '33b9370de46e49e085dabab2ed11b7fd', back: '7cc3605a763c43f89765f7cefde663c6' },
  { color: 'Gray', front: 'db2da1353f5847dbbc0d8b9062864eaf', back: '0fb2e879153c45f4b692b9f7218aa8bd' },
  { color: 'Coffee', front: '29c28a0de9864fd3aebf0111f1083eef', back: '24b671d66cf64d0690369aee538176e9' },
  { color: 'Purple', front: '76eed136822b4e8dbb5268c82eb2e85c', back: 'e2d3b84db2514d30a71939169f091fae' },
  { color: 'Navy Blue', front: '7986294217ba47aca105588da18e4f0c', back: '493884b134944da48ebc743e2758962d' },
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
      APPAREL_SIZES,
    ),
  },
  {
    id: 'tapstitch:oversize-fleeced-hoodie-summer-addition',
    handle: 'oversize-fleeced-hoodie-summer-addition',
    title: 'Oversize Fleeced Hoodie Summer Addition',
    description:
      'The Oversize Fleeced Hoodie Summer Addition — the same heavyweight, relaxed-fit fleece hoodie with the summer design printed front and back. Available in five colourways.',
    provider: 'tapstitch',
    images: galleryOf(SUMMER_HOODIE_COLOURS),
    priceFrom: 18.22,
    currency: 'GBP',
    category: 'Hoodies',
    tags: ['apparel', 'hoodie', 'summer'],
    variants: colourSizeVariants(
      'oversize-fleeced-hoodie-summer-addition',
      18.22,
      SUMMER_HOODIE_COLOURS,
      APPAREL_SIZES,
    ),
  },
  {
    id: 'tapstitch:apex-woody-addition-hoodie',
    handle: 'apex-woody-addition-hoodie',
    title: 'Apex Woody Addition Hoodie',
    description:
      'The Apex Woody Addition Hoodie — a heavyweight, relaxed-fit fleece hoodie with the Woody design, personalised with your chosen number printed on the back. Pick your colour, size and number.',
    provider: 'tapstitch',
    images: galleryOf(WOODY_HOODIE_COLOURS),
    priceFrom: 18.22,
    currency: 'GBP',
    category: 'Hoodies',
    tags: ['apparel', 'hoodie', 'personalised'],
    personalization: {
      label: 'Number on the back',
      required: true,
      maxLength: 3,
      placeholder: 'e.g. 27',
    },
    variants: colourSizeVariants(
      'apex-woody-addition-hoodie',
      18.22,
      WOODY_HOODIE_COLOURS,
      APPAREL_SIZES,
    ),
  },
  {
    id: 'tapstitch:sunfade-vintage-washed-t-shirt',
    handle: 'sunfade-vintage-washed-t-shirt',
    title: 'Sunfade Vintage Washed T-Shirt',
    description:
      'The Sunfade Vintage Washed T-Shirt — a soft, garment-washed tee with a lived-in vintage fade and the design printed front and back. Available in black.',
    provider: 'tapstitch',
    images: galleryOf(SUNFADE_TEE_COLOURS),
    priceFrom: 12.96,
    currency: 'GBP',
    category: 'T-Shirts',
    tags: ['apparel', 't-shirt'],
    variants: colourSizeVariants(
      'sunfade-vintage-washed-t-shirt',
      12.96,
      SUNFADE_TEE_COLOURS,
      APPAREL_SIZES,
    ),
  },
  {
    id: 'tapstitch:andys-man-club-unisex-seamless-cotton-t-shirt',
    handle: 'andys-man-club-unisex-seamless-cotton-t-shirt',
    title: "Andy's Man Club Unisex Seamless Cotton T-Shirt",
    description:
      "The Andy's Man Club unisex seamless cotton t-shirt — a soft, everyday cotton tee with the Andy's Man Club design printed front and back. A share of every sale supports men's mental health. It's okay to talk. #ITSOKAYTOTALK",
    provider: 'tapstitch',
    images: galleryOf(AMC_TEE_COLOURS),
    priceFrom: 7.96,
    currency: 'GBP',
    category: 'T-Shirts',
    tags: ['apparel', 't-shirt', 'amc'],
    variants: colourSizeVariants(
      'andys-man-club-unisex-seamless-cotton-t-shirt',
      7.96,
      AMC_TEE_COLOURS,
      APPAREL_SIZES,
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
