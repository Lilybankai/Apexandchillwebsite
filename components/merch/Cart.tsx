'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, X, Plus, Minus, Trash2, Loader2, CheckCircle2 } from 'lucide-react';
import type { CartLine } from '@/lib/types';
import { formatGBP, lineKey, useCart } from '@/lib/merch/cart';

type CheckoutState = 'idle' | 'loading' | 'error';

/**
 * Floating cart button + slide-over drawer. Shows the live item count, lists
 * cart lines with quantity controls, and starts Stripe checkout via
 * `POST /api/checkout`. The drawer is a focus-trapped modal dialog (focus in on
 * open, Tab cycles within, focus restored on close, Escape/backdrop close).
 *
 * Also clears the cart and shows a thank-you when returning from a successful
 * Stripe redirect (`?checkout=success`).
 */
export function Cart() {
  const { lines, count, total, update, remove, clear, hydrated } = useCart();
  const [open, setOpen] = useState(false);
  const [checkout, setCheckout] = useState<CheckoutState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [thanks, setThanks] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Clear the cart + acknowledge a successful Stripe return.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') {
      clear();
      setThanks(true);
      setOpen(true);
    }
  }, [clear]);

  // Focus-trap the drawer while open (WCAG 2.1.2 / 2.4.3).
  useEffect(() => {
    if (!open) return;
    triggerRef.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const focusables = (): HTMLElement[] =>
      panel
        ? Array.from(
            panel.querySelectorAll<HTMLElement>(
              'button, a[href], input, [tabindex]:not([tabindex="-1"])',
            ),
          ).filter((el) => !el.hasAttribute('disabled'))
        : [];

    (focusables()[0] ?? panel)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const el = document.activeElement;
      if (e.shiftKey) {
        if (el === first || !panel?.contains(el)) {
          e.preventDefault();
          last.focus();
        }
      } else if (el === last || !panel?.contains(el)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      triggerRef.current?.focus?.();
    };
  }, [open]);

  async function startCheckout() {
    setCheckout('loading');
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lines }),
      });
      const data = (await res.json()) as { ok: boolean; url?: string; error: string | null };
      if (res.ok && data.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setCheckout('error');
      setError(data.error ?? 'Could not start checkout. Please try again.');
    } catch {
      setCheckout('error');
      setError('Network error — please try again.');
    }
  }

  return (
    <>
      {/* Floating trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Open cart${count ? ` (${count} item${count === 1 ? '' : 's'})` : ''}`}
        className="fixed bottom-6 right-6 z-[90] inline-flex h-14 w-14 items-center justify-center rounded-full bg-neon-primary text-white shadow-glow transition-transform hover:scale-105"
      >
        <ShoppingBag className="h-6 w-6" />
        {hydrated && count > 0 && (
          <span className="tabular absolute -right-1 -top-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-base bg-cyan px-1 text-xs font-bold text-base">
            {count}
          </span>
        )}
      </button>

      {/* Drawer */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Shopping cart"
          className="fixed inset-0 z-[130] flex justify-end bg-base/80 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            ref={panelRef}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            className="flex h-full w-full max-w-md flex-col border-l border-line bg-surface shadow-2xl focus:outline-none animate-rise"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="font-display text-xl text-ink">Your Cart</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close cart"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {thanks ? (
                <div className="py-12 text-center">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
                  <h3 className="mt-4 font-display text-xl text-ink">Thank You!</h3>
                  <p className="mt-2 text-sm text-muted">
                    Your order is confirmed. Check your email for the receipt.
                  </p>
                </div>
              ) : lines.length === 0 ? (
                <div className="py-12 text-center text-muted">
                  <ShoppingBag className="mx-auto mb-3 h-10 w-10 opacity-40" />
                  <p>Your cart is empty.</p>
                  <Link
                    href="/merch"
                    onClick={() => setOpen(false)}
                    className="mt-4 inline-block font-display text-sm uppercase tracking-wide text-cyan hover:underline"
                  >
                    Browse the store
                  </Link>
                </div>
              ) : (
                <ul className="space-y-4">
                  {lines.map((line) => (
                    <CartRow key={lineKey(line)} line={line} onUpdate={update} onRemove={remove} />
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {!thanks && lines.length > 0 && (
              <div className="border-t border-line px-5 py-4">
                {error && (
                  <p role="alert" className="mb-3 rounded-lg border border-flag-red/40 bg-flag-red/10 px-3 py-2 text-sm text-ink">
                    {error}
                  </p>
                )}
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-widest text-subtle">Subtotal</span>
                  <span className="tabular text-xl font-bold text-ink">{formatGBP(total)}</span>
                </div>
                <button
                  type="button"
                  onClick={startCheckout}
                  disabled={checkout === 'loading'}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-neon-primary py-3.5 font-display uppercase tracking-wide text-white shadow-glow-soft transition-all hover:brightness-110 disabled:opacity-60"
                >
                  {checkout === 'loading' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Starting checkout…
                    </>
                  ) : (
                    'Checkout'
                  )}
                </button>
                <p className="mt-3 text-center font-mono text-[0.65rem] uppercase tracking-widest text-subtle">
                  Secure checkout · Shipping to UK &amp; Ireland
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/** A single editable cart line. */
function CartRow({
  line,
  onUpdate,
  onRemove,
}: {
  line: CartLine;
  onUpdate: (key: string, qty: number) => void;
  onRemove: (key: string) => void;
}) {
  const key = lineKey(line);
  return (
    <li className="flex gap-3">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-line bg-elevated">
        {line.image && (
          <Image src={line.image} alt="" fill sizes="64px" className="object-cover" />
        )}
      </div>
      <div className="flex flex-1 flex-col">
        <Link href={`/merch/${line.handle}`} className="font-display text-sm text-ink hover:text-cyan">
          {line.title}
        </Link>
        <span className="font-mono text-xs text-subtle">{line.variantName}</span>
        {line.custom && (
          <span className="font-mono text-xs text-accent">No. {line.custom}</span>
        )}
        <div className="mt-auto flex items-center justify-between">
          <div className="inline-flex items-center rounded-lg border border-line">
            <button
              type="button"
              onClick={() => onUpdate(key, line.quantity - 1)}
              aria-label="Decrease quantity"
              className="flex h-8 w-8 items-center justify-center text-muted hover:text-ink"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="tabular w-8 text-center text-sm text-ink">{line.quantity}</span>
            <button
              type="button"
              onClick={() => onUpdate(key, line.quantity + 1)}
              aria-label="Increase quantity"
              className="flex h-8 w-8 items-center justify-center text-muted hover:text-ink"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <span className="tabular text-sm font-semibold text-ink">
            {formatGBP(line.price * line.quantity)}
          </span>
          <button
            type="button"
            onClick={() => onRemove(key)}
            aria-label={`Remove ${line.title}`}
            className="text-subtle transition-colors hover:text-flag-red"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </li>
  );
}
