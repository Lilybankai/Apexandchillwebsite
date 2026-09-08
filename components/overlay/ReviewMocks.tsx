import type { ReactNode } from "react";
import { Activity, ArrowLeft, ChevronDown, Search, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  RV_ABS,
  RV_CURSOR,
  RV_DELTA,
  RV_LAP,
  RV_LAP_MS,
  RV_MICRO,
  RV_REF,
  RV_REF_MS,
  RV_SAMPLES,
  RV_TC,
  RV_VMAX_MPH,
  rvDelta,
  rvLap,
  rvPath,
} from "@/components/overlay/reviewTraces";
import { RV_ELEV, RV_LINE_MINE, RV_LINE_THEIRS, RV_MAP, RV_POINTS, RV_ROAD } from "@/components/overlay/reviewMapData";

/**
 * The Review tab, rebuilt in HTML, CSS and SVG from the app's own renderer —
 * the same approach the overlay mocks on this page take, for the same reason:
 * a screenshot of a data panel is a picture, and this thing's entire argument
 * is that it draws real numbers.
 *
 * The palette is lifted verbatim from `review-panel.css` and
 * `review-charts.js` so the colours mean here exactly what they mean in the
 * app: violet is the session's best lap and green a stint's, the way every
 * timing screen in the sport has coloured them for thirty years; amber is a
 * lap with a real time that broke the clean rule; green and red on a delta are
 * gained and lost.
 */
const C = {
  cyan: "#26bbf4",
  cyanCmp: "#bfe9fb",
  ok: "#35d07f",
  okCmp: "#b6f0cf",
  bad: "#ff5470",
  badCmp: "#ffbcc8",
  best: "#b388ff",
  warn: "#ffb020",
  abs: "rgba(167,139,250,0.9)",
  text2: "#9aa4b8",
  text3: "#66708a",
} as const;

/* ────────────────────────────────────────────────────────────────────────────
   THE SESSION — the report, and the sheet under it
   ──────────────────────────────────────────────────────────────────────────── */

/**
 * The session best, and the lap opened below it, both taken from the traces
 * rather than typed in — so the sheet, the report and the charts cannot drift
 * apart while this file is edited.
 */
const BEST_MS = RV_REF_MS;
const STUDIED_MS = RV_LAP_MS;

/** A sector, as the sheet prints it: seconds to three places. */
const sec = (ms: number) => (ms / 1000).toFixed(3);

/** Untapped: what the best sectors add up to, against the best actual lap. */
const UNTAPPED_MS = 409;
const OPTIMAL_MS = BEST_MS - UNTAPPED_MS;

/**
 * The session's best sectors. S3 is the remainder, so the three sum to the
 * optimal lap exactly — which is the only thing that makes that tile honest.
 */
const BEST_S1 = 34842;
const BEST_S2 = 39118;
const BEST_S3 = OPTIMAL_MS - BEST_S1 - BEST_S2;

const TILES: {
  label: string;
  value: string;
  note: string;
  tone?: "accent" | "good";
  bar?: number;
}[] = [
  { label: "Optimal lap", value: rvLap(OPTIMAL_MS), note: "Your own best sectors", tone: "accent" },
  { label: "Untapped", value: rvDelta(UNTAPPED_MS / 1000, 3), note: "Best minus optimal" },
  { label: "Average lap", value: rvLap(BEST_MS + 1433), note: "9 clean laps" },
  { label: "Consistency", value: "±0.48s", note: "74% of the scale", bar: 74 },
  { label: "Clean driving", value: "82%", note: "2 laps lost to track limits", tone: "good" },
  { label: "Laps", value: "14", note: "3 stints" },
  { label: "On track", value: "27:41", note: "51:08 in the car" },
  { label: "Fuel", value: "4.12 L", note: "38.6 L per stint" },
  { label: "Energy", value: "2.94%", note: "per lap" },
];

/** The career strip: counted from the driver's own lap files, not an account. */
const CAREER = [
  { value: "4,182", unit: "", label: "laps, 3,410 clean" },
  { value: "21,406", unit: "km", label: "distance" },
  { value: "96", unit: "h", label: "at the wheel" },
  { value: "14", unit: "", label: "circuits" },
  { value: "9", unit: "", label: "cars" },
  { value: "312", unit: "", label: "sessions" },
];

const SESSIONS = [
  { day: "Today", track: "Circuit of the Americas", car: "Porsche Penske Motorsport 2025 #4:LM · HYPERCAR", best: rvLap(RV_REF_MS), meta: "14 laps · 3 stints", active: true },
  { day: "", track: "Circuit of the Americas", car: "Team WRT 2026 #32:WEC · GT3", best: "2:11.582", meta: "7 laps · 2 stints" },
  { day: "Yesterday", track: "Circuit de Barcelona", car: "BMW GT3 Custom Team 2026 #397 · GT3", best: "1:44.443", meta: "52 laps · 2 stints" },
  { day: "", track: "Circuit de la Sarthe", car: "Oreca 07 ELMS Custom Team 2025 #397 · LMP2", best: "3:31.874", meta: "9 laps" },
  { day: "Fri, 4 Sept", track: "Circuit de la Sarthe", car: "Oreca 07 ELMS Custom Team 2025 #397 · LMP2", best: "no clean lap", meta: "2 laps", none: true },
];

/**
 * Stint 3, which is what lets both colours appear on one sheet legitimately:
 * the session best was set back in stint 2, so this stint's own best lap is
 * green rather than violet — and one sector here IS the session's best, so it
 * is violet while the lap around it is not.
 */
const RAW_ROWS: {
  lap: string;
  /** Lap time, as a gap to the session best. */
  offset: number;
  s1: number;
  s2: number;
  fuel: string;
  ve: string;
  temps: string;
  wear: string;
  dirty?: string;
  trace?: boolean;
}[] = [
  { lap: "9", offset: 760, s1: 35011, s2: BEST_S2, fuel: "4.11", ve: "2.90", temps: "86 88 85 86", wear: "97%", trace: true },
  { lap: "10", offset: 816, s1: 35104, s2: 39602, fuel: "4.14", ve: "2.91", temps: "86 88 85 87", wear: "96%", trace: true },
  { lap: "11", offset: STUDIED_MS - BEST_MS, s1: 35260, s2: 39884, fuel: "4.16", ve: "2.95", temps: "87 89 86 88", wear: "95%", trace: true },
  { lap: "12", offset: 2259, s1: 35402, s2: 40118, fuel: "4.18", ve: "2.97", temps: "88 90 87 89", wear: "94%", dirty: "limits", trace: true },
  { lap: "13", offset: 3513, s1: 35884, s2: 40402, fuel: "4.21", ve: "3.01", temps: "89 91 88 90", wear: "93%", trace: true },
  { lap: "14", offset: 4853, s1: 36204, s2: 41008, fuel: "4.24", ve: "3.04", temps: "90 92 89 91", wear: "92%" },
];

/** The third sector is whatever is left, so a row's sectors always add up. */
const ROWS = RAW_ROWS.map((r) => {
  const ms = BEST_MS + r.offset;
  return { ...r, ms, s3: ms - r.s1 - r.s2 };
});

const STINT_BEST_MS = Math.min(...ROWS.map((r) => r.ms));
const STINT_BEST_S1 = Math.min(...ROWS.map((r) => r.s1));
const STINT_BEST_S2 = Math.min(...ROWS.map((r) => r.s2));
const STINT_BEST_S3 = Math.min(...ROWS.map((r) => r.s3));

/** Violet for the session's best, green for this stint's — the app's rule. */
function rank(value: number, stintBest: number, sessionBest: number) {
  if (value === sessionBest) return "session" as const;
  if (value === stintBest) return "stint" as const;
  return undefined;
}

/** The lap the study view below is opened on, for its sector chips. */
const STUDIED = ROWS.find((r) => r.lap === "11")!;

/** One row of the lap sheet, ranked and formatted the way the app does it. */
type SheetRow = {
  lap: string;
  s: [string, string, string];
  time: string;
  delta: string | null;
  fuel: string;
  ve: string;
  temps: string;
  wear: string;
  rank?: "session" | "stint";
  sectorRank?: (undefined | "session" | "stint")[];
  dirty?: string;
  trace?: boolean;
};

const SHEET: SheetRow[] = ROWS.map((r) => ({
  lap: r.lap,
  s: [sec(r.s1), sec(r.s2), sec(r.s3)],
  time: rvLap(r.ms),
  delta: r.offset === 0 ? null : rvDelta(r.offset / 1000, 3),
  fuel: r.fuel,
  ve: r.ve,
  temps: r.temps,
  wear: r.wear,
  // A lap that broke the clean rule keeps its reason and is not eligible to be
  // anybody's best, so it is amber rather than ranked.
  rank: r.dirty ? undefined : rank(r.ms, STINT_BEST_MS, BEST_MS),
  sectorRank: [
    rank(r.s1, STINT_BEST_S1, BEST_S1),
    rank(r.s2, STINT_BEST_S2, BEST_S2),
    rank(r.s3, STINT_BEST_S3, BEST_S3),
  ],
  dirty: r.dirty,
  trace: r.trace,
}));

function Tile({ tile }: { tile: (typeof TILES)[number] }) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        tile.tone === "accent"
          ? "border-cyan/25 bg-cyan/[0.06]"
          : "border-line bg-surface/40",
      )}
    >
      <div className="font-display text-[9.5px] uppercase tracking-widest text-subtle">
        {tile.label}
      </div>
      <div
        className={cn(
          "mt-1 font-mono text-lg leading-none",
          tile.tone === "accent" ? "text-cyan" : tile.tone === "good" ? "text-success" : "text-ink",
        )}
      >
        {tile.value}
      </div>
      <div className="mt-1.5 text-[10px] leading-tight text-subtle">{tile.note}</div>
      {tile.bar !== undefined ? (
        <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-line">
          <span
            className="block h-full rounded-full"
            style={{ width: `${tile.bar}%`, background: C.warn }}
          />
        </div>
      ) : null}
    </div>
  );
}

/** The session view: the rail, the career strip, the report and the sheet. */
export function ReviewSessionMock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-card border border-line bg-base/70 shadow-card",
        className,
      )}
    >
      <div className="grid lg:grid-cols-[210px_1fr]">
        {/* ── The rail: one card per session, newest first ─────────────── */}
        <aside className="hidden border-r border-line bg-surface/30 p-3 lg:block">
          <div className="flex items-center gap-2 rounded-lg border border-line bg-base/60 px-2.5 py-2 text-[11px] text-subtle">
            <Search size={12} aria-hidden />
            Find a track or car
          </div>
          <div className="mt-3 space-y-2">
            {SESSIONS.map((s, i) => (
              <div key={`${s.track}-${i}`}>
                {s.day ? (
                  <div className="mb-1.5 mt-3 font-display text-[9px] uppercase tracking-widest text-subtle first:mt-0">
                    {s.day}
                  </div>
                ) : null}
                <div
                  className={cn(
                    "rounded-lg border border-l-2 bg-base/50 px-2.5 py-2",
                    s.active ? "border-line border-l-cyan bg-cyan/[0.06]" : "border-line border-l-line",
                  )}
                >
                  <p className="truncate text-[11px] font-bold text-ink">{s.track}</p>
                  <p className="truncate text-[9.5px] text-subtle">{s.car}</p>
                  <div className="mt-1 flex items-baseline justify-between gap-2">
                    <span
                      className="font-mono text-[11px]"
                      style={{ color: s.none ? C.text3 : C.cyan }}
                    >
                      {s.best}
                    </span>
                    <span className="font-mono text-[9px] text-subtle">{s.meta}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <div className="min-w-0 p-3 sm:p-4">
          {/* ── Everything you have driven ─────────────────────────────── */}
          <div className="rounded-lg border border-line bg-[linear-gradient(120deg,rgba(38,187,244,0.07),transparent_62%)] p-3">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-display text-[10px] uppercase tracking-widest text-muted">
                Everything you have driven
              </span>
              <span className="text-[10px] text-subtle">
                since 2 August · 38 days with laps
              </span>
            </div>
            <div className="mt-2.5 grid grid-cols-3 gap-x-4 gap-y-2 sm:grid-cols-6">
              {CAREER.map((stat) => (
                <div key={stat.label}>
                  <div className="font-mono text-base leading-none text-ink">
                    {stat.value}
                    {stat.unit ? (
                      <span className="ml-0.5 text-[10px] text-subtle">{stat.unit}</span>
                    ) : null}
                  </div>
                  <div className="mt-1 text-[10px] leading-tight text-subtle">{stat.label}</div>
                </div>
              ))}
            </div>
            <p className="mt-2.5 border-t border-line pt-2 text-[10px] text-subtle">
              Most laps: Circuit de la Sarthe (612 laps) · Oreca 07 (1,204 laps)
            </p>
          </div>

          {/* ── The session, and what it came to ───────────────────────── */}
          <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h4 className="text-lg font-bold text-ink">Circuit of the Americas</h4>
            <span className="chip !px-2 !py-0.5 !text-[9px]">Practice</span>
            <span className="text-[11px] text-subtle">
              Porsche Penske Motorsport 2025 #4:LM · HYPERCAR
            </span>
            <span className="ml-auto text-[10px] text-subtle">Today · 21:14</span>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {/* The hero: the number the driver came for */}
            <div className="rounded-lg border border-accent/30 bg-[linear-gradient(140deg,rgba(139,92,246,0.14),rgba(38,187,244,0.05))] p-3 sm:col-span-2 lg:col-span-1 lg:row-span-3">
              <div className="font-display text-[9.5px] uppercase tracking-widest text-subtle">
                Best lap
              </div>
              <div className="mt-1 font-mono text-3xl leading-none" style={{ color: C.cyan }}>
                {rvLap(BEST_MS)}
              </div>
              <p className="mt-3 inline-flex items-center gap-1.5 text-[11px]" style={{ color: C.best }}>
                <Trophy size={12} aria-hidden />
                Your best here in HYPERCAR
              </p>
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t border-line pt-2.5 font-mono text-[11px]">
                {[
                  ["S1", sec(BEST_S1)],
                  ["S2", sec(BEST_S2)],
                  ["S3", sec(BEST_S3)],
                ].map(([label, value]) => (
                  <span key={label} className="text-ink">
                    <b className="mr-1 text-[9px] font-medium" style={{ color: C.text3 }}>
                      {label}
                    </b>
                    {value}
                  </span>
                ))}
              </div>
            </div>

            {TILES.map((tile) => (
              <Tile key={tile.label} tile={tile} />
            ))}
          </div>

          {/* ── The lap sheet ──────────────────────────────────────────── */}
          <div className="mt-3 overflow-hidden rounded-lg border border-line bg-surface/30">
            <div className="flex items-center gap-3 border-b border-line px-3 py-2">
              <ChevronDown size={13} className="text-subtle" aria-hidden />
              <span className="font-display text-[10px] uppercase tracking-widest text-ink">
                Stint 3
              </span>
              <span className="font-mono text-[10px] text-subtle">
                6 laps · Best <span style={{ color: C.ok }}>{rvLap(STINT_BEST_MS)}</span> · 24.9 L
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] border-collapse font-mono text-[10.5px]">
                <thead>
                  <tr className="border-b border-line text-left font-display uppercase tracking-wide text-subtle">
                    {["Lap", "S1", "S2", "S3", "Time", "Δ best", "Fuel L", "VE %", "Tyres °C", "Wear", "vs"].map(
                      (head) => (
                        <th key={head} className="px-2 py-1.5 text-[9px] font-medium">
                          {head}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {SHEET.map((row) => (
                    <tr key={row.lap} className="border-b border-line/60 last:border-0">
                      <td className="px-2 py-1.5" style={{ color: C.text3 }}>
                        <span className="inline-flex items-center gap-1">
                          {row.lap}
                          {row.trace ? (
                            <Activity size={9} aria-hidden style={{ color: C.text3 }} />
                          ) : null}
                        </span>
                      </td>
                      {row.s.map((sector, i) => (
                        <td
                          key={i}
                          className="px-2 py-1.5"
                          style={{
                            color:
                              row.sectorRank?.[i] === "session"
                                ? C.best
                                : row.sectorRank?.[i] === "stint"
                                  ? C.ok
                                  : undefined,
                          }}
                        >
                          {sector}
                        </td>
                      ))}
                      <td
                        className="px-2 py-1.5"
                        style={{
                          color:
                            row.dirty !== undefined
                              ? C.warn
                              : row.rank === "session"
                                ? C.best
                                : row.rank === "stint"
                                  ? C.ok
                                  : undefined,
                        }}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          {row.time}
                          {row.dirty ? (
                            <span
                              className="rounded-sm px-1 py-px text-[8px] uppercase tracking-wide"
                              style={{ color: C.warn, background: "rgba(255,176,32,0.12)" }}
                            >
                              {row.dirty}
                            </span>
                          ) : null}
                        </span>
                      </td>
                      <td className="px-2 py-1.5" style={{ color: row.delta ? C.bad : C.text3 }}>
                        {row.delta ?? "—"}
                      </td>
                      <td className="px-2 py-1.5 text-muted">{row.fuel}</td>
                      <td className="px-2 py-1.5 text-muted">{row.ve}</td>
                      <td className="px-2 py-1.5" style={{ color: C.text3 }}>
                        {row.temps}
                      </td>
                      <td className="px-2 py-1.5 text-muted">{row.wear}</td>
                      <td className="px-2 py-1.5">
                        {row.trace ? (
                          <span
                            className="rounded border px-1.5 py-px text-[9px]"
                            style={{ borderColor: "rgba(38,187,244,0.4)", color: C.cyan }}
                          >
                            vs
                          </span>
                        ) : null}
                      </td>
                    </tr>
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

/* ────────────────────────────────────────────────────────────────────────────
   ONE LAP — the channels, the chips and the circuit
   ──────────────────────────────────────────────────────────────────────────── */

const W = 1000;

/** Every band is drawn to a fixed axis so the two laps stay comparable. */
const deltaMax = Math.max(0.25, ...RV_DELTA.map(Math.abs));
const speedMin = 0;
const speedMax = Math.max(...RV_LAP.speed, ...RV_REF.speed) * 1.04;
const steerMax = Math.max(...RV_LAP.steer.map(Math.abs)) * 1.1;

const BANDS = [
  { key: "delta", label: "Delta — slower above, faster below", h: 54 },
  { key: "speed", label: "Speed", h: 86 },
  { key: "pedals", label: "Throttle / brake", h: 72 },
  { key: "gear", label: "Gear", h: 46 },
  { key: "steer", label: "Steering", h: 50 },
] as const;

const cursorX = (RV_CURSOR / (RV_SAMPLES - 1)) * W;

/** The readout the cursor is parked on — every value from the same sample. */
const READ: [string, string, string][] = [
  ["Delta", rvDelta(RV_DELTA[RV_CURSOR]), "s"],
  ["Distance", String(Math.round((RV_CURSOR / RV_SAMPLES) * 5497)), "m"],
  ["Time", (RV_LAP_MS / 1000 * (RV_CURSOR / RV_SAMPLES)).toFixed(2), "s"],
  ["Speed", String(Math.round(RV_LAP.speed[RV_CURSOR] / 1.609344)), "mph"],
  ["Throttle", String(Math.round(RV_LAP.throttle[RV_CURSOR])), "%"],
  ["Brake", String(Math.round(RV_LAP.brake[RV_CURSOR])), "%"],
  ["Gear", String(RV_LAP.gear[RV_CURSOR]), ""],
  ["Steering", `${Math.abs(Math.round(RV_LAP.steer[RV_CURSOR]))}${RV_LAP.steer[RV_CURSOR] > 0 ? "R" : "L"}`, ""],
];

function Band({
  band,
  children,
}: {
  band: (typeof BANDS)[number];
  children: ReactNode;
}) {
  return (
    <div className="relative border-b border-line/70 last:border-0">
      <svg
        viewBox={`0 0 ${W} ${band.h}`}
        preserveAspectRatio="none"
        className="block w-full"
        style={{ height: band.h }}
        aria-hidden
      >
        {children}
        <line x1={cursorX} y1={0} x2={cursorX} y2={band.h} stroke="rgba(244,246,251,0.55)" strokeWidth="1.4" />
      </svg>
      <span className="pointer-events-none absolute left-1.5 top-1 font-display text-[8px] uppercase tracking-widest text-subtle">
        {band.label}
      </span>
    </div>
  );
}

/** The lap-study view: the thing the tab is actually for. */
export function ReviewLapMock({ className }: { className?: string }) {
  const dBand = BANDS[0];
  const sBand = BANDS[1];
  const pBand = BANDS[2];
  const gBand = BANDS[3];
  const stBand = BANDS[4];

  const zeroY = dBand.h / 2;
  const gap = (RV_LAP_MS - RV_REF_MS) / 1000;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-card border border-line bg-base/70 shadow-card",
        className,
      )}
    >
      {/* ── The lap, named ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line px-3 py-2.5">
        <span className="inline-flex items-center gap-1.5 rounded border border-line px-2 py-1 font-display text-[9px] uppercase tracking-widest text-muted">
          <ArrowLeft size={11} aria-hidden />
          Session
        </span>
        <span className="text-sm font-bold text-ink">
          Lap 11<i className="ml-1 not-italic text-[10px] font-normal text-subtle">· stint 3</i>
        </span>
        <span className="font-mono text-lg leading-none text-ink">{rvLap(RV_LAP_MS)}</span>
        <span className="font-mono text-[11px]" style={{ color: C.bad }}>
          {rvDelta(gap, 3)}
        </span>
        <span className="hidden text-[10px] text-subtle sm:inline">
          Circuit of the Americas · Porsche Penske Motorsport 2025 #4:LM
        </span>
        <span className="ml-auto hidden gap-1.5 font-mono text-[10px] sm:flex">
          {[["S1", sec(STUDIED.s1)], ["S2", sec(STUDIED.s2)], ["S3", sec(STUDIED.s3)]].map(([l, v]) => (
            <span key={l} className="rounded border border-line px-1.5 py-0.5 text-muted">
              <b className="mr-1 font-medium" style={{ color: C.text3 }}>{l}</b>
              {v}
            </span>
          ))}
        </span>
      </div>

      {/* ── The lap it is being measured against ─────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2">
        <span className="text-[10px] text-subtle">Compare with</span>
        <span className="inline-flex items-center gap-2 rounded border border-line bg-surface/50 px-2 py-1 font-mono text-[10px] text-ink">
          Lap 6 · session best · {rvLap(RV_REF_MS)}
          <ChevronDown size={11} className="text-subtle" aria-hidden />
        </span>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px]"
          style={{ background: "rgba(255,84,112,0.1)", color: C.bad }}
        >
          <i
            className="inline-block h-0 w-4 border-t border-dashed"
            style={{ borderColor: C.best }}
            aria-hidden
          />
          lap 6 · {rvDelta(gap, 3)} s slower
        </span>
        <span className="ml-auto hidden items-center gap-1.5 sm:flex">
          {["Big map", "−", "+", "Whole lap"].map((label) => (
            <span
              key={label}
              className="rounded border border-line px-2 py-1 font-display text-[9px] uppercase tracking-widest text-subtle"
            >
              {label}
            </span>
          ))}
        </span>
      </div>

      {/* ── The readout, one sample deep ─────────────────────────────────── */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 border-b border-line bg-surface/30 px-3 py-2">
        {READ.map(([label, value, unit]) => (
          <span key={label} className="font-mono text-[11px] text-ink">
            <b className="mr-1.5 font-display text-[8.5px] font-medium uppercase tracking-widest text-subtle">
              {label}
            </b>
            <span style={label === "Delta" ? { color: C.bad } : undefined}>{value}</span>
            {unit ? <span className="ml-0.5 text-[9px] text-subtle">{unit}</span> : null}
          </span>
        ))}
        <span className="font-mono text-[11px] text-ink">
          <b className="mr-1.5 font-display text-[8.5px] font-medium uppercase tracking-widest text-subtle">
            G lat / lon
          </b>
          1.42 / −0.68
        </span>
      </div>

      {/* ── The channels, against distance ───────────────────────────────── */}
      <div>
        {/* Delta: filled green where the lap was up, red where it was down */}
        <Band band={dBand}>
          <path
            d={`${rvPath(RV_DELTA, { w: W, h: dBand.h, min: -deltaMax, max: deltaMax })}L${W} ${zeroY}L0 ${zeroY}Z`}
            fill="rgba(255,84,112,0.24)"
          />
          <line x1={0} y1={zeroY} x2={W} y2={zeroY} stroke="rgba(102,112,138,0.5)" strokeWidth="1" />
          <path
            d={rvPath(RV_DELTA, { w: W, h: dBand.h, min: -deltaMax, max: deltaMax })}
            fill="none"
            stroke={C.text2}
            strokeWidth="1.4"
          />
        </Band>

        {/* Speed, with the compare lap dashed underneath */}
        <Band band={sBand}>
          <path
            d={rvPath(RV_LAP.speed, { w: W, h: sBand.h, min: speedMin, max: speedMax, close: true })}
            fill="rgba(38,187,244,0.10)"
          />
          <path
            d={rvPath(RV_REF.speed, { w: W, h: sBand.h, min: speedMin, max: speedMax })}
            fill="none"
            stroke={C.cyanCmp}
            strokeWidth="1.1"
            strokeDasharray="4 3"
            opacity="0.85"
          />
          <path
            d={rvPath(RV_LAP.speed, { w: W, h: sBand.h, min: speedMin, max: speedMax })}
            fill="none"
            stroke={C.cyan}
            strokeWidth="1.6"
          />
        </Band>

        {/* Throttle and brake, with the TC and ABS ticks under them */}
        <Band band={pBand}>
          <path
            d={rvPath(RV_LAP.throttle, { w: W, h: pBand.h, min: 0, max: 100, close: true })}
            fill="rgba(53,208,127,0.12)"
          />
          <path
            d={rvPath(RV_LAP.brake, { w: W, h: pBand.h, min: 0, max: 100, close: true })}
            fill="rgba(255,84,112,0.14)"
          />
          <path
            d={rvPath(RV_REF.throttle, { w: W, h: pBand.h, min: 0, max: 100 })}
            fill="none" stroke={C.okCmp} strokeWidth="1" strokeDasharray="4 3" opacity="0.8"
          />
          <path
            d={rvPath(RV_REF.brake, { w: W, h: pBand.h, min: 0, max: 100 })}
            fill="none" stroke={C.badCmp} strokeWidth="1" strokeDasharray="4 3" opacity="0.8"
          />
          <path
            d={rvPath(RV_LAP.throttle, { w: W, h: pBand.h, min: 0, max: 100 })}
            fill="none" stroke={C.ok} strokeWidth="1.5"
          />
          <path
            d={rvPath(RV_LAP.brake, { w: W, h: pBand.h, min: 0, max: 100 })}
            fill="none" stroke={C.bad} strokeWidth="1.5"
          />
          {RV_TC.map((on, i) =>
            on ? (
              <rect key={`tc${i}`} x={(i / (RV_SAMPLES - 1)) * W} y={pBand.h - 4} width="2.4" height="3" fill={C.warn} />
            ) : null,
          )}
          {RV_ABS.map((on, i) =>
            on ? (
              <rect key={`abs${i}`} x={(i / (RV_SAMPLES - 1)) * W} y={pBand.h - 8} width="2.4" height="3" fill={C.abs} />
            ) : null,
          )}
        </Band>

        {/* Gear: stepped, because a gear is */}
        <Band band={gBand}>
          <path
            d={rvPath(RV_LAP.gear, { w: W, h: gBand.h, min: 0, max: 8, step: true })}
            fill="none"
            stroke={C.best}
            strokeWidth="1.4"
          />
        </Band>

        {/* Steering, scaled to the lap rather than to full lock */}
        <Band band={stBand}>
          <line x1={0} y1={stBand.h / 2} x2={W} y2={stBand.h / 2} stroke="rgba(102,112,138,0.35)" strokeWidth="1" />
          <path
            d={rvPath(RV_LAP.steer, { w: W, h: stBand.h, min: -steerMax, max: steerMax })}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1.3"
          />
        </Band>
      </div>

      {/* ── The chips: what each 500 m of road cost or gained ────────────── */}
      <div className="flex gap-1 overflow-x-auto border-t border-line px-3 py-2.5">
        {RV_MICRO.map((seg) => {
          const lost = seg.delta > 0.02;
          const gained = seg.delta < -0.02;
          return (
            <span
              key={seg.no}
              className="flex min-w-[50px] flex-1 flex-col items-center gap-0.5 rounded border px-1 py-1"
              style={{
                borderColor: lost
                  ? "rgba(255,84,112,0.45)"
                  : gained
                    ? "rgba(53,208,127,0.45)"
                    : undefined,
                background: lost
                  ? "rgba(255,84,112,0.08)"
                  : gained
                    ? "rgba(53,208,127,0.08)"
                    : "transparent",
              }}
            >
              <b className="font-display text-[8px] font-medium uppercase tracking-widest text-subtle">
                SQ{seg.no}
              </b>
              <i
                className="font-mono text-[10px] not-italic"
                style={{ color: lost ? C.bad : gained ? C.ok : C.text2 }}
              >
                {rvDelta(seg.delta)}
              </i>
            </span>
          );
        })}
      </div>

      {/* ── The circuit, in plan and to scale ────────────────────────────── */}
      <div className="grid gap-3 border-t border-line p-3 sm:grid-cols-[1.6fr_1fr]">
        <div className="overflow-hidden rounded-lg border border-line bg-surface/20">
          <svg
            viewBox={`0 0 ${RV_MAP.width} ${RV_MAP.height}`}
            className="block w-full"
            role="img"
            aria-label="Circuit of the Americas drawn in plan and to scale, with the lap being studied in cyan and the lap it is compared with in violet"
          >
            <defs>
              <linearGradient id="rvRoad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="rgba(120,140,175,0.30)" />
                <stop offset="100%" stopColor="rgba(196,210,236,0.55)" />
              </linearGradient>
            </defs>

            {/* The road, shaded by its elevation — pale for the high ground */}
            <path d={RV_ROAD} fill="none" stroke="rgba(10,14,22,0.85)" strokeWidth="9" strokeLinejoin="round" />
            <path d={RV_ROAD} fill="none" stroke="url(#rvRoad)" strokeWidth="7" strokeLinejoin="round" />
            {RV_POINTS.map(([x, y], i) =>
              i % 2 ? null : (
                <circle
                  key={`e${i}`}
                  cx={x}
                  cy={y}
                  r="3.4"
                  fill="rgba(226,236,255,1)"
                  opacity={0.05 + RV_ELEV[i] * 0.22}
                />
              ),
            )}

            {/* The two racing lines: yours, and the one you are chasing */}
            <path d={RV_LINE_THEIRS} fill="none" stroke={C.best} strokeWidth="1.5" strokeDasharray="3 2.5" opacity="0.9" />
            <path d={RV_LINE_MINE} fill="none" stroke={C.cyan} strokeWidth="1.7" />

            {/* Each line carries its own car at the point of road being read */}
            <circle cx={RV_POINTS[119][0]} cy={RV_POINTS[119][1]} r="3.4" fill={C.cyan} stroke="#0b0e14" strokeWidth="1.2" />
            <circle cx={RV_POINTS[124][0]} cy={RV_POINTS[124][1]} r="3" fill={C.best} stroke="#0b0e14" strokeWidth="1.2" />

            {/* The scale bar — how far apart those two lines actually were */}
            <g transform={`translate(16, ${RV_MAP.height - 12})`}>
              <line x1="0" y1="0" x2={RV_MAP.scaleBarPx} y2="0" stroke={C.text3} strokeWidth="1.2" />
              <line x1="0" y1="-3" x2="0" y2="3" stroke={C.text3} strokeWidth="1.2" />
              <line x1={RV_MAP.scaleBarPx} y1="-3" x2={RV_MAP.scaleBarPx} y2="3" stroke={C.text3} strokeWidth="1.2" />
              <text x={RV_MAP.scaleBarPx / 2} y="-5" textAnchor="middle" fontSize="6" fill={C.text3} className="font-mono">
                {RV_MAP.scaleBarM} m
              </text>
            </g>
          </svg>
        </div>

        <div>
          <dl className="space-y-1.5 font-mono text-[11px]">
            {[
              ["V-max", `${RV_VMAX_MPH.toFixed(0)} mph`],
              ["Samples", String(RV_SAMPLES * 3)],
              ["Circuit", "916 pts, bundled"],
              ["Elevation", `${RV_MAP.riseM} m rise`],
            ].map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-3">
                <dt className="font-display text-[9px] uppercase tracking-widest text-subtle">
                  {label}
                </dt>
                <dd className="text-ink">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[10.5px] leading-relaxed text-subtle">
            Seen from directly above, to scale. Cyan is the line you drove, violet the lap you are
            comparing with; the road is shaded by its elevation, pale for the high ground. Click any
            part of it to zoom in, and Big map for a closer look.
          </p>
        </div>
      </div>
    </div>
  );
}
