'use client';

/**
 * Client-side shopping cart, persisted to `localStorage`.
 *
 * The cart is a small, framework-light store: mutations write to `localStorage`
 * and broadcast a custom event so every mounted {@link useCart} subscriber
 * re-reads in sync (including across tabs via the native `storage` event).
 *
 * This module is client-only (`'use client'`). Pure, server-safe helpers such
 * as `slugify` and `mergeCatalogs` live in `catalog.ts` instead, so server code
 * (the POD clients, the products route, the merch pages) never pulls in this
 * module's browser/React dependencies.
 *
 * @packageDocumentation
 */

import { useCallback, useEffect, useState } from 'react';
import type { CartLine, Product, ProductVariant } from '@/lib/types';

const STORAGE_KEY = 'apexchill.cart.v1';
/** Fired on the window whenever the cart changes, so subscribers refresh. */
const CART_EVENT = 'apexchill:cart';

/** Total number of items in the cart (sum of quantities). */
export function cartCount(lines: CartLine[]): number {
  return lines.reduce((n, l) => n + l.quantity, 0);
}

/** Cart subtotal in GBP. */
export function cartTotal(lines: CartLine[]): number {
  return Math.round(lines.reduce((sum, l) => sum + l.price * l.quantity, 0) * 100) / 100;
}

/** Format a GBP amount, e.g. `25.9` → `£25.90`. */
export function formatGBP(amount: number): string {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
}

/** Read the cart from `localStorage` (returns `[]` on the server or if empty/corrupt). */
export function readCart(): CartLine[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Persist the cart and notify subscribers. No-op on the server. */
function writeCart(lines: CartLine[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  window.dispatchEvent(new CustomEvent(CART_EVENT));
}

/**
 * Add a product variant to the cart (or increment its quantity if already
 * present). Returns the updated cart.
 */
export function addToCart(product: Product, variant: ProductVariant, quantity = 1): CartLine[] {
  const lines = readCart();
  const existing = lines.find((l) => l.variantId === variant.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    lines.push({
      productId: product.id,
      variantId: variant.id,
      title: product.title,
      variantName: variant.name,
      handle: product.handle,
      price: variant.price,
      quantity,
      image: variant.image ?? product.images[0],
    });
  }
  writeCart(lines);
  return lines;
}

/** Set the quantity of a line (removing it when quantity <= 0). Returns the cart. */
export function setQuantity(variantId: string, quantity: number): CartLine[] {
  let lines = readCart();
  if (quantity <= 0) {
    lines = lines.filter((l) => l.variantId !== variantId);
  } else {
    const line = lines.find((l) => l.variantId === variantId);
    if (line) line.quantity = quantity;
  }
  writeCart(lines);
  return lines;
}

/** Remove a line from the cart. Returns the updated cart. */
export function removeFromCart(variantId: string): CartLine[] {
  const lines = readCart().filter((l) => l.variantId !== variantId);
  writeCart(lines);
  return lines;
}

/** Empty the cart. */
export function clearCart(): void {
  writeCart([]);
}

/**
 * React hook exposing the reactive cart plus mutators. Re-renders whenever the
 * cart changes in this tab or another (via the custom + native storage events).
 *
 * @returns The current lines, derived totals, and mutation helpers.
 */
export function useCart() {
  const [lines, setLines] = useState<CartLine[]>([]);
  // Hydrate after mount to avoid SSR/client markup mismatch.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const sync = () => setLines(readCart());
    sync();
    setHydrated(true);
    window.addEventListener(CART_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CART_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const add = useCallback((product: Product, variant: ProductVariant, qty = 1) => {
    setLines(addToCart(product, variant, qty));
  }, []);
  const update = useCallback((variantId: string, qty: number) => {
    setLines(setQuantity(variantId, qty));
  }, []);
  const remove = useCallback((variantId: string) => {
    setLines(removeFromCart(variantId));
  }, []);
  const clear = useCallback(() => {
    clearCart();
    setLines([]);
  }, []);

  return {
    lines,
    hydrated,
    count: cartCount(lines),
    total: cartTotal(lines),
    add,
    update,
    remove,
    clear,
  };
}
