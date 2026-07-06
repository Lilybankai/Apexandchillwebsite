/**
 * `POST /api/checkout` — create a checkout session for the current cart.
 *
 * Body: `{ lines: CartLine[] }`. When Stripe is configured it creates a Stripe
 * Checkout Session and returns its hosted URL; otherwise it returns HTTP 503
 * with guidance so the store degrades gracefully before keys are supplied.
 *
 * ── OPERATOR: GOING LIVE ─────────────────────────────────────────────────────
 *  1. Put your Stripe keys in `.env.local`: STRIPE_SECRET_KEY (server),
 *     NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (client), STRIPE_WEBHOOK_SECRET.
 *  2. Checkout uses Stripe-hosted Checkout (no card data touches our servers).
 *     Every line's price/title is re-derived SERVER-SIDE from the merged catalog
 *     ({@link loadVariantIndex}); the client-supplied price is ignored entirely,
 *     so the browser cannot tamper with what it pays. Only the quantity is taken
 *     from the client (and validated).
 *  3. FULFILMENT: on payment, `POST /api/webhooks/stripe` verifies
 *     STRIPE_WEBHOOK_SECRET and, on `checkout.session.completed`, pushes the
 *     order to Printify's Orders API. So the webhook knows which variants were
 *     bought, we stash the trusted cart (variant id + quantity) in the session
 *     `metadata` here via {@link encodeCartMetadata}.
 *
 * @packageDocumentation
 */

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import type { CartLine } from '@/lib/types';
import { stripe as stripeEnv, isConfigured } from '@/lib/env';
import { loadVariantIndex } from '@/lib/merch/store';
import { encodeCartMetadata } from '@/lib/merch/cart-metadata';

interface CheckoutResponse {
  ok: boolean;
  /** Stripe-hosted Checkout URL to redirect the browser to, when created. */
  url?: string;
  error: string | null;
}

/** Validate the posted cart lines. */
function validateLines(body: unknown): { lines?: CartLine[]; error?: string } {
  if (!body || typeof body !== 'object') return { error: 'Invalid request body.' };
  const lines = (body as { lines?: unknown }).lines;
  if (!Array.isArray(lines) || lines.length === 0) return { error: 'Your cart is empty.' };
  for (const l of lines as CartLine[]) {
    // Only variantId + quantity are trusted; price/title are re-derived
    // server-side from the catalog, so they aren't validated here.
    if (!l || typeof l.variantId !== 'string' || l.variantId.length === 0) {
      return { error: 'Your cart contains an invalid item.' };
    }
    if (!Number.isInteger(l.quantity) || l.quantity < 1 || l.quantity > 99) {
      return { error: 'Your cart contains an invalid quantity.' };
    }
  }
  return { lines: lines as CartLine[] };
}

/** Resolve the site origin for absolute success/cancel/image URLs. */
function originOf(request: Request): string {
  return request.headers.get('origin') ?? new URL(request.url).origin;
}

/**
 * Handle POST requests to start checkout.
 *
 * @param request - The incoming request carrying `{ lines: CartLine[] }`.
 */
export async function POST(request: Request): Promise<NextResponse<CheckoutResponse>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Malformed JSON body.' }, { status: 400 });
  }

  const { lines, error } = validateLines(body);
  if (!lines) {
    return NextResponse.json({ ok: false, error: error ?? 'Invalid cart.' }, { status: 400 });
  }

  if (!isConfigured('stripe')) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'Checkout isn’t connected yet. Add your Stripe keys (STRIPE_SECRET_KEY) to enable card payments — until then, contact us on Discord to order.',
      },
      { status: 503 },
    );
  }

  const origin = originOf(request);

  // Re-price every line from the trusted server-side catalog. The client-supplied
  // price/title are IGNORED — only the quantity is honoured — so a crafted POST
  // cannot buy an item for an arbitrary amount (price-tampering prevention).
  const index = await loadVariantIndex();
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  for (const l of lines) {
    const entry = index.get(l.variantId);
    if (!entry) {
      // Unknown variant id — a bad/stale request.
      return NextResponse.json(
        { ok: false, error: 'An item in your cart is no longer available. Please refresh and try again.' },
        { status: 400 },
      );
    }
    if (!entry.variant.available) {
      // Known but out of stock — a state conflict.
      return NextResponse.json(
        { ok: false, error: `“${entry.product.title}” is out of stock. Please remove it and try again.` },
        { status: 409 },
      );
    }
    const { product, variant } = entry;
    const image = variant.image ?? product.images[0];
    lineItems.push({
      quantity: l.quantity,
      price_data: {
        currency: 'gbp',
        unit_amount: Math.round(variant.price * 100), // trusted server price
        product_data: {
          name: `${product.title} — ${variant.name}`,
          images: image ? [image.startsWith('http') ? image : `${origin}${image}`] : [],
        },
      },
    });
  }

  try {
    const stripe = new Stripe(stripeEnv.secretKey!);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${origin}/merch?checkout=success`,
      cancel_url: `${origin}/merch?checkout=cancelled`,
      shipping_address_collection: { allowed_countries: ['GB', 'IE'] },
      // Stash the trusted variant ids + quantities so the webhook
      // (POST /api/webhooks/stripe) can push the order to the POD provider.
      metadata: encodeCartMetadata(lines),
    });

    return NextResponse.json({ ok: true, url: session.url ?? undefined, error: null });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: `Could not start checkout (${err instanceof Error ? err.message : 'unknown error'}). Please try again.`,
      },
      { status: 500 },
    );
  }
}
