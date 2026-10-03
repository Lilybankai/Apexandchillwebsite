"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Download } from "lucide-react";
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
 *
 * On a phone it is dressed up so it can't be mistaken for part of the header:
 * a neon rule along its top edge, a raised surface, an "AIO" tag, larger
 * labels, and faded edges plus a chevron wherever there are more links to
 * swipe to. The current page is scrolled into view, so on the later topic
 * pages "you are here" isn't hidden off the right-hand edge.
 */
export function AioProductBar() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  /** Whether there is more to swipe to on either side. */
  const syncEdges = useCallback(() => {
    const nav = navRef.current;
    if (!nav) return;
    const start = nav.scrollLeft > 4;
    const end = nav.scrollLeft + nav.clientWidth < nav.scrollWidth - 4;
    setEdges((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    nav.addEventListener("scroll", syncEdges, { passive: true });
    const observer = new ResizeObserver(syncEdges);
    observer.observe(nav);
    return () => {
      nav.removeEventListener("scroll", syncEdges);
      observer.disconnect();
    };
  }, [syncEdges]);

  // Centre the current page's link in the strip. Horizontal only — scrollIntoView
  // would also scroll the page itself.
  useEffect(() => {
    const nav = navRef.current;
    const active = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (nav && active) {
      nav.scrollLeft = active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2;
    }
    syncEdges();
  }, [pathname, syncEdges]);

  const fade = `linear-gradient(to right, transparent, #000 ${edges.start ? 28 : 0}px, #000 calc(100% - ${edges.end ? 40 : 0}px), transparent)`;

  return (
    <div className="sticky top-16 z-30 border-b border-line bg-base/90 backdrop-blur-md max-sm:bg-surface/95 max-sm:shadow-[0_10px_24px_-14px_rgb(0_0_0/0.9)] lg:top-20">
      <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-neon-cyan sm:hidden" />

      <div className="container-rail flex h-11 items-stretch gap-4 max-sm:h-12 max-sm:gap-3">
        <Link
          href={AIO_PAGES[0].path}
          className="hidden shrink-0 items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.24em] text-ink sm:flex"
        >
          <span aria-hidden className="h-1.5 w-1.5 bg-cyan" />
          Apex AIO
        </Link>
        {/* The phone's tag. Not a link: Overview is the first item beside it. */}
        <span
          aria-hidden
          className="flex shrink-0 items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-ink sm:hidden"
        >
          <span className="h-1.5 w-1.5 bg-cyan" />
          AIO
        </span>
        <span aria-hidden className="my-3 w-px shrink-0 bg-line" />

        <div className="relative flex min-w-0 flex-1">
          <nav
            ref={navRef}
            aria-label="Apex AIO"
            style={{ maskImage: fade, WebkitMaskImage: fade }}
            className="relative -mx-2 flex min-w-0 flex-1 items-stretch overflow-x-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {AIO_PAGES.map((page, i) => {
              const active = pathname === page.path;
              return (
                <Link
                  key={page.key}
                  href={page.path}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex shrink-0 items-center gap-2 whitespace-nowrap px-3 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors max-sm:px-2.5 max-sm:text-xs max-sm:tracking-[0.12em]",
                    active ? "text-ink" : "text-muted hover:text-ink max-sm:text-ink/80",
                  )}
                >
                  <span aria-hidden className={cn("tabular-nums", active ? "text-cyan" : "text-subtle")}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {page.navLabel}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-3 bottom-0 h-px transition-colors max-sm:inset-x-2.5 max-sm:h-0.5",
                      active ? "bg-cyan" : "bg-transparent",
                    )}
                  />
                </Link>
              );
            })}
          </nav>
          {/* "More this way" cue. Decorative: the links themselves are all focusable. */}
          <ChevronRight
            aria-hidden
            size={16}
            className={cn(
              "pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-cyan transition-opacity",
              edges.end ? "opacity-100" : "opacity-0",
            )}
          />
        </div>

        {/* Below md the trial button jumps to the page's closing trial panel rather
            than downloading: the installer is ~330 MB of Windows, and a phone is
            where people browse, not where they install. */}
        <a
          href="#free-trial"
          className="my-2 inline-flex shrink-0 items-center bg-neon-primary px-3 font-display text-xs font-semibold uppercase tracking-wide text-white transition-all hover:brightness-110 md:hidden"
        >
          Try free
        </a>
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
