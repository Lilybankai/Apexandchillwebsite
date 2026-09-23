"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HubFeature } from "@/components/aio/hub/features";
import { useRovingTabs } from "@/components/aio/hub/useRovingTabs";

const HASH_PREFIX = "#feature-";

/**
 * Every feature on one screen: a tab list (a swipeable row of chips on a
 * phone, a column on a desktop) and the chosen feature's live mock, summary
 * and link to its topic page.
 *
 * Every panel is rendered, inactive ones with `hidden`, so all of the copy is
 * in the server HTML for search engines and for find-in-page — only the
 * visibility is client state.
 */
export function FeatureExplorer({ features }: { features: readonly HubFeature[] }) {
  const { active, select, onKeyDown, tabProps } = useRovingTabs(features.length, "both");

  // /apex-overlay-system#feature-setups opens on that tab.
  useEffect(() => {
    const open = () => {
      const { hash } = window.location;
      if (!hash.startsWith(HASH_PREFIX)) return;
      const index = features.findIndex((f) => f.id === hash.slice(HASH_PREFIX.length));
      if (index < 0) return;
      select(index);
      // The panel was hidden when the browser tried to scroll to it.
      requestAnimationFrame(() => document.getElementById("features")?.scrollIntoView());
    };
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, [features, select]);

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:gap-10">
      <div
        role="tablist"
        aria-label="Apex AIO features"
        onKeyDown={onKeyDown}
        className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
      >
        {features.map((feature, i) => {
          const selected = i === active;
          return (
            <button
              key={feature.id}
              id={`feature-tab-${feature.id}`}
              aria-controls={`feature-${feature.id}`}
              {...tabProps(i)}
              className={cn(
                "group flex shrink-0 items-center gap-3 whitespace-nowrap rounded-card border px-4 py-2.5 text-left font-display text-sm uppercase tracking-wide transition-colors",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                "lg:whitespace-normal lg:py-3",
                selected
                  ? "border-accent/60 bg-accent/15 text-ink shadow-glow-soft"
                  : "border-line bg-surface/40 text-muted hover:border-accent/40 hover:text-ink lg:border-transparent lg:bg-transparent",
              )}
            >
              <span className={selected ? "text-cyan" : "text-subtle group-hover:text-cyan"}>{feature.icon}</span>
              <span className="flex-1">{feature.label}</span>
              <ArrowRight
                size={14}
                aria-hidden
                className={cn("hidden shrink-0 transition-opacity lg:block", selected ? "opacity-100" : "opacity-0")}
              />
            </button>
          );
        })}
      </div>

      {features.map((feature, i) => (
        <div
          key={feature.id}
          id={`feature-${feature.id}`}
          role="tabpanel"
          aria-labelledby={`feature-tab-${feature.id}`}
          tabIndex={0}
          hidden={i !== active}
          className="min-w-0 scroll-mt-36 focus-visible:outline-none lg:min-h-[560px]"
        >
          <div className="grid gap-6 xl:grid-cols-[1fr_1fr] xl:items-start">
            <div>
              <span className="chip border-accent/40 text-accent-2">{feature.tag}</span>
              <h3 className="mt-4 text-2xl font-bold text-ink sm:text-3xl">{feature.title}</h3>
              <p className="mt-3 text-muted">{feature.summary}</p>
            </div>
            <div>
              <ul className="space-y-2.5">
                {feature.bullets.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm text-muted">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" aria-hidden />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              {feature.note && <p className="mt-3 text-xs text-subtle">{feature.note}</p>}
              {feature.link && (
                <Link
                  href={feature.link.href}
                  className="mt-5 inline-flex items-center gap-1.5 font-display text-sm font-semibold uppercase tracking-wide text-cyan hover:underline"
                >
                  {feature.link.label}
                  <ArrowRight size={15} aria-hidden />
                </Link>
              )}
            </div>
          </div>
          <div className="mt-8">{feature.visual}</div>
        </div>
      ))}
    </div>
  );
}
