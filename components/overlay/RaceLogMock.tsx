"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Copy, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  RL_CAR,
  RL_CLASS,
  RL_CLASS_POS,
  RL_COUNTS,
  RL_DRIVER,
  RL_EVENTS,
  RL_INCIDENT_KINDS,
  RL_KIND_WORD,
  RL_LAPS,
  RL_POS,
  RL_REPLAYABLE,
  RL_STARTED,
  RL_TRACK,
  rlClock,
  type RaceLogEvent,
  type RaceLogKind,
} from "@/components/overlay/raceLogData";

/**
 * The Race log tab, rebuilt from the app's `review-racelog.js` and the
 * `rv-log` rules in `review-panel.css`: the race rail, the facts, the
 * position line, the replay strip and the timeline.
 *
 * It works the way the tab does, as far as a web page can: the filters
 * filter, Replay marks the row and says where the game's replay has been put,
 * and Previous / Next walk the race's incidents. Nothing talks to a game.
 *
 * Colours are the app's: red for a heavy contact, major damage or a penalty,
 * amber for a light contact, a limits warning or a flag, green and red for
 * places gained and lost, violet for a class best and green for a personal
 * best on a lap line.
 */
const C = {
  cyan: "#26bbf4",
  ok: "#35d07f",
  bad: "#ff5470",
  warn: "#ffb020",
  best: "#b388ff",
  text2: "#9aa4b8",
  text3: "#66708a",
} as const;

type FilterId = "all" | "incidents" | "contacts" | "penalties" | "positions" | "laps" | "pit" | "flags";

const FILTERS: { id: FilterId; label: string; kinds: ReadonlySet<RaceLogKind> | null }[] = [
  { id: "all", label: "All", kinds: null },
  { id: "incidents", label: "Incidents", kinds: RL_INCIDENT_KINDS },
  { id: "contacts", label: "Contacts", kinds: new Set(["contact"]) },
  { id: "penalties", label: "Limits & penalties", kinds: new Set(["limits", "penalty"]) },
  { id: "positions", label: "Positions", kinds: new Set(["start", "position", "finish"]) },
  { id: "laps", label: "Laps", kinds: new Set(["lap"]) },
  { id: "pit", label: "Pit & drivers", kinds: new Set(["pit", "driver"]) },
  { id: "flags", label: "Flags", kinds: new Set(["flag"]) },
];

/** Indexes into RL_EVENTS that carry a Replay button, in race order. */
const INCIDENTS = RL_EVENTS.flatMap((e, i) => (RL_REPLAYABLE.has(e.kind) ? [i] : []));

/** The heavy contact: where the page opens, mid-review. */
const OPENED_ON = RL_EVENTS.findIndex((e) => e.kind === "contact" && e.tone === "bad");

const RACES = [
  { day: "Today", track: RL_TRACK, meta: `${RL_CLASS} · ${RL_STARTED}`, where: `P${RL_POS[RL_LAPS]} · P${RL_CLASS_POS[RL_LAPS]} ${RL_CLASS}`, note: `${RL_COUNTS.contacts} contacts · ${RL_COUNTS.penalties} penalty`, active: true },
  { day: "Yesterday", track: "Circuit de la Sarthe", meta: `${RL_CLASS} · 20:30`, where: "P19 · P7 LMGT3", note: "1 contact" },
  { day: "Sat, 26 Sept", track: "Algarve International Circuit", meta: "LMP2 · 19:15", where: "P6 · P2 LMP2", note: "clean", provisional: true },
  { day: "", track: "Autodromo Enzo e Dino Ferrari", meta: "Hypercar · 13:00", where: "P3", note: "2 contacts · 1 penalty" },
  { day: "Thu, 24 Sept", track: "Sebring International Raceway", meta: "LMGT3 · 21:00", where: "Which car?", none: true },
];

function where(kind: RaceLogKind, raceS: number, lap: number) {
  return `${RL_KIND_WORD[kind].toLowerCase()} at ${rlClock(raceS)}${lap ? `, lap ${lap}` : ""}`;
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="inline-flex items-baseline gap-2">
      <b className="font-display text-[9.5px] font-medium uppercase tracking-widest text-subtle">{label}</b>
      <span className="font-mono text-[12px] text-ink">{children}</span>
    </span>
  );
}

function Moved({ from, to }: { from: number; to: number }) {
  const moved = from - to;
  return (
    <>
      P{from} → P{to}
      {moved ? (
        <i className="ml-1 not-italic text-[11px]" style={{ color: moved > 0 ? C.ok : C.bad }}>
          {moved > 0 ? "+" : "−"}
          {Math.abs(moved)}
        </i>
      ) : null}
    </>
  );
}

/**
 * Place by lap: one band overall, one in class, P1 at the top of each. A step
 * line, because a place holds until the next crossing moves it.
 */
function PositionChart() {
  const W = 900;
  const BAND = 58;
  const GAP = 14;
  const LEFT = 64;
  const bands = [
    { label: "Overall", pos: RL_POS, max: 20 },
    { label: RL_CLASS, pos: RL_CLASS_POS, max: 9 },
  ];
  const x = (lap: number) => LEFT + ((W - LEFT - 8) * lap) / RL_LAPS;
  return (
    <svg
      viewBox={`0 0 ${W} ${bands.length * BAND + GAP}`}
      className="mt-3 block h-auto w-full"
      role="img"
      aria-label={`Position lap by lap: P${RL_POS[0]} to P${RL_POS[RL_LAPS]} overall, P${RL_CLASS_POS[0]} to P${RL_CLASS_POS[RL_LAPS]} in ${RL_CLASS}`}
    >
      {bands.map((band, b) => {
        const top = b * (BAND + GAP);
        const y = (p: number) => top + 6 + ((BAND - 12) * (p - 1)) / (band.max - 1);
        let d = `M${x(0)},${y(band.pos[0])}`;
        for (let n = 1; n <= RL_LAPS; n += 1) d += ` H${x(n)} V${y(band.pos[n])}`;
        return (
          <g key={band.label}>
            <rect x={LEFT} y={top} width={W - LEFT - 8} height={BAND} fill="rgba(255,255,255,0.015)" />
            <line x1={LEFT} x2={W - 8} y1={top + BAND} y2={top + BAND} stroke="rgba(255,255,255,0.06)" />
            <text x={0} y={top + 14} fill={C.text3} fontSize={10} fontFamily="var(--font-display)" letterSpacing="0.1em">
              {band.label.toUpperCase()}
            </text>
            <text x={0} y={top + 30} fill={C.text2} fontSize={11} fontFamily="var(--font-mono)">
              P{band.pos[RL_LAPS]}
            </text>
            <path d={d} fill="none" stroke={C.cyan} strokeWidth={1.75} strokeLinejoin="round" />
            <circle cx={x(RL_LAPS)} cy={y(band.pos[RL_LAPS])} r={3} fill={C.cyan} />
          </g>
        );
      })}
      {/* The contact on lap 6 and the drive-through on lap 11, where the line drops. */}
      {[6, 11].map((lap) => (
        <line
          key={lap}
          x1={x(lap - 0.5)}
          x2={x(lap - 0.5)}
          y1={0}
          y2={bands.length * BAND + GAP}
          stroke={C.bad}
          strokeOpacity={0.35}
          strokeDasharray="2 3"
        />
      ))}
    </svg>
  );
}

function Row({
  e,
  i,
  asked,
  onReplay,
}: {
  e: RaceLogEvent;
  i: number;
  asked: boolean;
  onReplay: (i: number) => void;
}) {
  const kindColor =
    e.tone === "bad" ? C.bad : e.tone === "warn" ? C.warn : e.dir === "gain" ? C.ok : e.dir === "loss" ? C.bad : C.text3;
  const edge = e.tone === "bad" ? C.bad : e.tone === "warn" ? C.warn : null;
  const lapColor = e.lapInvalid ? C.text3 : e.lapRank === "class" ? C.best : e.lapRank === "pb" ? C.ok : undefined;
  return (
    <tr
      className={cn("border-b border-line/60 last:border-0", asked && "bg-cyan/[0.07]")}
      style={asked ? { outline: `1px solid ${C.cyan}`, outlineOffset: -1 } : undefined}
    >
      <td
        className="w-px whitespace-nowrap py-1.5 pl-3 pr-2 font-mono text-[11px]"
        style={{ color: C.text2, boxShadow: edge ? `inset 2px 0 0 ${edge}` : undefined }}
      >
        {rlClock(e.raceS)}
      </td>
      <td className="w-px whitespace-nowrap px-2 py-1.5 text-right font-mono text-[11px]" style={{ color: C.text3 }}>
        {e.lap > 0 ? `L${e.lap}` : "—"}
      </td>
      <td
        className="w-px whitespace-nowrap px-2 py-1.5 font-display text-[9.5px] uppercase tracking-[0.08em]"
        style={{ color: kindColor }}
      >
        {RL_KIND_WORD[e.kind]}
      </td>
      <td
        className={cn(
          "min-w-[200px] px-2 py-1.5 text-[12px]",
          (e.kind === "start" || e.kind === "finish") && "font-semibold",
          e.kind === "lap" ? "text-muted" : "text-ink",
        )}
      >
        {e.kind === "lap" ? (
          <>
            <span className="font-mono text-[11.5px]" style={{ color: lapColor ?? "rgb(var(--color-ink))" }}>
              {e.lapTime}
            </span>
            {e.lapRest ? (
              <span className="ml-1.5 text-[11px]" style={{ color: e.lapInvalid ? C.warn : C.text3 }}>
                {e.lapRest}
              </span>
            ) : null}
          </>
        ) : (
          e.text
        )}
      </td>
      <td className="w-px whitespace-nowrap py-1.5 pl-2 pr-3 text-right">
        {RL_REPLAYABLE.has(e.kind) ? (
          <button
            type="button"
            onClick={() => onReplay(i)}
            aria-pressed={asked}
            className={cn(
              "rounded border px-1.5 py-0.5 font-display text-[9.5px] uppercase tracking-[0.06em] transition-colors",
              asked ? "border-cyan/50 text-cyan" : "border-line text-subtle hover:border-cyan hover:text-cyan",
            )}
          >
            Replay
          </button>
        ) : null}
      </td>
    </tr>
  );
}

/**
 * `hero` is the page's opening screen: no race rail, the log already on
 * Incidents and short enough to sit beside the headline.
 */
export function RaceLogMock({ variant = "full", className }: { variant?: "full" | "hero"; className?: string }) {
  const hero = variant === "hero";
  const [filter, setFilter] = useState<FilterId>(hero ? "incidents" : "all");
  const [asked, setAsked] = useState(OPENED_ON);

  const kinds = FILTERS.find((f) => f.id === filter)?.kinds ?? null;
  const shown = useMemo(
    () => RL_EVENTS.map((e, i) => ({ e, i })).filter(({ e }) => !kinds || kinds.has(e.kind)),
    [kinds],
  );
  const step = INCIDENTS.indexOf(asked);
  const current = RL_EVENTS[asked];
  const segs = FILTERS.filter((f) => !f.kinds || RL_EVENTS.some((e) => f.kinds!.has(e.kind)));
  const visibleSegs = hero ? segs.filter((f) => ["all", "incidents", "contacts", "penalties"].includes(f.id)) : segs;

  return (
    <div className={cn("overflow-hidden rounded-card border border-line bg-base/70 text-left shadow-card", className)}>
      <div className={cn("grid", !hero && "lg:grid-cols-[210px_1fr]")}>
        {!hero && (
          <aside className="hidden border-r border-line bg-surface/30 p-3 lg:block">
            <div className="flex items-center gap-2 rounded-lg border border-line bg-base/60 px-2.5 py-2 text-[11px] text-subtle">
              <Search size={12} aria-hidden />
              Find a track or class
            </div>
            <div className="mt-3 space-y-2">
              {RACES.map((r) => (
                <div key={r.track}>
                  {r.day ? (
                    <div className="mb-1.5 mt-3 font-display text-[9px] uppercase tracking-widest text-subtle first:mt-0">
                      {r.day}
                    </div>
                  ) : null}
                  <div
                    className={cn(
                      "rounded-lg border border-l-2 bg-base/50 px-2.5 py-2",
                      r.active ? "border-line border-l-cyan bg-cyan/[0.06]" : "border-line border-l-line",
                    )}
                  >
                    <p className="truncate text-[11px] font-bold text-ink">{r.track}</p>
                    <p className="flex items-center gap-1.5 truncate text-[9.5px] text-subtle">
                      {r.meta}
                      {r.provisional ? (
                        <span
                          className="rounded-sm px-1 text-[8px] uppercase tracking-wide"
                          style={{ color: C.warn, background: "rgba(255,176,32,0.12)" }}
                        >
                          provisional
                        </span>
                      ) : null}
                    </p>
                    <div className="mt-1 flex items-baseline justify-between gap-2">
                      <span className="font-mono text-[11px]" style={{ color: r.none ? C.text3 : C.cyan }}>
                        {r.where}
                      </span>
                      {r.note ? <span className="font-mono text-[9px] text-subtle">{r.note}</span> : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}

        <div className="min-w-0 space-y-3 p-3 sm:p-4">
          {/* ── The race, and what it came to ─────────────────────────── */}
          <div className="rounded-lg border border-line bg-surface/30 p-3">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h4 className="text-base font-bold text-ink sm:text-lg">{RL_TRACK}</h4>
              <span
                className="rounded-full border px-2 py-px font-display text-[9px] uppercase tracking-widest"
                style={{ color: C.bad, borderColor: "rgba(255,84,112,0.5)" }}
              >
                Race
              </span>
              {!hero && (
                <span className="text-[11px] text-subtle">
                  {RL_CAR} · {RL_CLASS}
                </span>
              )}
              <span className="ml-auto text-[10px] text-subtle">Today · {RL_STARTED}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
              <Fact label="Overall">
                <Moved from={RL_POS[0]} to={RL_POS[RL_LAPS]} />
              </Fact>
              <Fact label={RL_CLASS}>
                <Moved from={RL_CLASS_POS[0]} to={RL_CLASS_POS[RL_LAPS]} />
              </Fact>
              <Fact label="Laps">{RL_LAPS}</Fact>
              {!hero && <Fact label="Status">Finished</Fact>}
              <Fact label="Contacts">{RL_COUNTS.contacts}</Fact>
              <Fact label="Limits">{RL_COUNTS.limits}</Fact>
              <Fact label="Penalties">{RL_COUNTS.penalties}</Fact>
            </div>
            {!hero && <PositionChart />}
            {!hero && (
              <p className="mt-2.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 text-[11px] text-subtle">
                Driven by {RL_DRIVER}. Matched to your lap log.
                <span className="text-muted">
                  Replay opens the game&rsquo;s own replay of this race, 5 s before the moment.
                </span>
                <span className="rounded border border-line px-1.5 py-px font-display text-[9px] uppercase tracking-[0.06em]">
                  Not your car?
                </span>
              </p>
            )}
          </div>

          {/* ── The replay strip ─────────────────────────────────────── */}
          <div
            role="status"
            className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg border px-3 py-2"
            style={{ borderColor: "rgba(53,208,127,0.4)", background: "rgba(53,208,127,0.04)" }}
          >
            <span className="font-display text-[10px] uppercase tracking-[0.09em] text-subtle">Replay</span>
            <span className="text-[12px]" style={{ color: C.ok }}>
              In the game now: 5 s before the {where(current.kind, current.raceS, current.lap)}.
            </span>
            <span className="text-[11px] text-subtle">
              Incident {step + 1} of {INCIDENTS.length}. Jumps within this race are instant.
            </span>
            <span className="ml-auto inline-flex gap-1.5">
              <button
                type="button"
                disabled={step <= 0}
                onClick={() => setAsked(INCIDENTS[step - 1])}
                className="inline-flex items-center gap-1 rounded border border-line px-2 py-1 text-[10.5px] text-ink transition-colors hover:border-cyan disabled:opacity-40 disabled:hover:border-line"
              >
                <ChevronLeft size={12} aria-hidden />
                Previous
              </button>
              <button
                type="button"
                disabled={step >= INCIDENTS.length - 1}
                onClick={() => setAsked(INCIDENTS[step + 1])}
                className="inline-flex items-center gap-1 rounded border border-line px-2 py-1 text-[10.5px] text-ink transition-colors hover:border-cyan disabled:opacity-40 disabled:hover:border-line"
              >
                Next
                <ChevronRight size={12} aria-hidden />
              </button>
            </span>
          </div>

          {/* ── The timeline ─────────────────────────────────────────── */}
          <div className="overflow-hidden rounded-lg border border-line bg-surface/30">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 py-2">
              <span className="font-display text-[10px] uppercase tracking-widest text-ink">Timeline</span>
              <span className="font-mono text-[10px] text-subtle">
                {!hero && <span className="mr-3 hidden sm:inline">↑ ↓ to move · Enter to replay · [ ] previous and next</span>}
                {shown.length === RL_EVENTS.length
                  ? `${RL_EVENTS.length} events`
                  : `${shown.length} of ${RL_EVENTS.length} events`}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2">
              <div
                role="group"
                aria-label="Which events to show"
                className="inline-flex flex-wrap rounded-md border border-line bg-base/60 p-0.5"
              >
                {visibleSegs.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    aria-pressed={f.id === filter}
                    onClick={() => setFilter(f.id)}
                    className={cn(
                      "rounded px-2 py-1 text-[10.5px] transition-colors",
                      f.id === filter ? "bg-cyan/15 text-cyan" : "text-muted hover:text-ink",
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <span className="ml-auto inline-flex items-center gap-1.5 rounded border border-line px-2 py-1 text-[10.5px] text-muted">
                <Copy size={11} aria-hidden />
                Copy as text
              </span>
            </div>
            <div className={cn("overflow-auto", hero ? "max-h-[300px]" : "max-h-[520px]")}>
              <table className={cn("w-full border-collapse", !hero && "min-w-[520px]")}>
                <thead className="sticky top-0 bg-surface">
                  <tr className="border-b border-line text-left font-display text-[9px] font-medium uppercase tracking-wide text-subtle">
                    <th className="py-1.5 pl-3 pr-2 font-medium">Time</th>
                    <th className="px-2 py-1.5 text-right font-medium">Lap</th>
                    <th className="px-2 py-1.5 font-medium">Kind</th>
                    <th className="px-2 py-1.5 font-medium">Event</th>
                    <th className="py-1.5 pl-2 pr-3">
                      <span className="sr-only">Replay</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map(({ e, i }) => (
                    <Row key={i} e={e} i={i} asked={i === asked} onReplay={setAsked} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
