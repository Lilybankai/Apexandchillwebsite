import type { Metadata } from 'next';
import { Info, Heart } from 'lucide-react';
import type { DataSource } from '@/lib/types';
import { fetchTapstitchProducts } from '@/lib/merch/tapstitch';
import { fetchPrintifyProducts } from '@/lib/merch/printify';
import { mergeCatalogs } from '@/lib/merch/catalog';
import { Button } from '@/components/ui/Button';
import { ProductGrid } from '@/components/merch/ProductGrid';
import { Cart } from '@/components/merch/Cart';

export const metadata: Metadata = {
  title: 'Merch',
  description:
    'Official Apex & Chill Racing merch — hoodies, tees, accessories and the exclusive Andy’s Man Club charity range. Print-on-demand, shipped to the UK & Ireland.',
};

/**
 * Revalidate every 5 minutes. Next.js requires `revalidate` to be a STATIC
 * literal, kept in sync with the data layer's CACHE_TTL_SECONDS.
 */
export const revalidate = 300;

/**
 * Merch store. Fetches the Tapstitch + Printify catalogs on the server (same
 * source `GET /api/merch/products` wraps), merges them, and renders a filterable
 * grid plus the persistent cart. Degrades to a sample catalog with a notice when
 * provider keys are absent.
 */
export default async function MerchPage() {
  const [tapstitch, printify] = await Promise.all([
    fetchTapstitchProducts(),
    fetchPrintifyProducts(),
  ]);
  const products = mergeCatalogs(tapstitch.data, printify.data);
  const usingSample: DataSource[] = [tapstitch.source, printify.source].filter((s) => s === 'sample');

  return (
    <>
      {/* Header */}
      <section className="relative overflow-hidden border-b border-line">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-grid-lines bg-grid opacity-25 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]"
        />
        <div className="container-rail relative py-16 sm:py-20">
          <span className="kicker mb-4">Official Store</span>
          <h1 className="text-4xl font-bold text-ink sm:text-6xl">
            Apex &amp; Chill <span className="text-gradient">Merch</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            Wear the livery. Hoodies, tees and accessories printed on demand — plus
            our exclusive Andy&apos;s Man Club charity range.
          </p>
        </div>
      </section>

      <div className="container-rail space-y-10 py-12 sm:py-16">
        {usingSample.length > 0 && (
          <div className="flex items-start gap-2 rounded-card border border-flag-amber/30 bg-flag-amber/5 px-4 py-3 text-sm text-muted">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-flag-amber" aria-hidden />
            <span>
              Showing a sample catalog. Live products sync in automatically once the
              Tapstitch and Printify stores are connected.
            </span>
          </div>
        )}

        {/* Andy's Man Club feature band */}
        <section className="relative overflow-hidden rounded-card border border-pink/20 bg-pink/5 p-6 sm:p-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Heart className="mt-1 h-6 w-6 shrink-0 text-pink" />
              <div>
                <h2 className="font-display text-xl text-ink">Andy&apos;s Man Club Range</h2>
                <p className="mt-1 max-w-xl text-sm text-muted">
                  Our exclusive charity collection supports men&apos;s mental health.
                  A share of every sale goes to Andy&apos;s Man Club. #ITSOKAYTOTALK
                </p>
              </div>
            </div>
            <Button href="/partners" variant="outline">
              Our Partnership
            </Button>
          </div>
        </section>

        <ProductGrid products={products} />
      </div>

      <Cart />
    </>
  );
}
