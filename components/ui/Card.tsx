import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type CardVariant = "default" | "elevated" | "outline" | "glow";

const variants: Record<CardVariant, string> = {
  default: "glass",
  elevated: "bg-elevated border border-line shadow-card",
  outline: "bg-transparent border border-line",
  glow: "glass border-accent/40 shadow-glow-soft",
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  /** Angled bottom-right corner cut for the motorsport panel look. */
  clip?: boolean;
  /** Lift + accent border on hover — use for interactive/linked cards. */
  interactive?: boolean;
}

/**
 * Surface panel primitive. All boxed content (race cards, standings rows,
 * product tiles, partner logos) should sit on a `Card` for a consistent
 * layered-dark look.
 */
export function Card({
  variant = "default",
  clip = false,
  interactive = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "relative rounded-card",
        variants[variant],
        clip && "clip-corner",
        interactive &&
          "transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-glow-soft",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/** Optional padded header row with a title + optional action/aside slot. */
export function CardHeader({
  title,
  kicker,
  action,
  className,
}: {
  title: ReactNode;
  kicker?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 border-b border-line px-5 py-4",
        className,
      )}
    >
      <div className="space-y-1">
        {kicker ? <span className="kicker">{kicker}</span> : null}
        <h3 className="text-xl leading-none text-ink">{title}</h3>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/** Padded body wrapper for card content. */
export function CardBody({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-5", className)} {...props}>
      {children}
    </div>
  );
}
