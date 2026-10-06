import { CircleDashed } from "lucide-react";
import { isTbc, type EventDetail } from "@/lib/events/tbc";
import { cn } from "@/lib/utils";

/**
 * Renders an event detail: confirmed copy as-is, or an unconfirmed
 * placeholder as a dashed amber "To be confirmed" chip so it can't be
 * mistaken for a real detail. `data-placeholder` makes them easy to audit.
 */
export function EventDetailText({ detail, className }: { detail: EventDetail; className?: string }) {
  if (!isTbc(detail)) return <span className={className}>{detail}</span>;
  return (
    <span
      data-placeholder
      className={cn(
        "inline-flex items-start gap-1.5 rounded-card border border-dashed border-flag-amber/60 bg-flag-amber/10 px-2.5 py-1 text-sm font-normal normal-case tracking-normal text-flag-amber",
        className,
      )}
    >
      <CircleDashed size={14} aria-hidden className="mt-0.5 shrink-0" />
      <span>
        <span className="font-mono text-[0.65rem] font-semibold uppercase tracking-widest">TBC</span>
        <span className="sr-only">:</span> {detail.note}
      </span>
    </span>
  );
}
