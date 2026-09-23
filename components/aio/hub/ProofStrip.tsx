import { SectionHeading } from "@/components/aio/SectionHeading";

/**
 * Hard, checkable claims, each one measurable in the app within the first
 * ten minutes of the trial, printed as one row of a timing screen. The
 * long-form versions live on the topic pages.
 */
const FACTS: readonly { value: string; unit?: string; label: string }[] = [
  { value: "28", label: "Engineer questions answered offline" },
  { value: "0", label: "Extra renderers on stream" },
  { value: "1–2", unit: "KB", label: "Per telemetry frame, on loopback" },
  { value: "32", label: "Circuits bundled" },
  { value: "72", unit: "h", label: "Offline grace on a subscription" },
  { value: "3", unit: "/3", label: "Signed: installer, updates and voice engine" },
];

export function ProofStrip({ index }: { index?: string }) {
  return (
    <section aria-labelledby="proof-heading" className="border-t border-line py-16">
      <div className="container-rail">
        <SectionHeading
          index={index}
          id="proof-heading"
          label="Numbers"
          title="Six numbers you can check in the trial"
          className="mb-8"
        />

        {/* One timing-screen row: hairlines are the 1px gaps showing the line colour through */}
        <dl className="grid grid-cols-2 gap-px border-y border-line bg-line sm:grid-cols-3 lg:grid-cols-6">
          {FACTS.map((f) => (
            <div key={f.label} className="flex flex-col-reverse justify-end gap-2 bg-base px-4 py-5">
              <dt className="font-mono text-[10px] uppercase leading-snug tracking-[0.18em] text-subtle">
                {f.label}
              </dt>
              <dd className="font-mono text-4xl font-bold tabular-nums leading-none text-ink">
                {f.value}
                {f.unit && <span className="ml-1 text-base font-normal text-muted">{f.unit}</span>}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 grid gap-2 text-sm text-muted md:grid-cols-[200px_minmax(0,1fr)] md:gap-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-flag-amber">Where data is missing</p>
          <p className="max-w-3xl">
            The MFD, race control, track-limit, damage and setup features depend on data rFactor 2
            doesn&apos;t publish, so on rF2 they read &ldquo;no data&rdquo; rather than showing a
            plausible zero. Track-limit charges can arrive up to ~25 seconds late because of how LMU
            flushes its log, though the total is correct. Repair and tyre times are shown side by
            side rather than added together, because whether they overlap hasn&apos;t been verified
            against a real stop.
          </p>
        </div>
      </div>
    </section>
  );
}
