import { ChevronDown, ShieldAlert } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Hard, checkable claims — each one measurable in the app within the first
 * ten minutes of the trial. The long-form versions live on the topic pages.
 */
const FACTS: readonly { stat: string; label: string }[] = [
  { stat: "28", label: "engineer questions answered offline" },
  { stat: "0", label: "extra renderers on stream" },
  { stat: "1–2 KB", label: "per telemetry frame, on loopback" },
  { stat: "32", label: "circuits bundled in the box" },
  { stat: "72 h", label: "offline grace on your subscription" },
  { stat: "Signed", label: "installer, updates and voice engine" },
];

export function ProofStrip() {
  return (
    <section className="border-t border-line py-14">
      <div className="container-rail">
        <Reveal className="mb-8 text-center">
          <span className="kicker mb-4">Checkable claims</span>
          <h2 className="text-3xl font-bold text-ink sm:text-4xl">
            The LMU app, <span className="text-gradient">by the numbers</span>
          </h2>
        </Reveal>

        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-3 lg:grid-cols-6">
          {FACTS.map((f) => (
            <div key={f.label} className="flex flex-col-reverse bg-surface/80 p-5 text-center">
              <dt className="mt-1 font-mono text-[11px] uppercase tracking-widest text-cyan">{f.label}</dt>
              <dd className="font-display text-3xl font-bold text-gradient">{f.stat}</dd>
            </div>
          ))}
        </dl>

        <details className="group mx-auto mt-4 max-w-3xl text-sm text-muted">
          <summary className="flex cursor-pointer list-none items-center justify-center gap-2 text-subtle hover:text-ink [&::-webkit-details-marker]:hidden">
            <ShieldAlert size={16} className="shrink-0 text-flag-amber" aria-hidden />
            <strong className="font-semibold">Where the data isn&apos;t there, we say so.</strong>
            <ChevronDown size={14} aria-hidden className="transition-transform group-open:rotate-180" />
          </summary>
          <p className="mt-3 rounded-card border border-line bg-surface/50 p-4">
            The MFD, race control, track-limit, damage and setup features depend on data rFactor 2
            doesn&apos;t publish, so on rF2 they read &ldquo;no data&rdquo; rather than showing a
            plausible zero. Track-limit charges can arrive up to ~25 seconds late because of how LMU
            flushes its log — the total is right, sometimes it&apos;s right late. And repair and tyre
            times are shown side by side rather than added together, because whether they overlap
            hasn&apos;t been verified against a real stop.
          </p>
        </details>
      </div>
    </section>
  );
}
