import { forwardRef } from "react";
import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "outline"
  | "ghost"
  | "discord"
  | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-display uppercase tracking-wide font-semibold transition-all duration-150 select-none disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none";

const variants: Record<ButtonVariant, string> = {
  // Electric violet→magenta neon gradient — primary call to action
  primary:
    "bg-neon-primary text-white shadow-glow-soft hover:shadow-glow hover:brightness-110 active:translate-y-px",
  // Cyan neon wireframe — secondary actions on dark surfaces
  outline:
    "border border-cyan/60 text-cyan hover:bg-cyan/10 hover:border-cyan hover:shadow-glow-cyan active:translate-y-px",
  // Minimal — tertiary / inline
  ghost: "text-muted hover:text-ink hover:bg-elevated active:translate-y-px",
  // Discord blurple — community CTA
  discord:
    "bg-[#5865F2] text-white hover:bg-[#4752c4] active:translate-y-px shadow-[0_8px_24px_-10px_rgba(88,101,242,0.9)]",
  // Destructive / penalty
  danger:
    "bg-flag-red/15 text-flag-red border border-flag-red/40 hover:bg-flag-red/25 active:translate-y-px",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-14 px-7 text-base",
};

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Angled bottom-right corner for the motorsport panel look. */
  clip?: boolean;
  className?: string;
  children?: ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/**
 * The single button primitive for the site. Renders a semantic `<a>` when a
 * `href` is supplied, otherwise a `<button>`. Use `variant` for intent and
 * `clip` to enable the angled-corner motorsport styling.
 */
export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ variant = "primary", size = "md", clip = false, className, children, ...props }, ref) => {
    const classes = cn(
      base,
      variants[variant],
      sizes[size],
      clip && "clip-corner",
      className,
    );

    if ("href" in props && props.href !== undefined) {
      const { href, ...anchorProps } = props as ButtonAsLink;
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={classes}
          {...anchorProps}
        >
          {children}
        </a>
      );
    }

    const { type = "button", ...buttonProps } = props as ButtonAsButton;
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        className={classes}
        {...buttonProps}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
