import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/aio/SectionHeading";
import { AIO_PAGES, type AioPageKey } from "@/lib/aio-pages";

/**
 * "The rest of the app": an index of every other Apex AIO page. Every topic
 * page carries it so each one links to all the others, which is what lets
 * search engines (and people) see the section as one product rather than five
 * orphans.
 *
 * Numbered in product-bar order, so a page keeps its number wherever it is
 * listed from.
 */
export function AioRelatedPages({ current }: { current: AioPageKey }) {
  const others = AIO_PAGES.map((page, i) => ({ page, number: String(i + 1).padStart(2, "0") })).filter(
    ({ page }) => page.key !== current,
  );
  return (
    <section className="border-t border-line py-16">
      <div className="container-rail">
        <SectionHeading label="Also in Apex AIO" title="One app, one price" />
        <ul className="border-t border-line">
          {others.map(({ page, number }) => (
            <li key={page.key} className="border-b border-line">
              <Link
                href={page.path}
                className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-4 gap-y-1 py-4 transition-colors hover:bg-surface/40 sm:grid-cols-[3rem_14rem_1fr_auto] sm:px-2"
              >
                <span className="font-mono text-xs tabular-nums text-subtle">{number}</span>
                <span className="font-display text-lg font-bold uppercase tracking-wide text-ink group-hover:text-cyan">
                  {page.breadcrumb}
                </span>
                <span className="col-start-2 row-start-2 text-sm text-muted sm:col-start-3 sm:row-start-1 sm:line-clamp-1">
                  {page.description}
                </span>
                <ArrowRight
                  size={16}
                  aria-hidden
                  className="col-start-3 row-start-1 self-center text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-cyan sm:col-start-4"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
