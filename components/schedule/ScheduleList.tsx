"use client";

import { useMemo, useState } from "react";
import type { ApiResult, League, Schedule } from "@/lib/types";
import { LEAGUE_LABELS, LEAGUES } from "@/lib/types";
import { cn } from "@/lib/utils";
import { RoundCard } from "@/components/schedule/RoundCard";

export interface ScheduleListProps {
  /** Per-league season calendars, fetched on the server. */
  schedules: Partial<Record<League, ApiResult<Schedule>>>;
  /** Which league's calendar to show first. */
  initialLeague?: League;
}

/**
 * Full GT7 + LMU calendars with a league toggle and next-race highlight.
 *
 * Presentational: the season data is fetched on the server (SimGrid for LMU,
 * Sim League Pro / sample for GT7) and passed in via {@link ScheduleListProps}.
 * Each league surfaces an honest live / sample badge from its {@link ApiResult}.
 */
export function ScheduleList({ schedules, initialLeague = "LMU" }: ScheduleListProps) {
  // Only offer leagues we actually received data for, in canonical order.
  const available = useMemo(
    () => LEAGUES.filter((lg) => schedules[lg]),
    [schedules],
  );
  const [active, setActive] = useState<League>(
    available.includes(initialLeague) ? initialLeague : available[0] ?? initialLeague,
  );

  const result = schedules[active];
  const rounds = useMemo(
    () => [...(result?.data.rounds ?? [])].sort((a, b) => a.round - b.round),
    [result],
  );
  const isSample = result?.source === "sample";
  const seasonLabel = result?.data.seasonLabel ?? "Season";

  // The soonest upcoming round in the active league is the "next race".
  const nextRound = useMemo(() => {
    const now = Date.now();
    return rounds
      .filter(
        (r) =>
          r.status === "upcoming" &&
          new Date(`${r.date}T${r.time || "00:00"}`).getTime() >= now,
      )
      .sort(
        (a, b) =>
          new Date(`${a.date}T${a.time || "00:00"}`).getTime() -
          new Date(`${b.date}T${b.time || "00:00"}`).getTime(),
      )[0];
  }, [rounds]);

  const remaining = rounds.filter((r) => r.status === "upcoming").length;

  return (
    <div>
      {/* League toggle */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="inline-flex rounded-card border border-line bg-elevated p-1"
          role="tablist"
          aria-label="Select league"
        >
          {available.map((lg) => (
            <button
              key={lg}
              role="tab"
              aria-selected={active === lg}
              onClick={() => setActive(lg)}
              className={cn(
                "px-5 py-2 font-display text-sm font-semibold uppercase tracking-wide transition-colors",
                active === lg ? "bg-neon-primary text-white" : "text-muted hover:text-ink",
              )}
            >
              {LEAGUE_LABELS[lg]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="chip">{seasonLabel}</span>
          {isSample ? (
            <span className="chip text-flag-amber" title="Live schedule source not yet configured">
              Sample data
            </span>
          ) : (
            <span className="chip text-success" title="Live from SimGrid">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-success" /> Live
            </span>
          )}
        </div>
      </div>

      {/* Season status banner */}
      {rounds.length === 0 ? null : remaining === 0 ? (
        <div className="mb-6 rounded-card border border-success/30 bg-success/5 px-5 py-4 text-center font-display text-lg font-semibold uppercase tracking-wide text-success">
          {seasonLabel} Complete — {rounds.length} rounds raced
        </div>
      ) : (
        <div className="mb-6 font-mono text-xs uppercase tracking-widest text-subtle">
          {remaining} of {rounds.length} rounds remaining
        </div>
      )}

      {/* Rounds */}
      {rounds.length === 0 ? (
        <div className="glass rounded-card p-10 text-center text-muted">
          Season calendar coming soon.
        </div>
      ) : (
        <div className="space-y-3">
          {rounds.map((round) => (
            <RoundCard
              key={`${round.league}-${round.round}`}
              round={round}
              isNext={nextRound ? round.round === nextRound.round : false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
