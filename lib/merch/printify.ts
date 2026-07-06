/**
 * Printify print-on-demand client for the merch store.
 *
 * Follows the data-layer pattern: env-driven, returns a typed {@link ApiResult},
 * never throws — when `PRINTIFY_API_KEY` / `PRINTIFY_SHOP_ID` are absent (or the
 * upstream call fails) it resolves to a bundled sample catalog with
 * `source: 'sample'`.
 *
 * ── OPERATOR: BEST INTEGRATION PATH ──────────────────────────────────────────
 * This store reads Printify's Shop API directly and normalises into
 * {@link Product}. To go live:
 *   1. Printify → Account → Connections → generate a Personal Access Token
 *      (scopes: shops.read, products.read, orders.read/write). Put it in
 *      `.env.local` as PRINTIFY_API_KEY.
 *   2. Find your shop id via `GET /v1/shops.json` (the numeric `id`) and set it
 *      as PRINTIFY_SHOP_ID — every product/order call is scoped to one shop.
 *   3. This client calls `GET /shops/{shop_id}/products.json`, which already
 *      embeds variants + images (no per-product round-trips like Printful).
 *      Prices come back as integer minor units (pence) — we divide by 100.
 *      Verify field names in {@link normaliseProduct} against the Printify API
 *      docs if your payload differs — normalisation is defensive and degrades to
 *      the sample catalog.
 *   4. For fulfilment, pair with Stripe checkout (see app/api/checkout/route.ts);
 *      paid orders are pushed to Printify's Orders API from the Stripe webhook.
 *
 * @packageDocumentation
 */

import type { ApiResult, Product, ProductVariant } from '@/lib/types';
import { printify as cfg, isConfigured, CACHE_TTL_SECONDS } from '@/lib/env';
import { slugify } from '@/lib/merch/catalog';

const APPAREL_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

/** Build apparel variants (one per size) at a flat price. */
function apparelVariants(idBase: string, price: number): ProductVariant[] {
  return APPAREL_SIZES.map((size) => ({
    id: `${idBase}-${size.toLowerCase()}`,
    name: size,
    size,
    price,
    available: true,
  }));
}

/**
 * Bundled sample Printify catalog (used when live credentials are absent).
 * Includes the Apex & Chill oversized hoodie plus the Andy's Man Club exclusive
 * charity line. Images use bundled brand art as placeholders until the live
 * Printify feed supplies product photos.
 */
const SAMPLE_PRINTIFY: Product[] = [
  {
    id: 'printify:oversize-hoodie',
    handle: 'oversize-hoodie',
    title: 'Oversized Race Hoodie',
    description:
      'Heavyweight oversized hoodie with the Apex & Chill neon crest. Brushed fleece inside, drop shoulder, built for the paddock and the sofa.',
    provider: 'sample',
    images: ['/brand/about.png'],
    priceFrom: 31.99,
    currency: 'GBP',
    category: 'Hoodies',
    tags: ['apparel', 'hoodie'],
    variants: apparelVariants('printify:oversize-hoodie', 31.99),
  },
  {
    id: 'printify:amc-hoodie',
    handle: 'andys-man-club-hoodie',
    title: "Andy's Man Club Hoodie",
    description:
      "Our exclusive Andy's Man Club charity hoodie — #ITSOKAYTOTALK across the back. A share of every sale supports men's mental health. Wear it, start a conversation.",
    provider: 'sample',
    images: ['/brand/andysmanclub-logo-white.png'],
    priceFrom: 34.99,
    currency: 'GBP',
    category: 'Hoodies',
    tags: ['apparel', 'hoodie', 'amc', 'charity'],
    variants: apparelVariants('printify:amc-hoodie', 34.99),
  },
  {
    id: 'printify:amc-summer-tee',
    handle: 'amc-summer-tee',
    title: "Andy's Man Club — Summer Tee",
    description:
      "Part of the summer Andy's Man Club collection. Lightweight tee with the #ITSOKAYTOTALK mark. Proceeds support men's mental health.",
    provider: 'sample',
    images: ['/brand/itsokaytotalk-logo-white.png'],
    priceFrom: 22.99,
    currency: 'GBP',
    category: 'Apparel',
    tags: ['apparel', 'tee', 'amc', 'charity'],
    variants: apparelVariants('printify:amc-summer-tee', 22.99),
  },
];

/** Auth headers shared by every Printify request. */
function printifyHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${cfg.apiKey}`,
    Accept: 'application/json',
  };
}

/** Prefix a shop-scoped path with `/shops/{shop_id}`. */
function shopPath(path: string): string {
  return `/shops/${cfg.shopId}${path}`;
}

/** GET against the Printify API. @throws on a non-ok response. */
async function printifyGet<T>(path: string): Promise<T> {
  const url = `${cfg.baseUrl.replace(/\/$/, '')}${path}`;
  const res = await fetch(url, {
    headers: printifyHeaders(),
    next: { revalidate: CACHE_TTL_SECONDS },
  });
  if (!res.ok) throw new Error(`Printify ${path} responded ${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}

/** POST against the Printify API (uncached). @throws with the API error message. */
async function printifyPost<T>(path: string, body: unknown): Promise<T> {
  const url = `${cfg.baseUrl.replace(/\/$/, '')}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { ...printifyHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`;
    try {
      const j = (await res.json()) as { message?: string; errors?: unknown };
      if (typeof j?.message === 'string') detail = j.message;
    } catch {
      /* keep status-line detail */
    }
    throw new Error(`Printify ${path} failed: ${detail}`);
  }
  return (await res.json()) as T;
}

/** Printify paginates list endpoints in a `data` envelope. */
interface PrintifyPage<T> {
  data?: T[];
}

/** Minimal shape of a Printify product image. */
interface PrintifyImage {
  src?: string;
  variant_ids?: number[];
  is_default?: boolean;
}

/** Minimal shape of a Printify product variant. */
interface PrintifyVariant {
  id: number;
  title?: string;
  /** Price in integer minor units (pence). */
  price?: number;
  is_enabled?: boolean;
  is_available?: boolean;
}

/** Minimal shape of a Printify product. */
interface PrintifyProduct {
  id: string;
  title?: string;
  description?: string;
  images?: PrintifyImage[];
  variants?: PrintifyVariant[];
  tags?: string[];
  visible?: boolean;
}

/** Strip HTML tags/entities from Printify's rich-text descriptions. */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Pick the image URL for a specific variant, else the product's default/first. */
function imageForVariant(images: PrintifyImage[], variantId: number): string | undefined {
  const match = images.find((img) => img.variant_ids?.includes(variantId));
  if (match?.src) return match.src;
  const fallback = images.find((img) => img.is_default) ?? images[0];
  return fallback?.src;
}

/** Normalise a Printify product into a provider-agnostic {@link Product}. */
function normaliseProduct(p: PrintifyProduct): Product {
  const title = p.title ?? 'Untitled product';
  const images = p.images ?? [];
  // Only enabled variants are buyable; disabled ones are hidden in the store UI.
  const variants: ProductVariant[] = (p.variants ?? [])
    .filter((v) => v.is_enabled !== false)
    .map((v) => ({
      id: `printify:${p.id}:${v.id}`,
      name: v.title ?? 'Variant',
      price: Number(v.price ?? 0) / 100,
      available: v.is_available !== false,
      image: imageForVariant(images, v.id),
    }));
  const priceFrom = variants.length ? Math.min(...variants.map((v) => v.price)) : 0;
  const primaryImages = images.map((img) => img.src).filter((s): s is string => Boolean(s));
  return {
    id: `printify:${p.id}`,
    handle: slugify(title),
    title,
    description: p.description ? stripHtml(p.description) : '',
    provider: 'printify',
    images: primaryImages.length ? primaryImages : ['/brand/about.png'],
    priceFrom,
    currency: 'GBP',
    category: 'Apparel',
    tags: /andy'?s man club|amc|itsokaytotalk/i.test(title) ? ['amc', 'charity'] : [],
    variants,
  };
}

/** The sample fallback result (shared by success + error paths). */
function sample(error: string | null): ApiResult<Product[]> {
  return { ok: true, source: 'sample', error, data: SAMPLE_PRINTIFY };
}

/**
 * Fetch the Printify product catalog.
 *
 * @returns Live products when configured, otherwise the sample catalog. Never
 *          throws.
 */
export async function fetchPrintifyProducts(): Promise<ApiResult<Product[]>> {
  if (!isConfigured('printify')) {
    return sample('Printify not configured — showing sample catalog.');
  }
  try {
    const page = await printifyGet<PrintifyPage<PrintifyProduct>>(shopPath('/products.json?limit=100'));
    const items = (page.data ?? []).filter((p) => p.visible !== false);
    if (items.length === 0) return sample('Printify returned no products — showing sample catalog.');

    const products = items.map(normaliseProduct).filter((p) => p.variants.length > 0);
    if (products.length === 0) return sample('Printify returned no usable products — showing sample catalog.');
    return { ok: true, source: 'printify', error: null, data: products };
  } catch (err) {
    return sample(
      `Printify request failed (${err instanceof Error ? err.message : 'unknown error'}) — showing sample catalog.`,
    );
  }
}

/* ------------------------------------------------------------------------- *
 * Fulfilment — push a paid Stripe order to Printify's Orders API.
 * ------------------------------------------------------------------------- */

/** Shipping recipient, shaped for the Printify Orders API (`address_to`). */
export interface PrintifyRecipient {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  /** ISO-3166-1 alpha-2 country code, e.g. `GB`. */
  country?: string;
  /** State/province/region name (optional for many countries). */
  region?: string;
  address1?: string;
  address2?: string;
  city?: string;
  zip?: string;
}

/**
 * One line of a Printify order. Unlike Printful (a single `sync_variant_id`),
 * Printify needs BOTH the parent product id and the variant id.
 */
export interface PrintifyOrderItem {
  product_id: string;
  variant_id: number;
  quantity: number;
}

/** Outcome of a {@link createPrintifyOrder} call. */
export interface PrintifyOrderResult {
  ok: boolean;
  /** Printify order id, when created. */
  id?: string;
  /** Printify order status, e.g. `pending` or `in-production`. */
  status?: string;
  error: string | null;
}

/**
 * Create a Printify order for a set of product/variant lines.
 *
 * By default the order is created but NOT sent to production (`confirm=false`)
 * so the operator reviews it in the Printify dashboard before it's charged &
 * shipped; set `PRINTIFY_AUTO_CONFIRM=true` (or pass `confirm: true`) to send it
 * to production automatically via `send_to_production.json`. Pass a stable
 * `externalId` (we use the Stripe session id) so Printify de-duplicates retried
 * webhook deliveries into a single order.
 *
 * Never throws — returns `{ ok: false, error }` on any failure.
 */
export async function createPrintifyOrder(
  recipient: PrintifyRecipient,
  items: PrintifyOrderItem[],
  opts: { externalId?: string; confirm?: boolean } = {},
): Promise<PrintifyOrderResult> {
  if (!isConfigured('printify')) {
    return { ok: false, error: 'Printify not configured — cannot create order.' };
  }
  if (items.length === 0) {
    return { ok: false, error: 'No Printify items to fulfil.' };
  }

  const confirm = opts.confirm ?? cfg.autoConfirm;
  const payload = {
    ...(opts.externalId ? { external_id: opts.externalId } : {}),
    // Printify requires a shipping method; 1 = standard.
    shipping_method: 1,
    send_shipping_notification: false,
    line_items: items,
    address_to: recipient,
  };

  try {
    const created = await printifyPost<{ id?: string; status?: string }>(shopPath('/orders.json'), payload);
    const orderId = created.id;
    let status = created.status;

    // Optionally push the order to production. A failure here is non-fatal: the
    // order still exists in Printify for the operator to send manually.
    if (confirm && orderId) {
      try {
        await printifyPost(shopPath(`/orders/${orderId}/send_to_production.json`), {});
        status = 'in-production';
      } catch {
        /* order created but not auto-confirmed; operator confirms in dashboard */
      }
    }

    return { ok: true, id: orderId, status, error: null };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'unknown error' };
  }
}
