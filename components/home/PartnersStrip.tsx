import Link from "next/link";

const PARTNERS = [
  {
    name: "MOZA Racing",
    note: "Affiliate · Direct-drive hardware",
    href: "https://uk.mozaracing.com/?ref=Apexandchillracing",
  },
  {
    name: "Rogue Energy",
    note: "Affiliate · Code apexandchill (10% off)",
    href: "https://rogueenergy.com/discount/ApexandChill?ref=vsodjwaa",
  },
  {
    name: "Sim Endurance",
    note: "Race strategy & telemetry",
    href: "https://simendurance.com/",
  },
] as const;

/** Compact partners strip (Andy's Man Club has its own dedicated feature). */
export function PartnersStrip() {
  return (
    <section className="container-rail py-16">
      <div className="flex flex-col gap-6 rounded-card border border-line bg-surface/50 p-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-md">
          <span className="kicker mb-3">Backed By</span>
          <h2 className="text-3xl font-bold text-ink">Our Partners</h2>
          <p className="mt-3 text-sm text-muted">
            Proudly working with brands that share our standard for clean, competitive racing.
          </p>
          <Link
            href="/partners"
            className="mt-4 inline-flex font-display text-sm font-semibold uppercase tracking-wide text-cyan hover:underline"
          >
            Meet all partners →
          </Link>
        </div>

        <div className="flex flex-wrap gap-3">
          {PARTNERS.map((p) => {
            const inner = (
              <div className="flex min-w-[160px] flex-col rounded-card border border-line bg-elevated px-5 py-4 transition-colors hover:border-cyan/40">
                <span className="font-display text-lg font-semibold uppercase tracking-wide text-ink">
                  {p.name}
                </span>
                <span className="mt-1 font-mono text-[0.6rem] uppercase tracking-widest text-subtle">
                  {p.note}
                </span>
              </div>
            );
            return p.href ? (
              <a key={p.name} href={p.href} target="_blank" rel="noopener noreferrer">
                {inner}
              </a>
            ) : (
              <div key={p.name}>{inner}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
