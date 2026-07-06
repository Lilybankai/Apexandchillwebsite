/**
 * `POST /api/webhooks/stripe` — Stripe webhook receiver + fulfilment.
 *
 * Stripe calls this endpoint after a payment. We verify the signature with
 * `STRIPE_WEBHOOK_SECRET`, and on `checkout.session.completed` push the paid
 * order to the print-on-demand provider (currently Printify) so the items are
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
 *  3. Printify orders are created but NOT sent to production by default (review
 *     + send from the Printify dashboard). Set `PRINTIFY_AUTO_CONFIRM=true` to
 *     fulfil automatically. Tapstitch items are logged for manual fulfilment
 *     until a Tapstitch Orders client is added.
 *
 * ── RELIABILITY NOTES ────────────────────────────────────────────────────────
 *  - The raw request body is read verbatim for signature verification (do NOT
 *    parse it first — that would break the signature).
 *  - We pass the Stripe session id as Printify's `external_id`, so a webhook
 *    that Stripe retries won't create duplicate Printify orders.
 *  - Fulfilment failures are logged and still return 200 (the payment already
 *    succeeded); watch server logs / the Printify dashboard. A durable
 *    persist-and-retry queue is a future enhancement.
 *
 * @packageDocumentation
 */

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe as stripeEnv, isConfigured } from '@/lib/env';
import { decodeCartMetadata } from '@/lib/merch/cart-metadata';
import { loadVariantIndex } from '@/lib/merch/store';
import {
  recordOrder,
  attachPrintifyResult,
  type MerchOrder,
  type MerchOrderLine,
  type OrderShipping,
} from '@/lib/merch/orders';
import { sendOrderNotification } from '@/lib/merch/order-email';
import {
  createPrintifyOrder,
  type PrintifyOrderItem,
  type PrintifyRecipient,
} from '@/lib/merch/printify';

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

const PRINTIFY_PREFIX = 'printify:';

/** Pull the shipping details off a session across Stripe API-version shapes. */
function shippingOf(session: Stripe.Checkout.Session): ShippingLike | null {
  const s = session as unknown as {
    shipping_details?: ShippingLike | null;
    collected_information?: { shipping_details?: ShippingLike | null } | null;
  };
  return s.shipping_details ?? s.collected_information?.shipping_details ?? null;
}

/** Split a full name into first / last for Printify's `address_to`. */
function splitName(name: string | undefined): { first_name?: string; last_name?: string } {
  const trimmed = (name ?? '').trim();
  if (!trimmed) return {};
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return { first_name: parts[0] };
  return { first_name: parts.slice(0, -1).join(' '), last_name: parts[parts.length - 1] };
}

/** Build a Printify recipient from a completed Checkout Session. */
function recipientOf(session: Stripe.Checkout.Session): PrintifyRecipient {
  const shipping = shippingOf(session);
  const customer = session.customer_details;
  return {
    ...splitName(shipping?.name ?? customer?.name ?? undefined),
    email: customer?.email ?? undefined,
    phone: customer?.phone ?? undefined,
    country: shipping?.address?.country ?? undefined,
    region: shipping?.address?.state ?? undefined,
    address1: shipping?.address?.line1 ?? undefined,
    address2: shipping?.address?.line2 ?? undefined,
    city: shipping?.address?.city ?? undefined,
    zip: shipping?.address?.postal_code ?? undefined,
  };
}

/** Normalise the session shipping into the persisted order-record shape. */
function orderShippingOf(session: Stripe.Checkout.Session): OrderShipping | null {
  const shipping = shippingOf(session);
  const customer = session.customer_details;
  const name = shipping?.name ?? customer?.name ?? undefined;
  const addr = shipping?.address;
  if (!name && !addr) return null;
  return {
    name: name ?? undefined,
    address1: addr?.line1 ?? undefined,
    address2: addr?.line2 ?? undefined,
    city: addr?.city ?? undefined,
    state: addr?.state ?? undefined,
    postalCode: addr?.postal_code ?? undefined,
    country: addr?.country ?? undefined,
  };
}

/**
 * Parse a checkout variant id into a Printify order line. Our ids are
 * `printify:<product_id>:<variant_id>` (the variant id is numeric). Returns null
 * for sample/malformed ids so they route to manual fulfilment instead.
 */
function parsePrintifyItem(variantId: string, quantity: number): PrintifyOrderItem | null {
  if (!variantId.startsWith(PRINTIFY_PREFIX)) return null;
  const rest = variantId.slice(PRINTIFY_PREFIX.length);
  const sep = rest.lastIndexOf(':');
  if (sep <= 0) return null; // no product/variant split (e.g. a sample id)
  const productId = rest.slice(0, sep);
  const variant = Number(rest.slice(sep + 1));
  if (!productId || !Number.isInteger(variant) || variant <= 0) return null;
  return { product_id: productId, variant_id: variant, quantity };
}

/**
 * Fulfil a paid session: record the order, email the operator, then auto-push
 * any Printify items. Tapstitch items are flagged for manual fulfilment.
 */
async function fulfilSession(session: Stripe.Checkout.Session): Promise<void> {
  const cart = decodeCartMetadata(session.metadata);
  if (cart.length === 0) {
    console.warn(`[stripe-webhook] session ${session.id} had no decodable cart metadata; nothing to fulfil.`);
    return;
  }

  // Enrich each cart line with trusted product/variant detail from the catalog,
  // and split into auto-fulfillable Printify items vs. manual (Tapstitch) items.
  const index = await loadVariantIndex();
  const lines: MerchOrderLine[] = [];
  const printifyItems: PrintifyOrderItem[] = [];
  let needsManualFulfilment = false;

  for (const line of cart) {
    const entry = index.get(line.variantId);
    lines.push({
      variantId: line.variantId,
      quantity: line.quantity,
      title: entry?.product.title ?? line.variantId,
      variantName: entry?.variant.name ?? '—',
      unitPrice: entry?.variant.price ?? 0,
      provider: entry?.product.provider ?? 'sample',
    });

    const item = parsePrintifyItem(line.variantId, line.quantity);
    if (item) {
      printifyItems.push(item);
    } else {
      // Tapstitch (and sample) ids have no Orders API — needs manual fulfilment.
      needsManualFulfilment = true;
    }
  }

  // 1) Persist the order (idempotent on the Stripe session id). Only the FIRST
  //    delivery of a given session proceeds to email + fulfilment; a Stripe retry
  //    finds the row already present and short-circuits.
  const amountTotalPence =
    typeof session.amount_total === 'number'
      ? session.amount_total
      : lines.reduce((sum, l) => sum + Math.round(l.unitPrice * 100) * l.quantity, 0);
  const shipping = orderShippingOf(session);
  const currency = (session.currency ?? 'gbp').toUpperCase();
  const email = session.customer_details?.email ?? undefined;
  const customerName = session.customer_details?.name ?? undefined;

  const record = await recordOrder({
    stripeSessionId: session.id,
    email,
    customerName,
    amountTotalPence,
    currency,
    shipping,
    lines,
    needsManualFulfilment,
  });

  if (!record.ok) {
    console.error(`[stripe-webhook] failed to persist order for session ${session.id}: ${record.error}`);
  }
  if (!record.created) {
    console.info(`[stripe-webhook] session ${session.id} already recorded; skipping email + fulfilment.`);
    return;
  }

  // 2) Email the operator (best-effort; never blocks fulfilment).
  const orderForEmail: MerchOrder = {
    id: '',
    stripeSessionId: session.id,
    email,
    customerName,
    amountTotalPence,
    currency,
    shipping,
    lines,
    needsManualFulfilment,
    status: 'new',
    printifyOrderId: null,
    printifyStatus: null,
    notes: null,
    createdAt: new Date().toISOString(),
    fulfilledAt: null,
  };
  await sendOrderNotification(orderForEmail);

  // 3) Auto-push any Printify items, then record the result on the order row.
  if (printifyItems.length > 0) {
    if (!isConfigured('printify')) {
      console.warn(
        `[stripe-webhook] session ${session.id} has ${printifyItems.length} Printify item(s) but PRINTIFY_API_KEY / PRINTIFY_SHOP_ID are unset — cannot fulfil.`,
      );
    } else {
      const result = await createPrintifyOrder(recipientOf(session), printifyItems, {
        externalId: session.id,
      });
      if (result.ok) {
        console.info(
          `[stripe-webhook] Printify order ${result.id} (${result.status ?? 'created'}) for session ${session.id}.`,
        );
        await attachPrintifyResult(session.id, { id: result.id, status: result.status });
      } else {
        console.error(`[stripe-webhook] Printify order FAILED for session ${session.id}: ${result.error}`);
      }
    }
  }

  if (needsManualFulfilment) {
    console.warn(`[stripe-webhook] session ${session.id} needs MANUAL (Tapstitch) fulfilment — see /admin.`);
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
    // retries for a fulfilment-side error. Watch logs / the Printify dashboard.
    const message = err instanceof Error ? err.message : 'unknown error';
    console.error(`[stripe-webhook] handler error for ${event.type} (${event.id}): ${message}`);
  }

  return NextResponse.json({ received: true });
}
