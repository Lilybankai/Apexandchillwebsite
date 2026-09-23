"use client";

import { useEffect, useRef, useState } from "react";
import { HERO_VIDEO } from "@/components/aio/broadcast/heroVideo";

const FPS = 30;
/** Where the timecode starts: 00:41:12:00 into the stream. */
const START_FRAMES = (41 * 60 + 12) * FPS;

function formatTimecode(totalFrames: number) {
  const ff = totalFrames % FPS;
  const s = Math.floor(totalFrames / FPS);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(ff)}`;
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * The stream timecode, HH:MM:SS:FF at 30 fps. Written straight to the DOM on
 * each animation frame rather than through React state, so a ticking clock
 * never re-renders the stage. Static under reduced motion.
 */
export function Timecode({ className }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const started = performance.now();
    let raf = 0;
    let last = -1;
    const tick = (now: number) => {
      const frames = START_FRAMES + Math.floor(((now - started) / 1000) * FPS);
      if (frames !== last && ref.current) {
        ref.current.textContent = formatTimecode(frames);
        last = frames;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <span ref={ref} className={className}>
      {formatTimecode(START_FRAMES)}
    </span>
  );
}

/**
 * The gameplay loop behind the overlays, when the operator has supplied one
 * (see heroVideo.ts). Nothing renders while HERO_VIDEO is null. The video
 * element is only created after mount and only without reduced motion; until
 * then, and under reduced motion, the poster stands in.
 */
export function HeroVideoLayer() {
  const [play, setPlay] = useState(false);

  useEffect(() => {
    if (HERO_VIDEO && !prefersReducedMotion()) setPlay(true);
  }, []);

  if (!HERO_VIDEO) return null;

  return play ? (
    <video
      className="absolute inset-0 h-full w-full object-cover"
      src={HERO_VIDEO.src}
      poster={HERO_VIDEO.poster}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden
    />
  ) : (
    <div
      aria-hidden
      className="absolute inset-0 bg-cover bg-center"
      style={{ backgroundImage: `url(${HERO_VIDEO.poster})` }}
    />
  );
}
