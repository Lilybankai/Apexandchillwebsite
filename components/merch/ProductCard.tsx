'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Plus, Heart } from 'lucide-react';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatGBP, useCart } from '@/lib/merch/cart';

export interface ProductCardProps {
  product: Product;
}

/**
 * A merch product tile: image, title, price-from, and an add / choose-options
 * action. Single-variant products can be added straight from the grid; products
 * with multiple variants link through to the detail page to pick a size.
 */
export function ProductCard({ product }: ProductCardProps) {
  const { add } = useCart();
  const singleVariant = product.variants.length === 1 ? product.variants[0] : null;
  const isAmc = product.tags.includes('amc');

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-card border border-line bg-surface/40 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-glow-soft">
      <Link href={`/merch/${product.handle}`} className="relative block aspect-square overflow-hidden bg-elevated">
        <Image
          src={product.images[0]}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={cn(
            'transition-transform duration-500 group-hover:scale-105',
            // AMC logos are transparent PNGs — pad + contain so they sit nicely.
            isAmc ? 'object-contain p-8' : 'object-cover',
          )}
        />
        {isAmc && (
          <span className="chip absolute left-2 top-2 !border-pink/50 !text-pink">
            <Heart className="h-3 w-3" />
            Charity
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[0.65rem] uppercase tracking-widest text-subtle">
            {product.category}
          </span>
          {product.provider !== 'sample' && (
            <span className="font-mono text-[0.6rem] uppercase tracking-widest text-subtle/70">
              {product.provider}
            </span>
          )}
        </div>
        <Link href={`/merch/${product.handle}`}>
          <h3 className="font-display text-base leading-tight text-ink transition-colors group-hover:text-cyan">
            {product.title}
          </h3>
        </Link>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="tabular text-lg font-bold text-ink">
            {product.variants.length > 1 && <span className="text-xs font-normal text-subtle">from </span>}
            {formatGBP(product.priceFrom)}
          </span>
          {singleVariant ? (
            <button
              type="button"
              onClick={() => add(product, singleVariant)}
              className="inline-flex items-center gap-1 rounded-lg bg-neon-primary px-3 py-1.5 font-display text-xs uppercase tracking-wide text-white shadow-glow-soft transition-all hover:brightness-110"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          ) : (
            <Link
              href={`/merch/${product.handle}`}
              className="inline-flex items-center rounded-lg border border-cyan/50 px-3 py-1.5 font-display text-xs uppercase tracking-wide text-cyan transition-colors hover:bg-cyan/10"
            >
              Options
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
