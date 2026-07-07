'use client';

import { useMemo, useState } from 'react';
import { Heart, PackageSearch } from 'lucide-react';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ProductCard } from './ProductCard';

export interface ProductGridProps {
  products: Product[];
}

/** The special "Andy's Man Club" filter, matched by tag rather than category. */
const AMC_FILTER = "Andy's Man Club";

/**
 * Responsive product grid with category filter chips (each showing its product
 * count). Categories are derived from the catalog, plus an "All" option and a
 * dedicated Andy's Man Club filter (matched by the `amc` tag) so the charity
 * range is easy to find.
 */
export function ProductGrid({ products }: ProductGridProps) {
  const filters = useMemo(() => {
    const byCategory = new Map<string, number>();
    for (const p of products) byCategory.set(p.category, (byCategory.get(p.category) ?? 0) + 1);
    const list: { label: string; count: number }[] = [
      { label: 'All', count: products.length },
      ...[...byCategory.keys()].sort().map((c) => ({ label: c, count: byCategory.get(c) ?? 0 })),
    ];
    const amcCount = products.filter((p) => p.tags.includes('amc')).length;
    if (amcCount > 0) list.push({ label: AMC_FILTER, count: amcCount });
    return list;
  }, [products]);

  const [active, setActive] = useState('All');

  const visible = useMemo(() => {
    if (active === 'All') return products;
    if (active === AMC_FILTER) return products.filter((p) => p.tags.includes('amc'));
    return products.filter((p) => p.category === active);
  }, [products, active]);

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        {filters.length > 2 ? (
          <div className="flex flex-wrap items-center gap-2">
            {filters.map(({ label, count }) => {
              const isActive = label === active;
              const isAmc = label === AMC_FILTER;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setActive(label)}
                  aria-pressed={isActive}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-widest transition-all duration-150',
                    isActive
                      ? 'border-transparent bg-neon-primary text-white shadow-glow-soft'
                      : 'border-line text-muted hover:border-accent/50 hover:text-ink',
                    isAmc && !isActive && 'border-pink/40 text-pink hover:border-pink hover:text-pink',
                  )}
                >
                  {isAmc && <Heart className="h-3 w-3" />}
                  {label}
                  <span
                    className={cn(
                      'tabular text-[0.65rem]',
                      isActive ? 'text-white/70' : 'text-subtle',
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div />
        )}
        <p aria-live="polite" className="font-mono text-[0.65rem] uppercase tracking-widest text-subtle">
          {visible.length} {visible.length === 1 ? 'product' : 'products'}
        </p>
      </div>

      {visible.length === 0 ? (
        <div className="glass rounded-card p-12 text-center">
          <PackageSearch className="mx-auto mb-3 h-10 w-10 text-subtle" aria-hidden />
          <p className="text-muted">No products in this category yet.</p>
        </div>
      ) : (
        <div key={active} className="grid animate-rise grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
