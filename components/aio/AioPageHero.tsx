import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { AioTrialButton } from "@/components/aio/AioTrialCta";

/**
 * The top of an Apex AIO topic page. The H1 is the search term the page is
 * for ("LMU Overlays", "LMU Setups") so the heading and the query agree; the
 * product name belongs in the kicker, not the H1.
 */
export function AioPageHero({
  kicker,
  title,
  lead,
  points = [],
  actions,
  visual,
}: {
  kicker: string;
  title: ReactNode;
  lead: ReactNode;
  points?: readonly string[];
  /** Extra buttons beside the trial button. */
  actions?: ReactNode;
  /** A live mock (or several) shown beside or under the copy. */
  visual?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid-lines bg-grid opacity-25 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-accent/15 blur-[120px]"
      />
      <div className="container-rail relative grid gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
        <Reveal>
          <span className="kicker mb-4">{kicker}</span>
          <h1 className="max-w-3xl text-4xl font-bold text-ink sm:text-5xl lg:text-6xl">{title}</h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">{lead}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <AioTrialButton />
            {actions}
          </div>
          {points.length > 0 && (
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
              {points.map((point) => (
                <li key={point} className="inline-flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-success" />
                  {point}
                </li>
              ))}
            </ul>
          )}
        </Reveal>
        {visual && <Reveal delay={150}>{visual}</Reveal>}
      </div>
    </section>
  );
}
