import { cn } from "@/lib/utils";

/**
 * Placeholder brand mark — a stylised "A" chevron filled with the cyan→violet
 * neon gradient. Designed to sit alongside the "APEX & CHILL" wordmark. The
 * operator will supply a hi-res logo later; swap the SVG paths here in one place.
 *
 * Each instance uses a unique gradient id (via React's `useId`) so multiple
 * logos on the same page (header + footer) don't collide.
 */
import { useId } from "react";

export function ApexChevron({ className }: { className?: string }) {
  const gradId = useId();
  return (
    <svg
      viewBox="0 0 32 32"
      role="img"
      aria-label="Apex & Chill Racing logo"
      className={cn("shrink-0 drop-shadow-[0_0_10px_rgba(155,92,255,0.55)]", className)}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="32" x2="32" y2="0">
          <stop offset="0%" stopColor="rgb(34 227 255)" />
          <stop offset="55%" stopColor="rgb(155 92 255)" />
          <stop offset="100%" stopColor="rgb(236 72 200)" />
        </linearGradient>
      </defs>
      {/* Outer chevron */}
      <path
        d="M16 2 L30 30 L23.5 30 L16 14.5 L8.5 30 L2 30 Z"
        fill={`url(#${gradId})`}
      />
      {/* Inner speed notch */}
      <path d="M16 17.5 L20 26 L12 26 Z" fill="rgb(10 10 18)" />
    </svg>
  );
}
