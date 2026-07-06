import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge conditional class names and de-duplicate conflicting Tailwind
 * utilities. This is the canonical class-composition helper for the whole
 * app — always prefer `cn(...)` over manual template strings.
 *
 * @example cn("px-2", isActive && "text-accent", className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format an ISO date (or Date) as a human race date, e.g. "Sat 25 Jul 2026".
 * Returns an empty string for missing/invalid input rather than throwing.
 */
export function formatRaceDate(input: string | Date | null | undefined): string {
  if (!input) return "";
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * Ordinal suffix for a finishing position, e.g. 1 -> "1st", 22 -> "22nd".
 */
export function ordinal(n: number): string {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

/**
 * Format a large count compactly for community stat badges,
 * e.g. 1000 -> "1K", 1500 -> "1.5K".
 */
export function compactNumber(n: number): string {
  return new Intl.NumberFormat("en-GB", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}
