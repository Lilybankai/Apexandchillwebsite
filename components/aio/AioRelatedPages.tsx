import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AIO_PAGES, type AioPageKey } from "@/lib/aio-pages";

/**
 * "The rest of the app" — a card per other Apex AIO page. Every topic page
 * carries it so each one links to all the others, which is what lets search
 * engines (and people) see the section as one product rather than five
 * orphans.
 */
export function AioRelatedPages({ current }: { current: AioPageKey }) {
  const others = AIO_PAGES.filter((p) => p.key !== current);
  return (
    <section className="border-t border-line py-16">
      <div className="container-rail">
        <span className="kicker mb-4">Also in Apex AIO</span>
        <h2 className="text-3xl font-bold text-ink sm:text-4xl">
          One app, <span className="text-gradient">one price</span>
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {others.map((page) => (
            <Link
              key={page.key}
              href={page.path}
              className="group flex flex-col gap-2 rounded-card border border-line bg-surface/50 p-5 transition-colors hover:border-accent/50"
            >
              <span className="font-display text-sm font-bold uppercase tracking-wide text-ink">
                {page.breadcrumb}
              </span>
              <span className="line-clamp-3 text-sm text-muted">{page.description}</span>
              <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm text-cyan">
                Read more
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
