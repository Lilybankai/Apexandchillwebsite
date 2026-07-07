'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Plus, Heart, ArrowUpRight } from 'lucide-react';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatGBP, useCart } from '@/lib/merch/cart';

export interface ProductCardProps {
  product: Product;
}

/** Canonical size order so "S – 2XL" style ranges read correctly. */
const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', 'XXL', '3XL', 'XXXL', '4XL', '5XL'];

/**
 * Short availability hint for the card footer: a size range ("S – 2XL") when
 * variants carry sizes, an option count otherwise, nothing for single-variant
 * products.
 */
function variantHint(product: Product): string | null {
  if (product.variants.length <= 1) return null;
  const sizes = [...new Set(product.variants.filter((v) => v.available && v.size).map((v) => v.size as string))];
  if (sizes.length > 1) {
    const ranked = sizes
      .map((s) => ({ s, i: SIZE_ORDER.indexOf(s.toUpperCase()) }))
      .filter((x) => x.i !== -1)
      .sort((a, b) => a.i - b.i);
    if (ranked.length > 1) return `${ranked[0].s} – ${ranked[ranked.length - 1].s}`;
  }
  return `${product.variants.length} options`;
}

/**
 * A merch product tile: image (with a second-image crossfade on hover when the
 * product has one), title, price-from, and an add / choose-options action.
 * Single-variant products can be added straight from the grid; products with
 * multiple variants link through to the detail page to pick a size.
 */
export function ProductCard({ product }: ProductCardProps) {
  const { add } = useCart();
  // A required personalisation (e.g. a number) must be entered on the detail
  // page, so such products never expose the one-tap quick-add.
  const singleVariant =
    product.variants.length === 1 && !product.personalization?.required ? product.variants[0] : null;
  const isAmc = product.tags.includes('amc');
  const hint = variantHint(product);
  const hoverImage = product.images[1];

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-card border border-line bg-surface/60 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:shadow-glow-soft">
      <Link
        href={`/merch/${product.handle}`}
        className="relative block aspect-square overflow-hidden bg-elevated"
      >
        <Image
          src={product.images[0]}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={cn(
            'transition-all duration-500 group-hover:scale-[1.04]',
            // AMC logos are transparent PNGs — pad + contain so they sit nicely.
            isAmc ? 'object-contain p-8' : 'object-cover',
            hoverImage && 'group-hover:opacity-0',
          )}
        />
        {hoverImage && (
          <Image
            src={hoverImage}
            alt=""
            aria-hidden
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              'opacity-0 transition-all duration-500 group-hover:scale-[1.04] group-hover:opacity-100',
              isAmc ? 'object-contain p-8' : 'object-cover',
            )}
          />
        )}
        {/* Bottom scrim so the tile grounds into the card body */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-base/60 to-transparent"
        />
        {isAmc && (
          <span className="chip absolute left-2.5 top-2.5 !border-pink/50 !bg-base/80 !text-pink backdrop-blur-sm">
            <Heart className="h-3 w-3" />
            Charity
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-4 sm:p-5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-mono text-[0.65rem] font-semibold uppercase tracking-widest text-subtle">
            {product.category}
          </span>
          {hint && (
            <span className="font-mono text-[0.6rem] uppercase tracking-widest text-subtle/80">
              {hint}
            </span>
          )}
        </div>
        <Link href={`/merch/${product.handle}`} className="focus-visible:outline-none">
          <h3 className="font-display text-base leading-tight text-ink transition-colors group-hover:text-cyan sm:text-lg">
            {product.title}
          </h3>
        </Link>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className="tabular text-lg font-bold text-ink">
            {product.variants.length > 1 && (
              <span className="mr-1 font-mono text-[0.65rem] font-normal uppercase tracking-widest text-subtle">
                from
              </span>
            )}
            {formatGBP(product.priceFrom)}
          </span>
          {singleVariant ? (
            <button
              type="button"
              onClick={() => add(product, singleVariant)}
              className="inline-flex items-center gap-1 rounded-lg bg-neon-primary px-3.5 py-2 font-display text-xs uppercase tracking-wide text-white shadow-glow-soft transition-all hover:shadow-glow hover:brightness-110 active:translate-y-px"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          ) : (
            <Link
              href={`/merch/${product.handle}`}
              className="inline-flex items-center gap-1 rounded-lg border border-cyan/40 px-3.5 py-2 font-display text-xs uppercase tracking-wide text-cyan transition-all hover:border-cyan hover:bg-cyan/10 hover:shadow-glow-cyan active:translate-y-px"
            >
              Options
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
