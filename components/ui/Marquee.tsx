import { cn } from "@/lib/utils";

const DEFAULT_ITEMS = [
  "Multi-Platform Racing",
  "Gr.2 & Gr.3 Classes",
  "High-Stakes Events",
  "200+ Drivers",
  "Global Community",
];

/**
 * Thin scrolling neon ticker strip. Sits under the hero and can be reused on
 * any page. The content is duplicated so the CSS `marquee` animation
 * (translateX -50%) loops seamlessly. Pauses on hover and respects
 * `prefers-reduced-motion` (handled globally in globals.css).
 */
export function Marquee({
  items = DEFAULT_ITEMS,
  className,
}: {
  items?: string[];
  className?: string;
}) {
  // Two copies back-to-back → a seamless -50% translate loop.
  const loop = [...items, ...items];

  return (
    <div
      className={cn(
        "group relative flex overflow-hidden border-y border-line bg-elevated/60 py-2.5",
        className,
      )}
      aria-label="Apex & Chill Racing highlights"
    >
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-base to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-base to-transparent" />

      <div
        aria-hidden
        className="flex shrink-0 animate-marquee items-center whitespace-nowrap group-hover:[animation-play-state:paused]"
      >
        {loop.map((item, i) => (
          <span key={i} className="flex items-center">
            <span className="px-6 font-display text-sm font-semibold uppercase tracking-widest text-muted">
              {item}
            </span>
            <span aria-hidden className="h-1.5 w-1.5 rotate-45 bg-gradient-to-br from-cyan to-accent" />
          </span>
        ))}
      </div>
    </div>
  );
}
