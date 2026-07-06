'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, Minus, Check, Heart } from 'lucide-react';
import type { Product, ProductVariant } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatGBP, useCart } from '@/lib/merch/cart';
import { Button } from '@/components/ui/Button';

export interface ProductDetailProps {
  product: Product;
}

/**
 * Interactive purchase panel for a product detail page: image, variant/size
 * selector, quantity stepper, and add-to-cart with confirmation feedback. The
 * displayed price tracks the selected variant.
 */
export function ProductDetail({ product }: ProductDetailProps) {
  const { add } = useCart();
  const firstAvailable = product.variants.find((v) => v.available) ?? product.variants[0];
  const [variant, setVariant] = useState<ProductVariant | undefined>(firstAvailable);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const isAmc = product.tags.includes('amc');

  function handleAdd() {
    if (!variant) return;
    add(product, variant, qty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-card border border-line bg-elevated">
        <Image
          src={variant?.image ?? product.images[0]}
          alt={product.title}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
          className={cn(isAmc ? 'object-contain p-12' : 'object-cover')}
        />
      </div>

      {/* Buy panel */}
      <div>
        {isAmc && (
          <span className="chip mb-4 !border-pink/50 !text-pink">
            <Heart className="h-3 w-3" />
            Andy&apos;s Man Club — Charity
          </span>
        )}
        <span className="font-mono text-xs uppercase tracking-widest text-subtle">{product.category}</span>
        <h1 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">{product.title}</h1>
        <p className="tabular mt-4 text-2xl font-bold text-ink">
          {formatGBP(variant?.price ?? product.priceFrom)}
        </p>
        {product.description && <p className="mt-5 text-muted">{product.description}</p>}

        {/* Variant selector */}
        {product.variants.length > 1 && (
          <div className="mt-7">
            <span className="mb-2 block font-mono text-xs font-semibold uppercase tracking-widest text-subtle">
              {product.category === 'Apparel' || product.category === 'Hoodies' ? 'Size' : 'Option'}
            </span>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  disabled={!v.available}
                  onClick={() => setVariant(v)}
                  className={cn(
                    'min-w-[3rem] rounded-lg border px-4 py-2 font-display text-sm uppercase tracking-wide transition-all',
                    v.id === variant?.id
                      ? 'border-transparent bg-neon-primary text-white shadow-glow-soft'
                      : 'border-line text-muted hover:border-accent/50 hover:text-ink',
                    !v.available && 'cursor-not-allowed opacity-40',
                  )}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity + add */}
        <div className="mt-7 flex flex-wrap items-center gap-4">
          <div className="inline-flex items-center rounded-lg border border-line">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              className="flex h-12 w-12 items-center justify-center text-muted hover:text-ink"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="tabular w-10 text-center text-lg text-ink">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              aria-label="Increase quantity"
              className="flex h-12 w-12 items-center justify-center text-muted hover:text-ink"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <Button type="button" size="lg" clip onClick={handleAdd} disabled={!variant?.available}>
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

        {isAmc && (
          <p className="mt-6 rounded-card border border-pink/20 bg-pink/5 px-4 py-3 text-sm text-muted">
            A share of every Andy&apos;s Man Club sale supports men&apos;s mental
            health. #ITSOKAYTOTALK
          </p>
        )}
      </div>
    </div>
  );
}
