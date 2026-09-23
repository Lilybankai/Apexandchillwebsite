import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { AioTrialButton } from "@/components/aio/AioTrialCta";
import { cn } from "@/lib/utils";

export type AioHeroStat = { value: string; label: string };

/**
 * The top of an Apex AIO topic page, set like the opening of a broadcast
 * segment: a mono timing label, one big H1, and the product on a "screen"
 * rather than floating in a glow.
 *
 * The H1 is the search term the page is for ("LMU Overlays", "LMU Setups") so
 * the heading and the query agree; the product name belongs in the kicker, not
 * the H1. Pages pass at most one `text-gradient` span inside `title`. It is the
 * only gradient text on the page.
 *
 *   ● APEX AIO │ LE MANS ULTIMATE │ RFACTOR 2
 *   LMU OVERLAYS FOR OBS & IN-GAME
 *   lead…
 *   [trial] [actions]
 *   20 WIDGETS │ 32 TRACK MAPS │ 1–120 HZ        ┌ OVERLAY · STANDINGS ─ LIVE ┐
 *                                                 │           visual           │
 */
export function AioPageHero({
  kicker,
  title,
  lead,
  points = [],
  actions,
  visual,
  stats = [],
  visualCaption = "Apex AIO",
  visualMeta = "Live",
  frame = true,
}: {
  /** Segments separated by " · " are set as separate timing-label cells. */
  kicker: string;
  title: ReactNode;
  lead: ReactNode;
  /** Short facts, set as a compact mono list under the buttons. */
  points?: readonly string[];
  /** Extra buttons beside the trial button. */
  actions?: ReactNode;
  /** A live mock (or several) shown beside or under the copy. */
  visual?: ReactNode;
  /** A timing-screen strip of big values and tiny labels, under the buttons. */
  stats?: readonly AioHeroStat[];
  /** Mono caption on the visual's screen frame, e.g. "Overlay · Standings". */
  visualCaption?: string;
  /** Right-hand caption on the frame. Pass "" to hide it. */
  visualMeta?: string;
  /** Set false when the visual already carries its own chrome. */
  frame?: boolean;
}) {
  const segments = kicker.split(/\s*·\s*/).filter(Boolean);

  return (
    <section className="relative overflow-hidden border-b border-line">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid-lines bg-grid opacity-[0.18] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
      />
      <div className="container-rail relative grid gap-12 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:py-20">
        <Reveal>
          <p className="mb-6 flex flex-wrap items-center gap-y-2 font-mono text-[11px] uppercase tracking-[0.24em] text-subtle">
            <span aria-hidden className="mr-3 inline-block h-1.5 w-1.5 animate-pulse-dot bg-cyan" />
            {segments.map((segment, i) => (
              <span key={segment} className="inline-flex items-center">
                {i > 0 && <span aria-hidden className="mx-3 h-3 w-px bg-line" />}
                <span className={i === 0 ? "text-cyan" : undefined}>{segment}</span>
              </span>
            ))}
          </p>
          <h1 className="max-w-3xl text-5xl font-bold leading-[0.92] tracking-tight text-ink sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{lead}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <AioTrialButton />
            {actions}
          </div>

          {stats.length > 0 && (
            <dl className="mt-10 grid max-w-2xl grid-cols-2 border-y border-line sm:flex">
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className={cn(
                    "flex flex-col gap-1.5 px-4 py-3 sm:flex-1",
                    i % 2 === 0 && "pl-0",
                    i > 0 && "sm:border-l sm:border-line sm:pl-4",
                    i % 2 === 1 && "border-l border-line",
                    i >= 2 && "border-t border-line sm:border-t-0",
                  )}
                >
                  <dt className="order-2 font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">
                    {stat.label}
                  </dt>
                  <dd className="order-1 font-mono text-2xl font-semibold tabular-nums leading-none text-ink sm:text-3xl">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {points.length > 0 && (
            <ul className="mt-6 flex max-w-2xl flex-wrap gap-x-5 gap-y-2 font-mono text-xs uppercase tracking-wider text-muted">
              {points.map((point) => (
                <li key={point} className="inline-flex items-center gap-2">
                  <span aria-hidden className="h-px w-3 bg-cyan/70" />
                  {point}
                </li>
              ))}
            </ul>
          )}
        </Reveal>

        {visual && (
          <Reveal delay={150}>
            {frame ? (
              <figure className="border border-line bg-base/60">
                <figcaption className="flex items-center justify-between gap-3 border-b border-line px-3 py-2 font-mono text-[10px] uppercase tracking-[0.24em] text-subtle">
                  <span>{visualCaption}</span>
                  {visualMeta && (
                    <span className="inline-flex items-center gap-2 text-cyan">
                      <span aria-hidden className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-cyan" />
                      {visualMeta}
                    </span>
                  )}
                </figcaption>
                <div className="p-3 sm:p-4">{visual}</div>
              </figure>
            ) : (
              visual
            )}
          </Reveal>
        )}
      </div>
    </section>
  );
}
