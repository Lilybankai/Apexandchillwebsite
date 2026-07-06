/**
 * `POST /api/webhooks/stripe` — Stripe webhook receiver + fulfilment.
 *
 * Stripe calls this endpoint after a payment. We verify the signature with
 * `STRIPE_WEBHOOK_SECRET`, and on `checkout.session.completed` push the paid
 * order to the print-on-demand provider (currently Printful) so the items are
 * printed & shipped.
 *
 * ── OPERATOR: GOING LIVE ─────────────────────────────────────────────────────
 *  1. Deploy the site, then in the Stripe Dashboard → Developers → Webhooks add
 *     an endpoint pointing at your production URL:
 *
 *         https://<your-domain>/api/webhooks/stripe
 *
 *     (Use the FINAL canonical host — if the site redirects to `www.`, point
 *     Stripe at the `www.` URL; Stripe does not follow redirects.)
 *  2. Subscribe it to the `checkout.session.completed` event and copy the
 *     signing secret (`whsec_…`) into `.env.local` as STRIPE_WEBHOOK_SECRET.
 *  3. Printful orders are created as **drafts** by default (review + confirm in
 *     the Printful dashboard). Set `PRINTFUL_AUTO_CONFIRM=true` to fulfil
 *     automatically. Tapstitch items are logged for manual fulfilment until a
 *     Tapstitch Orders client is added.
 *
 * ── RELIABILITY NOTES ────────────────────────────────────────────────────────
 *  - The raw request body is read verbatim for signature verification (do NOT
 *    parse it first — that would break the signature).
 *  - We pass the Stripe session id as Printful's `external_id`, so a webhook
 *    that Stripe retries won't create duplicate Printful orders.
 *  - Fulfilment failures are logged and still return 200 (the payment already
 *    succeeded); watch server logs / the Printful dashboard. A durable
 *    persist-and-retry queue is a future enhancement.
 *
 * @packageDocumentation
 */

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe as stripeEnv, isConfigured } from '@/lib/env';
import { decodeCartMetadata } from '@/lib/merch/cart-metadata';
import {
  createPrintfulOrder,
  type PrintfulOrderItem,
  type PrintfulRecipient,
} from '@/lib/merch/printful';

// Stripe signature verification needs the Node runtime (crypto) and the raw,
// unbuffered body — never the Edge runtime or a cached/static response.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Loose shape of the shipping block, tolerant to Stripe API-version drift. */
interface ShippingLike {
  name?: string | null;
  address?: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    country?: string | null;
  } | null;
}

const PRINTFUL_PREFIX = 'printful:';

/** Pull the shipping details off a session across Stripe API-version shapes. */
function shippingOf(session: Stripe.Checkout.Session): ShippingLike | null {
  const s = session as unknown as {
    shipping_details?: ShippingLike | null;
    collected_information?: { shipping_details?: ShippingLike | null } | null;
  };
  return s.shipping_details ?? s.collected_information?.shipping_details ?? null;
}

/** Build a Printful recipient from a completed Checkout Session. */
function recipientOf(session: Stripe.Checkout.Session): PrintfulRecipient {
  const shipping = shippingOf(session);
  const customer = session.customer_details;
  return {
    name: shipping?.name ?? customer?.name ?? undefined,
    address1: shipping?.address?.line1 ?? undefined,
    address2: shipping?.address?.line2 ?? undefined,
    city: shipping?.address?.city ?? undefined,
    state_code: shipping?.address?.state ?? undefined,
    country_code: shipping?.address?.country ?? undefined,
    zip: shipping?.address?.postal_code ?? undefined,
    email: customer?.email ?? undefined,
    phone: customer?.phone ?? undefined,
  };
}

/** Fulfil a paid session by routing its variants to the right provider(s). */
async function fulfilSession(session: Stripe.Checkout.Session): Promise<void> {
  const cart = decodeCartMetadata(session.metadata);
  if (cart.length === 0) {
    console.warn(`[stripe-webhook] session ${session.id} had no decodable cart metadata; nothing to fulfil.`);
    return;
  }

  const printfulItems: PrintfulOrderItem[] = [];
  const unfulfilled: string[] = [];

  for (const line of cart) {
    if (line.variantId.startsWith(PRINTFUL_PREFIX)) {
      const syncVariantId = Number(line.variantId.slice(PRINTFUL_PREFIX.length));
      if (Number.isInteger(syncVariantId) && syncVariantId > 0) {
        printfulItems.push({ sync_variant_id: syncVariantId, quantity: line.quantity });
        continue;
      }
    }
    // Tapstitch items, or non-numeric (sample) Printful ids, have no Orders
    // client yet — surface them for manual fulfilment rather than dropping them.
    unfulfilled.push(`${line.variantId} ×${line.quantity}`);
  }

  if (printfulItems.length > 0) {
    if (!isConfigured('printful')) {
      console.warn(
        `[stripe-webhook] session ${session.id} has ${printfulItems.length} Printful item(s) but PRINTFUL_API_KEY is unset — cannot fulfil.`,
      );
    } else {
      const result = await createPrintfulOrder(recipientOf(session), printfulItems, {
        externalId: session.id,
      });
      if (result.ok) {
        console.info(
          `[stripe-webhook] Printful order ${result.id} (${result.status ?? 'created'}) for session ${session.id}.`,
        );
      } else {
        console.error(`[stripe-webhook] Printful order FAILED for session ${session.id}: ${result.error}`);
      }
    }
  }

  if (unfulfilled.length > 0) {
    console.warn(
      `[stripe-webhook] session ${session.id} needs MANUAL fulfilment for: ${unfulfilled.join(', ')}.`,
    );
  }
}

/**
 * Receive and verify a Stripe webhook, then fulfil completed checkouts.
 *
 * @param request - The raw incoming Stripe webhook request.
 */
export async function POST(request: Request): Promise<NextResponse> {
  if (!isConfigured('stripe') || !stripeEnv.webhookSecret) {
    // Misconfiguration, not a bad request — 500 so Stripe retries after setup.
    console.error('[stripe-webhook] STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET not configured.');
    return NextResponse.json({ error: 'Webhook not configured.' }, { status: 500 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 400 });
  }

  // The RAW body — parsing it first would invalidate the signature.
  const payload = await request.text();

  const stripe = new Stripe(stripeEnv.secretKey!);
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(payload, signature, stripeEnv.webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    console.error(`[stripe-webhook] signature verification failed: ${message}`);
    return NextResponse.json({ error: `Signature verification failed: ${message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await fulfilSession(event.data.object);
        break;
      default:
        // Unhandled event types are acknowledged so Stripe stops retrying them.
        break;
    }
  } catch (err) {
    // The payment already succeeded; log and still 200 so Stripe doesn't hammer
    // retries for a fulfilment-side error. Watch logs / the Printful dashboard.
    const message = err instanceof Error ? err.message : 'unknown error';
    console.error(`[stripe-webhook] handler error for ${event.type} (${event.id}): ${message}`);
  }

  return NextResponse.json({ received: true });
}
