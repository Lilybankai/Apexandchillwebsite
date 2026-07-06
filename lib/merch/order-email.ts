/**
 * Order-notification email via Resend's REST API (no SDK — plain `fetch`, matching
 * the other provider clients).
 *
 * Sent from the Stripe webhook after an order is recorded. The email lists what
 * was bought, the shipping address, and — crucially — which items need MANUAL
 * fulfilment in Tapstitch (which has no order API). Never throws: when Resend
 * isn't configured, or the send fails, it logs and returns `false` so a
 * notification problem can never fail the payment webhook.
 *
 * @packageDocumentation
 */

import { resend as cfg, isConfigured } from '@/lib/env';
import type { MerchOrder } from '@/lib/merch/orders';

/** Format pennies as a GBP string, e.g. `2599` → `£25.99`. */
function gbp(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

/** Escape a string for safe interpolation into HTML. */
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Render a one-line shipping address from the order's shipping block. */
function formatAddress(order: MerchOrder): string {
  const s = order.shipping;
  if (!s) return 'No shipping address on file.';
  return [s.name, s.address1, s.address2, s.city, s.state, s.postalCode, s.country]
    .filter(Boolean)
    .join(', ');
}

/** Build the HTML body for an order-notification email. */
function renderHtml(order: MerchOrder): string {
  const rows = order.lines
    .map(
      (l) => `
      <tr>
        <td style="padding:6px 10px;border-bottom:1px solid #eee">${esc(l.title)} — ${esc(l.variantName)}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:center">${l.quantity}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:right">${gbp(Math.round(l.unitPrice * 100))}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:center;text-transform:capitalize">${esc(l.provider)}</td>
      </tr>`,
    )
    .join('');

  const manualBanner = order.needsManualFulfilment
    ? `<p style="background:#fff4e5;border:1px solid #ffcf99;border-radius:8px;padding:12px 14px;color:#7a4a00">
         ⚠️ This order contains <strong>Tapstitch</strong> item(s) that must be placed
         manually in the Tapstitch dashboard — Printify items (if any) are pushed automatically.
       </p>`
    : `<p style="color:#2a7a2a">✅ All items are Printify — pushed to Printify automatically. No manual action needed.</p>`;

  return `
  <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:640px;margin:0 auto;color:#111">
    <h2 style="margin:0 0 4px">New merch order — ${gbp(order.amountTotalPence)}</h2>
    <p style="color:#666;margin:0 0 16px">Stripe session <code>${esc(order.stripeSessionId)}</code></p>
    ${manualBanner}
    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      <thead>
        <tr style="text-align:left;color:#666;font-size:13px">
          <th style="padding:6px 10px">Item</th>
          <th style="padding:6px 10px;text-align:center">Qty</th>
          <th style="padding:6px 10px;text-align:right">Unit</th>
          <th style="padding:6px 10px;text-align:center">Provider</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <h3 style="margin:16px 0 4px">Ship to</h3>
    <p style="margin:0 0 4px">${esc(formatAddress(order))}</p>
    <p style="margin:0;color:#666">${esc(order.email ?? 'no email')}</p>
    <p style="margin:20px 0 0;color:#999;font-size:13px">Review &amp; mark fulfilled in your /admin dashboard.</p>
  </div>`;
}

/** Plain-text fallback body. */
function renderText(order: MerchOrder): string {
  const lines = order.lines
    .map((l) => `- ${l.title} — ${l.variantName} ×${l.quantity} @ ${gbp(Math.round(l.unitPrice * 100))} [${l.provider}]`)
    .join('\n');
  return [
    `New merch order — ${gbp(order.amountTotalPence)}`,
    `Stripe session: ${order.stripeSessionId}`,
    order.needsManualFulfilment
      ? '⚠️ Contains Tapstitch item(s) — place manually in Tapstitch.'
      : '✅ All Printify — auto-fulfilled.',
    '',
    lines,
    '',
    `Ship to: ${formatAddress(order)}`,
    `Email: ${order.email ?? 'no email'}`,
  ].join('\n');
}

/**
 * Email the operator about a completed order.
 *
 * @returns `true` if Resend accepted the message, else `false` (logged).
 */
export async function sendOrderNotification(order: MerchOrder): Promise<boolean> {
  if (!isConfigured('resend')) {
    console.warn(
      `[order-email] RESEND_API_KEY / ORDER_NOTIFICATION_EMAIL not set — skipping email for order ${order.stripeSessionId}.`,
    );
    return false;
  }

  const subject = order.needsManualFulfilment
    ? `🧵 New order needs manual fulfilment — ${gbp(order.amountTotalPence)}`
    : `🛒 New merch order — ${gbp(order.amountTotalPence)}`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: cfg.from,
        to: [cfg.to],
        subject,
        html: renderHtml(order),
        text: renderText(order),
      }),
      cache: 'no-store',
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => `${res.status}`);
      console.error(`[order-email] Resend rejected order ${order.stripeSessionId}: ${detail}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(
      `[order-email] Resend send failed for order ${order.stripeSessionId}: ${err instanceof Error ? err.message : 'unknown error'}`,
    );
    return false;
  }
}
