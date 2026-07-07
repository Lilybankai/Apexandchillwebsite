'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, Minus, Check, Heart, Truck, ShieldCheck, Shirt } from 'lucide-react';
import type { Product, ProductVariant } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatGBP, useCart } from '@/lib/merch/cart';
import { Button } from '@/components/ui/Button';

export interface ProductDetailProps {
  product: Product;
}

/** Approximate hex for each colourway name, for the swatch buttons. */
const SWATCH_HEX: Record<string, string> = {
  black: '#1b1b1b',
  gray: '#8b8b8b',
  grey: '#8b8b8b',
  white: '#f4f4f5',
  brown: '#6b4a2b',
  coffee: '#4b3626',
  'navy blue': '#26324f',
  blue: '#2f5fd0',
  purple: '#6b3fa0',
  'gray coffee': '#7c7065',
  'oat gray': '#d9d2c4',
  'gray apricot': '#d7a591',
  'dark purple': '#3b2a4d',
  'medium green': '#4e7c58',
};

/** Swatch fill for a colour name (falls back to a neutral grey when unknown). */
function swatchHex(name: string): string {
  return SWATCH_HEX[name.toLowerCase()] ?? '#8b8b8b';
}

/**
 * Interactive purchase panel for a product detail page: image gallery with
 * thumbnails, variant/size selector, quantity stepper, add-to-cart with
 * confirmation feedback, and fulfilment trust notes. The displayed price and
 * image track the selected variant; picking a thumbnail overrides the variant
 * image until the variant changes again.
 */
export function ProductDetail({ product }: ProductDetailProps) {
  const { add } = useCart();
  // Colour-based apparel is chosen by a colour swatch + size; everything else
  // (single-dimension products) falls back to a flat variant list.
  const hasColours = product.variants.some((v) => Boolean(v.color));
  const firstAvailable = product.variants.find((v) => v.available) ?? product.variants[0];

  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [custom, setCustom] = useState('');
  // Explicit thumbnail choice; null means "follow the selected variant".
  const [pickedImage, setPickedImage] = useState<string | null>(null);
  const [descExpanded, setDescExpanded] = useState(false);

  // Colour + size selection (colour-based apparel) …
  const [color, setColor] = useState<string | undefined>(firstAvailable?.color);
  const [size, setSize] = useState<string | undefined>(firstAvailable?.size);
  // … or a flat variant pick (accessories / single-dimension products).
  const [flatVariant, setFlatVariant] = useState<ProductVariant | undefined>(firstAvailable);

  const variant = hasColours
    ? product.variants.find((v) => v.color === color && v.size === size)
    : flatVariant;

  const personalization = product.personalization;
  const personalizationMissing = Boolean(personalization?.required) && custom.trim().length === 0;
  const isAmc = product.tags.includes('amc');
  // POD providers ship long spec-sheet descriptions; clamp them behind a toggle.
  const longDescription = product.description.length > 420;

  // Distinct colours (first-seen order), each with its availability.
  const colourOptions = hasColours
    ? Array.from(
        new Map(product.variants.filter((v) => v.color).map((v) => [v.color as string, v])).values(),
      ).map((v) => ({
        name: v.color as string,
        available: product.variants.some((pv) => pv.color === v.color && pv.available),
      }))
    : [];
  const sizeOptions = hasColours
    ? Array.from(new Set(product.variants.map((v) => v.size).filter((s): s is string => Boolean(s))))
    : [];
  const sizeAvailable = (s: string) =>
    product.variants.some((v) => v.color === color && v.size === s && v.available);

  const gallery = [...new Set([...(variant?.image ? [variant.image] : []), ...product.images])];
  const displayed = pickedImage ?? variant?.image ?? product.images[0];

  function selectColour(c: string) {
    setColor(c);
    setPickedImage(null);
    // Keep the size valid: if the current size isn't offered/available in this
    // colour, jump to the first available size for it.
    const forColour = product.variants.filter((v) => v.color === c);
    if (!forColour.some((v) => v.size === size && v.available)) {
      setSize((forColour.find((v) => v.available) ?? forColour[0])?.size);
    }
  }
  function selectSize(s: string) {
    setSize(s);
    setPickedImage(null);
  }
  function selectVariant(v: ProductVariant) {
    setFlatVariant(v);
    setPickedImage(null);
  }

  function handleAdd() {
    if (!variant) return;
    const value = custom.trim();
    if (personalization?.required && !value) return;
    add(product, variant, qty, value || undefined);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
      {/* Gallery */}
      <div className="space-y-3">
        <div className="relative aspect-square overflow-hidden rounded-card border border-line bg-elevated shadow-card">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-grid-lines bg-grid opacity-[0.15] [mask-image:radial-gradient(80%_80%_at_50%_50%,black,transparent)]"
          />
          <Image
            key={displayed}
            src={displayed}
            alt={product.title}
            fill
            sizes="(max-width: 1024px) 100vw, 55vw"
            priority
            className={cn('animate-rise', isAmc ? 'object-contain p-12' : 'object-cover')}
          />
        </div>
        {gallery.length > 1 && (
          <div className="flex flex-wrap gap-2.5">
            {gallery.map((src) => {
              const isActive = src === displayed;
              return (
                <button
                  key={src}
                  type="button"
                  onClick={() => setPickedImage(src)}
                  aria-label="View product image"
                  aria-pressed={isActive}
                  className={cn(
                    'relative h-20 w-20 overflow-hidden rounded-lg border bg-elevated transition-all',
                    isActive
                      ? 'border-accent shadow-glow-soft'
                      : 'border-line opacity-70 hover:border-accent/50 hover:opacity-100',
                  )}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="80px"
                    className={cn(isAmc ? 'object-contain p-2' : 'object-cover')}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Buy panel */}
      <div className="lg:sticky lg:top-28 lg:self-start">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip">{product.category}</span>
          {isAmc && (
            <span className="chip !border-pink/50 !text-pink">
              <Heart className="h-3 w-3" />
              Andy&apos;s Man Club — Charity
            </span>
          )}
        </div>
        <h1 className="mt-4 text-3xl font-bold leading-none text-ink sm:text-4xl lg:text-5xl">
          {product.title}
        </h1>
        <p className="tabular mt-4 text-2xl font-bold text-ink">
          {formatGBP(variant?.price ?? product.priceFrom)}
        </p>

        {product.description && (
          <div className="mt-5 border-t border-line pt-5">
            <p
              className={cn(
                'leading-relaxed text-muted',
                longDescription && !descExpanded && 'line-clamp-5',
              )}
            >
              {product.description}
            </p>
            {longDescription && (
              <button
                type="button"
                onClick={() => setDescExpanded((e) => !e)}
                className="mt-2 font-mono text-xs uppercase tracking-widest text-cyan transition-colors hover:text-ink"
              >
                {descExpanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        )}

        {/* Colour + size selectors (colour-based apparel) */}
        {hasColours ? (
          <>
            <div className="mt-7">
              <span className="mb-2.5 block font-mono text-xs font-semibold uppercase tracking-widest text-subtle">
                Colour{color ? <span className="ml-1 text-ink">· {color}</span> : null}
              </span>
              <div className="flex flex-wrap gap-2.5">
                {colourOptions.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    disabled={!c.available}
                    onClick={() => selectColour(c.name)}
                    aria-label={c.name}
                    aria-pressed={c.name === color}
                    title={c.name}
                    className={cn(
                      'h-9 w-9 rounded-full border transition-all',
                      c.name === color
                        ? 'border-transparent ring-2 ring-accent ring-offset-2 ring-offset-base'
                        : 'border-line hover:border-accent/60',
                      !c.available && 'cursor-not-allowed opacity-30',
                    )}
                    style={{ backgroundColor: swatchHex(c.name) }}
                  />
                ))}
              </div>
            </div>

            {sizeOptions.length > 0 && (
              <div className="mt-6">
                <span className="mb-2.5 block font-mono text-xs font-semibold uppercase tracking-widest text-subtle">
                  Size
                </span>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((s) => {
                    const ok = sizeAvailable(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={!ok}
                        onClick={() => selectSize(s)}
                        aria-pressed={s === size}
                        className={cn(
                          'min-w-[3rem] rounded-lg border px-4 py-2 font-display text-sm uppercase tracking-wide transition-all',
                          s === size
                            ? 'border-transparent bg-neon-primary text-white shadow-glow-soft'
                            : 'border-line text-muted hover:border-accent/50 hover:text-ink',
                          !ok && 'cursor-not-allowed opacity-40 hover:border-line hover:text-muted',
                        )}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          product.variants.length > 1 && (
            <div className="mt-7">
              <span className="mb-2.5 block font-mono text-xs font-semibold uppercase tracking-widest text-subtle">
                {product.category === 'Apparel' || product.category === 'Hoodies' ? 'Size' : 'Option'}
              </span>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    disabled={!v.available}
                    onClick={() => selectVariant(v)}
                    aria-pressed={v.id === variant?.id}
                    className={cn(
                      'min-w-[3rem] rounded-lg border px-4 py-2 font-display text-sm uppercase tracking-wide transition-all',
                      v.id === variant?.id
                        ? 'border-transparent bg-neon-primary text-white shadow-glow-soft'
                        : 'border-line text-muted hover:border-accent/50 hover:text-ink',
                      !v.available && 'cursor-not-allowed opacity-40 hover:border-line hover:text-muted',
                    )}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )
        )}

        {/* Personalisation (e.g. number on the back) */}
        {personalization && (
          <div className="mt-7">
            <label
              htmlFor="product-personalization"
              className="mb-2.5 block font-mono text-xs font-semibold uppercase tracking-widest text-subtle"
            >
              {personalization.label}
              {personalization.required && <span className="text-accent"> *</span>}
            </label>
            <input
              id="product-personalization"
              type="text"
              inputMode="numeric"
              value={custom}
              maxLength={personalization.maxLength ?? 32}
              onChange={(e) => setCustom(e.target.value)}
              placeholder={personalization.placeholder}
              aria-required={personalization.required}
              className="w-full max-w-[12rem] rounded-lg border border-line bg-surface/60 px-4 py-2.5 font-display text-lg tracking-wide text-ink outline-none transition-colors focus:border-accent"
            />
            {personalizationMissing && (
              <p className="mt-1.5 font-mono text-[0.65rem] uppercase tracking-widest text-subtle">
                Enter your {personalization.label.toLowerCase()} to add to cart
              </p>
            )}
          </div>
        )}

        {/* Quantity + add */}
        <div className="mt-7 flex flex-wrap items-center gap-4">
          <div className="inline-flex items-center rounded-lg border border-line bg-surface/60">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              className="flex h-12 w-12 items-center justify-center text-muted transition-colors hover:text-ink"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="tabular w-10 text-center text-lg text-ink">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              aria-label="Increase quantity"
              className="flex h-12 w-12 items-center justify-center text-muted transition-colors hover:text-ink"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <Button
            type="button"
            size="lg"
            clip
            onClick={handleAdd}
            disabled={!variant?.available || personalizationMissing}
            className="flex-1 sm:flex-none sm:min-w-[14rem]"
          >
            {added ? (
              <>
                <Check className="h-4 w-4" />
                Added to Cart
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add to Cart
              </>
            )}
          </Button>
        </div>

        {/* Fulfilment trust notes */}
        <ul className="mt-8 space-y-3 border-t border-line pt-6 text-sm text-muted">
          <li className="flex items-center gap-3">
            <Shirt className="h-4 w-4 shrink-0 text-cyan" aria-hidden />
            Printed on demand, just for you — no waste, no overstock
          </li>
          <li className="flex items-center gap-3">
            <Truck className="h-4 w-4 shrink-0 text-cyan" aria-hidden />
            Ships to the UK &amp; Ireland
          </li>
          <li className="flex items-center gap-3">
            <ShieldCheck className="h-4 w-4 shrink-0 text-cyan" aria-hidden />
            Secure checkout powered by Stripe
          </li>
        </ul>

        {isAmc && (
          <p className="mt-6 rounded-card border border-pink/20 bg-pink/5 px-4 py-3 text-sm text-muted">
            A share of every Andy&apos;s Man Club sale supports men&apos;s mental
            health. <span className="font-semibold text-pink">#ITSOKAYTOTALK</span>
          </p>
        )}
      </div>
    </div>
  );
}
