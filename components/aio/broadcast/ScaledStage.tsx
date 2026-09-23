"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** The stage's logical size: one 1600×900 "stream output". */
export const STAGE_W = 1600;
export const STAGE_H = 900;

/**
 * Lays its children out on a fixed 1600×900 canvas and scales that canvas to
 * fit the container, so every overlay keeps the proportions it has on a real
 * 16:9 stream whatever the screen size.
 *
 * The outer box takes its height from `aspect-ratio`, not from the scale, so
 * nothing on the page moves when the script arrives. Until then the canvas
 * uses a per-breakpoint estimate (`--bf-scale` in globals.css), and the
 * ResizeObserver then sets the exact figure.
 */
export function ScaledStage({ children, className }: { children: ReactNode; className?: string }) {
  const outer = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  useEffect(() => {
    const el = outer.current;
    if (!el) return;
    const measure = (width: number) => setScale(width / STAGE_W);
    measure(el.getBoundingClientRect().width);
    const observer = new ResizeObserver(([entry]) => measure(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={outer} className={cn("relative w-full overflow-hidden", className)} style={{ aspectRatio: "16 / 9" }}>
      <div
        className="bf-stage absolute left-0 top-0 origin-top-left"
        style={{
          width: STAGE_W,
          height: STAGE_H,
          ...(scale !== null && { transform: `scale(${scale})` }),
        }}
      >
        {children}
      </div>
    </div>
  );
}
