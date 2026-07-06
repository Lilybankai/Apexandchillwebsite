/**
 * Server-side merch catalog helpers shared by checkout and fulfilment.
 *
 * Loads the merged provider catalog (manual Tapstitch + live Printify) and builds
 * a trusted `variantId -> {product, variant}` index. Both the checkout route
 * (server-side re-pricing) and the Stripe webhook (enriching an order with real
 * titles/prices) use this so there is ONE source of truth for what a variant is
 * and costs — the client is never trusted for either.
 *
 * Server-only: importing this pulls in the provider clients' `fetch` calls, so
 * never import it from client (`'use client'`) code.
 *
 * @packageDocumentation
 */

import type { Product, ProductVariant } from '@/lib/types';
import { fetchTapstitchProducts } from '@/lib/merch/tapstitch';
import { fetchPrintifyProducts } from '@/lib/merch/printify';
import { mergeCatalogs } from '@/lib/merch/catalog';

/** A trusted, server-side view of a variant plus its parent product. */
export interface CatalogEntry {
  product: Product;
  variant: ProductVariant;
}

/** Fetch + merge every provider catalog into one product list. */
export async function loadMergedCatalog(): Promise<Product[]> {
  const [tapstitch, printify] = await Promise.all([
    fetchTapstitchProducts(),
    fetchPrintifyProducts(),
  ]);
  return mergeCatalogs(tapstitch.data, printify.data);
}

/**
 * Build a `variantId -> {product, variant}` index from a product list, so
 * downstream code can resolve a bought variant to its trusted product + price.
 */
export function buildVariantIndex(catalog: Product[]): Map<string, CatalogEntry> {
  const index = new Map<string, CatalogEntry>();
  for (const product of catalog) {
    for (const variant of product.variants) {
      index.set(variant.id, { product, variant });
    }
  }
  return index;
}

/** Convenience: load the merged catalog and return its variant index. */
export async function loadVariantIndex(): Promise<Map<string, CatalogEntry>> {
  return buildVariantIndex(await loadMergedCatalog());
}
