import { CalendarPlus, MapPin, CloudRain, CheckCircle2, Flag } from "lucide-react";
import type { ScheduleRound } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { formatRaceDate, googleCalendarUrl } from "@/lib/utils";

export type { ScheduleRound };

/**
 * A single round row/card. The soonest upcoming round is emphasised via the
 * `isNext` flag (accent border + "Next Race" badge).
 */
export function RoundCard({ round, isNext = false }: { round: ScheduleRound; isNext?: boolean }) {
  const isCompleted = round.status === "completed";
  const gcal =
    !isCompleted && round.time
      ? googleCalendarUrl({
          round: round.round,
          track: round.track,
          class: round.class,
          date: round.date,
          time: round.time,
          lobbyOpens: round.lobbyOpens,
        })
      : null;

  return (
    <Card
      variant={isNext ? "glow" : "default"}
      className={`flex flex-col gap-4 p-5 sm:flex-row sm:items-center ${
        isCompleted ? "opacity-70" : ""
      }`}
    >
      {/* Round number */}
      <div className="flex items-center gap-4 sm:w-32 sm:shrink-0">
        <div className="flex flex-col">
          <span className="font-mono text-[0.6rem] uppercase tracking-widest text-subtle">
            Round
          </span>
          <span className="tabular text-3xl font-bold leading-none text-ink">
            {String(round.round).padStart(2, "0")}
          </span>
        </div>
        {isNext && (
          <span className="inline-flex items-center gap-1.5 bg-accent/15 px-2.5 py-1 font-mono text-[0.6rem] font-semibold uppercase tracking-widest text-accent">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-accent" />
            Next
          </span>
        )}
      </div>

      {/* Track + meta */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <MapPin size={15} className="shrink-0 text-cyan" />
          <h3 className="truncate font-display text-xl font-semibold uppercase text-ink">
            {round.track}
          </h3>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="chip">{round.class}</span>
          {round.variableWeather && (
            <span className="chip text-flag-blue">
              <CloudRain size={11} /> Variable Weather
            </span>
          )}
          <span className="font-mono text-xs text-subtle">
            {formatRaceDate(round.date)}
            {round.time ? ` · ${round.time}` : ""}
          </span>
        </div>
      </div>

      {/* Status / action */}
      <div className="flex shrink-0 items-center gap-3 sm:justify-end">
        {isCompleted ? (
          <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-success">
            <CheckCircle2 size={14} /> Completed
          </span>
        ) : gcal ? (
          <a
            href={gcal}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 border border-cyan/50 px-3 py-2 font-display text-xs font-semibold uppercase tracking-wide text-cyan transition-colors hover:bg-cyan/10"
          >
            <CalendarPlus size={14} /> Add to Calendar
          </a>
        ) : (
          <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-muted">
            <Flag size={14} /> Upcoming
          </span>
        )}
      </div>
    </Card>
  );
}
