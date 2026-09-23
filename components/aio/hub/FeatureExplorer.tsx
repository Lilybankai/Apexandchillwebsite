"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HubFeature } from "@/components/aio/hub/features";
import { useRovingTabs } from "@/components/aio/hub/useRovingTabs";

const HASH_PREFIX = "#feature-";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Every feature on one screen, laid out like a timing monitor: a column of
 * numbered rows (a swipeable strip on a phone) and the chosen feature's
 * summary, spec table, live mock and link to its topic page.
 *
 * Every panel is rendered, inactive ones with `hidden`, so all of the copy is
 * in the server HTML for search engines and for find-in-page. Only the
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
    <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-12">
      <div
        role="tablist"
        aria-label="Apex AIO features"
        onKeyDown={onKeyDown}
        className={cn(
          "-mx-5 flex overflow-x-auto border-y border-line px-5 [scrollbar-width:none] sm:-mx-8 sm:px-8 [&::-webkit-scrollbar]:hidden",
          "lg:mx-0 lg:flex-col lg:self-start lg:overflow-visible lg:border-b-0 lg:px-0",
        )}
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
                "relative flex shrink-0 items-baseline gap-3 whitespace-nowrap px-3 py-3 text-left transition-colors",
                "focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent",
                "lg:border-b lg:border-line lg:py-2.5 lg:pl-4",
                selected ? "bg-surface text-ink" : "text-muted hover:bg-surface/50 hover:text-ink",
              )}
            >
              {/* The selected row's marker: a bar underneath on a phone, down the left on a desktop */}
              <span
                aria-hidden
                className={cn(
                  "absolute bg-cyan",
                  "inset-x-0 bottom-0 h-[2px] lg:inset-x-auto lg:inset-y-0 lg:left-0 lg:h-auto lg:w-[2px]",
                  selected ? "opacity-100" : "opacity-0",
                )}
              />
              <span className={cn("font-mono text-[11px] tabular-nums", selected ? "text-cyan" : "text-subtle")}>
                {pad(i + 1)}
              </span>
              <span className="font-display text-sm uppercase tracking-wide">{feature.label}</span>
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
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:items-start">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-subtle">
                <span className="tabular-nums text-cyan">{pad(i + 1)}</span> · {feature.tag}
              </p>
              <h3 className="mt-3 font-display text-2xl font-bold uppercase tracking-wide text-ink sm:text-3xl">
                {feature.title}
              </h3>
              <p className="mt-3 leading-relaxed text-muted">{feature.summary}</p>
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
            <div>
              <dl className="border-t border-line">
                {feature.specs.map(([label, value]) => (
                  <div
                    key={label}
                    className="grid grid-cols-[112px_minmax(0,1fr)] gap-4 border-b border-line py-2.5 sm:grid-cols-[132px_minmax(0,1fr)]"
                  >
                    <dt className="pt-px font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">{label}</dt>
                    <dd className="text-sm text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
              {feature.note && <p className="mt-3 text-xs text-subtle">{feature.note}</p>}
            </div>
          </div>
          <div className="mt-8">{feature.visual}</div>
        </div>
      ))}
    </div>
  );
}
