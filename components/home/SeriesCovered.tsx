import Link from "next/link";
import { Gauge, Flag } from "lucide-react";
import { Card } from "@/components/ui/Card";

const SERIES = [
  {
    league: "GT7 League",
    tag: "PlayStation 5",
    title: "Gran Turismo 7",
    classes: ["Gr.2", "Gr.3"],
    blurb:
      "Our flagship console championship. Wheel-to-wheel Gr.2 & Gr.3 racing with qualifying, strategy and a full penalty system — raced on a shared grid every week.",
    accent: "text-cyan",
    icon: Gauge,
    href: "/standings",
  },
  {
    league: "LMU League",
    tag: "PC",
    title: "Le Mans Ultimate",
    classes: ["Hypercar", "LMGT3"],
    blurb:
      "Multi-class endurance built for drivers who love strategy. Hypercar & LMGT3 sharing the track, blending pace and traffic management across a nine-round season.",
    accent: "text-accent",
    icon: Flag,
    href: "/standings",
  },
] as const;

/** Two-up overview of the leagues Apex & Chill runs. */
export function SeriesCovered() {
  return (
    <section className="container-rail py-20">
      <header className="mb-10 max-w-2xl">
        <span className="kicker mb-3">What We Race</span>
        <h2 className="text-4xl font-bold text-ink sm:text-5xl">Series We Cover</h2>
        <p className="mt-4 text-muted">
          Two platforms, one community. Whether you&apos;re on console or PC, there&apos;s a
          championship with your name on the grid.
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        {SERIES.map((s) => (
          <Card key={s.league} variant="default" interactive className="group p-7">
            <div className="flex items-start justify-between">
              <s.icon size={34} className={s.accent} />
              <span className="font-mono text-[0.65rem] uppercase tracking-widest text-subtle">
                {s.tag}
              </span>
            </div>
            <p className={`mt-6 font-mono text-xs font-semibold uppercase tracking-widest ${s.accent}`}>
              {s.league}
            </p>
            <h3 className="mt-1 text-3xl font-bold text-ink">{s.title}</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {s.classes.map((c) => (
                <span key={c} className="chip">
                  {c}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">{s.blurb}</p>
            <Link
              href={s.href}
              className={`mt-6 inline-flex items-center gap-1.5 font-display text-sm font-semibold uppercase tracking-wide ${s.accent} transition-transform group-hover:gap-2.5`}
            >
              View Standings →
            </Link>
          </Card>
        ))}
      </div>
    </section>
  );
}
