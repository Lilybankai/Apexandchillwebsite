import type { Metadata } from 'next';
import { Info, HeartHandshake, Shirt, Truck, ShieldCheck } from 'lucide-react';
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
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/3 h-[380px] w-[620px] -translate-x-1/2 rounded-full bg-accent/20 blur-[120px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-[-8%] top-10 h-[280px] w-[280px] rounded-full bg-cyan/10 blur-[100px]"
        />
        <div className="container-rail relative py-16 sm:py-24">
          <span className="kicker mb-4">Official Store</span>
          <h1 className="text-5xl font-bold text-ink sm:text-7xl">
            Wear The <span className="text-gradient">Livery</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
            Official Apex &amp; Chill hoodies, tees and accessories — plus our
            exclusive Andy&apos;s Man Club charity range. Every piece printed on
            demand, just for you.
          </p>
          <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-[0.7rem] uppercase tracking-widest text-muted">
            <li className="flex items-center gap-2">
              <Shirt className="h-4 w-4 text-cyan" aria-hidden />
              Print on demand
            </li>
            <li className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-cyan" aria-hidden />
              UK &amp; Ireland shipping
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-cyan" aria-hidden />
              Secure Stripe checkout
            </li>
          </ul>
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
        <section className="relative overflow-hidden rounded-card border border-pink/30 shadow-glow-soft">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/10 via-base to-pink/10"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-pink/20 blur-[80px]"
          />
          <div className="relative flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-card border border-pink/40 bg-pink/10">
                <HeartHandshake className="h-5 w-5 text-pink" aria-hidden />
              </span>
              <div>
                <span className="font-mono text-[0.65rem] font-semibold uppercase tracking-widest text-pink">
                  Racing for a reason
                </span>
                <h2 className="mt-1 font-display text-2xl text-ink">Andy&apos;s Man Club Range</h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
                  Our exclusive charity collection supports men&apos;s mental health —
                  a share of every sale goes to Andy&apos;s Man Club.{' '}
                  <span className="font-semibold text-pink">#ITSOKAYTOTALK</span>
                </p>
              </div>
            </div>
            <Button href="/partners" variant="outline" className="shrink-0">
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
