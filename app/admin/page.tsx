import type { Metadata } from 'next';
import { Info, Package, Truck } from 'lucide-react';
import { isConfigured } from '@/lib/env';
import { listOrders, type MerchOrder } from '@/lib/merch/orders';
import { FulfilToggle, LogoutButton } from '@/components/admin/OrderActions';

export const metadata: Metadata = {
  title: 'Admin — Orders',
  // Never let the admin dashboard be indexed.
  robots: { index: false, follow: false },
};

// Always render fresh — orders change constantly and this page is behind auth.
export const dynamic = 'force-dynamic';

/** Format integer pence as GBP, e.g. 2599 → £25.99. */
function gbp(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

/** Format an ISO timestamp for the operator (UK locale, date + time). */
function when(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
}

/** One-line shipping address. */
function address(order: MerchOrder): string {
  const s = order.shipping;
  if (!s) return '—';
  return [s.name, s.address1, s.address2, s.city, s.state, s.postalCode, s.country]
    .filter(Boolean)
    .join(', ');
}

function OrderCard({ order }: { order: MerchOrder }) {
  const isFulfilled = order.status === 'fulfilled';
  return (
    <article className="rounded-card border border-line bg-surface/40 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display text-lg text-ink">{gbp(order.amountTotalPence)}</span>
            {order.needsManualFulfilment ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-flag-amber/15 px-2 py-0.5 text-xs text-flag-amber">
                <Package className="h-3 w-3" aria-hidden /> Manual (Tapstitch)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-cyan/15 px-2 py-0.5 text-xs text-cyan">
                <Truck className="h-3 w-3" aria-hidden /> Auto (Printify)
              </span>
            )}
            {isFulfilled && (
              <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs text-success">Fulfilled</span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted">
            {when(order.createdAt)} · {order.email ?? 'no email'}
          </p>
        </div>
        <FulfilToggle id={order.id} fulfilled={isFulfilled} />
      </div>

      <ul className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
        {order.lines.map((l, i) => (
          <li key={`${l.variantId}-${i}`} className="flex items-center justify-between gap-4">
            <span className="text-ink">
              {l.title} <span className="text-muted">— {l.variantName}</span>
              <span className="ml-2 text-xs capitalize text-subtle">[{l.provider}]</span>
            </span>
            <span className="shrink-0 font-mono text-muted">
              ×{l.quantity} · {gbp(Math.round(l.unitPrice * 100))}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-4 border-t border-line pt-3 text-sm text-muted">
        <span className="text-subtle">Ship to:</span> {address(order)}
      </p>
      {order.printifyOrderId && (
        <p className="mt-1 text-xs text-subtle">
          Printify order {order.printifyOrderId}
          {order.printifyStatus ? ` (${order.printifyStatus})` : ''}
        </p>
      )}
    </article>
  );
}

/**
 * Admin orders dashboard. Server-rendered from `merch_orders` via the
 * service-role client; access is gated by the middleware (see `middleware.ts`).
 * Manual-fulfilment (Tapstitch) orders are highlighted so the operator knows
 * which ones to place by hand.
 */
export default async function AdminOrdersPage() {
  const configured = isConfigured('supabaseAdmin');
  const orders = configured ? await listOrders() : [];
  const needsAction = orders.filter((o) => o.status !== 'fulfilled');
  const manualPending = needsAction.filter((o) => o.needsManualFulfilment);

  return (
    <div className="container-rail space-y-8 py-12 sm:py-16">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <span className="kicker mb-2 block">Operator</span>
          <h1 className="font-display text-3xl text-ink sm:text-4xl">Merch Orders</h1>
          <p className="mt-2 text-sm text-muted">
            {orders.length} order{orders.length === 1 ? '' : 's'} · {needsAction.length} awaiting fulfilment ·{' '}
            {manualPending.length} need manual (Tapstitch) action
          </p>
        </div>
        <LogoutButton />
      </header>

      {!configured && (
        <div className="flex items-start gap-2 rounded-card border border-flag-amber/30 bg-flag-amber/5 px-4 py-3 text-sm text-muted">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-flag-amber" aria-hidden />
          <span>
            Supabase isn’t configured, so no orders can be shown. Set{' '}
            <code>SUPABASE_SERVICE_ROLE_KEY</code> and run <code>supabase/schema.sql</code> to enable order
            storage.
          </span>
        </div>
      )}

      {configured && orders.length === 0 && (
        <div className="rounded-card border border-line bg-surface/40 px-4 py-10 text-center text-muted">
          No orders yet. Completed checkouts will appear here.
        </div>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}
