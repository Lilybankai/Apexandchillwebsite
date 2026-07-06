/**
 * Printful print-on-demand client for the merch store.
 *
 * Follows the data-layer pattern: env-driven, returns a typed {@link ApiResult},
 * never throws — when `PRINTFUL_API_KEY` is absent (or the upstream call fails)
 * it resolves to a bundled sample catalog with `source: 'sample'`.
 *
 * ── OPERATOR: BEST INTEGRATION PATH ──────────────────────────────────────────
 * Printful products don't import cleanly into WordPress either; this store reads
 * Printful's Store Products API directly and normalises into {@link Product}.
 * To go live:
 *   1. Printful → Settings → API → create a private token (store-level is
 *      simplest; account-level tokens also need PRINTFUL_STORE_ID). Put values in
 *      `.env.local` as PRINTFUL_API_KEY / PRINTFUL_STORE_ID.
 *   2. This client calls `GET /store/products` then (lazily) `GET
 *      /store/products/{id}` for variants. Verify field names in
 *      {@link normaliseSyncProduct} against the Printful API docs if your payload
 *      differs — normalisation is defensive and degrades to the sample catalog.
 *   3. For fulfilment, pair with Stripe checkout (see app/api/checkout/route.ts)
 *      or Printful's own checkout; orders can later be pushed to Printful's
 *      Orders API from a Stripe webhook (TODO noted in the checkout route).
 *
 * @packageDocumentation
 */

import type { ApiResult, Product, ProductVariant } from '@/lib/types';
import { printful as cfg, isConfigured, CACHE_TTL_SECONDS } from '@/lib/env';
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
 * Bundled sample Printful catalog (used when live credentials are absent).
 * Includes the Apex & Chill oversized hoodie plus the Andy's Man Club exclusive
 * charity line. Images use bundled brand art as placeholders until the live
 * Printful feed supplies product photos.
 */
const SAMPLE_PRINTFUL: Product[] = [
  {
    id: 'printful:oversize-hoodie',
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
    variants: apparelVariants('printful:oversize-hoodie', 31.99),
  },
  {
    id: 'printful:amc-hoodie',
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
    variants: apparelVariants('printful:amc-hoodie', 34.99),
  },
  {
    id: 'printful:amc-summer-tee',
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
    variants: apparelVariants('printful:amc-summer-tee', 22.99),
  },
];

/** Auth + store headers shared by every Printful request. */
function printfulHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${cfg.apiKey}`,
    Accept: 'application/json',
    ...(cfg.storeId ? { 'X-PF-Store-Id': cfg.storeId } : {}),
  };
}

/** GET against the Printful API. @throws on a non-ok response. */
async function printfulGet<T>(path: string): Promise<T> {
  const url = `${cfg.baseUrl.replace(/\/$/, '')}${path}`;
  const res = await fetch(url, {
    headers: printfulHeaders(),
    next: { revalidate: CACHE_TTL_SECONDS },
  });
  if (!res.ok) throw new Error(`Printful ${path} responded ${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}

/** POST against the Printful API (uncached). @throws with the API error message. */
async function printfulPost<T>(path: string, body: unknown): Promise<T> {
  const url = `${cfg.baseUrl.replace(/\/$/, '')}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { ...printfulHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`;
    try {
      const j = (await res.json()) as { error?: { message?: string }; result?: unknown };
      if (j?.error?.message) detail = j.error.message;
      else if (typeof j?.result === 'string') detail = j.result;
    } catch {
      /* keep status-line detail */
    }
    throw new Error(`Printful ${path} failed: ${detail}`);
  }
  return (await res.json()) as T;
}

/** Printful wraps payloads in a `result` envelope. */
interface PrintfulEnvelope<T> {
  result?: T;
}

/** Minimal shape of a Printful sync product list item. */
interface PrintfulSyncProduct {
  id: number;
  name?: string;
  thumbnail_url?: string;
}

/** Minimal shape of a Printful sync product detail. */
interface PrintfulSyncDetail {
  sync_product?: { id: number; name?: string; thumbnail_url?: string };
  sync_variants?: Array<{
    id: number;
    name?: string;
    retail_price?: string;
    currency?: string;
    availability_status?: string;
    product?: { image?: string };
  }>;
}

/** Normalise a Printful sync-product detail into a {@link Product}. */
function normaliseSyncProduct(detail: PrintfulSyncDetail): Product {
  const sp = detail.sync_product ?? { id: 0 };
  const title = sp.name ?? 'Untitled product';
  const variants: ProductVariant[] = (detail.sync_variants ?? []).map((v) => ({
    id: `printful:${v.id}`,
    name: v.name ?? 'Variant',
    price: Number(v.retail_price ?? 0) || 0,
    available: v.availability_status !== 'discontinued' && v.availability_status !== 'out_of_stock',
    image: v.product?.image,
  }));
  const priceFrom = variants.length ? Math.min(...variants.map((v) => v.price)) : 0;
  return {
    id: `printful:${sp.id}`,
    handle: slugify(title),
    title,
    description: '',
    provider: 'printful',
    images: [sp.thumbnail_url ?? '/brand/about.png'],
    priceFrom,
    currency: 'GBP',
    category: 'Apparel',
    tags: /andy'?s man club|amc|itsokaytotalk/i.test(title) ? ['amc', 'charity'] : [],
    variants,
  };
}

/** The sample fallback result (shared by success + error paths). */
function sample(error: string | null): ApiResult<Product[]> {
  return { ok: true, source: 'sample', error, data: SAMPLE_PRINTFUL };
}

/**
 * Fetch the Printful product catalog.
 *
 * @returns Live products when configured, otherwise the sample catalog. Never
 *          throws.
 */
export async function fetchPrintfulProducts(): Promise<ApiResult<Product[]>> {
  if (!isConfigured('printful')) {
    return sample('Printful not configured — showing sample catalog.');
  }
  try {
    const list = await printfulGet<PrintfulEnvelope<PrintfulSyncProduct[]>>('/store/products');
    const items = list.result ?? [];
    if (items.length === 0) return sample('Printful returned no products — showing sample catalog.');

    // Fetch variant details per product (bounded to keep the request snappy).
    const details = await Promise.all(
      items.slice(0, 40).map((p) =>
        printfulGet<PrintfulEnvelope<PrintfulSyncDetail>>(`/store/products/${p.id}`)
          .then((d) => d.result)
          .catch(() => undefined),
      ),
    );
    const products = details
      .filter((d): d is PrintfulSyncDetail => Boolean(d))
      .map(normaliseSyncProduct);

    if (products.length === 0) return sample('Printful returned no usable products — showing sample catalog.');
    return { ok: true, source: 'printful', error: null, data: products };
  } catch (err) {
    return sample(
      `Printful request failed (${err instanceof Error ? err.message : 'unknown error'}) — showing sample catalog.`,
    );
  }
}

/* ------------------------------------------------------------------------- *
 * Fulfilment — push a paid Stripe order to Printful's Orders API.
 * ------------------------------------------------------------------------- */

/** Shipping recipient, shaped for the Printful Orders API. */
export interface PrintfulRecipient {
  name?: string;
  address1?: string;
  address2?: string;
  city?: string;
  /** ISO state/region code, e.g. `CA` (optional for many countries). */
  state_code?: string;
  /** ISO-3166-1 alpha-2 country code, e.g. `GB`. */
  country_code?: string;
  zip?: string;
  email?: string;
  phone?: string;
}

/** One line of a Printful order: a sync-variant id + quantity. */
export interface PrintfulOrderItem {
  /** Printful `sync_variant_id` (the numeric part of our `printful:<id>`). */
  sync_variant_id: number;
  quantity: number;
}

/** Outcome of a {@link createPrintfulOrder} call. */
export interface PrintfulOrderResult {
  ok: boolean;
  /** Printful order id, when created. */
  id?: number;
  /** Printful order status, e.g. `draft` or `pending`. */
  status?: string;
  error: string | null;
}

/**
 * Create a Printful order for a set of sync-variant lines.
 *
 * By default the order is created as a **draft** (`confirm=false`) so the
 * operator reviews it in the Printful dashboard before it's charged & shipped;
 * set `PRINTFUL_AUTO_CONFIRM=true` (or pass `confirm: true`) to fulfil
 * automatically. Pass a stable `externalId` (we use the Stripe session id) so
 * Printful de-duplicates retried webhook deliveries into a single order.
 *
 * Never throws — returns `{ ok: false, error }` on any failure.
 */
export async function createPrintfulOrder(
  recipient: PrintfulRecipient,
  items: PrintfulOrderItem[],
  opts: { externalId?: string; confirm?: boolean } = {},
): Promise<PrintfulOrderResult> {
  if (!isConfigured('printful')) {
    return { ok: false, error: 'Printful not configured — cannot create order.' };
  }
  if (items.length === 0) {
    return { ok: false, error: 'No Printful items to fulfil.' };
  }

  const confirm = opts.confirm ?? cfg.autoConfirm;
  const query = confirm ? '?confirm=true' : '';
  const payload = {
    ...(opts.externalId ? { external_id: opts.externalId } : {}),
    recipient,
    items,
  };

  try {
    const res = await printfulPost<PrintfulEnvelope<{ id: number; status?: string }>>(`/orders${query}`, payload);
    return { ok: true, id: res.result?.id, status: res.result?.status, error: null };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'unknown error' };
  }
}
