import type { ReactNode } from "react";
import { CloudSun, Fuel, Map, Radio, Users, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

function Panel({
  title,
  icon,
  className,
  children,
}: {
  title: string;
  icon: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("overflow-hidden rounded-lg border border-line bg-surface/40", className)}>
      <div className="flex items-center gap-2 border-b border-line bg-elevated/60 px-3 py-2">
        <span className="text-cyan">{icon}</span>
        <span className="font-display text-[11px] font-semibold uppercase tracking-widest text-ink">
          {title}
        </span>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

const TIMING_ROWS = [
  ["4", "87", "CARL", "2:14.800", "2:13.100", "+0.8", "—", "39%"],
  ["5", "46", "VER", "2:15.121", "2:13.420", "+1.1", "+0.3", "42%"],
  ["6", "12", "MUL", "2:15.802", "2:14.011", "+1.8", "+1.0", "34%"],
  ["7", "92", "JAM", "2:16.214", "2:14.208", "+2.2", "+1.4", "51%"],
] as const;

function TimingPanel() {
  return (
    <Panel title="Timing · LMGT3 · 12" icon={<Radio size={13} />} className="col-span-7 row-span-2">
      <table className="w-full table-fixed font-mono text-[10px]">
        <thead className="text-left font-display uppercase tracking-wide text-subtle">
          <tr>
            {["P", "#", "Driver", "Last", "Best", "Int", "vs me", "VE"].map((head) => (
              <th
                key={head}
                className={cn(
                  "border-b border-line pb-2 font-medium",
                  head === "Driver" ? "w-[22%]" : "",
                )}
              >
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TIMING_ROWS.map((row, index) => (
            <tr
              key={row[1]}
              className={cn(
                "border-b border-line/60 last:border-0",
                index === 0 && "bg-cyan/5 text-ink",
              )}
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={`${row[1]}-${cellIndex}`}
                  className={cn(
                    "py-2",
                    cellIndex === 0 || cellIndex === 2 ? "font-bold text-ink" : "text-muted",
                    cellIndex === 6 && "text-cyan",
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-[9px] text-subtle">
        vs me shows the live interval to your team car. Negative is ahead.
      </p>
    </Panel>
  );
}

function TrackMapPanel() {
  return (
    <Panel title="Track map" icon={<Map size={13} />} className="col-span-5 row-span-2">
      <div className="flex items-center gap-3">
        <svg viewBox="0 0 220 112" className="h-28 flex-1" aria-hidden>
          <path
            d="M22 82 C18 58 35 32 61 38 C82 42 82 18 111 17 C145 16 149 40 179 42 C205 44 209 69 189 83 C166 99 139 80 119 89 C95 100 78 81 62 91 C43 103 27 98 22 82Z"
            fill="none"
            stroke="rgb(var(--color-line))"
            strokeWidth="8"
            strokeLinejoin="round"
          />
          <path
            d="M22 82 C18 58 35 32 61 38 C82 42 82 18 111 17 C145 16 149 40 179 42 C205 44 209 69 189 83 C166 99 139 80 119 89 C95 100 78 81 62 91 C43 103 27 98 22 82Z"
            fill="none"
            stroke="rgb(var(--color-muted))"
            strokeOpacity=".45"
            strokeWidth="2"
          />
          <circle className="motion-map-car" cx="49" cy="39" r="5" fill="rgb(var(--color-cyan))" />
          <circle className="motion-map-car" style={{ animationDelay: "-.5s" }} cx="104" cy="18" r="3.5" fill="rgb(var(--color-accent-2))" />
          <circle className="motion-map-car" style={{ animationDelay: "-1s" }} cx="180" cy="43" r="3.5" fill="rgb(var(--color-gold))" />
          <circle className="motion-map-car" style={{ animationDelay: "-1.5s" }} cx="121" cy="89" r="3.5" fill="rgb(var(--color-success))" />
        </svg>
        <div className="w-24 space-y-2 font-mono text-[9px]">
          <p className="text-cyan">● #87 CARL</p>
          <p className="text-accent-2">● #46 VER</p>
          <p className="text-flag-gold">● #12 MUL</p>
          <p className="text-success">● #92 JAM</p>
        </div>
      </div>
    </Panel>
  );
}

function StrategyPanel() {
  return (
    <Panel title="Strategy to the flag" icon={<Wrench size={13} />} className="col-span-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-display text-2xl font-bold text-ink">2 stops</p>
          <p className="text-[10px] text-subtle">Pit window · in 6–8 laps</p>
        </div>
        <span className="rounded border border-flag-amber/40 bg-flag-amber/10 px-2 py-1 font-mono text-[10px] text-flag-amber">
          Save 3.08% / lap
        </span>
      </div>
      <div className="mt-3 flex items-center gap-1">
        <span className="h-2 flex-[6] rounded-l bg-cyan" />
        <span className="h-2 flex-[6] bg-accent" />
        <span className="h-2 flex-[5] rounded-r bg-accent-2" />
      </div>
      <div className="mt-1 flex justify-between font-mono text-[9px] text-subtle">
        <span>This stint</span>
        <span>Stint 2</span>
        <span>To flag</span>
      </div>
    </Panel>
  );
}

function FuelPanel() {
  return (
    <Panel title="Fuel & energy" icon={<Fuel size={13} />} className="col-span-3">
      <p className="font-display text-2xl font-bold text-cyan">38.5%</p>
      <p className="text-[10px] text-subtle">≈ 8.8 laps in the tank</p>
      <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-[9px]">
        <span className="rounded bg-elevated p-2 text-muted">
          PER LAP <b className="mt-1 block text-ink">4.40%</b>
        </span>
        <span className="rounded bg-flag-red/10 p-2 text-muted">
          AT FLAG <b className="mt-1 block text-flag-red">−35.4%</b>
        </span>
      </div>
    </Panel>
  );
}

function TyresPanel() {
  return (
    <Panel title="Tyres & brakes" icon={<Radio size={13} />} className="col-span-4">
      <div className="grid grid-cols-2 gap-2">
        {[
          ["FL", "81%", "88°C", "352°C"],
          ["FR", "78%", "91°C", "365°C"],
          ["RL", "84%", "86°C", "341°C"],
          ["RR", "80%", "89°C", "358°C"],
        ].map(([corner, wear, tyre, brake]) => (
          <div key={corner} className="flex items-center gap-2 rounded border border-line bg-elevated/60 p-2">
            <span className="flex h-8 w-5 items-center justify-center rounded-full border-2 border-success/70 bg-success/10 font-display text-[8px] text-subtle">
              {corner}
            </span>
            <span className="font-mono text-[9px] text-subtle">
              <b className="block text-success">{wear} left</b>
              {tyre} · {brake}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function WeatherPanel() {
  return (
    <Panel title="Weather" icon={<CloudSun size={13} />} className="col-span-4">
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          ["AIR", "24°C"],
          ["TRACK", "31°C"],
          ["RAIN", "Dry"],
          ["+30M", "50%"],
        ].map(([label, value]) => (
          <span key={label} className="rounded bg-elevated p-2 font-mono text-[9px] text-subtle">
            {label}
            <b className="mt-1 block text-ink">{value}</b>
          </span>
        ))}
      </div>
    </Panel>
  );
}

function LapChartPanel() {
  return (
    <Panel title="Lap times" icon={<Radio size={13} />} className="col-span-8">
      <svg viewBox="0 0 500 70" className="h-16 w-full" preserveAspectRatio="none" aria-hidden>
        <path className="motion-chart-line" pathLength="1" d="M0 48 L70 42 L140 51 L210 28 L280 33 L350 20 L420 31 L500 15" fill="none" stroke="rgb(var(--color-cyan))" strokeWidth="2" />
        <path className="motion-chart-line" pathLength="1" style={{ animationDelay: "-.4s" }} d="M0 58 L70 51 L140 55 L210 46 L280 49 L350 38 L420 42 L500 34" fill="none" stroke="rgb(var(--color-accent-2))" strokeWidth="2" />
        <path d="M0 64 H500 M0 42 H500 M0 20 H500" stroke="rgb(var(--color-line))" strokeWidth="1" />
      </svg>
      <div className="flex gap-2 font-mono text-[9px]">
        <span className="text-cyan">● CARL</span>
        <span className="text-accent-2">● VER</span>
      </div>
    </Panel>
  );
}

export function TeamPitWallMock() {
  return (
    <div
      role="img"
      aria-label="Apex AIO Team pit wall showing live timing, track map, fuel, strategy, tyres, weather and lap charts"
      className="relative overflow-x-auto rounded-card border border-line bg-[#080a0f] shadow-card"
    >
      <span aria-hidden className="motion-scanline pointer-events-none absolute inset-y-0 z-10 w-24 bg-gradient-to-r from-transparent via-cyan/5 to-transparent" />
      <div className="min-w-[900px]">
        <div className="flex items-center justify-between border-b border-line bg-elevated/80 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="font-display text-sm font-semibold uppercase tracking-widest text-ink">
              Team · The pit wall
            </span>
            <span className="motion-live-pulse inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-success/10 px-2 py-1 font-mono text-[9px] font-bold text-success">
              <Radio size={9} /> RELAY · CARL
            </span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-subtle">
            <span className="inline-flex items-center gap-1.5">
              <Users size={12} className="text-cyan" /> Apex Endurance · 4 crew
            </span>
            <span className="rounded bg-accent/15 px-2 py-1 font-display uppercase text-accent-2">
              Engineer
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <div>
            <strong className="font-display text-sm text-ink">Circuit de la Sarthe · Full</strong>
            <span className="ml-3 font-mono text-[10px] uppercase text-success">Race · green</span>
          </div>
          <div className="flex items-center gap-5 font-mono text-[10px] text-muted">
            <span><b className="block text-sm text-ink">1:00:00</b>to go</span>
            <span><b className="block text-sm text-ink">42</b>lap</span>
            <span><b className="block text-sm text-ink">35</b>cars</span>
            <span><b className="block text-sm text-ink">#87</b>team car</span>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-3 p-3">
          <TimingPanel />
          <TrackMapPanel />
          <FuelPanel />
          <StrategyPanel />
          <TyresPanel />
          <LapChartPanel />
          <WeatherPanel />
        </div>
      </div>
    </div>
  );
}
