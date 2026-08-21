import { Fragment } from "react";
import { cn } from "@/lib/utils";
import styles from "./mocks.module.css";

/**
 * Static recreations of the Apex AIO System widgets, rebuilt in HTML/CSS/SVG
 * rather than screenshotted — so they stay sharp at any size, cost a few KB
 * instead of a few hundred, and can be restyled without re-exporting an image.
 *
 * The tokens below are lifted verbatim from the app's own `overlay/css/theme.css`
 * so these read as the real thing rather than an approximation. The site's fonts
 * are a deliberate near-match for the app's: Oswald stands in for Bahnschrift
 * (condensed display) and JetBrains Mono for Cascadia Mono (tabular data).
 *
 * KEEP IN SYNC: if theme.css changes in the overlay repo, mirror it in T,
 * CLASS_COLOURS and MFD_CAT below.
 *
 * The data is representative of a real LMU session — it is not live telemetry.
 */

/** Theme tokens, verbatim from the overlay's theme.css `:root`. */
const T = {
  panel: "#0c0e18", // --bg-panel
  panel2: "#10131f", // --bg-panel-2 — rows/cells
  panel3: "#161a29", // --bg-panel-3 — player row
  header: "#090a12", // --bg-header
  borderSoft: "#232838", // --border-soft
  borderStrong: "#313850", // --border-strong
  primary: "#f4f6fb", // --text-primary
  secondary: "#aeb6c8", // --text-secondary
  muted: "#6b7387", // --text-muted
  gain: "#35d07f", // --pos-gain
  loss: "#ff5470", // --pos-loss
  warn: "#ffb020", // --warn
  fastest: "#b06bff", // --purple-fastest
  flagBlue: "#3d8bff", // --flag-blue
  traffic: "#ffb347", // --traffic-amber
  cyan: "#22d3ee",
  purple: "#8b5cf6",
  magenta: "#ec4899",
} as const;

/** The 3px vertical brand stripe every panel carries down its left edge. */
const ACCENT_BAR = `linear-gradient(180deg, ${T.cyan} 0%, ${T.purple} 55%, ${T.magenta} 100%)`;

/** Per-class colours — from client.js, applied inline exactly as the app does. */
const CLASS_COLOURS: Record<string, string> = {
  HY: T.loss, // Hypercar — #ff5470
  P2: "#4f8bff",
  P3: T.cyan,
  GTE: T.warn,
  GT3: T.gain, // #35d07f
  GT4: T.warn,
};

/* ────────────────────────────────────────────────────────────────────────────
   SHARED CHROME
   ──────────────────────────────────────────────────────────────────────────── */

/**
 * `.panel` — solid and opaque, because in the app these sit on top of the sim's
 * own HUD and have to fully occlude it.
 */
function Panel({
  title,
  meta,
  metaLarge = false,
  flush = false,
  children,
  footer,
  className,
}: {
  title: string;
  meta?: string;
  /** Standings + Relative promote their meta to 20px/700 white. */
  metaLarge?: boolean;
  /** Tables manage their own spacing — `.panel__body--flush`. */
  flush?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("relative flex flex-col overflow-hidden rounded-lg border", className)}
      style={{
        background: T.panel,
        borderColor: T.borderSoft,
        boxShadow: "0 4px 14px rgba(0,0,0,0.55)",
      }}
    >
      {/* .panel::before — the brand accent bar, full height */}
      <span aria-hidden className="absolute inset-y-0 left-0 z-10 w-[3px]" style={{ background: ACCENT_BAR }} />

      {/* .panel__header */}
      <div
        className="flex items-center justify-between gap-2 border-b py-[5px] pl-[13px] pr-[10px]"
        style={{ background: T.header, borderColor: T.borderSoft }}
      >
        <span
          className="font-display text-[12px] font-bold uppercase leading-none"
          style={{ color: T.primary, letterSpacing: "0.12em" }}
        >
          {title}
        </span>
        {meta && (
          <span
            className={cn("tabular font-mono leading-none", metaLarge ? "text-[20px] font-bold" : "text-[11px]")}
            style={{ color: metaLarge ? T.primary : T.secondary, letterSpacing: "0.02em" }}
          >
            {meta}
          </span>
        )}
      </div>

      <div className={cn("flex-1", flush ? "pl-[3px]" : "p-[10px] pl-[13px]")}>{children}</div>

      {footer}
    </div>
  );
}

/** A small all-caps label — `font-display`, 9px, muted, wide tracking. */
function MicroLabel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <span
      className="font-display text-[9px] font-bold uppercase leading-none"
      style={{ color: T.muted, letterSpacing: "0.1em", ...style }}
    >
      {children}
    </span>
  );
}

/**
 * The session strip shared by Standings and Fuel. `sm` is the Fuel variant.
 */
function SessionStrip({ sm = false, flush = false }: { sm?: boolean; flush?: boolean }) {
  const big = sm ? "text-[20px]" : "text-[28px]";
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-[10px]",
        flush ? "border-b py-[5px] pl-[13px] pr-[10px] pb-[6px]" : "mb-2 border-b pb-2",
      )}
      style={{
        background: flush ? T.header : undefined,
        borderColor: flush ? T.borderStrong : T.borderSoft,
      }}
    >
      <span
        className={cn("font-display font-bold uppercase leading-none", big)}
        style={{ color: T.primary, letterSpacing: "0.06em" }}
      >
        LAP 12/40
      </span>
      <span className={cn("tabular font-mono leading-none", big)} style={{ color: T.cyan, letterSpacing: "0.02em" }}>
        <span className="text-[12px]" style={{ color: T.muted }}>
          ⏱{" "}
        </span>
        1:24:07
      </span>
      <span
        className={cn("font-display font-bold uppercase leading-none", sm ? "text-[15px]" : "text-[20px]")}
        style={{ color: T.primary, letterSpacing: "0.05em" }}
      >
        29 LAPS LEFT
      </span>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   STANDINGS TOWER
   ──────────────────────────────────────────────────────────────────────────── */

/* ── The LMU badge set, rebuilt from the app's own SVG artwork ─────────────── */

/** DR/SR plaque tier colours — verbatim from overlay/rankbadges/. */
const RANK_TIER_COLOURS = {
  Bronze: "#977548",
  Silver: "#8F9499",
  Gold: "#E1A01F",
  Platinum: "#89B2DD",
} as const;

/**
 * The driver-rating plaque: a two-panel rounded plaque (112×52), light left
 * half carrying "DR" in the tier colour, solid tier-coloured right half with
 * the rank initial + tier digit, and a 3px tier outline round the whole thing.
 */
function DrPlaque({ rank, tier }: { rank: keyof typeof RANK_TIER_COLOURS; tier: number }) {
  const c = RANK_TIER_COLOURS[rank];
  return (
    <svg
      viewBox="0 0 112 52"
      className="mr-[3px] inline-block align-middle"
      style={{ height: "1.05em", width: "auto" }}
      role="img"
      aria-label={`Driver rating: ${rank} ${tier}`}
    >
      <rect width="112" height="52" rx="8" fill="#F3F4F8" />
      <path d="M56 0 H104 Q112 0 112 8 V44 Q112 52 104 52 H56 Z" fill={c} />
      <text x="28" y="37" textAnchor="middle" fontSize="27" fontWeight="700" fontFamily="Arial, sans-serif" fill={c}>
        DR
      </text>
      <text x="84" y="37" textAnchor="middle" fontSize="27" fontWeight="700" fontFamily="Arial, sans-serif" fill="#F3F4F8">
        {rank[0]}
        {tier}
      </text>
      <rect x="1.5" y="1.5" width="109" height="49" rx="6.5" fill="none" stroke={c} strokeWidth="3" />
    </svg>
  );
}

/** Driver profile badge — the rounded diamond from overlay/driverbadges/. */
function ProfileBadge({ plate, label }: { plate: string; label: string }) {
  return (
    <svg
      viewBox="0 0 128 128"
      className="mr-[5px] inline-block align-middle"
      style={{ height: "1.1em", width: "1.1em" }}
      role="img"
      aria-label={label}
    >
      <path d="M64 12 L116 64 L64 116 L12 64 Z" fill={plate} stroke={plate} strokeWidth="16" strokeLinejoin="round" />
      <path d="M44 66 L58 80 L86 50" fill="none" stroke="#101223" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Manufacturer badge stand-in. The app proxies the sim's own 64×64 marque
 * SVGs; a neutral monogram plate keeps the layout honest here without
 * reproducing anyone's trademark on a marketing page.
 */
function ManuMark({ letter }: { letter: string }) {
  return (
    <span
      className="mr-[5px] inline-flex items-center justify-center rounded-[3px] align-middle font-display font-bold leading-none"
      style={{ width: "1.25em", height: "1.25em", fontSize: "0.72em", background: "#e9edf6", color: "#10131f" }}
    >
      {letter}
    </span>
  );
}

type StRow = {
  pos: number;
  delta: string;
  deltaState: "gain" | "loss" | "flat";
  cls: string;
  manu: string;
  dr: { rank: keyof typeof RANK_TIER_COLOURS; tier: number };
  badge?: { plate: string; label: string };
  name: string;
  gap: string;
  avg: string;
  best: string;
  ve?: number;
  pit?: boolean;
  player?: boolean;
  fastest?: boolean;
};

const STANDINGS: { group: string; count: string; cls: string; rows: StRow[] }[] = [
  {
    group: "HYPERCAR",
    count: "6 CARS",
    cls: "HY",
    rows: [
      { pos: 1, delta: "▲2", deltaState: "gain", cls: "HY", manu: "T", dr: { rank: "Platinum", tier: 1 }, name: "#7 Conway", gap: "—", avg: "3:25.4", best: "3:24.892", ve: 84, fastest: true },
      { pos: 2, delta: "•", deltaState: "flat", cls: "HY", manu: "F", dr: { rank: "Gold", tier: 2 }, name: "#51 Pier Guidi", gap: "+4.812", avg: "3:25.9", best: "3:25.107", ve: 81 },
      { pos: 3, delta: "▼1", deltaState: "loss", cls: "HY", manu: "T", dr: { rank: "Gold", tier: 1 }, badge: { plate: "#427FC3", label: "Good Driver" }, name: "#8 Buemi", gap: "+9.204", avg: "3:26.2", best: "3:25.288", ve: 79 },
    ],
  },
  {
    group: "LMP2",
    count: "9 CARS",
    cls: "P2",
    rows: [
      { pos: 1, delta: "▲3", deltaState: "gain", cls: "P2", manu: "O", dr: { rank: "Silver", tier: 3 }, name: "#22 Albuquerque", gap: "—", avg: "3:32.8", best: "3:32.114", ve: 66 },
      { pos: 2, delta: "•", deltaState: "flat", cls: "P2", manu: "O", dr: { rank: "Silver", tier: 1 }, name: "#34 Smiechowski", gap: "+3.551", avg: "3:33.4", best: "3:32.640", ve: 62 },
    ],
  },
  {
    group: "LMGT3",
    count: "12 CARS",
    cls: "GT3",
    rows: [
      { pos: 1, delta: "•", deltaState: "flat", cls: "GT3", manu: "B", dr: { rank: "Gold", tier: 3 }, badge: { plate: "#1EFF6B", label: "Trusted Racer" }, name: "#46 Rossi", gap: "—", avg: "3:48.0", best: "3:47.552" },
      { pos: 2, delta: "▲1", deltaState: "gain", cls: "GT3", manu: "P", dr: { rank: "Silver", tier: 2 }, name: "#92 Christensen", gap: "+2.140", avg: "3:48.6", best: "3:47.998" },
      { pos: 3, delta: "▲2", deltaState: "gain", cls: "GT3", manu: "M", dr: { rank: "Bronze", tier: 2 }, name: "#63 Pereira", gap: "+12.408", avg: "3:49.1", best: "3:48.201", pit: true, player: true },
    ],
  },
];

/** One fastest-lap line per class, in that class's colour — the app's default. */
const FASTEST_LINES = [
  { cls: "HY", text: "HYPERCAR · #7 Conway · 3:24.892" },
  { cls: "P2", text: "LMP2 · #22 Albuquerque · 3:32.114" },
  { cls: "GT3", text: "LMGT3 · #46 Rossi · 3:47.552" },
];

export function StandingsMock({ className }: { className?: string }) {
  return (
    <Panel
      title="Standings"
      meta="P12"
      metaLarge
      flush
      className={className}
      footer={
        /* The sponsor strip under the tower — rotating logos in the real app */
        <div
          className="mt-auto flex h-[40px] items-center justify-center border-t"
          style={{ background: T.header, borderColor: T.borderStrong }}
        >
          <span
            className="font-display text-[13px] font-bold uppercase"
            style={{
              letterSpacing: "0.28em",
              background: `linear-gradient(90deg, ${T.cyan}, ${T.purple}, ${T.magenta})`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              opacity: 0.75,
            }}
          >
            Apex &amp; Chill
          </span>
          <span className="ml-3 font-mono text-[8px] uppercase" style={{ color: T.muted, letterSpacing: "0.1em" }}>
            Your sponsors, rotating
          </span>
        </div>
      }
    >
      <SessionStrip flush />

      {/* Per-class fastest-lap lines — inset stripe and text in the class colour */}
      <div className="border-b" style={{ background: T.header, borderColor: T.borderStrong }}>
        {FASTEST_LINES.map((f, i) => (
          <div
            key={f.cls}
            className="overflow-hidden text-ellipsis whitespace-nowrap py-[3px] pl-[13px] pr-[10px] font-display text-[11px] font-bold uppercase"
            style={{
              borderTop: i > 0 ? `1px solid ${T.borderSoft}` : undefined,
              boxShadow: `inset 3px 0 0 ${CLASS_COLOURS[f.cls]}`,
              color: CLASS_COLOURS[f.cls],
              letterSpacing: "0.08em",
            }}
          >
            {f.text}
          </div>
        ))}
      </div>

      <table className="tabular w-full table-fixed border-collapse text-[11px]">
        <colgroup>
          <col className="w-[24px]" />
          <col className="w-[24px]" />
          <col />
          <col className="w-[50px]" />
          <col className="w-[52px]" />
          <col className="w-[56px]" />
          <col className="w-[34px]" />
          <col className="w-[18px]" />
        </colgroup>
        <thead>
          <tr style={{ borderBottom: `1px solid ${T.borderStrong}` }}>
            {(["POS", "±", "DRIVER", "GAP", "AVG", "BEST", "VE", ""] as const).map((h, i) => (
              <th
                key={i}
                className={cn(
                  "px-[4px] py-[3px] font-display text-[9px] font-bold uppercase",
                  i === 2 ? "pl-[8px] text-left" : i < 2 ? "text-center" : "text-right",
                )}
                style={{ color: T.muted, letterSpacing: "0.1em" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {STANDINGS.map((grp) => (
            <Fragment key={grp.group}>
              {/* Class group subheader */}
              <tr style={{ background: T.header }}>
                <td
                  colSpan={8}
                  className="py-[3px] pl-[11px] pr-2"
                  style={{
                    borderTop: `1px solid ${T.borderStrong}`,
                    borderBottom: `1px solid ${T.borderSoft}`,
                    boxShadow: `inset 3px 0 0 ${CLASS_COLOURS[grp.cls]}`,
                  }}
                >
                  <span
                    className="mr-[7px] inline-block h-[9px] w-[9px] rounded-[2px] align-middle"
                    style={{ background: CLASS_COLOURS[grp.cls] }}
                  />
                  <span
                    className="font-display text-[12px] font-bold uppercase"
                    style={{ color: T.primary, letterSpacing: "0.12em" }}
                  >
                    {grp.group}
                  </span>
                  <span className="float-right font-mono text-[11px]" style={{ color: T.muted, letterSpacing: "0.06em" }}>
                    {grp.count}
                  </span>
                </td>
              </tr>

              {grp.rows.map((r) => (
                <tr
                  key={r.name}
                  style={{
                    borderBottom: `1px solid ${T.borderSoft}`,
                    // The player row: cyan wash, pinned by cyan bars both sides —
                    // exactly the app's .standings__row--player treatment.
                    background: r.player ? "color-mix(in srgb, #22d3ee 16%, transparent)" : undefined,
                    boxShadow: r.player
                      ? `inset 4px 0 0 ${T.cyan}, inset -3px 0 0 ${T.cyan}`
                      : r.fastest
                        ? `inset 3px 0 0 ${T.fastest}`
                        : undefined,
                  }}
                >
                  <td
                    className="overflow-hidden whitespace-nowrap px-[4px] py-[4px] text-center font-display font-bold"
                    style={{ color: r.player ? T.cyan : T.secondary }}
                  >
                    {r.pos}
                  </td>
                  <td
                    className="overflow-hidden whitespace-nowrap px-[3px] py-[4px] text-center font-mono text-[10px]"
                    style={{
                      color: r.deltaState === "gain" ? T.gain : r.deltaState === "loss" ? T.loss : T.muted,
                    }}
                  >
                    {r.delta}
                  </td>
                  {/* Driver cell: class tag · marque · DR plaque · profile badge · name */}
                  <td
                    className="overflow-hidden text-ellipsis whitespace-nowrap py-[4px] pl-[8px] pr-[4px]"
                    style={{ color: T.primary, fontWeight: r.player ? 700 : undefined }}
                  >
                    <span
                      className="mr-[6px] inline-block h-[8px] w-[8px] rounded-[2px] align-middle"
                      style={{ background: CLASS_COLOURS[r.cls] }}
                    />
                    <ManuMark letter={r.manu} />
                    <DrPlaque rank={r.dr.rank} tier={r.dr.tier} />
                    {r.badge && <ProfileBadge plate={r.badge.plate} label={r.badge.label} />}
                    {r.name}
                  </td>
                  <td className="whitespace-nowrap px-[4px] py-[4px] text-right font-mono" style={{ color: T.secondary }}>
                    {r.gap}
                  </td>
                  <td className="whitespace-nowrap px-[4px] py-[4px] text-right font-mono" style={{ color: T.secondary }}>
                    {r.avg}
                  </td>
                  <td
                    className="whitespace-nowrap px-[4px] py-[4px] text-right font-mono"
                    style={{
                      color: r.fastest ? T.fastest : T.secondary,
                      fontWeight: r.fastest ? 700 : undefined,
                    }}
                  >
                    {r.best}
                  </td>
                  {/* VE: the percentage over its thin green fill bar */}
                  <td className="relative whitespace-nowrap py-[4px] pl-[2px] pr-[4px] text-right font-mono text-[10px]" style={{ color: T.secondary }}>
                    {r.ve != null && (
                      <>
                        {r.ve}%
                        <span
                          aria-hidden
                          className="absolute bottom-[3px] left-[3px] h-[3px] rounded-[2px]"
                          style={{ width: `${Math.round(r.ve * 0.26)}px`, background: T.gain, opacity: 0.5 }}
                        />
                      </>
                    )}
                  </td>
                  {/* Pit chip — the amber P, box always reserved so columns never shift */}
                  <td className="whitespace-nowrap py-[4px] pl-0 pr-[6px] text-right">
                    <span
                      className="inline-flex h-[13px] w-[13px] items-center justify-center rounded-[3px] font-display text-[10px] font-bold leading-none"
                      style={{
                        background: "rgba(8,10,17,0.82)",
                        color: T.warn,
                        boxShadow: `inset 0 0 0 1px ${T.warn}`,
                        visibility: r.pit ? "visible" : "hidden",
                      }}
                    >
                      P
                    </span>
                  </td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   RELATIVE / TIMING
   ──────────────────────────────────────────────────────────────────────────── */

const REL_ROWS: {
  pos: number;
  cls: string;
  name: string;
  delta: string;
  state?: "yield" | "traffic" | "player";
  near?: boolean;
  ghost?: boolean;
}[] = [
  { pos: 2, cls: "HY", name: "#7 M. Conway", delta: "−4.1", state: "yield" },
  { pos: 3, cls: "P2", name: "#22 F. Albuquerque", delta: "−2.9" },
  { pos: 9, cls: "GT3", name: "#46 V. Rossi", delta: "−1.2", near: true },
  { pos: 12, cls: "GT3", name: "#63 T. Pereira", delta: "—", state: "player" },
  { pos: 11, cls: "GT3", name: "#92 M. Christensen", delta: "+1.8", near: true },
  { pos: 14, cls: "GT3", name: "#88 D. Serra", delta: "+6.3", state: "traffic", ghost: true },
  { pos: 5, cls: "HY", name: "#8 S. Buemi", delta: "+11.7" },
];

export function RelativeMock({ className }: { className?: string }) {
  return (
    <Panel title="Relative" meta="LAP 12/40" metaLarge flush className={className}>
      {/* Timing strip — 4-up, 1px gaps showing the border colour through */}
      <div className="grid grid-cols-4 gap-px border-b" style={{ background: T.borderSoft, borderColor: T.borderSoft }}>
        {[
          ["Last", "3:51.774", T.primary],
          ["Best", "3:48.201", T.primary],
          ["Current", "1:12.430", T.primary],
          ["Delta", "−0.412", T.gain],
        ].map(([label, value, colour]) => (
          <div key={label} className="px-2 py-[5px] text-center" style={{ background: T.panel }}>
            <div className="font-display text-[9px] uppercase" style={{ color: T.muted, letterSpacing: "0.12em" }}>
              {label}
            </div>
            <div className="tabular mt-px font-mono text-[15px]" style={{ color: colour }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Blue-flag banner */}
      <div
        className="mb-[2px] px-[10px] py-[4px] font-display text-[12px] font-bold"
        style={{
          background: "color-mix(in srgb, #3d8bff 22%, transparent)",
          boxShadow: `inset 3px 0 0 ${T.flagBlue}`,
          color: T.flagBlue,
          letterSpacing: "0.06em",
        }}
      >
        ⚑ BLUE · #7 M. Conway · LAPPING YOU · 1.4s
      </div>

      <table className="w-full border-collapse text-[12px]">
        <tbody>
          {REL_ROWS.map((r) => (
            <tr
              key={r.name}
              style={{
                borderBottom: `1px solid ${T.borderSoft}`,
                background:
                  r.state === "player"
                    ? T.panel3
                    : r.state === "yield"
                      ? "color-mix(in srgb, #3d8bff 14%, transparent)"
                      : r.state === "traffic"
                        ? "color-mix(in srgb, #ffb347 12%, transparent)"
                        : undefined,
                boxShadow:
                  r.state === "player"
                    ? `inset 3px 0 0 ${T.magenta}`
                    : r.state === "yield"
                      ? `inset 3px 0 0 ${T.flagBlue}`
                      : r.state === "traffic"
                        ? `inset 3px 0 0 ${T.traffic}`
                        : undefined,
              }}
            >
              <td className="w-[26px] whitespace-nowrap px-2 py-[4px] text-center font-display font-bold" style={{ color: T.secondary }}>
                {r.pos}
              </td>
              <td className="max-w-0 overflow-hidden text-ellipsis whitespace-nowrap px-2 py-[4px]" style={{ color: T.primary }}>
                {/* Class tag: coloured letters on a dark square, ring in the class colour */}
                <span
                  className="mr-[6px] inline-flex h-[16px] w-[29px] items-center justify-center rounded-[3px] align-middle font-display text-[11px] font-bold leading-none"
                  style={{
                    background: "rgba(8,10,17,0.82)",
                    color: CLASS_COLOURS[r.cls],
                    boxShadow: `inset 0 0 0 1px ${CLASS_COLOURS[r.cls]}`,
                  }}
                >
                  {r.cls}
                </span>
                {r.ghost && <span className="mr-1 align-middle text-[11px]">👻</span>}
                {r.name}
              </td>
              <td
                className="tabular w-[84px] whitespace-nowrap px-2 py-[4px] text-right font-mono"
                style={{
                  color:
                    r.state === "yield" ? T.flagBlue : r.state === "traffic" ? T.traffic : T.primary,
                  fontSize: r.near ? "20px" : undefined,
                  fontWeight: r.near ? 700 : undefined,
                }}
              >
                {r.delta}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   MFD
   ──────────────────────────────────────────────────────────────────────────── */

/** `--mfd-cat` — the category colour that groups related pit rows. */
const MFD_CAT: Record<string, string> = {
  fuel: T.gain,
  tyre: T.cyan,
  pressure: "#4f8bff",
  aero: T.purple,
  duct: T.warn,
  brake: T.magenta,
  traction: T.cyan,
  engine: T.warn,
  hybrid: T.gain,
  service: T.muted,
};

type MfdRow = { label: string; value: string; cat: string; step?: boolean; selected?: boolean; groupStart?: boolean };

const MFD_GROUPS: { title: string; rows: MfdRow[]; aids?: boolean }[] = [
  {
    title: "Race control",
    rows: [
      { label: "PENALTIES", value: "0", cat: "service" },
      { label: "SERVE", value: "OFF", cat: "service", step: true, groupStart: true },
      { label: "PIT REQUEST", value: "REQUESTED", cat: "service", step: true },
    ],
  },
  {
    title: "Pit strategy",
    rows: [
      { label: "FUEL:", value: "48 L", cat: "fuel", step: true },
      { label: "VIRTUAL ENERGY:", value: "62 %", cat: "fuel", step: true },
      { label: "FL TIRE:", value: "SOFT", cat: "tyre", step: true, groupStart: true },
      { label: "FR TIRE:", value: "SOFT", cat: "tyre", step: true },
      { label: "RL TIRE:", value: "SOFT", cat: "tyre", step: true },
      { label: "RR TIRE:", value: "SOFT", cat: "tyre", step: true, selected: true },
      { label: "FL PRESS:", value: "170 kPa", cat: "pressure", step: true, groupStart: true },
      { label: "F BRAKE DUCT:", value: "3", cat: "duct", step: true, groupStart: true },
      { label: "REAR WING:", value: "7", cat: "aero", step: true, groupStart: true },
    ],
  },
  {
    title: "Driving aids",
    aids: true,
    rows: [
      { label: "BRAKE BIAS", value: "56.4%", cat: "brake", step: true },
      { label: "TRACTION CONTROL", value: "4", cat: "traction", step: true },
      { label: "ABS", value: "3", cat: "traction", step: true },
      { label: "MOTOR MAP", value: "6", cat: "hybrid", step: true },
      { label: "ENGINE MIX", value: "2", cat: "engine" },
    ],
  },
];

function Stepper() {
  return (
    <span className="ml-2 flex shrink-0 gap-[3px]">
      {["−", "+"].map((s) => (
        <span
          key={s}
          className="flex h-[18px] w-[20px] items-center justify-center rounded-[5px] border font-mono text-[12px] leading-none"
          style={{ background: "rgba(22,26,41,0.85)", borderColor: "rgba(49,56,80,0.85)", color: T.primary }}
        >
          {s}
        </span>
      ))}
    </span>
  );
}

export function MfdMock({ className }: { className?: string }) {
  return (
    <Panel title="MFD" meta="LIVE" className={className}>
      <div className="flex flex-col gap-[14px]">
        {MFD_GROUPS.map((g) => (
          <div key={g.title}>
            {/* Group title with the brand-gradient underline */}
            <div
              className="mb-2 pb-[5px] font-display text-[12px] font-bold uppercase"
              style={{
                color: T.primary,
                letterSpacing: "0.18em",
                borderBottom: "2px solid transparent",
                borderImage: `linear-gradient(90deg, ${T.cyan} 0%, #4f8bff 32%, ${T.purple} 64%, ${T.magenta} 100%) 1`,
              }}
            >
              {g.title}
            </div>

            <div className="flex flex-col gap-[2px]">
              {g.rows.map((row) => {
                const cat = MFD_CAT[row.cat];
                return (
                  <div
                    key={row.label}
                    className={cn(
                      "flex items-center justify-between gap-[10px] rounded-r-[5px]",
                      row.groupStart && "mt-[5px]",
                    )}
                    style={{
                      minHeight: g.aids ? 28 : 22.5,
                      padding: row.selected ? "2px 8px 2px 5px" : "2px 8px 2px 9px",
                      borderLeft: `${row.selected ? 7 : 3}px solid ${cat}`,
                      background: row.selected
                        ? `color-mix(in srgb, ${cat} 55%, transparent)`
                        : `color-mix(in srgb, ${cat} 9%, transparent)`,
                      boxShadow: row.selected
                        ? `inset 0 0 0 1.5px color-mix(in srgb, ${cat} 85%, transparent), 0 0 10px color-mix(in srgb, ${cat} 40%, transparent)`
                        : undefined,
                    }}
                  >
                    <span
                      className="overflow-hidden text-ellipsis whitespace-nowrap font-display text-[12px]"
                      style={{
                        color: row.selected ? "#fff" : T.secondary,
                        textShadow: row.selected ? "0 1px 2px rgba(0,0,0,.75)" : undefined,
                      }}
                    >
                      {row.label}
                    </span>
                    <span
                      className="tabular ml-auto text-right font-mono font-semibold"
                      style={{
                        fontSize: g.aids ? 20 : 15,
                        color: row.selected ? "#fff" : T.primary,
                        textShadow: row.selected ? "0 1px 2px rgba(0,0,0,.75)" : undefined,
                      }}
                    >
                      {row.value}
                    </span>
                    {row.step ? <Stepper /> : <span className="ml-2 w-[43px] shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   TRACK LIMITS — the corner-cut warnings
   ──────────────────────────────────────────────────────────────────────────── */

export function TrackLimitsMock({ large = false, className }: { large?: boolean; className?: string }) {
  // data-limits="warned": 3.25 of 5 left, so the count and the bar both read amber.
  const pct = (3.25 / 5) * 100;
  return (
    <Panel title="Track Limits" meta="3.25 / 5" className={className}>
      <div className="relative flex flex-col gap-[6px] py-[2px]">
        <div className="flex items-baseline gap-2">
          <span
            className="tabular font-mono font-bold leading-none"
            style={{ fontSize: large ? 44 : 28, color: T.warn }}
          >
            3.25
          </span>
          <MicroLabel style={{ color: T.warn, letterSpacing: "0.14em" }}>Left</MicroLabel>

          {/* The flash: the widget only shouts when the total actually moves. */}
          <span
            className="ml-auto self-center rounded-[5px] px-[10px] py-[3px] font-display text-[11px] font-bold"
            style={{ background: "rgba(255,176,32,0.94)", color: "#0a0b12", letterSpacing: "0.1em" }}
          >
            +0.5
          </span>
        </div>

        {/* Draining allowance bar — amber under half, red under a fifth */}
        <div className="relative h-[4px] overflow-hidden rounded-[2px]" style={{ background: T.panel2 }}>
          <div className="absolute inset-y-0 left-0 rounded-[2px]" style={{ width: `${pct}%`, background: T.warn }} />
        </div>

        <div className="tabular overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[9px]" style={{ color: T.secondary, letterSpacing: "0.04em" }}>
          CUTS&nbsp;&nbsp;0.25 · 0.5 · 1 · 0.25
        </div>

        {large && (
          <p
            className="mt-2 border-t pt-[10px] font-display text-[10px] uppercase leading-relaxed"
            style={{ borderColor: T.borderSoft, color: T.muted, letterSpacing: "0.08em" }}
          >
            Three 0.25s in a row is one kerb you clip every lap.
            <br />A single 1.00 is a mistake already made.
          </p>
        )}
      </div>
    </Panel>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   DAMAGE & REPAIR — the pit-stop predictor
   ──────────────────────────────────────────────────────────────────────────── */

const DAMAGE = [
  { label: "AERO", pct: 35.7, tone: T.loss },
  { label: "FRONT LEFT", pct: 52.1, tone: T.loss },
  { label: "FRONT RIGHT", pct: 11.4, tone: T.warn },
  { label: "REAR LEFT", pct: 0, tone: null },
  { label: "REAR RIGHT", pct: 0, tone: null },
];

export function DamagePredictorMock({ className }: { className?: string }) {
  return (
    <Panel title="Damage & Repair" meta="IN THE BOX" className={className}>
      <div className="flex flex-col gap-[6px]">
        {DAMAGE.map((d) => (
          <div key={d.label} className="flex items-center gap-2">
            <MicroLabel>
              <span className="inline-block w-[74px]">{d.label}</span>
            </MicroLabel>
            <span className="relative h-[6px] flex-1 overflow-hidden rounded-[3px]" style={{ background: T.panel2 }}>
              {d.tone && (
                <span className="absolute inset-y-0 left-0 rounded-[3px]" style={{ width: `${d.pct}%`, background: d.tone }} />
              )}
            </span>
            <span
              className="tabular w-[38px] text-right font-mono text-[11px]"
              style={{ color: d.tone ?? T.muted }}
            >
              {d.pct.toFixed(0)}%
            </span>
          </div>
        ))}

        {/* Once the car stops, the estimate becomes a countdown to release. */}
        <div
          className="mt-1 rounded-[5px] px-[10px] py-[8px]"
          style={{ background: T.panel2, borderLeft: `3px solid ${T.cyan}` }}
        >
          <div className="flex items-end justify-between gap-3">
            <div>
              <MicroLabel style={{ color: T.cyan }}>Release in</MicroLabel>
              <div className="tabular mt-[2px] font-mono text-[34px] leading-none" style={{ color: T.primary }}>
                38.4<span className="text-[11px]" style={{ color: T.muted }}> s</span>
              </div>
            </div>
            <div className="text-right">
              <div className="tabular font-mono text-[11px]" style={{ color: T.secondary }}>
                Damage 95 s
              </div>
              <div className="tabular font-mono text-[11px]" style={{ color: T.secondary }}>
                Tyres 5 s
              </div>
            </div>
          </div>
          <div className="relative mt-[8px] h-[4px] overflow-hidden rounded-[2px]" style={{ background: T.panel }}>
            <div className="absolute inset-y-0 left-0 rounded-[2px]" style={{ width: "60%", background: T.cyan }} />
          </div>
        </div>

        <p className="font-display text-[9px] uppercase" style={{ color: T.muted, letterSpacing: "0.08em" }}>
          Shown side by side — never summed
        </p>
      </div>
    </Panel>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   FUEL CALCULATOR
   ──────────────────────────────────────────────────────────────────────────── */

function FuelCube({ label, value, unit, res, crit = false }: { label: string; value: string; unit?: string; res: "fuel" | "energy"; crit?: boolean }) {
  const colour = res === "fuel" ? T.gain : T.cyan;
  return (
    <div className="rounded-r-[5px] px-2 py-[5px]" style={{ background: T.panel2, borderLeft: `3px solid ${colour}` }}>
      <MicroLabel style={res === "energy" ? { color: T.cyan } : undefined}>{label}</MicroLabel>
      <div
        className="tabular mt-[2px] whitespace-nowrap font-mono leading-[1.05]"
        style={{ fontSize: crit ? 28 : 28, color: T.primary }}
      >
        {value}
        {unit && (
          <span className="text-[11px]" style={{ color: T.muted }}>
            {" "}
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

export function FuelMock({ className }: { className?: string }) {
  return (
    <Panel title="Fuel" meta="50.9 L · 62%" className={className}>
      <SessionStrip sm />

      {/* Resource bars + cubes */}
      <div className="mb-2 grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-[6px] border-b pb-2" style={{ borderColor: T.borderSoft }}>
        <div className="relative h-[12px] overflow-hidden rounded-[3px]" style={{ background: T.panel2 }}>
          <div className="absolute inset-y-0 left-0 rounded-[3px]" style={{ width: "56.6%", background: T.gain }} />
        </div>
        <FuelCube label="Fuel" value="50.9" unit="L" res="fuel" />
        <FuelCube label="Laps" value="12.3" res="fuel" crit />

        <div className="relative h-[12px] overflow-hidden rounded-[3px]" style={{ background: T.panel2 }}>
          <div className="absolute inset-y-0 left-0 rounded-[3px]" style={{ width: "62%", background: T.cyan }} />
        </div>
        <FuelCube label="Energy" value="62.0" unit="%" res="energy" />
        <FuelCube label="Laps" value="10.1" res="energy" crit />
      </div>

      <div className="mb-1 font-display text-[11px] font-bold" style={{ color: T.muted, letterSpacing: "0.12em" }}>
        FUEL
      </div>
      <div className="mb-2 grid grid-cols-2 gap-2">
        {[
          { label: "Per Lap", value: "4.1", unit: "L", hero: false, colour: T.primary },
          { label: "Laps Left", value: "12", unit: "", hero: true, colour: T.primary },
          { label: "To Finish", value: "46.7", unit: "L", hero: false, colour: T.primary },
          { label: "Margin", value: "+4.2", unit: "L", hero: true, colour: T.gain },
        ].map((s) => (
          <div key={s.label} className="rounded-[5px] px-2 py-[6px]" style={{ background: T.panel2 }}>
            <MicroLabel style={s.label === "Laps Left" ? { fontSize: 11, color: T.secondary } : undefined}>
              {s.label}
            </MicroLabel>
            <div
              className="tabular mt-[2px] font-mono leading-[1.05]"
              style={{ fontSize: s.label === "Laps Left" ? 34 : s.hero ? 28 : 20, color: s.colour }}
            >
              {s.value}
              {s.unit && (
                <span className="text-[11px]" style={{ color: T.muted }}>
                  {" "}
                  {s.unit}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div
        className="mb-1 rounded-[5px] px-[7px] py-[3px] font-display text-[11px] font-bold"
        style={{ background: T.panel2, color: T.gain, letterSpacing: "0.04em" }}
      >
        ⚡ 3 of 5 ahead pit first · +1.4 laps in hand
      </div>
      <div className="flex items-center justify-between text-[11px]" style={{ color: T.secondary }}>
        <span>Refuel +38.4 L</span>
        <span>Pit window: L18</span>
      </div>
    </Panel>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   TYRE TEMPS
   ──────────────────────────────────────────────────────────────────────────── */

const TYRES = [
  { pos: "FL", core: "88.4°", surf: "surf 94.2°", band: T.gain, lamp: T.gain, glow: true },
  { pos: "FR", core: "91.7°", surf: "surf 98.0°", band: T.gain, lamp: T.gain, glow: true },
  { pos: "RL", core: "96.2°", surf: "surf 103.4°", band: T.warn, lamp: T.warn, glow: false },
  { pos: "RR", core: "99.8°", surf: "surf 108.1°", band: T.loss, lamp: T.loss, glow: true },
];

export function TyreTempMock({ className }: { className?: string }) {
  return (
    <Panel title="Tyre Temps" meta="SOFT" className={className}>
      <div className="mb-1 font-display text-[9px] font-bold uppercase" style={{ color: T.muted, letterSpacing: "0.12em" }}>
        Core temp · Auto
      </div>
      <div className="grid grid-cols-2 gap-2">
        {TYRES.map((t) => (
          <div
            key={t.pos}
            className="rounded-[5px] border p-[6px] text-center"
            style={{ background: T.panel2, borderColor: T.borderSoft }}
          >
            <div className="flex items-center justify-between gap-1">
              <MicroLabel>{t.pos}</MicroLabel>
              <span
                className="h-[8px] w-[8px] rounded-full border"
                style={{
                  background: t.lamp,
                  borderColor: T.borderSoft,
                  boxShadow: t.glow ? `0 0 6px ${t.lamp}` : undefined,
                }}
              />
            </div>
            <div className="tabular mt-[2px] font-mono text-[28px] leading-[1.05]" style={{ color: t.band }}>
              {t.core}
            </div>
            <div className="font-display text-[9px] uppercase" style={{ color: T.muted, letterSpacing: "0.08em" }}>
              {t.surf}
            </div>
            <div className="mt-[2px] h-[4px] rounded-[2px]" style={{ background: t.band }} />
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   RADAR — no panel chrome at all; it's a bare HUD over transparency
   ──────────────────────────────────────────────────────────────────────────── */

/** The player's arrowhead silhouette, in a local box of `w × h`. */
function CarArrow({ w, h, fill, stroke, strokeWidth }: { w: number; h: number; fill: string; stroke: string; strokeWidth: number }) {
  const hw = w / 2;
  const hl = h / 2;
  return (
    <polygon
      points={`0,${-hl} ${-hw},${hl} 0,${hl * 0.45} ${hw},${hl}`}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
  );
}

export function RadarMock({ className }: { className?: string }) {
  const W = 188;
  const H = 188;
  const PX_PER_M = 6; // isotropic — one scale for both axes

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full max-w-[188px]"
        role="img"
        aria-label="Proximity radar: a GT3 car ahead-right, a Hypercar behind-left with a faster-class halo, and a car alongside on the right"
      >
        <defs>
          <radialGradient id="radarEdge" cx="100%" cy="50%" r="100%">
            <stop offset="0%" stopColor="#ff3b3b" stopOpacity="0.42" />
            <stop offset="25%" stopColor="#ff3b3b" stopOpacity="0.26" />
            <stop offset="50%" stopColor="#ff3b3b" stopOpacity="0.12" />
            <stop offset="75%" stopColor="#ff3b3b" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#ff3b3b" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Alongside-on-the-right warning: a bloom centred on the canvas edge */}
        <rect x="0" y="0" width={W} height={H} fill="url(#radarEdge)" />

        {/* Opponent: GT3 ahead and slightly right */}
        <g transform={`translate(${W / 2 + 2.4 * PX_PER_M}, ${H / 2 - 5.2 * PX_PER_M})`}>
          <CarArrow w={2.05 * PX_PER_M} h={4.76 * PX_PER_M} fill={CLASS_COLOURS.GT3} stroke="rgba(0,0,0,0.6)" strokeWidth={1.2} />
          <text
            x="0"
            y={4.76 * PX_PER_M / 2 + 9}
            textAnchor="middle"
            className="font-mono"
            fontSize="8"
            fontWeight="bold"
            fill="#e6ebf5"
            stroke="rgba(0,0,0,0.85)"
            strokeWidth="2.5"
            paintOrder="stroke"
          >
            63
          </text>
        </g>

        {/* Opponent: Hypercar behind-left, with the faster-class halo ring */}
        <g transform={`translate(${W / 2 - 2.6 * PX_PER_M}, ${H / 2 + 4.4 * PX_PER_M})`}>
          <circle r={(4.76 * PX_PER_M) / 2 + 0.9 * PX_PER_M} fill={CLASS_COLOURS.HY} fillOpacity="0.22" stroke={CLASS_COLOURS.HY} strokeOpacity="0.95" strokeWidth="1.6" />
          <CarArrow w={2.0 * PX_PER_M} h={5.1 * PX_PER_M} fill={CLASS_COLOURS.HY} stroke="rgba(0,0,0,0.6)" strokeWidth={1.2} />
          <text
            x="0"
            y={5.1 * PX_PER_M / 2 + 9}
            textAnchor="middle"
            className="font-mono"
            fontSize="8"
            fontWeight="bold"
            fill="#e6ebf5"
            stroke="rgba(0,0,0,0.85)"
            strokeWidth="2.5"
            paintOrder="stroke"
          >
            7
          </text>
        </g>

        {/* You — white arrowhead, fixed at the exact centre */}
        <g transform={`translate(${W / 2}, ${H / 2})`}>
          <CarArrow w={2.05 * PX_PER_M} h={4.76 * PX_PER_M} fill="#e9eefb" stroke="rgba(0,0,0,0.75)" strokeWidth={1.6} />
        </g>
      </svg>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   TRACK MAP — the circuit as a lit 2.5-D ribbon on a soft ground plane
   ──────────────────────────────────────────────────────────────────────────── */

/*
 * Rebuilt from the widget's own canvas renderer, in its DEFAULT "classic"
 * palette: one infographic red, shaded per segment by a single Lambert light
 * so straights and the corners they feed read as different faces of one
 * solid. The road is extruded down to the ground plane as a tall curtain that
 * follows the (exaggerated) elevation, casts a blurred shadow, and the field
 * circulates as class-coloured dots on a CSS motion path. A brand cyan→pink
 * style also ships in the app; the classic red is what it opens with.
 */

const TM_N = 88;
const TM_LIGHT = { x: -0.468, y: -0.884 }; // normalised top-left light
const TM_AMBIENT = 0.3; // ambient floor — deep shadow faces stay dark maroon
const TM_BASE = [235, 45, 48]; // the classic palette's flat red
const TM_LINE = "#141821"; // classic start/finish bar colour

/** A representative circuit, sampled like the learned centreline. `lift` is
    the (exaggerated) elevation, exactly as the renderer treats it. */
const TM_PTS = Array.from({ length: TM_N }, (_, i) => {
  const t = i / TM_N;
  const th = t * Math.PI * 2;
  return {
    x: 150 + 110 * Math.cos(th) + 22 * Math.cos(2 * th + 1.1) + 8 * Math.cos(4 * th + 0.4),
    y: 108 + 44 * Math.sin(th) + 12 * Math.sin(3 * th + 0.6),
    lift: 15 + 9 * Math.sin(2 * th + 0.9) + 3 * Math.sin(5 * th + 1.7),
    t,
  };
});

/** The road centreline at road height — also the cars' motion path. */
const TM_PATH =
  TM_PTS.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${(p.y - p.lift).toFixed(1)}`).join(" ") + " Z";

/** The flat silhouette (lift removed) that casts the shadow. */
const TM_SHADOW =
  TM_PTS.map((p, i) => `${i === 0 ? "M" : "L"}${(p.x + 3).toFixed(1)} ${(p.y + 6).toFixed(1)}`).join(" ") + " Z";

/** Per-segment Lambert shading over the classic red. `shade(m)` darkens the
    lit colour for the curtain bands below the road lip. */
const TM_SEGS = TM_PTS.map((p, i) => {
  const q = TM_PTS[(i + 1) % TM_N];
  const dx = q.x - p.x;
  const dy = q.y - q.lift - (p.y - p.lift);
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const k = TM_AMBIENT + (1 - TM_AMBIENT) * Math.abs(nx * TM_LIGHT.x + ny * TM_LIGHT.y);
  const shade = (m: number) => `rgb(${TM_BASE.map((c) => Math.round(c * k * m)).join(",")})`;
  return { p, q, top: shade(1), shade };
});

/** The circulating field: lap position, class colour, lap duration. Slightly
    different durations keep the traffic pattern from ever repeating. */
const TM_CARS = [
  { pct: 6, colour: "#ff5470", dur: 30 },
  { pct: 21, colour: "#4f8bff", dur: 33 },
  { pct: 34, colour: "#35d07f", dur: 36 },
  { pct: 55, colour: "#ff5470", dur: 31 },
  { pct: 68, colour: "#4f8bff", dur: 34 },
  { pct: 83, colour: "#35d07f", dur: 37 },
];

function tmOrbitStyle(pct: number, dur: number): React.CSSProperties {
  return {
    offsetPath: `path("${TM_PATH}")`,
    offsetDistance: `${pct}%`,
    offsetRotate: "0deg",
    animationDelay: `${(-(pct / 100) * dur).toFixed(2)}s`,
    ["--orbit-dur" as never]: `${dur}s`,
  };
}

export function TrackMapMock({ large = false, className }: { large?: boolean; className?: string }) {
  // Start/finish bar: perpendicular to the road at station 0, in the palette's
  // dark line colour, exactly where the cyan→pink seam sits.
  const sfP = TM_PTS[0];
  const sfQ = TM_PTS[1];
  const sfDx = sfQ.x - sfP.x;
  const sfDy = sfQ.y - sfQ.lift - (sfP.y - sfP.lift);
  const sfLen = Math.hypot(sfDx, sfDy) || 1;
  const sfNx = (-sfDy / sfLen) * 6.5;
  const sfNy = (sfDx / sfLen) * 6.5;

  return (
    <Panel title="Track Map" meta="Silverstone (ELMS)" className={className}>
      <div className="flex h-full flex-col justify-center">
      <svg
        viewBox="0 0 300 200"
        className={cn("w-full", large ? "min-h-[260px]" : "")}
        role="img"
        aria-label="A 3D track map: the circuit as a raised red ribbon extruded down to a ground plane, with every car in the session circulating as a class-coloured dot"
      >
        <defs>
          {/* The ground plane is a soft pool of light, not a plate */}
          <radialGradient id="tmGround" cx="50%" cy="52%" r="55%">
            <stop offset="0%" stopColor="rgb(150,170,210)" stopOpacity="0.075" />
            <stop offset="55%" stopColor="rgb(150,170,210)" stopOpacity="0.054" />
            <stop offset="100%" stopColor="rgb(150,170,210)" stopOpacity="0" />
          </radialGradient>
          {/* Your dot: the brand gradient across its face, as the renderer draws it */}
          <linearGradient id="tmEgo" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <filter id="tmBlur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.8" />
          </filter>
        </defs>

        <ellipse cx="150" cy="120" rx="142" ry="62" fill="url(#tmGround)" />

        {/* Cast shadow from the flat silhouette, offset and blurred */}
        <path d={TM_SHADOW} fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="10" strokeLinejoin="round" filter="url(#tmBlur)" />

        {/* The curtain: the road extruded the FULL way down to the ground
            plane, in stacked bands — darkest at the foot, lightening toward
            the lip. This tall wall is most of the 2.5-D read. */}
        {TM_SEGS.map((s, i) => {
          const steps = Math.max(2, Math.round(Math.min(s.p.lift, s.q.lift) / 3.2));
          return Array.from({ length: steps }, (_, b) => {
            const f = b / steps; // 0 = ground … →1 just under the road
            return (
              <line
                key={`c${i}-${b}`}
                x1={s.p.x}
                y1={s.p.y - s.p.lift * f}
                x2={s.q.x}
                y2={s.q.y - s.q.lift * f}
                stroke={s.shade(0.28 + 0.42 * f)}
                strokeWidth="10"
                strokeLinecap="round"
              />
            );
          });
        })}
        {/* The lit road surface, one Lambert-shaded flat fill per segment */}
        {TM_SEGS.map((s, i) => (
          <line
            key={`hi${i}`}
            x1={s.p.x}
            y1={s.p.y - s.p.lift}
            x2={s.q.x}
            y2={s.q.y - s.q.lift}
            stroke={s.top}
            strokeWidth="11"
            strokeLinecap="round"
          />
        ))}

        {/* Start/finish bar across the road, in the classic line colour */}
        <line
          x1={sfP.x + sfNx}
          y1={sfP.y - sfP.lift + sfNy}
          x2={sfP.x - sfNx}
          y2={sfP.y - sfP.lift - sfNy}
          stroke={TM_LINE}
          strokeWidth="4.5"
        />

        {/* The field — contact shadow + outlined dot, circulating the lap */}
        {TM_CARS.map((c, i) => (
          <g key={i} className={styles.orbit} style={tmOrbitStyle(c.pct, c.dur)}>
            <ellipse cx="0" cy="2.3" rx="4.4" ry="2.1" fill="rgba(0,0,0,0.38)" />
            <circle r="4.2" fill={c.colour} stroke="#0a0b12" strokeWidth="1.6" />
          </g>
        ))}

        {/* You — gradient face, white ring, cyan halo ring, drawn last */}
        <g className={styles.orbit} style={tmOrbitStyle(46, 32)}>
          <ellipse cx="0" cy="3.6" rx="6.9" ry="3.3" fill="rgba(0,0,0,0.38)" />
          <circle r="10.6" fill="none" stroke="rgba(34,211,238,0.95)" strokeWidth="2.2" />
          <circle r="8.2" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.4" />
          <circle r="6.6" fill="url(#tmEgo)" stroke="#0a0b12" strokeWidth="2" />
        </g>
      </svg>

      {large && (
        <p
          className="mt-1 text-center font-display text-[10px] uppercase"
          style={{ color: T.muted, letterSpacing: "0.08em" }}
        >
          32 circuits bundled · the rest learned from your first lap
        </p>
      )}
      </div>
    </Panel>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   RACE CONTROL — the calls the stock HUD makes, without the stock HUD.
   Faithful to the widget: a headed panel, the sim's own start-light count,
   the 28px flag message, and the always-present sector rail. The animation
   runs the real sequence — lamps build one by one, lights out, green flag.
   ──────────────────────────────────────────────────────────────────────────── */

const RC_LAMPS = [styles.lamp1, styles.lamp2, styles.lamp3, styles.lamp4, styles.lamp5];

export function RaceControlMock({ className }: { className?: string }) {
  return (
    <Panel title="Race Control" meta="GREEN" className={className}>
      <div className="flex flex-col items-center gap-2 py-1">
        {/* The start-light gantry — 22px lamps, lit red with the app's glow */}
        <div className="flex gap-[10px] pb-[2px] pt-[4px]">
          {RC_LAMPS.map((cls, i) => (
            <span
              key={i}
              className={cn("h-[22px] w-[22px] rounded-full border", cls)}
              style={{
                background: T.loss,
                borderColor: "rgba(255,84,112,0.35)",
                boxShadow: "0 0 12px rgba(255,84,112,0.8)",
              }}
            />
          ))}
        </div>

        {/* The message line — fs-crit, coloured by race state */}
        <div
          className={cn("text-center font-display text-[28px] font-bold uppercase", styles.rcMsg)}
          style={{ color: T.gain, letterSpacing: "0.12em", lineHeight: 1.1 }}
        >
          Green flag
        </div>

        {/* The sector rail is always present; S2 carries a local yellow */}
        <div className="flex gap-[6px]">
          {(["S1", "S2", "S3"] as const).map((s) => {
            const yellow = s === "S2";
            return (
              <span
                key={s}
                className="rounded-[5px] border px-[10px] py-[2px] font-display text-[9px] font-bold uppercase"
                style={{
                  background: yellow ? "rgba(255,176,32,0.18)" : T.panel2,
                  borderColor: yellow ? T.warn : "transparent",
                  color: yellow ? T.warn : T.muted,
                  letterSpacing: "0.1em",
                }}
              >
                {s}
              </span>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   SPEEDO CLUSTER — the Apex design, rebuilt from the widget's own 1000×470
   design box: the chamfered binocular bezel, the two black wells, the twin
   rev bars that climb the outer edges and meet head-on above the speed, and
   the floor-up illumination wash that climbs and recolours with the revs.
   The widget ships without panel chrome — it's a bare cluster over the sim.
   ──────────────────────────────────────────────────────────────────────────── */

/** The bezel silhouette from the renderer's shellPath constants. */
const SP_SHELL =
  "M74 0 L306 0 L352 52 L648 52 L694 0 L926 0 Q1000 0 1000 74 L1000 372 " +
  "Q1000 424 948 424 L826 424 L780 470 L220 470 L174 424 L52 424 Q0 424 0 372 L0 74 Q0 0 74 0 Z";

/** Rev-bar centrelines: bottom outer corner → up the edge → round the top →
    across the pod → down the chamfer → inward to meet above the speed. */
const SP_BAR_L = "M40 404 L40 132 Q40 40 132 40 L306 40 L358 92 L476 92";
const SP_BAR_R = "M960 404 L960 132 Q960 40 868 40 L694 40 L642 92 L524 92";

/** The lit band at ~93% revs, split into flat-colour runs per the ramp:
    flat green low down, green→yellow across the top, amber on the chamfer,
    into red at the tip. */
const SP_BAND_L: { d: string; stroke: string }[] = [
  { d: "M40 404 L40 132 Q40 40 132 40", stroke: "#30d87c" },
  { d: "M132 40 L306 40", stroke: "url(#spRampL)" },
  { d: "M306 40 L358 92", stroke: "#ffb020" },
  { d: "M358 92 L421 92", stroke: "url(#spTipL)" },
];
const SP_BAND_R: { d: string; stroke: string }[] = [
  { d: "M960 404 L960 132 Q960 40 868 40", stroke: "#30d87c" },
  { d: "M868 40 L694 40", stroke: "url(#spRampR)" },
  { d: "M694 40 L642 92", stroke: "#ffb020" },
  { d: "M642 92 L579 92", stroke: "url(#spTipR)" },
];

/** The chin chip strip: LIMITER · REGEN · TC · PWR · SLIP · ABS. */
const SP_CHIPS: { t: string; w: number; on?: string }[] = [
  { t: "LIMITER", w: 96 },
  { t: "REGEN 2", w: 96, on: "#35d07f" },
  { t: "TC 4", w: 64, on: "#ffd23e" },
  { t: "PWR 2", w: 76 },
  { t: "SLIP 3", w: 78 },
  { t: "ABS 3", w: 70 },
];

export function SpeedoMock({ className }: { className?: string }) {
  const chipsTotal = SP_CHIPS.reduce((sum, c) => sum + c.w, 0) + (SP_CHIPS.length - 1) * 8;
  let chipX = (1000 - chipsTotal) / 2;

  return (
    <div className={className}>
      <svg
        viewBox="0 0 1000 470"
        className="w-full"
        role="img"
        aria-label="The Apex speedo cluster: speed, gear and revs in the centre, fuel and energy in the left well, projected lap and hybrid battery in the right, twin rev bars meeting overhead, the whole panel glowing amber from the floor up at high revs"
      >
        <defs>
          <clipPath id="spClip">
            <path d={SP_SHELL} />
          </clipPath>
          {/* Bezel edge: lit at the top, falling away below */}
          <linearGradient id="spBezel" x1="0" y1="0" x2="0" y2="470" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="rgba(205,245,245,0.8)" />
            <stop offset="0.4" stopColor="rgba(130,185,185,0.3)" />
            <stop offset="1" stopColor="rgba(100,155,155,0.16)" />
          </linearGradient>
          {/* The floor-up illumination, in the current rev colour — kept well
              below the real peak alpha so the shell still reads near-black */}
          <linearGradient id="spGlow" x1="0" y1="470" x2="0" y2="33" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="rgba(255,176,32,0.22)" />
            <stop offset="0.45" stopColor="rgba(255,176,32,0.11)" />
            <stop offset="1" stopColor="rgba(255,176,32,0)" />
          </linearGradient>
          {/* Band ramps: green→yellow across the pod tops, amber→red at the tips */}
          <linearGradient id="spRampL" x1="132" y1="0" x2="306" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#30d87c" />
            <stop offset="1" stopColor="#e8d834" />
          </linearGradient>
          <linearGradient id="spRampR" x1="868" y1="0" x2="694" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#30d87c" />
            <stop offset="1" stopColor="#e8d834" />
          </linearGradient>
          <linearGradient id="spTipL" x1="358" y1="0" x2="421" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ffb020" />
            <stop offset="1" stopColor="#ff2e2a" />
          </linearGradient>
          <linearGradient id="spTipR" x1="642" y1="0" x2="579" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ffb020" />
            <stop offset="1" stopColor="#ff2e2a" />
          </linearGradient>
          <filter id="spDrop" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="8" stdDeviation="14" floodColor="#000000" floodOpacity="0.6" />
          </filter>
          <filter id="spBloom" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        {/* The shell */}
        <path d={SP_SHELL} fill="rgb(11,17,17)" filter="url(#spDrop)" />

        {/* Floor-up illumination — screen-blended, clipped to the shell */}
        <g clipPath="url(#spClip)" style={{ mixBlendMode: "screen" }}>
          <rect x="0" y="33" width="1000" height="437" fill="url(#spGlow)" className={styles.glowPulse} />
        </g>

        {/* Bezel edge light */}
        <path d={SP_SHELL} fill="none" stroke="url(#spBezel)" strokeWidth="2" />

        {/* The two wells */}
        <rect x="96" y="96" width="286" height="312" rx="16" fill="rgba(0,0,0,0.86)" stroke="rgba(140,200,200,0.13)" />
        <rect x="618" y="96" width="286" height="312" rx="16" fill="rgba(0,0,0,0.86)" stroke="rgba(140,200,200,0.13)" />

        {/* Rev-bar tracks, with the red limit zone at the tips */}
        <path d={SP_BAR_L} fill="none" stroke="rgba(255,255,255,0.055)" strokeWidth="15" strokeLinecap="round" />
        <path d={SP_BAR_R} fill="none" stroke="rgba(255,255,255,0.055)" strokeWidth="15" strokeLinecap="round" />
        <path d="M421 92 L476 92" fill="none" stroke="rgba(255,46,42,0.17)" strokeWidth="15" strokeLinecap="round" />
        <path d="M579 92 L524 92" fill="none" stroke="rgba(255,46,42,0.17)" strokeWidth="15" strokeLinecap="round" />
        {/* The keystone bridging the two tips, unlit until the shift flash */}
        <rect x="476" y="85.5" width="48" height="13" rx="2" fill="rgba(255,255,255,0.06)" />

        {/* The lit band: soft bloom pass, then the crisp band, then the cap */}
        {[...SP_BAND_L, ...SP_BAND_R].map((seg, i) => (
          <path key={`b${i}`} d={seg.d} fill="none" stroke={seg.stroke} strokeWidth="25" opacity="0.16" strokeLinecap="round" filter="url(#spBloom)" />
        ))}
        {[...SP_BAND_L, ...SP_BAND_R].map((seg, i) => (
          <path key={`c${i}`} d={seg.d} fill="none" stroke={seg.stroke} strokeWidth="13" opacity="0.96" strokeLinecap="round" />
        ))}
        <circle cx="421" cy="92" r="8" fill="rgba(255,46,42,0.3)" filter="url(#spBloom)" />
        <circle cx="421" cy="92" r="4.5" fill="#ff2e2a" />
        <circle cx="579" cy="92" r="8" fill="rgba(255,46,42,0.3)" filter="url(#spBloom)" />
        <circle cx="579" cy="92" r="4.5" fill="#ff2e2a" />

        {/* Centre core: unit above the number, gear framed in the band colour */}
        <text x="500" y="140" textAnchor="middle" className="font-display" fontSize="15" letterSpacing="0.16em" fill="#aeb6c8">
          KPH
        </text>
        <text x="500" y="212" textAnchor="middle" className="font-display font-bold" fontSize="76" fill="#f4f6fb">
          287
        </text>
        <text x="500" y="243" textAnchor="middle" className="font-mono" fontSize="13" fill="#6b7387">
          7 420 RPM
        </text>
        <rect x="457" y="262" width="86" height="86" rx="5" fill="rgba(0,0,0,0.42)" stroke="#ffb020" />
        <text x="500" y="332" textAnchor="middle" className="font-display font-bold" fontSize="68" fill="#f4f6fb">
          6
        </text>

        {/* Left well: the two distance budgets */}
        <text x="124" y="155" className="font-display" fontSize="15" letterSpacing="0.12em" fill="#6b7387">
          FUEL
        </text>
        <text x="124" y="192" className="font-mono" fontSize="32" fontWeight="600" fill="#f4f6fb">
          62.4 L
        </text>
        <text x="124" y="216" className="font-mono" fontSize="15" fill="#aeb6c8">
          ≈8.2 LAPS
        </text>
        <text x="124" y="272" className="font-display" fontSize="15" letterSpacing="0.12em" fill="#6b7387">
          ENERGY
        </text>
        <text x="124" y="309" className="font-mono" fontSize="32" fontWeight="600" fill="#f4f6fb">
          57%
        </text>
        <text x="124" y="333" className="font-mono" fontSize="15" fill="#aeb6c8">
          ≈6.1 LAPS
        </text>

        {/* Right well: pace and the hybrid battery, breathing green on regen */}
        <text x="876" y="155" textAnchor="end" className="font-display" fontSize="15" letterSpacing="0.12em" fill="#6b7387">
          PROJECTED
        </text>
        <text x="876" y="192" textAnchor="end" className="font-mono" fontSize="32" fontWeight="600" fill="#f4f6fb">
          1:37.912
        </text>
        <text x="876" y="216" textAnchor="end" className="font-mono" fontSize="15" fill="#35d07f">
          −0.24
        </text>
        <text x="876" y="272" textAnchor="end" className="font-display" fontSize="15" letterSpacing="0.12em" fill="#6b7387">
          BATTERY
        </text>
        <rect x="746" y="286" width="44" height="20" rx="3" fill="rgba(0,0,0,0.55)" stroke="#6b7387" strokeWidth="1.5" />
        <rect x="791" y="291" width="4" height="10" rx="1" fill="#35d07f" />
        <rect x="749" y="289" width="28" height="14" rx="1" fill="#35d07f" className={styles.breathe} />
        <text x="876" y="305" textAnchor="end" className="font-mono" fontSize="28" fontWeight="600" fill="#f4f6fb">
          72%
        </text>
        <text x="876" y="333" textAnchor="end" className="font-mono" fontSize="15" fill="#35d07f">
          ▼ REGEN
        </text>

        {/* The chip strip in the chin */}
        {SP_CHIPS.map((chip) => {
          const x = chipX;
          chipX += chip.w + 8;
          return (
            <g key={chip.t}>
              <rect
                x={x}
                y="433"
                width={chip.w}
                height="27"
                rx="3"
                fill={chip.on ?? "rgba(0,0,0,0.45)"}
                stroke={chip.on ? "none" : "#232838"}
              />
              <text
                x={x + chip.w / 2}
                y="452"
                textAnchor="middle"
                className="font-display"
                fontSize="15"
                letterSpacing="0.05em"
                fill={chip.on ? "#0a0b12" : "#6b7387"}
              >
                {chip.t}
              </text>
            </g>
          );
        })}
      </svg>

      <p className="mt-2 text-center font-display text-[10px] uppercase" style={{ color: T.muted, letterSpacing: "0.08em" }}>
        Speedo · Apex design — LMP2 crews get the Cosworth CDU design instead
      </p>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   REFERENCE PACE — the Ohne Speed ladder. Faithful to the widget: the band
   percentage in the band's colour, the six-rung gradient ladder running
   Offline on the left to Alien on the right, the white marker on your spot,
   and the credit line that is not decoration and is not optional.
   ──────────────────────────────────────────────────────────────────────────── */

/** The six bands, slow → fast, flex-grown to their share of the 98–109% scale. */
const REF_BANDS: { label: string; grow: number }[] = [
  { label: "Offline", grow: 3 },
  { label: "Tail-ender", grow: 1 },
  { label: "Midpack", grow: 2 },
  { label: "Good", grow: 2 },
  { label: "Competitive", grow: 1 },
  { label: "Alien", grow: 2 },
];

export function RefPaceMock({ large = false, className }: { large?: boolean; className?: string }) {
  const pct = 102.4; // GOOD — the band colour is the app's text-primary white
  const markerLeft = ((109 - pct) / (109 - 98)) * 100;

  return (
    <Panel title="Reference Pace" meta="GT3 · Grand Prix" className={className}>
      <div className="flex flex-col gap-[7px]">
        <div className="flex items-baseline gap-2">
          <span
            className="tabular font-mono font-bold leading-none"
            style={{ fontSize: large ? 42 : 28, color: T.primary, textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}
          >
            {pct.toFixed(1)}%
          </span>
          <span className="font-mono text-[11px] font-bold" style={{ color: T.primary, letterSpacing: "0.08em" }}>
            GOOD
          </span>
        </div>

        {/* The ladder: one gradient bar, carved into the six bands */}
        <div
          className="relative flex h-[8px] gap-[2px] rounded-[4px]"
          style={{
            opacity: 0.9,
            background: "linear-gradient(90deg, #309be1, #35d07f 45%, #ffb020 75%, #6a2fd6)",
          }}
        >
          {REF_BANDS.map((b) => (
            <span key={b.label} title={b.label} className="rounded-[2px]" style={{ flexGrow: b.grow }} />
          ))}
          <span
            className={cn("absolute w-[3px] rounded-[2px]", styles.settle)}
            style={{
              left: `${markerLeft}%`,
              top: -3,
              height: 14,
              marginLeft: -1.5,
              background: T.primary,
              boxShadow: "0 0 0 1px rgba(0,0,0,0.85)",
            }}
          />
        </div>

        {large && (
          <div className="flex gap-[2px]">
            {REF_BANDS.map((b) => (
              <span
                key={b.label}
                className="overflow-hidden text-ellipsis whitespace-nowrap text-center font-display text-[8px] font-bold uppercase"
                style={{ flexGrow: b.grow, flexBasis: 0, color: T.muted, letterSpacing: "0.06em" }}
              >
                {b.label}
              </span>
            ))}
          </div>
        )}

        <div className="grid grid-cols-3 gap-[6px]">
          {[
            { label: "YOU", value: "1:57.803", colour: T.primary },
            { label: "ALIEN", value: "1:55.021", colour: T.primary },
            { label: "GAP", value: "+2.78", colour: T.loss },
          ].map((s) => (
            <div key={s.label} className="rounded-[5px] px-[6px] py-[4px]" style={{ background: T.panel2 }}>
              <div className="font-mono text-[11px] font-bold" style={{ color: T.muted, letterSpacing: "0.06em" }}>
                {s.label}
              </div>
              <div className="tabular font-mono text-[15px] font-bold" style={{ color: s.colour }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        <p className="text-[10px]" style={{ color: T.muted, letterSpacing: "0.02em" }}>
          Reference times by Ohne Speed
        </p>
      </div>
    </Panel>
  );
}
