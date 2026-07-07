/**
 * Merch order persistence (Supabase `merch_orders`).
 *
 * The Stripe webhook records every completed checkout here; the /admin dashboard
 * reads and updates them. All access uses the service-role client (bypasses RLS)
 * — never call these from the browser.
 *
 * Every function degrades gracefully: when Supabase isn't configured the writes
 * no-op (returning `{ ok: false }`) and reads return `[]`, so a missing database
 * can never crash the payment webhook.
 *
 * @packageDocumentation
 */

import type { MerchProvider } from '@/lib/types';
import { getSupabaseAdminClient } from '@/lib/supabase';

/** A shipping address, normalised from the Stripe session. */
export interface OrderShipping {
  name?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

/** One line of a persisted order (enriched from the trusted catalog). */
export interface MerchOrderLine {
  variantId: string;
  quantity: number;
  /** Parent product title. */
  title: string;
  /** Variant label, e.g. `M` or `iPhone 15`. */
  variantName: string;
  /** Trusted unit price in GBP. */
  unitPrice: number;
  /** Which provider fulfils this line. */
  provider: MerchProvider;
  /** Buyer personalisation value (e.g. their chosen number), when present. */
  custom?: string;
}

/** Input to {@link recordOrder} — the webhook's view of a paid checkout. */
export interface MerchOrderInput {
  stripeSessionId: string;
  email?: string;
  customerName?: string;
  /** Total charged, in integer pence. */
  amountTotalPence: number;
  currency: string;
  shipping: OrderShipping | null;
  lines: MerchOrderLine[];
  /** True when any line needs manual (e.g. Tapstitch) fulfilment. */
  needsManualFulfilment: boolean;
}

/** A persisted order row as read back for the admin dashboard. */
export interface MerchOrder extends MerchOrderInput {
  id: string;
  status: 'new' | 'fulfilled';
  printifyOrderId: string | null;
  printifyStatus: string | null;
  notes: string | null;
  createdAt: string;
  fulfilledAt: string | null;
}

/** Result of a write. `created` is false when the row already existed. */
export interface RecordOrderResult {
  ok: boolean;
  created: boolean;
  error: string | null;
}

/** Map a DB row (snake_case) to the {@link MerchOrder} shape (camelCase). */
function fromRow(row: Record<string, unknown>): MerchOrder {
  return {
    id: String(row.id),
    stripeSessionId: String(row.stripe_session_id),
    email: (row.email as string) ?? undefined,
    customerName: (row.customer_name as string) ?? undefined,
    amountTotalPence: Number(row.amount_total_pence ?? 0),
    currency: (row.currency as string) ?? 'GBP',
    shipping: (row.shipping as OrderShipping) ?? null,
    lines: Array.isArray(row.line_items) ? (row.line_items as MerchOrderLine[]) : [],
    needsManualFulfilment: Boolean(row.needs_manual_fulfilment),
    status: (row.status as MerchOrder['status']) ?? 'new',
    printifyOrderId: (row.printify_order_id as string) ?? null,
    printifyStatus: (row.printify_status as string) ?? null,
    notes: (row.notes as string) ?? null,
    createdAt: String(row.created_at),
    fulfilledAt: (row.fulfilled_at as string) ?? null,
  };
}

/**
 * Insert a completed order. Idempotent on `stripe_session_id`: a webhook Stripe
 * retries upserts the same row and reports `created: false` so the caller can
 * avoid sending a duplicate notification email.
 */
export async function recordOrder(input: MerchOrderInput): Promise<RecordOrderResult> {
  const admin = getSupabaseAdminClient();
  if (!admin) return { ok: false, created: false, error: 'Supabase not configured.' };

  const { data, error } = await admin
    .from('merch_orders')
    .upsert(
      {
        stripe_session_id: input.stripeSessionId,
        email: input.email ?? null,
        customer_name: input.customerName ?? null,
        amount_total_pence: input.amountTotalPence,
        currency: input.currency,
        shipping: input.shipping,
        line_items: input.lines,
        needs_manual_fulfilment: input.needsManualFulfilment,
      },
      { onConflict: 'stripe_session_id', ignoreDuplicates: true },
    )
    .select('id');

  if (error) return { ok: false, created: false, error: error.message };
  // With ignoreDuplicates, a conflicting (already-seen) session returns no rows.
  return { ok: true, created: (data?.length ?? 0) > 0, error: null };
}

/** Attach the Printify order id/status to an order after auto-fulfilment. */
export async function attachPrintifyResult(
  stripeSessionId: string,
  printify: { id?: number | string; status?: string },
): Promise<void> {
  const admin = getSupabaseAdminClient();
  if (!admin) return;
  await admin
    .from('merch_orders')
    .update({
      printify_order_id: printify.id != null ? String(printify.id) : null,
      printify_status: printify.status ?? null,
    })
    .eq('stripe_session_id', stripeSessionId);
}

/** List orders, newest first, for the admin dashboard. */
export async function listOrders(limit = 100): Promise<MerchOrder[]> {
  const admin = getSupabaseAdminClient();
  if (!admin) return [];
  const { data, error } = await admin
    .from('merch_orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data.map(fromRow);
}

/** Toggle an order between `new` and `fulfilled` (sets/clears `fulfilled_at`). */
export async function setOrderFulfilled(id: string, fulfilled: boolean): Promise<boolean> {
  const admin = getSupabaseAdminClient();
  if (!admin) return false;
  const { error } = await admin
    .from('merch_orders')
    .update({
      status: fulfilled ? 'fulfilled' : 'new',
      fulfilled_at: fulfilled ? new Date().toISOString() : null,
    })
    .eq('id', id);
  return !error;
}
