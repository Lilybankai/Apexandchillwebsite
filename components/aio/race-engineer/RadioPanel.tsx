/**
 * A still of the race engineer's radio panel, frozen on one exchange, for the
 * teardown on /lmu-race-engineer. Same chrome and tokens as the interactive
 * AskEngineer demo in the hero, but static: no audio, no state, so it can sit
 * under annotation callouts without competing with the demo above it.
 *
 * The exchange is one of the scripted demo answers (and one of the real 28
 * questions). KEEP IN SYNC with the QA list in components/overlay/AskEngineer.
 */

const T = {
  panel: "#0c0e18",
  panel2: "#10131f",
  header: "#090a12",
  borderSoft: "#232838",
  primary: "#f4f6fb",
  secondary: "#aeb6c8",
  muted: "#6b7387",
  cyan: "#22d3ee",
  magenta: "#ec4899",
} as const;

const ACCENT_BAR = "linear-gradient(180deg, #22d3ee 0%, #8b5cf6 55%, #ec4899 100%)";
const WAVE = [4, 9, 14, 7, 12, 16, 10, 5, 11, 15, 8, 4, 10, 13, 6];

export function RadioPanel() {
  return (
    <div
      className="relative overflow-hidden rounded-lg border"
      style={{ background: T.panel, borderColor: T.borderSoft }}
      role="img"
      aria-label="The race engineer panel: push-to-talk held, the question 'Fuel to the end?', and Alan's answer on the radio in 0.4 seconds"
    >
      <span aria-hidden className="absolute inset-y-0 left-0 z-10 w-[3px]" style={{ background: ACCENT_BAR }} />
      <div
        className="flex items-center justify-between gap-2 border-b py-[6px] pl-[13px] pr-[10px]"
        style={{ background: T.header, borderColor: T.borderSoft }}
      >
        <span
          className="font-display text-[12px] font-bold uppercase leading-none"
          style={{ color: T.primary, letterSpacing: "0.12em" }}
        >
          Race Engineer
        </span>
        <span className="font-mono text-[11px] leading-none" style={{ color: T.secondary, letterSpacing: "0.02em" }}>
          ALAN · EN-GB
        </span>
      </div>

      <div className="flex flex-col gap-[14px] p-[16px] pl-[19px]">
        <div
          className="flex items-center gap-[10px] rounded-[5px] px-[10px] py-[7px]"
          style={{ background: T.panel2, borderLeft: `3px solid ${T.cyan}` }}
        >
          <span
            className="rounded-[4px] px-[7px] py-[3px] font-display text-[10px] font-bold leading-none"
            style={{ background: "color-mix(in srgb, #22d3ee 18%, transparent)", color: T.cyan, letterSpacing: "0.12em" }}
          >
            ● PTT
          </span>
          <span className="flex h-[16px] flex-1 items-center gap-[2px]" aria-hidden>
            {WAVE.map((h, i) => (
              <span key={i} className="w-[3px] rounded-[1px]" style={{ height: h, background: T.cyan, opacity: 0.8 }} />
            ))}
          </span>
          <span
            className="font-display text-[9px] font-bold uppercase leading-none"
            style={{ color: T.cyan, letterSpacing: "0.1em" }}
          >
            Wheel button
          </span>
        </div>

        <div className="pl-[2px]">
          <span
            className="font-display text-[9px] font-bold uppercase leading-none"
            style={{ color: T.muted, letterSpacing: "0.1em" }}
          >
            You
          </span>
          <p className="tabular mt-[3px] font-mono text-[16px] leading-snug" style={{ color: T.secondary }}>
            &ldquo;Fuel to the end?&rdquo;
          </p>
        </div>

        <div className="rounded-r-[5px] px-[10px] py-[11px]" style={{ background: T.panel2, borderLeft: `3px solid ${T.magenta}` }}>
          <div className="flex items-center justify-between">
            <span
              className="font-display text-[9px] font-bold uppercase leading-none"
              style={{ color: T.magenta, letterSpacing: "0.1em" }}
            >
              Alan · on the radio
            </span>
            <span
              className="tabular font-mono text-[10px] leading-none"
              style={{ color: T.secondary, letterSpacing: "0.04em" }}
            >
              0.4 s
            </span>
          </div>
          <p className="mt-[5px] font-mono text-[16px] leading-snug" style={{ color: T.primary }}>
            &ldquo;You need 46.7 litres to the flag. That&apos;s a splash at the last stop. Plan&apos;s
            unchanged.&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
