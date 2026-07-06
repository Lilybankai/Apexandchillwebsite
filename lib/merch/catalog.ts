/**
 * Pure, framework-agnostic merch catalog helpers.
 *
 * This module intentionally has NO React and NO browser dependencies, so it is
 * safe to import from server code (the POD provider clients, the products route,
 * and the merch pages). Client-only cart state lives in `cart.ts`.
 *
 * @packageDocumentation
 */

import type { Product } from '@/lib/types';

/**
 * Convert a title to a URL-safe slug, e.g. `Sunfade Racing Tee` →
 * `sunfade-racing-tee`. Used by the POD clients so product handles are stable.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/**
 * Merge provider catalogs into one list, de-duplicating by product handle
 * (first occurrence wins) so a product listed by both providers appears once.
 */
export function mergeCatalogs(...lists: Product[][]): Product[] {
  const byHandle = new Map<string, Product>();
  for (const list of lists) {
    for (const product of list) {
      if (!byHandle.has(product.handle)) byHandle.set(product.handle, product);
    }
  }
  return [...byHandle.values()];
}
