"use client";

import { useState } from "react";
import Link from "next/link";
import type { ApiResult, League, Standings } from "@/lib/types";
import { LEAGUE_LABELS } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

/** Position-bar colours P1–P5 per the Scout design report. */
const POSITION_COLORS = [
  "rgb(var(--color-success))", // P1 racing green
  "rgb(var(--color-red))", // P2
  "rgb(var(--color-purple))", // P3
  "rgb(var(--color-blue))", // P4
  "rgb(var(--color-cyan))", // P5
];

/** Homepage standings preview with a league toggle (top 5 each). */
export function MiniStandings({
  gt7,
  lmu,
}: {
  gt7: ApiResult<Standings>;
  lmu: ApiResult<Standings>;
}) {
  const [active, setActive] = useState<League>("GT7");
  const byLeague: Record<League, ApiResult<Standings>> = { GT7: gt7, LMU: lmu };
  const current = byLeague[active];
  const rows = current.data.rows.slice(0, 5);

  return (
    <section className="container-rail py-20">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <span className="kicker mb-3">Championship</span>
          <h2 className="text-4xl font-bold text-ink sm:text-5xl">Live Standings</h2>
          <p className="mt-4 text-muted">Current championship leaders across both leagues.</p>
        </div>

        {/* League toggle */}
        <div
          className="inline-flex rounded-card border border-line bg-elevated p-1"
          role="tablist"
          aria-label="Select league"
        >
          {(Object.keys(byLeague) as League[]).map((lg) => (
            <button
              key={lg}
              role="tab"
              aria-selected={active === lg}
              onClick={() => setActive(lg)}
              className={cn(
                "px-4 py-2 font-display text-sm font-semibold uppercase tracking-wide transition-colors",
                active === lg ? "bg-neon-primary text-white" : "text-muted hover:text-ink",
              )}
            >
              {LEAGUE_LABELS[lg]}
            </button>
          ))}
        </div>
      </header>

      <Card variant="default" className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <span className="font-mono text-xs uppercase tracking-widest text-subtle">
            {current.data.seasonLabel}
          </span>
          {current.source === "sample" && (
            <span className="chip text-flag-amber">Sample data</span>
          )}
        </div>

        <ul className="divide-y divide-line">
          {rows.length === 0 && (
            <li className="px-5 py-10 text-center text-sm text-subtle">
              Season data coming soon.
            </li>
          )}
          {rows.map((row, i) => (
            <li
              key={`${row.driver}-${i}`}
              className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-elevated/50"
            >
              <span className="tabular w-6 text-center text-lg font-bold text-ink">
                {row.position}
              </span>
              <span
                aria-hidden
                className="h-9 w-1 rounded-full"
                style={{ background: POSITION_COLORS[i] ?? "rgb(var(--color-line))" }}
              />
              <span
                aria-hidden
                className="h-3 w-3 shrink-0 rounded-full ring-1 ring-inset ring-white/10"
                style={{ background: row.teamColor }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">{row.driver}</p>
                <p className="truncate font-mono text-xs text-subtle">{row.team || "Privateer"}</p>
              </div>
              <div className="hidden text-right sm:block">
                <p className="font-mono text-xs text-subtle">
                  {row.wins}W · {row.podiums}P
                </p>
              </div>
              <div className="text-right">
                <span className="tabular text-xl font-bold text-accent">{row.points}</span>
                <span className="ml-1 font-mono text-[0.6rem] uppercase tracking-widest text-subtle">
                  pts
                </span>
              </div>
            </li>
          ))}
        </ul>

        <div className="border-t border-line p-4 text-center">
          <Link
            href="/standings"
            className="font-display text-sm font-semibold uppercase tracking-wide text-cyan hover:underline"
          >
            See All Standings →
          </Link>
        </div>
      </Card>
    </section>
  );
}
