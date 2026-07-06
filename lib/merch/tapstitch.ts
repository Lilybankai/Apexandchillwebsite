/**
 * Tapstitch print-on-demand client for the merch store.
 *
 * Follows the data-layer pattern: env-driven, returns a typed {@link ApiResult},
 * and never throws — when `TAPSTITCH_API_KEY` is absent (or the upstream call
 * fails) it resolves to a bundled sample catalog with `source: 'sample'` so the
 * store always renders.
 *
 * ── OPERATOR: BEST INTEGRATION PATH ──────────────────────────────────────────
 * Tapstitch syncs products poorly into WordPress; this store bypasses that by
 * reading Tapstitch's storefront/products API directly and normalising into the
 * provider-agnostic {@link Product} model. To go live:
 *   1. In Tapstitch → Settings → API/Integrations, create an API key and note
 *      your store id. Put them in `.env.local` as TAPSTITCH_API_KEY /
 *      TAPSTITCH_STORE_ID.
 *   2. Verify the request path + JSON field names in {@link fetchTapstitchProducts}
 *      / {@link normaliseProduct} against your Tapstitch API docs (the mapping
 *      below is defensive but provider payloads vary).
 *   3. Product images/prices then flow from Tapstitch automatically; the sample
 *      catalog is only used while the key is unset.
 * Because normalisation is provider-agnostic, adding/removing a provider never
 * touches the UI — only this file.
 *
 * @packageDocumentation
 */

import type { ApiResult, Product, ProductVariant } from '@/lib/types';
import { tapstitch as cfg, isConfigured, CACHE_TTL_SECONDS } from '@/lib/env';
import { slugify } from '@/lib/merch/catalog';

/** Standard apparel sizes used to expand a sample product's variants. */
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
 * Bundled sample Tapstitch catalog (used when live credentials are absent).
 * Mirrors the real Apex & Chill items sourced by the Scout. Images use bundled
 * brand art as placeholders until the live Tapstitch feed supplies photos.
 */
const SAMPLE_TAPSTITCH: Product[] = [
  {
    id: 'tapstitch:neon-desk-mat',
    handle: 'neon-desk-mat',
    title: 'Neon Circuit Desk Mat',
    description:
      'Oversized neon desk mat with the Apex & Chill circuit artwork. Smooth surface, stitched edges — built for sim rig setups.',
    provider: 'sample',
    images: ['/brand/banner.png'],
    priceFrom: 25.99,
    currency: 'GBP',
    category: 'Accessories',
    tags: ['accessories', 'desk'],
    variants: [{ id: 'tapstitch:neon-desk-mat-xl', name: 'XL (900×400mm)', price: 25.99, available: true }],
  },
  {
    id: 'tapstitch:tough-phone-case',
    handle: 'tough-phone-case',
    title: 'Tough Phone Case',
    description:
      'Impact-resistant phone case in the Apex & Chill livery. Dual-layer protection with a matte neon finish.',
    provider: 'sample',
    images: ['/brand/standings.png'],
    priceFrom: 24.13,
    currency: 'GBP',
    category: 'Accessories',
    tags: ['accessories', 'phone'],
    variants: [
      { id: 'tapstitch:tough-phone-case-15', name: 'iPhone 15 / Pro', price: 24.13, available: true },
      { id: 'tapstitch:tough-phone-case-14', name: 'iPhone 14 / Pro', price: 24.13, available: true },
      { id: 'tapstitch:tough-phone-case-s24', name: 'Samsung S24', price: 24.13, available: true },
    ],
  },
  {
    id: 'tapstitch:sunfade-tee',
    handle: 'sunfade-tee',
    title: 'Sunfade Racing Tee',
    description:
      'Soft cotton tee with a sunfade neon print. Relaxed fit — race day or rest day.',
    provider: 'sample',
    images: ['/brand/replays.png'],
    priceFrom: 25.92,
    currency: 'GBP',
    category: 'Apparel',
    tags: ['apparel', 'tee'],
    variants: apparelVariants('tapstitch:sunfade-tee', 25.92),
  },
];

/** GET against the Tapstitch API. @throws on a non-ok response. */
async function tapstitchGet<T>(path: string): Promise<T> {
  const url = `${cfg.baseUrl.replace(/\/$/, '')}${path}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${cfg.apiKey}`,
      Accept: 'application/json',
    },
    next: { revalidate: CACHE_TTL_SECONDS },
  });
  if (!res.ok) throw new Error(`Tapstitch ${path} responded ${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}

/** Defensively normalise a raw Tapstitch product into a {@link Product}. */
function normaliseProduct(raw: Record<string, unknown>): Product {
  const str = (v: unknown, fb = ''): string => (typeof v === 'string' ? v : fb);
  const num = (v: unknown, fb = 0): number =>
    typeof v === 'number' ? v : typeof v === 'string' ? Number(v) || fb : fb;

  const id = str(raw.id ?? raw.product_id, crypto.randomUUID());
  const title = str(raw.title ?? raw.name, 'Untitled product');
  const rawVariants = Array.isArray(raw.variants) ? (raw.variants as Record<string, unknown>[]) : [];
  const variants: ProductVariant[] = rawVariants.map((v, i) => ({
    id: `tapstitch:${id}:${str(v.id, String(i))}`,
    name: str(v.title ?? v.name, `Variant ${i + 1}`),
    size: str(v.size) || undefined,
    color: str(v.color) || undefined,
    price: num(v.price ?? v.retail_price),
    available: v.available !== false,
    image: str(v.image) || undefined,
  }));
  const priceFrom = variants.length ? Math.min(...variants.map((v) => v.price)) : num(raw.price);
  const images = Array.isArray(raw.images)
    ? (raw.images as unknown[]).map((i) => String(i))
    : [str(raw.image ?? raw.thumbnail, '/brand/banner.png')];

  return {
    id: `tapstitch:${id}`,
    handle: slugify(title),
    title,
    description: str(raw.description),
    provider: 'tapstitch',
    images,
    priceFrom,
    currency: 'GBP',
    category: str(raw.category ?? raw.type, 'Apparel'),
    tags: Array.isArray(raw.tags) ? (raw.tags as unknown[]).map((t) => String(t)) : [],
    variants,
  };
}

/** The sample fallback result (shared by success + error paths). */
function sample(error: string | null): ApiResult<Product[]> {
  return { ok: true, source: 'sample', error, data: SAMPLE_TAPSTITCH };
}

/**
 * Fetch the Tapstitch product catalog.
 *
 * @returns Live products when configured, otherwise the sample catalog. Never
 *          throws.
 */
export async function fetchTapstitchProducts(): Promise<ApiResult<Product[]>> {
  if (!isConfigured('tapstitch')) {
    return sample('Tapstitch not configured — showing sample catalog.');
  }
  try {
    const storePath = cfg.storeId ? `/stores/${cfg.storeId}/products` : '/products';
    const raw = await tapstitchGet<{ products?: Record<string, unknown>[] }>(storePath);
    const list = Array.isArray(raw.products) ? raw.products : [];
    if (list.length === 0) return sample('Tapstitch returned no products — showing sample catalog.');
    return { ok: true, source: 'tapstitch', error: null, data: list.map(normaliseProduct) };
  } catch (err) {
    return sample(
      `Tapstitch request failed (${err instanceof Error ? err.message : 'unknown error'}) — showing sample catalog.`,
    );
  }
}
