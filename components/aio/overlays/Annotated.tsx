import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Annotation = {
  /** Where the note points, as a percentage of the mock's width. */
  x: number;
  /** Where the note points, as a percentage of the mock's height. */
  y: number;
  side: "left" | "right";
  label: string;
  body: ReactNode;
};

/** Gap between a callout column and the mock, in px. The leader lines cross it. */
const GAP = 28;

/**
 * A mock shown large with teardown callouts: numbered markers on the real
 * details of the widget, and on wide screens a hairline leader from each
 * marker out to its note. On narrow screens the notes drop under the mock as
 * a numbered list keyed to the same markers.
 *
 * Positions are percentages of the mock's own box, so they hold at any width
 * the mock is drawn at. Keep notes on one side at least ~14% apart so the
 * labels don't collide.
 */
export function Annotated({
  children,
  notes,
  caption,
  meta,
  mockWidth = 28,
  className,
}: {
  children: ReactNode;
  notes: readonly Annotation[];
  /** Mono caption on the frame, e.g. "Overlay · MFD". */
  caption: string;
  meta?: string;
  /** Width the mock is drawn at, in rem. */
  mockWidth?: number;
  className?: string;
}) {
  const numbered = notes.map((note, i) => ({ ...note, n: String(i + 1).padStart(2, "0") }));

  return (
    <figure className={cn("border border-line bg-base/50", className)}>
      <figcaption className="flex items-center justify-between gap-3 border-b border-line px-4 py-2 font-mono text-[10px] uppercase tracking-[0.24em] text-subtle">
        <span>{caption}</span>
        {meta && <span className="text-cyan">{meta}</span>}
      </figcaption>

      <div
        className="grid px-4 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,var(--mock-w))_minmax(0,1fr)] lg:py-12"
        style={{ columnGap: GAP, ["--mock-w" as never]: `${mockWidth}rem` }}
      >
        {(["left", "right"] as const).map((side) => (
          <ol
            key={side}
            aria-hidden
            className={cn(
              "relative hidden lg:block",
              side === "left" ? "col-start-1 row-start-1" : "col-start-3 row-start-1",
            )}
          >
            {numbered
              .filter((note) => note.side === side)
              .map((note) => (
                <li
                  key={note.n}
                  className={cn(
                    "absolute w-full max-w-[15rem] -translate-y-1/2",
                    side === "left" ? "right-0 text-right" : "left-0",
                  )}
                  style={{ top: `${note.y}%` }}
                >
                  <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-cyan">
                    <span className="tabular-nums text-subtle">{note.n}</span> {note.label}
                  </span>
                  <span className="mt-1 block text-[13px] leading-snug text-muted">{note.body}</span>
                </li>
              ))}
          </ol>
        ))}

        <div className={"relative col-start-1 row-start-1 mx-auto w-full max-w-[var(--mock-w)] lg:col-start-2"}>
          {children}
          {numbered.map((note) => (
            <span key={note.n} aria-hidden className="pointer-events-none absolute inset-0">
              {/* Leader line: from the marker out across the gap to the note. */}
              <span
                className="absolute hidden h-px bg-cyan/50 lg:block"
                style={
                  note.side === "left"
                    ? { top: `${note.y}%`, left: -GAP, width: `calc(${note.x}% + ${GAP}px)` }
                    : { top: `${note.y}%`, right: -GAP, width: `calc(${100 - note.x}% + ${GAP}px)` }
                }
              />
              <span
                className="absolute flex h-4 min-w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-cyan bg-base px-1 font-mono text-[9px] leading-none text-cyan lg:h-2 lg:min-w-2 lg:px-0 lg:text-[0px]"
                style={{ left: `${note.x}%`, top: `${note.y}%` }}
              >
                {Number(note.n)}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* The same notes as a list, for narrow screens and for screen readers. */}
      <ol className="grid gap-4 border-t border-line px-4 py-6 sm:grid-cols-2 sm:px-8 lg:sr-only">
        {numbered.map((note) => (
          <li key={note.n} className="flex gap-3">
            <span className="font-mono text-xs tabular-nums text-cyan">{Number(note.n)}</span>
            <span>
              <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-ink">{note.label}</span>
              <span className="mt-1 block text-sm leading-snug text-muted">{note.body}</span>
            </span>
          </li>
        ))}
      </ol>
    </figure>
  );
}
