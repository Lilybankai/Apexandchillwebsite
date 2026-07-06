/**
 * `GET /api/merch/products` — the unified merch catalog.
 *
 * Merges the Tapstitch and Printful product feeds into a single, deduped list
 * (by product handle) and reports where each provider's slice came from so the
 * UI can flag sample-vs-live. Never throws — each provider degrades to its
 * sample catalog independently.
 *
 * @packageDocumentation
 */

import { NextResponse } from 'next/server';
import type { MerchFeed } from '@/lib/types';
import { fetchTapstitchProducts } from '@/lib/merch/tapstitch';
import { fetchPrintfulProducts } from '@/lib/merch/printful';
import { mergeCatalogs } from '@/lib/merch/catalog';
import { CACHE_TTL_SECONDS } from '@/lib/env';

/**
 * Revalidate every 5 minutes. Next.js requires `revalidate` to be a STATIC
 * literal — it cannot reference {@link CACHE_TTL_SECONDS} — so keep them in sync.
 */
export const revalidate = 300;

/** Handle GET requests for the merged merch catalog. */
export async function GET(): Promise<NextResponse<MerchFeed>> {
  const [tapstitch, printful] = await Promise.all([
    fetchTapstitchProducts(),
    fetchPrintfulProducts(),
  ]);

  const products = mergeCatalogs(tapstitch.data, printful.data);
  const errors = [tapstitch.error, printful.error].filter(Boolean);

  const body: MerchFeed = {
    ok: products.length > 0,
    products,
    providers: { tapstitch: tapstitch.source, printful: printful.source },
    error: errors.length ? errors.join(' ') : null,
  };

  return NextResponse.json(body, {
    headers: {
      'Cache-Control': `s-maxage=${CACHE_TTL_SECONDS}, stale-while-revalidate=${CACHE_TTL_SECONDS * 2}`,
    },
  });
}
