import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Product } from '@/lib/types';
import { fetchTapstitchProducts } from '@/lib/merch/tapstitch';
import { fetchPrintifyProducts } from '@/lib/merch/printify';
import { mergeCatalogs } from '@/lib/merch/catalog';
import { ProductDetail } from '@/components/merch/ProductDetail';
import { ProductCard } from '@/components/merch/ProductCard';
import { Cart } from '@/components/merch/Cart';

/**
 * Revalidate every 5 minutes. Next.js requires `revalidate` to be a STATIC
 * literal, kept in sync with the data layer's CACHE_TTL_SECONDS.
 */
export const revalidate = 300;

/** Load and merge the full catalog (shared by params, metadata, and the page). */
async function loadCatalog(): Promise<Product[]> {
  const [tapstitch, printify] = await Promise.all([
    fetchTapstitchProducts(),
    fetchPrintifyProducts(),
  ]);
  return mergeCatalogs(tapstitch.data, printify.data);
}

/** Pre-render the known (sample/live-at-build) product pages; others render on demand. */
export async function generateStaticParams(): Promise<{ handle: string }[]> {
  const products = await loadCatalog();
  return products.map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const product = (await loadCatalog()).find((p) => p.handle === handle);
  if (!product) return { title: 'Product not found', robots: { index: false } };
  const description = product.description || `${product.title} — official Apex & Chill Racing merch.`;
  const image = product.images[0];
  return {
    title: product.title,
    description,
    alternates: { canonical: `/merch/${product.handle}` },
    openGraph: {
      title: product.title,
      description,
      url: `/merch/${product.handle}`,
      ...(image ? { images: [image] } : {}),
    },
  };
}

/**
 * Product detail page. Resolves the product by handle from the merged catalog
 * and renders the interactive {@link ProductDetail} purchase panel plus a small
 * "more from the store" strip. Unknown handles 404.
 */
export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const products = await loadCatalog();
  const product = products.find((p) => p.handle === handle);
  if (!product) notFound();

  const related = products.filter((p) => p.handle !== product.handle && p.category === product.category).slice(0, 4);

  return (
    <>
      <div className="container-rail py-10 sm:py-14">
        <nav aria-label="Breadcrumb" className="mb-8">
          <Link
            href="/merch"
            className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-cyan"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Store
            <span aria-hidden className="text-subtle">/</span>
            <span className="text-subtle">{product.category}</span>
          </Link>
        </nav>

        <ProductDetail product={product} />

        {related.length > 0 && (
          <section className="mt-20 border-t border-line pt-12">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="kicker mb-2">Keep Browsing</span>
                <h2 className="font-display text-3xl text-ink">More From The Store</h2>
              </div>
              <Link
                href="/merch"
                className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-cyan transition-colors hover:text-ink"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      <Cart />
    </>
  );
}
