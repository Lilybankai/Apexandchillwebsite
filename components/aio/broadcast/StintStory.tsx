"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type StintBeat = {
  id: string;
  /** The race lap this beat happens on. */
  lap: number;
  /** Short mono label, e.g. "Lights out". */
  label: string;
  /** The beat's H3. */
  title: string;
  body: ReactNode;
  /** The widgets in the visual, named as the app names them. */
  onScreen: string;
  /** Pre-rendered on the server and handed across as a slot. */
  visual: ReactNode;
};

const pad = (n: number) => String(n).padStart(2, "0");

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Counts from the lap on screen to `target` one lap at a time, like a timing
 * screen catching up. Jumps straight there under reduced motion.
 */
function useTickingLap(target: number) {
  const [lap, setLap] = useState(target);

  useEffect(() => {
    if (reducedMotion()) {
      setLap(target);
      return;
    }
    const id = window.setInterval(() => {
      setLap((current) => {
        if (current === target) {
          window.clearInterval(id);
          return current;
        }
        return current + (target > current ? 1 : -1);
      });
    }, 35);
    return () => window.clearInterval(id);
  }, [target]);

  return lap;
}

/**
 * One stint told in beats. On a desktop the beats' text scrolls up the left
 * while the matching widgets hold still on the right, swapping as each beat
 * crosses the middle of the screen, with a lap counter and progress rail
 * above them. On a phone the beats are simply stacked, each with its visual.
 *
 * Each beat renders its visual exactly once, in both layouts: the beat's
 * wrapper is `display: contents` on a desktop, which lets its text and its
 * visual become separate cells of one grid. The visuals all share one sticky
 * cell and fade by opacity only, never `display: none`, so the radar's SVG
 * gradient (a fixed id) keeps painting.
 */
export function StintStory({ beats, totalLaps }: { beats: readonly StintBeat[]; totalLaps: number }) {
  const [active, setActive] = useState(0);
  const texts = useRef<(HTMLDivElement | null)[]>([]);
  const lap = useTickingLap(beats[active].lap);
  const span = `1 / span ${beats.length}`;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = Number((entry.target as HTMLElement).dataset.beat);
          if (!Number.isNaN(index)) setActive(index);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    texts.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-x-14">
      {/* The lap counter and progress rail (desktop only; each beat on a
          phone carries its own lap in its text). */}
      <div
        aria-hidden
        className="z-20 hidden bg-base/90 py-2 lg:sticky lg:top-36 lg:col-start-2 lg:block lg:self-start"
        style={{ gridRow: span }}
      >
        <div className="flex items-baseline justify-between gap-4 font-mono uppercase">
          <span className="text-[11px] tracking-[0.28em] text-subtle">
            <span className="text-cyan">{pad(active + 1)}</span> / {pad(beats.length)} · {beats[active].label}
          </span>
          <span className="text-2xl font-bold tabular-nums text-ink">
            Lap {pad(lap)}
            <span className="text-subtle">/{totalLaps}</span>
          </span>
        </div>
        <div className="relative mt-3 h-[3px] bg-line">
          <div
            className="bf-stint-fill absolute inset-y-0 left-0 bg-cyan transition-[width] duration-700 ease-out"
            style={{ width: `${(beats[active].lap / totalLaps) * 100}%` }}
          />
          {beats.map((beat, i) => (
            <span
              key={beat.id}
              className={cn(
                "absolute top-1/2 h-[9px] w-[2px] -translate-y-1/2",
                i <= active ? "bg-cyan" : "bg-subtle/60",
              )}
              style={{ left: `calc(${(beat.lap / totalLaps) * 100}% - 1px)` }}
            />
          ))}
        </div>
      </div>

      {beats.map((beat, i) => {
        const on = i === active;
        return (
          <div key={beat.id} className="lg:contents">
            <div
              ref={(el) => {
                texts.current[i] = el;
              }}
              data-beat={i}
              className={cn(
                "border-l-2 py-2 pl-5 lg:col-start-1 lg:my-[18vh] lg:flex lg:min-h-[44vh] lg:flex-col lg:justify-center",
                "bf-stint-visual transition-colors duration-300",
                on ? "border-cyan" : "border-line",
                i > 0 && "mt-14",
              )}
              style={{ gridRow: i + 1 }}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-subtle">
                <span className="tabular-nums text-cyan">Lap {pad(beat.lap)}</span>
                <span className="text-subtle">/{totalLaps}</span> · {beat.label}
              </p>
              <h3 className="mt-3 font-display text-2xl font-bold uppercase tracking-wide text-ink sm:text-3xl">
                {beat.title}
              </h3>
              <div className="mt-3 max-w-xl space-y-3 leading-relaxed text-muted">{beat.body}</div>
              <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">
                On screen: <span className="text-muted">{beat.onScreen}</span>
              </p>
            </div>

            <div
              className={cn(
                "mt-6 lg:sticky lg:col-start-2 lg:mt-20 lg:self-start",
                "lg:top-[calc(9rem_+_80px)]",
                "bf-stint-visual lg:transition-opacity lg:duration-500",
                on ? "lg:z-10 lg:opacity-100" : "lg:pointer-events-none lg:opacity-0",
              )}
              style={{ gridRow: span }}
            >
              {beat.visual}
            </div>
          </div>
        );
      })}
    </div>
  );
}
