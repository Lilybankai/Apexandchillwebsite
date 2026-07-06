import Image from "next/image";
import { cn } from "@/lib/utils";

/** Path to the operator-supplied logo. Swap here when a hi-res/SVG arrives. */
const LOGO_SRC = "/brand/apex-chill-logo.jpg";
const LOGO_INTRINSIC = 150;

/**
 * Apex & Chill brand mark — the real operator-supplied logo (cyan→violet "A"
 * chevron + wordmark badge on a dark ground). Kept as a thin wrapper around
 * `next/image` so the source can be swapped for a hi-res/SVG later without
 * touching call sites (Header, Footer, hero lockup, etc.).
 *
 * The badge already ships on a dark background, so it blends onto the site's
 * dark surfaces. Size it with a `className` height/width (e.g. `h-9 w-9`).
 */
export function Logo({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={LOGO_SRC}
      alt="Apex & Chill Racing League"
      width={LOGO_INTRINSIC}
      height={LOGO_INTRINSIC}
      priority={priority}
      className={cn("rounded-[6px] object-contain", className)}
    />
  );
}

/**
 * Backwards-compatible alias — earlier code referenced `ApexChevron`. Both
 * render the same real logo wrapper.
 * @deprecated Prefer {@link Logo}.
 */
export const ApexChevron = Logo;
