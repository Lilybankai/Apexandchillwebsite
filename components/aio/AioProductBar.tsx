"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Download } from "lucide-react";
import { AIO_PRODUCT } from "@/lib/aio";
import { AIO_PAGES } from "@/lib/aio-pages";
import { cn } from "@/lib/utils";

/**
 * The second bar every Apex AIO page carries under the site header — the
 * product's own navigation, so the main header keeps its single "Apex AIO"
 * entry however many topic pages the product grows.
 *
 * It sticks directly under the header (h-16, lg:h-20). On a phone the links
 * scroll sideways rather than collapsing into a second menu: six short words
 * fit a swipe, and a hamburger inside a hamburger is the complication this
 * bar exists to avoid.
 */
export function AioProductBar() {
  const pathname = usePathname();

  return (
    <div className="sticky top-16 z-30 border-b border-line bg-base/90 backdrop-blur-md lg:top-20">
      <div className="container-rail flex h-12 items-center gap-4">
        <Link
          href={AIO_PAGES[0].path}
          className="hidden shrink-0 font-display text-sm font-bold uppercase tracking-wide text-ink sm:block"
        >
          Apex <span className="text-gradient">AIO</span>
        </Link>
        <span aria-hidden className="hidden h-5 w-px shrink-0 bg-line sm:block" />

        <nav
          aria-label="Apex AIO"
          className="-mx-2 flex min-w-0 flex-1 items-center gap-1 overflow-x-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {AIO_PAGES.map((page) => {
            const active = pathname === page.path;
            return (
              <Link
                key={page.key}
                href={page.path}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 font-display text-xs font-medium uppercase tracking-wide transition-colors sm:text-sm",
                  active ? "bg-accent/15 text-accent" : "text-muted hover:text-ink",
                )}
              >
                {page.navLabel}
              </Link>
            );
          })}
        </nav>

        <a
          href={AIO_PRODUCT.downloadPath}
          download
          className="hidden shrink-0 items-center gap-2 rounded-full bg-neon-primary px-4 py-1.5 font-display text-xs font-semibold uppercase tracking-wide text-white shadow-glow-soft transition-all hover:brightness-110 md:inline-flex"
        >
          <Download size={14} aria-hidden />
          {AIO_PRODUCT.trialDays}-day free trial
        </a>
      </div>
    </div>
  );
}
