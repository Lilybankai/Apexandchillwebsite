import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A mock shown large, drawn up like a teardown: numbered pins sit on the real
 * details, and the notes that explain them run down a gutter beside the
 * figure on hairline leaders. The pin number is what ties a note to its
 * detail, so the leaders never have to cross the mock's own text.
 *
 * Below `xl` there is no room for gutters, so the notes become a numbered
 * list under the figure. Pins stay on the mock only where its layout is
 * stable at every width (`pins="always"`, used with `minWidth` for mocks that
 * scroll sideways on a phone); otherwise they appear at `xl` with the gutter.
 *
 * Shared by the setups, pit wall and telemetry pages. It lives here because
 * those pages own this folder; it has no setup-specific logic.
 */
export type Callout = {
  /**
   * Pin position across the mock: a number is a percentage of its width; a
   * string is any CSS length ("269px", "calc(100% - 28px)") for details that
   * sit a fixed distance from one edge.
   */
  x: number | string;
  /** Pin position down the mock, as a CSS length from its top ("206px"). */
  y: string;
  /** Where the note sits in the gutter. Defaults to the pin's `y`. */
  labelY?: string;
  side: "left" | "right";
  label: string;
  note: ReactNode;
};

const GUTTER = "12rem";

export function AnnotatedFigure({
  children,
  callouts,
  caption,
  pins = "xl",
  minWidth,
  className,
}: {
  children: ReactNode;
  callouts: readonly Callout[];
  caption?: ReactNode;
  pins?: "always" | "xl";
  /** Keep the mock at least this wide (px) and scroll it below that. */
  minWidth?: number;
  className?: string;
}) {
  const hasLeft = callouts.some((c) => c.side === "left");
  const hasRight = callouts.some((c) => c.side === "right");
  const n = (i: number) => String(i + 1).padStart(2, "0");

  return (
    <figure className={className}>
      <div className={cn("relative", hasLeft && "xl:pl-[12rem]", hasRight && "xl:pr-[12rem]")}>
        <div className={cn(minWidth && "overflow-x-auto xl:overflow-visible")}>
          <div className="relative" style={minWidth ? { minWidth } : undefined}>
            {children}

            {/* Pins on the details themselves */}
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-0 z-20",
                pins === "xl" ? "hidden xl:block" : "block",
              )}
            >
              {callouts.map((c, i) => (
                <span
                  key={c.label}
                  className="absolute flex h-[18px] min-w-[18px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-sm border border-cyan bg-base px-0.5 font-mono text-[9px] font-bold tabular-nums leading-none text-cyan"
                  style={{
                    left: typeof c.x === "number" ? `${c.x}%` : c.x,
                    top: c.y,
                  }}
                >
                  {i + 1}
                </span>
              ))}
            </div>

            {/* Notes in the gutters, on hairline leaders (xl only) */}
            <div aria-hidden className="pointer-events-none absolute inset-0 hidden xl:block">
              {callouts.map((c, i) => {
                const top = c.labelY ?? c.y;
                const right = c.side === "right";
                const lead: CSSProperties = right
                  ? { top, left: "100%", width: "1.75rem" }
                  : { top, right: "100%", width: "1.75rem" };
                const note: CSSProperties = right
                  ? {
                      top,
                      left: "calc(100% + 2.25rem)",
                      width: `calc(${GUTTER} - 2.5rem)`,
                    }
                  : {
                      top,
                      right: "calc(100% + 2.25rem)",
                      width: `calc(${GUTTER} - 2.5rem)`,
                    };
                return (
                  <span key={c.label}>
                    <span className="absolute h-px bg-cyan/50" style={lead} />
                    <span
                      className={cn(
                        "absolute h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-cyan",
                        right ? "-translate-x-1/2" : "translate-x-1/2",
                      )}
                      style={right ? { top, left: "100%" } : { top, right: "100%" }}
                    />
                    <span
                      className={cn("absolute -translate-y-[9px]", !right && "text-right")}
                      style={note}
                    >
                      <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-cyan">
                        <span className="tabular-nums text-subtle">{n(i)}</span> {c.label}
                      </span>
                      <span className="mt-1 block text-xs leading-snug text-muted">{c.note}</span>
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* The same notes as a list: the only copy below xl, and the one screen readers get */}
      <ol className="mt-6 grid gap-x-8 gap-y-4 border-t border-line pt-5 sm:grid-cols-2 lg:grid-cols-3 xl:sr-only">
        {callouts.map((c, i) => (
          <li key={c.label} className="flex gap-3">
            <span className="font-mono text-[11px] font-bold tabular-nums text-cyan">{n(i)}</span>
            <span>
              <span className="block font-mono text-[11px] uppercase tracking-[0.18em] text-ink">
                {c.label}
              </span>
              <span className="mt-1 block text-sm text-muted">{c.note}</span>
            </span>
          </li>
        ))}
      </ol>

      {caption && (
        <figcaption className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-subtle xl:mt-6">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
