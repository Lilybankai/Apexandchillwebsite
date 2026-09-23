"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useRovingTabs } from "@/components/aio/hub/useRovingTabs";

export type HeroDemoTab = {
  id: string;
  label: string;
  /** One line under the mock saying what is on screen. */
  caption: string;
  /** Pre-rendered on the server and handed across as a slot. */
  panel: ReactNode;
};

/**
 * The hero's live wall, one view at a time. Only the selected panel is
 * mounted: these are decoration for the H1, not the page's copy (the feature
 * explorer below carries that, all of it in the server HTML), and keeping one
 * mounted means a mock's inline SVG gradients are never duplicated inside a
 * hidden subtree — a hidden `<linearGradient>` stops painting for every other
 * copy of the same id on the page.
 */
export function HeroDemo({ tabs }: { tabs: readonly HeroDemoTab[] }) {
  const { active, onKeyDown, tabProps } = useRovingTabs(tabs.length);
  const current = tabs[active];

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-10 -inset-y-6 rounded-[32px] bg-gradient-to-br from-cyan/5 via-accent/10 to-accent-2/5 blur-2xl"
      />
      <div className="relative">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="motion-live-pulse inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-success/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-success">
            Live demo
          </span>
          <div
            role="tablist"
            aria-label="Apex AIO live demo"
            onKeyDown={onKeyDown}
            className="-mx-1 flex min-w-0 flex-1 gap-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {tabs.map((tab, i) => (
              <button
                key={tab.id}
                id={`demo-tab-${tab.id}`}
                aria-controls={i === active ? `demo-panel-${tab.id}` : undefined}
                {...tabProps(i)}
                className={cn(
                  "shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 font-display text-xs font-medium uppercase tracking-wide transition-colors sm:text-sm",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                  i === active
                    ? "border-accent/60 bg-accent/15 text-ink"
                    : "border-line bg-surface/50 text-muted hover:border-accent/40 hover:text-ink",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div
          key={current.id}
          id={`demo-panel-${current.id}`}
          role="tabpanel"
          aria-labelledby={`demo-tab-${current.id}`}
          className="motion-safe:animate-rise min-h-[320px] lg:min-h-[420px]"
        >
          {current.panel}
          <p className="mt-3 text-center font-mono text-xs text-subtle">{current.caption}</p>
        </div>
      </div>
    </div>
  );
}
