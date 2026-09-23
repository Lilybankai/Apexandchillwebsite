"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Download } from "lucide-react";
import { AIO_PRODUCT } from "@/lib/aio";
import { AIO_PAGES } from "@/lib/aio-pages";
import { cn } from "@/lib/utils";

/**
 * The second bar every Apex AIO page carries under the site header: the
 * product's own navigation, so the main header keeps its single "Apex AIO"
 * entry however many topic pages the product grows.
 *
 * It sticks directly under the header (h-16, lg:h-20). On a phone the links
 * scroll sideways rather than collapsing into a second menu: six short words
 * fit a swipe, and a hamburger inside a hamburger is the complication this
 * bar exists to avoid.
 *
 * Styled as a timing-screen sub-nav: mono labels, and the current page marked
 * by a hairline under it rather than a pill.
 */
export function AioProductBar() {
  const pathname = usePathname();

  return (
    <div className="sticky top-16 z-30 border-b border-line bg-base/90 backdrop-blur-md lg:top-20">
      <div className="container-rail flex h-11 items-stretch gap-4">
        <Link
          href={AIO_PAGES[0].path}
          className="hidden shrink-0 items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.24em] text-ink sm:flex"
        >
          <span aria-hidden className="h-1.5 w-1.5 bg-cyan" />
          Apex AIO
        </Link>
        <span aria-hidden className="my-3 hidden w-px shrink-0 bg-line sm:block" />

        <nav
          aria-label="Apex AIO"
          className="-mx-2 flex min-w-0 flex-1 items-stretch overflow-x-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {AIO_PAGES.map((page, i) => {
            const active = pathname === page.path;
            return (
              <Link
                key={page.key}
                href={page.path}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex shrink-0 items-center gap-2 whitespace-nowrap px-3 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors",
                  active ? "text-ink" : "text-muted hover:text-ink",
                )}
              >
                <span aria-hidden className={cn("tabular-nums", active ? "text-cyan" : "text-subtle")}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                {page.navLabel}
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-x-3 bottom-0 h-px transition-colors",
                    active ? "bg-cyan" : "bg-transparent",
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <a
          href={AIO_PRODUCT.downloadPath}
          download
          className="my-2 hidden shrink-0 items-center gap-2 bg-neon-primary px-4 font-display text-xs font-semibold uppercase tracking-wide text-white transition-all hover:brightness-110 md:inline-flex"
        >
          <Download size={14} aria-hidden />
          {AIO_PRODUCT.trialDays}-day free trial
        </a>
      </div>
    </div>
  );
}
