import type { Config } from "tailwindcss";

/**
 * Apex & Chill Racing — design system.
 *
 * A dark synthwave/neon motorsport aesthetic: near-black base, an electric
 * violet→magenta gradient for primary actions, cyan for secondary neon, hot
 * pink highlights, and the signature racing green reserved for P1 / success.
 * A mono typeface is used for numeric data (positions, points, lap times) so
 * the site reads like a live pit wall rather than a generic template.
 *
 * Colours are driven by CSS custom properties declared in `app/globals.css`
 * so the brand can be retuned in one place.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Surfaces (dark base, layered)
        base: "rgb(var(--color-base) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        elevated: "rgb(var(--color-elevated) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        // Foreground text
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        subtle: "rgb(var(--color-subtle) / <alpha-value>)",
        // Brand neon
        accent: {
          DEFAULT: "rgb(var(--color-accent) / <alpha-value>)", // violet
          2: "rgb(var(--color-accent-2) / <alpha-value>)", // magenta
        },
        cyan: "rgb(var(--color-cyan) / <alpha-value>)",
        pink: "rgb(var(--color-pink) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
        // Flags / team accents
        flag: {
          red: "rgb(var(--color-red) / <alpha-value>)",
          amber: "rgb(var(--color-amber) / <alpha-value>)",
          blue: "rgb(var(--color-blue) / <alpha-value>)",
          purple: "rgb(var(--color-purple) / <alpha-value>)",
          gold: "rgb(var(--color-gold) / <alpha-value>)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Impact", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        widest: "0.22em",
      },
      borderRadius: {
        card: "var(--radius-card)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgb(var(--color-accent) / 0.5), 0 0 28px -4px rgb(var(--color-accent) / 0.6)",
        "glow-soft": "0 0 36px -10px rgb(var(--color-accent) / 0.5)",
        "glow-cyan": "0 0 0 1px rgb(var(--color-cyan) / 0.5), 0 0 28px -4px rgb(var(--color-cyan) / 0.55)",
        card: "0 1px 0 0 rgb(255 255 255 / 0.05) inset, 0 16px 40px -20px rgb(0 0 0 / 0.85)",
      },
      backgroundImage: {
        "neon-primary":
          "linear-gradient(135deg, rgb(var(--color-accent)) 0%, rgb(var(--color-accent-2)) 100%)",
        "neon-cyan":
          "linear-gradient(135deg, rgb(var(--color-cyan)) 0%, rgb(var(--color-accent)) 100%)",
        "grid-lines":
          "linear-gradient(rgb(var(--color-line) / 0.5) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--color-line) / 0.5) 1px, transparent 1px)",
        "carbon":
          "repeating-linear-gradient(45deg, rgb(255 255 255 / 0.015) 0 2px, transparent 2px 4px)",
      },
      backgroundSize: {
        grid: "48px 48px",
      },
      keyframes: {
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.4", transform: "scale(0.85)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "pulse-dot": "pulse-dot 1.4s ease-in-out infinite",
        marquee: "marquee 30s linear infinite",
        rise: "rise 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
