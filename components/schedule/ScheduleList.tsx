"use client";

import { useMemo, useState } from "react";
import type { League } from "@/lib/types";
import { LEAGUE_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";
import { RoundCard, type ScheduleRound } from "@/components/schedule/RoundCard";

/**
 * Graceful sample schedule used until the data layer exposes a live schedule
 * source. Clearly badged as "sample" in the UI. GT7 Season 3 is complete
 * (per Scout); LMU Season 2 is mid-season with upcoming rounds.
 */
const SAMPLE_SCHEDULE: ScheduleRound[] = [
  // ---- GT7 League — Season 3 (complete) — Sundays 20:00 ----
  { league: "GT7", round: 1, track: "Nürburgring GP", class: "GR.3", date: "2026-01-11", time: "20:00", status: "completed" },
  { league: "GT7", round: 2, track: "Suzuka Circuit", class: "GR.2", date: "2026-01-18", time: "20:00", status: "completed" },
  { league: "GT7", round: 3, track: "Brands Hatch", class: "GR.3", date: "2026-01-25", time: "20:00", variableWeather: true, status: "completed" },
  { league: "GT7", round: 4, track: "Autodromo di Monza", class: "GR.2", date: "2026-02-01", time: "20:00", status: "completed" },
  { league: "GT7", round: 5, track: "Spa-Francorchamps", class: "GR.3", date: "2026-02-08", time: "20:00", variableWeather: true, status: "completed" },
  { league: "GT7", round: 6, track: "Interlagos", class: "GR.2", date: "2026-02-15", time: "20:00", status: "completed" },
  { league: "GT7", round: 7, track: "Red Bull Ring", class: "F3500", date: "2026-02-22", time: "20:00", status: "completed" },
  { league: "GT7", round: 8, track: "Mount Panorama", class: "GR.3", date: "2026-03-01", time: "20:00", variableWeather: true, status: "completed" },
  { league: "GT7", round: 9, track: "Autopolis", class: "GR.2", date: "2026-03-08", time: "20:00", status: "completed" },
  { league: "GT7", round: 10, track: "Trial Mountain", class: "GR.3", date: "2026-03-15", time: "20:00", status: "completed" },
  { league: "GT7", round: 11, track: "Yas Marina", class: "GR.2", date: "2026-03-22", time: "20:00", status: "completed" },
  { league: "GT7", round: 12, track: "Circuit de la Sarthe", class: "GR.3", date: "2026-03-29", time: "20:00", variableWeather: true, status: "completed" },

  // ---- LMU League — Season 2 (in progress) — Saturdays 20:00 ----
  { league: "LMU", round: 1, track: "Sebring International", class: "GT3 / Hypercar", date: "2026-05-30", time: "20:00", status: "completed" },
  { league: "LMU", round: 2, track: "Algarve (Portimão)", class: "GT3 / Hypercar", date: "2026-06-06", time: "20:00", variableWeather: true, status: "completed" },
  { league: "LMU", round: 3, track: "Autodromo di Monza", class: "GT3 / Hypercar", date: "2026-06-13", time: "20:00", status: "completed" },
  { league: "LMU", round: 4, track: "Spa-Francorchamps", class: "GT3 / Hypercar", date: "2026-06-20", time: "20:00", variableWeather: true, status: "completed" },
  { league: "LMU", round: 5, track: "Fuji Speedway (WEC)", class: "GT3 / Hypercar", date: "2026-07-25", time: "20:00", lobbyOpens: "19:00", status: "upcoming" },
  { league: "LMU", round: 6, track: "Bahrain International", class: "GT3 / Hypercar", date: "2026-08-01", time: "20:00", lobbyOpens: "19:00", status: "upcoming" },
  { league: "LMU", round: 7, track: "Interlagos", class: "GT3 / Hypercar", date: "2026-08-08", time: "20:00", lobbyOpens: "19:00", variableWeather: true, status: "upcoming" },
  { league: "LMU", round: 8, track: "Circuit of the Americas", class: "GT3 / Hypercar", date: "2026-08-15", time: "20:00", lobbyOpens: "19:00", status: "upcoming" },
  { league: "LMU", round: 9, track: "Circuit de la Sarthe", class: "GT3 / Hypercar", date: "2026-08-22", time: "20:00", lobbyOpens: "19:00", status: "upcoming" },
];

const SEASON_LABELS: Record<League, string> = {
  GT7: "Season 3",
  LMU: "Season 2",
};

/** Full GT7 + LMU calendars with a league toggle and next-race highlight. */
export function ScheduleList() {
  const [active, setActive] = useState<League>("LMU");

  const rounds = useMemo(
    () => SAMPLE_SCHEDULE.filter((r) => r.league === active).sort((a, b) => a.round - b.round),
    [active],
  );

  // The soonest upcoming round in the active league is the "next race".
  const nextRound = useMemo(() => {
    const now = Date.now();
    return rounds
      .filter((r) => r.status === "upcoming" && new Date(`${r.date}T${r.time || "00:00"}`).getTime() >= now)
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
          {(["GT7", "LMU"] as League[]).map((lg) => (
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
          <span className="chip">{SEASON_LABELS[active]}</span>
          <span className="chip text-flag-amber" title="Live schedule source not yet configured">
            Sample data
          </span>
        </div>
      </div>

      {/* Season status banner */}
      {remaining === 0 ? (
        <div className="mb-6 rounded-card border border-success/30 bg-success/5 px-5 py-4 text-center font-display text-lg font-semibold uppercase tracking-wide text-success">
          {SEASON_LABELS[active]} Complete — {rounds.length} rounds raced
        </div>
      ) : (
        <div className="mb-6 font-mono text-xs uppercase tracking-widest text-subtle">
          {remaining} of {rounds.length} rounds remaining
        </div>
      )}

      {/* Rounds */}
      <div className="space-y-3">
        {rounds.map((round) => (
          <RoundCard
            key={`${round.league}-${round.round}`}
            round={round}
            isNext={nextRound ? round.round === nextRound.round : false}
          />
        ))}
      </div>
    </div>
  );
}
