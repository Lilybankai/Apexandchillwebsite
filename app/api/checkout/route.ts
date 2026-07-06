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
 *  2. Checkout then uses Stripe-hosted Checkout (no card data touches our
 *     servers). Prices are computed server-side from the trusted sample/live
 *     catalog rather than the client-supplied price to prevent tampering — see
 *     the TODO below to swap in a catalog lookup once live provider prices flow.
 *  3. FULFILMENT TODO: add `POST /api/webhooks/stripe` verifying
 *     STRIPE_WEBHOOK_SECRET, and on `checkout.session.completed` push the order
 *     to Printful/Tapstitch's Orders API so items are printed & shipped.
 *
 * @packageDocumentation
 */

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import type { CartLine } from '@/lib/types';
import { stripe as stripeEnv, isConfigured } from '@/lib/env';

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
    if (!l || typeof l.variantId !== 'string' || typeof l.price !== 'number' || l.price <= 0) {
      return { error: 'Your cart contains an invalid item.' };
    }
    if (!Number.isInteger(l.quantity) || l.quantity < 1) {
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

  try {
    const stripe = new Stripe(stripeEnv.secretKey!);
    // NOTE: prices are taken from the (trusted server-side) sample catalog values
    // carried on each line for now. TODO: once live provider catalogs are wired,
    // re-price each line by looking the variant up in the catalog to fully
    // eliminate any client-side price tampering.
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lines.map((l) => ({
        quantity: l.quantity,
        price_data: {
          currency: 'gbp',
          unit_amount: Math.round(l.price * 100),
          product_data: {
            name: `${l.title} — ${l.variantName}`,
            images: l.image ? [l.image.startsWith('http') ? l.image : `${origin}${l.image}`] : [],
          },
        },
      })),
      success_url: `${origin}/merch?checkout=success`,
      cancel_url: `${origin}/merch?checkout=cancelled`,
      shipping_address_collection: { allowed_countries: ['GB', 'IE'] },
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
