"use client";

import { useEffect, useState } from "react";
import { HERO_VIDEO } from "@/components/aio/broadcast/heroVideo";

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
