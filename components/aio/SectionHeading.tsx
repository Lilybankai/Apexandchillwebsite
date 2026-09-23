import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A section header in the house style of a timing screen rather than a
 * template: a mono index and label on a hairline rule, then a plain display
 * heading. No gradient words — the gradient belongs to the H1 alone, which is
 * what keeps it meaning something.
 *
 *   03 ─── SETUPS ──────────────────────────
 *   Community setups, ranked by lap time
 */
export function SectionHeading({
  index,
  label,
  title,
  lead,
  align = "left",
  className,
  id,
}: {
  /** Two-digit section number, e.g. "03". Omit for an unnumbered header. */
  index?: string;
  /** Short mono label on the rule — the topic, not a slogan. */
  label: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "left" | "center";
  className?: string;
  /** id for the H2, for aria-labelledby on the section. */
  id?: string;
}) {
  const centered = align === "center";
  return (
    <div className={cn("mb-10", centered && "mx-auto max-w-3xl text-center", className)}>
      <div
        className={cn(
          "mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.28em] text-subtle",
          centered && "justify-center",
        )}
      >
        {index && <span className="tabular-nums text-cyan">{index}</span>}
        <span aria-hidden className={cn("h-px bg-line", centered ? "w-8" : "w-8 shrink-0")} />
        <span>{label}</span>
        <span aria-hidden className={cn("h-px bg-line", centered ? "w-8" : "flex-1")} />
      </div>
      <h2
        id={id}
        className="font-display text-3xl font-bold uppercase leading-[1.05] tracking-wide text-ink sm:text-4xl lg:text-[2.75rem]"
      >
        {title}
      </h2>
      {lead && (
        <p className={cn("mt-4 max-w-2xl text-lg leading-relaxed text-muted", centered && "mx-auto")}>
          {lead}
        </p>
      )}
    </div>
  );
}
