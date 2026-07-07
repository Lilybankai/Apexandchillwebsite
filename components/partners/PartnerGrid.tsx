import { Check, ExternalLink, Zap, Gauge, Radio, Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface Partner {
  name: string;
  category: string;
  icon: LucideIcon;
  accent: string;
  blurb: string;
  benefits: string[];
  href?: string;
  /** Extra callout, e.g. an affiliate/creator code. */
  code?: string;
}

/**
 * Confirmed partners. Field content mirrors the copy shown on the current
 * live site's partner sections. Add new partners here as the operator supplies
 * them; unknown links can be omitted (the Visit CTA hides itself).
 */
const PARTNERS: Partner[] = [
  {
    name: "Rogue Energy",
    category: "Gaming Energy & Hydration",
    icon: Zap,
    accent: "text-cyan",
    blurb:
      "A gaming energy and hydration brand built for focus and endurance. Sugar-free formulas designed to keep racers sharp through long stints and late-night endurance events — without the crash.",
    benefits: [
      "Energy and hydration formulas for gamers",
      "Sugar-free and packed with vitamins",
      "Built for focus through long sessions",
      "Mixes easily — no crash, no jitters",
      "Fuel for endurance race nights",
    ],
    href: "https://rogueenergy.com/",
  },
  {
    name: "MOZA Racing",
    category: "Sim Racing Hardware",
    icon: Gauge,
    accent: "text-accent",
    blurb:
      "A leading sim racing hardware brand building direct-drive wheelbases, wheels, pedals and cockpits. Engineered for precision force feedback and durability — hardware that keeps up with everyone from newcomers to endurance racers.",
    benefits: [
      "Direct-drive wheelbases and racing wheels",
      "Load-cell pedals and sim accessories",
      "Precision force feedback for real feel",
      "Scales from entry-level to pro setups",
      "Trusted across the sim racing community",
    ],
    href: "https://mozaracing.com/",
  },
  {
    name: "Sim Endurance",
    category: "Strategy & Live Telemetry",
    icon: Radio,
    accent: "text-accent",
    blurb:
      "A race strategy and live-telemetry platform built for Le Mans Ultimate. It brings planning, team coordination and live race data into one place, helping drivers and teams make better decisions throughout a race.",
    benefits: [
      "Live telemetry and real-time race monitoring",
      "Strategy planning and race simulation tools",
      "Driver stints, fuel and pit-stop planning",
      "Lap-time tracking and performance insights",
      "Team management and shared setups",
    ],
    // href intentionally omitted until the operator confirms the official
    // Sim Endurance URL — the card renders without a (possibly 404) Visit CTA.
    href: undefined,
  },
];

/** Number of clearly-marked "coming soon" placeholder slots. */
const PLACEHOLDER_SLOTS = 1;

/** Grid of confirmed partners plus placeholder slots for pending partners. */
export function PartnerGrid() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {PARTNERS.map((p) => (
        <Card key={p.name} variant="default" className="flex flex-col p-7">
          <div className="flex items-start justify-between">
            <p.icon size={32} className={p.accent} />
            <span className="font-mono text-[0.65rem] uppercase tracking-widest text-subtle">
              {p.category}
            </span>
          </div>
          <h3 className="mt-5 text-2xl font-bold text-ink">{p.name}</h3>
          {p.code && (
            <p className="mt-1 font-mono text-xs text-accent">
              Creator code: <span className="font-semibold">{p.code}</span>
            </p>
          )}
          <p className="mt-3 text-sm leading-relaxed text-muted">{p.blurb}</p>

          <ul className="mt-5 space-y-2">
            {p.benefits.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm text-muted">
                <Check size={15} className={`mt-0.5 shrink-0 ${p.accent}`} />
                {b}
              </li>
            ))}
          </ul>

          {p.href && (
            <div className="mt-6 pt-2">
              <Button href={p.href} target="_blank" rel="noopener noreferrer" variant="outline" size="md">
                Visit {p.name}
                <ExternalLink size={16} />
              </Button>
            </div>
          )}
        </Card>
      ))}

      {Array.from({ length: PLACEHOLDER_SLOTS }).map((_, i) => (
        <Card
          key={`placeholder-${i}`}
          variant="outline"
          className="flex min-h-[220px] flex-col items-center justify-center border-dashed p-7 text-center"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-line text-subtle">
            <Plus size={22} />
          </span>
          <p className="mt-4 font-display text-lg font-semibold uppercase tracking-wide text-muted">
            Partner Slot
          </p>
          <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-widest text-subtle">
            Coming soon — operator to supply
          </p>
        </Card>
      ))}
    </div>
  );
}
