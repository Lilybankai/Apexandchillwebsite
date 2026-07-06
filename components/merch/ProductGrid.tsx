'use client';

import { useMemo, useState } from 'react';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ProductCard } from './ProductCard';

export interface ProductGridProps {
  products: Product[];
}

/** The special "Andy's Man Club" filter, matched by tag rather than category. */
const AMC_FILTER = "Andy's Man Club";

/**
 * Responsive product grid with category filter chips. Categories are derived
 * from the catalog, plus an "All" option and a dedicated Andy's Man Club filter
 * (matched by the `amc` tag) so the charity range is easy to find.
 */
export function ProductGrid({ products }: ProductGridProps) {
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) set.add(p.category);
    const list = ['All', ...[...set].sort()];
    if (products.some((p) => p.tags.includes('amc'))) list.push(AMC_FILTER);
    return list;
  }, [products]);

  const [active, setActive] = useState('All');

  const visible = useMemo(() => {
    if (active === 'All') return products;
    if (active === AMC_FILTER) return products.filter((p) => p.tags.includes('amc'));
    return products.filter((p) => p.category === active);
  }, [products, active]);

  return (
    <div className="space-y-8">
      {categories.length > 2 && (
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActive(cat)}
              className={cn(
                'rounded-full border px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-widest transition-all duration-150',
                cat === active
                  ? 'border-transparent bg-neon-primary text-white shadow-glow-soft'
                  : 'border-line text-muted hover:border-accent/50 hover:text-ink',
                cat === AMC_FILTER && cat !== active && 'border-pink/40 text-pink hover:border-pink',
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <div className="glass rounded-card p-10 text-center text-muted">
          No products in this category yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
