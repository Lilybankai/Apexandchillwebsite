import { CalendarPlus, MapPin, Trophy, Clock, DoorOpen } from "lucide-react";
import type { ApiResult, League, NextRace } from "@/lib/types";
import { LEAGUE_LABELS } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatRaceDate, googleCalendarUrl } from "@/lib/utils";

/** Prominent "next event" card driven by the soonest upcoming race. */
export function NextRaceCard({
  primary,
}: {
  primary: { league: League; result: ApiResult<NextRace> };
}) {
  const race = primary.result.data;
  const isSample = primary.result.source === "sample";
  const gcal = googleCalendarUrl({
    round: race.round,
    track: race.track,
    class: race.class,
    date: race.date,
    time: race.time,
    lobbyOpens: race.lobbyOpens,
  });

  const meta = [
    { icon: MapPin, label: "Track", value: race.track },
    { icon: Trophy, label: "Class", value: race.class },
    { icon: Clock, label: "Start", value: `${race.time} local` },
    { icon: DoorOpen, label: "Lobby Opens", value: race.lobbyOpens || "TBC" },
  ];

  return (
    <section className="container-rail relative -mt-6 py-6">
      <Card variant="glow" clip className="overflow-hidden">
        {/* accent sheen top border */}
        <div aria-hidden className="h-1 w-full bg-neon-primary" />
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 bg-accent/15 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-widest text-accent">
              <span className="h-2 w-2 animate-pulse-dot rounded-full bg-accent" />
              Next Event
            </span>
            <span className="chip text-cyan">{LEAGUE_LABELS[primary.league]}</span>
            {isSample && (
              <span className="chip text-flag-amber" title="Live API keys not yet configured">
                Sample data
              </span>
            )}
          </div>

          <h2 className="mt-5 text-4xl font-bold text-ink sm:text-5xl">
            <span className="text-gradient">Round {race.round}</span> · {race.track}
          </h2>
          <p className="mt-3 tabular text-lg text-muted">
            {formatRaceDate(race.date)} · {race.time}
          </p>

          <div className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line/60 lg:grid-cols-4">
            {meta.map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-surface/80 px-4 py-4">
                <div className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-widest text-subtle">
                  <Icon size={13} className="text-accent" />
                  {label}
                </div>
                <div className="mt-1.5 font-display text-lg font-semibold uppercase text-ink">
                  {value}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            {gcal && (
              <Button href={gcal} target="_blank" rel="noopener noreferrer" size="md">
                <CalendarPlus size={17} />
                Add to Calendar
              </Button>
            )}
            <Button href="/schedule" variant="outline" size="md">
              View Full Schedule
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
}
