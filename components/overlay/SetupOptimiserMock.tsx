import { Check, LockKeyhole, Radio, RotateCcw, SlidersHorizontal } from "lucide-react";

const SETUP_ROWS = [
  { label: "Brake balance", value: "52.3:47.7", next: "54.1:45.9" },
  { label: "Front brake ducts", value: "Open", next: "33%" },
  { label: "Rear wing", value: "8", next: "10" },
  { label: "Front anti-roll bar", value: "4", next: "3" },
] as const;

const ENGINEER_SLIDERS = [
  { label: "Front turn-in", value: "+3", position: "72%" },
  { label: "Mid-corner stability", value: "+2", position: "64%" },
  { label: "Braking stability", value: "+1", position: "57%" },
] as const;

function SetupRow({
  label,
  value,
  next,
  locked = false,
}: {
  label: string;
  value: string;
  next?: string;
  locked?: boolean;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-line/70 px-4 py-3 last:border-0">
      <div className="flex items-center gap-2">
        {next ? <span className="h-1.5 w-1.5 rounded-full bg-flag-amber" /> : null}
        <span className="text-sm text-muted">{label}</span>
        {locked ? <LockKeyhole aria-label="Fixed by ruleset" size={12} className="text-subtle" /> : null}
      </div>
      <div className="flex items-center gap-2 font-mono text-xs">
        <span className="text-ink">{value}</span>
        {next ? (
          <>
            <span className="text-subtle">→</span>
            <span className="text-flag-amber">{next}</span>
          </>
        ) : null}
      </div>
    </div>
  );
}

function EngineerSlider({
  label,
  value,
  position,
}: {
  label: string;
  value: string;
  position: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-xs text-muted">{label}</span>
        <span className="font-mono text-xs font-bold text-cyan">{value}</span>
      </div>
      <div className="relative h-1 rounded-full bg-line">
        <span className="absolute left-1/2 top-1/2 h-2.5 w-px -translate-y-1/2 bg-subtle" />
        <span
          className="motion-slider-thumb absolute top-1/2 h-3.5 w-3.5 rounded-full border-2 border-base bg-cyan shadow-glow-cyan"
          style={{ left: position }}
        />
      </div>
    </div>
  );
}

export function SetupOptimiserMock() {
  return (
    <div
      role="img"
      aria-label="Apex AIO Setups screen showing live garage settings and staged Race engineer changes"
      className="relative overflow-hidden rounded-card border border-line bg-[#080a0f] shadow-card"
    >
      <span aria-hidden className="motion-scanline pointer-events-none absolute inset-y-0 z-10 w-24 bg-gradient-to-r from-transparent via-cyan/5 to-transparent" />
      <div className="flex items-center justify-between border-b border-line bg-elevated/80 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-flag-red/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-flag-amber/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
          <span className="ml-2 font-display text-sm font-semibold uppercase tracking-widest text-ink">
            Setups
          </span>
        </div>
        <span className="motion-live-pulse inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-success/10 px-2.5 py-1 font-mono text-[10px] font-bold text-success">
          <Radio size={10} /> LIVE
        </span>
      </div>

      <div className="border-b border-line px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <strong className="font-display text-sm text-ink">Porsche 911 GT3 R</strong>
          <span className="chip border-accent/40 text-[10px] text-accent-2">LMGT3</span>
          <span className="chip border-cyan/30 text-[10px] text-cyan">Symmetric</span>
        </div>
        <p className="mt-1 text-xs text-subtle">
          Edits here land in the garage instantly. Engineer changes are staged first.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1.35fr_0.85fr]">
        <div className="border-line lg:border-r">
          <div className="flex gap-1 overflow-hidden border-b border-line p-2">
            {["Basic", "Powertrain", "Wheels & brakes", "Suspension"].map((tab) => (
              <span
                key={tab}
                className={
                  tab === "Wheels & brakes"
                    ? "whitespace-nowrap rounded bg-accent/15 px-2 py-1 font-display text-[10px] uppercase tracking-wide text-accent-2"
                    : "whitespace-nowrap px-2 py-1 font-display text-[10px] uppercase tracking-wide text-subtle"
                }
              >
                {tab}
              </span>
            ))}
          </div>
          <div className="bg-surface/20">
            <div className="border-b border-line bg-surface/50 px-4 py-2 font-display text-[10px] uppercase tracking-widest text-subtle">
              Brakes &amp; aero
            </div>
            {SETUP_ROWS.map((row) => (
              <SetupRow key={row.label} {...row} />
            ))}
            <div className="border-b border-line bg-surface/50 px-4 py-2 font-display text-[10px] uppercase tracking-widest text-subtle">
              Ruleset
            </div>
            <SetupRow label="ABS map" value="Factory" locked />
          </div>
        </div>

        <div className="bg-surface/30 p-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-cyan" />
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink">
              Race engineer
            </h3>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-subtle">
            Turn handling intent into balanced, car-specific setup changes.
          </p>
          <div className="mt-5 space-y-5">
            {ENGINEER_SLIDERS.map((slider) => (
              <EngineerSlider key={slider.label} {...slider} />
            ))}
          </div>
          <p className="mt-5 rounded border border-flag-amber/30 bg-flag-amber/10 px-3 py-2 font-mono text-[10px] text-flag-amber">
            5 settings staged · 1 fixed by ruleset
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <span className="inline-flex items-center justify-center gap-1.5 rounded border border-line px-3 py-2 font-display text-xs uppercase text-muted">
              <RotateCcw size={12} /> Revert
            </span>
            <span className="inline-flex items-center justify-center gap-1.5 rounded bg-neon-primary px-3 py-2 font-display text-xs font-semibold uppercase text-white">
              <Check size={12} /> Apply
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-line bg-elevated/50 px-4 py-3 text-xs">
        <span className="text-subtle">Community setup · Spa race — low drag</span>
        <span className="font-mono text-success">2:15.032 ✓</span>
      </div>
    </div>
  );
}
