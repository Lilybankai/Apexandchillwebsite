"use client";

import { useState } from "react";
import {
  Activity,
  BadgeCheck,
  CircleDot,
  ClipboardList,
  Droplets,
  Flag,
  Fuel,
  Gauge,
  Layers,
  Map as MapIcon,
  Monitor,
  Radar as RadarIcon,
  Sliders,
  Sparkles,
  Timer,
  TrafficCone,
  TrendingUp,
  Wrench,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type Category = "Timing & pace" | "Track & traffic" | "Car & cockpit" | "Strategy & pit" | "Stream";

const CATEGORIES: readonly (Category | "All")[] = [
  "All",
  "Timing & pace",
  "Track & traffic",
  "Car & cockpit",
  "Strategy & pit",
  "Stream",
];

const WIDGETS: {
  icon: typeof Gauge;
  name: string;
  body: string;
  cat: Category;
  lmuOnly?: boolean;
  isNew?: boolean;
}[] = [
  { icon: Layers, name: "Standings", body: "The full field with gaps, pit status, driver-rating badges and a last-5-lap pace column.", cat: "Timing & pace" },
  { icon: Activity, name: "Relative / timing", body: "Nearest cars on track with live delta, each tagged with its class in that class's colour.", cat: "Timing & pace" },
  { icon: Timer, name: "Delta", body: "Live gap to your own best lap, updating as you drive it.", cat: "Timing & pace" },
  { icon: TrendingUp, name: "Pace delta", body: "Time and speed delta against session, all-time or last lap.", cat: "Timing & pace" },
  { icon: BadgeCheck, name: "Reference pace", body: "Your lap as a percentage of alien pace, on Ohne Speed's reference times.", cat: "Timing & pace" },
  { icon: MapIcon, name: "Track map", body: "The circuit as a lit 2.5-D ribbon with every car on it. 32 circuits bundled.", cat: "Track & traffic" },
  { icon: RadarIcon, name: "Proximity radar", body: "A spotter's-eye strip drawn to true scale, plus the pit-release light.", cat: "Track & traffic" },
  { icon: Flag, name: "Race control", body: "Start lights, flags, sector yellows and pit confirmations — without the stock HUD.", cat: "Track & traffic", lmuOnly: true, isNew: true },
  { icon: TrafficCone, name: "Track limits", body: "Points left, what each cut cost, and penalties named — drive-through, stop-go, DQ.", cat: "Track & traffic", lmuOnly: true },
  { icon: Gauge, name: "Speedo cluster", body: "Speed, gear, revs, hybrid battery and aid chips — the panel lights up as revs rise.", cat: "Car & cockpit", isNew: true },
  { icon: Droplets, name: "Tyre temps", body: "Four-corner temperatures with five view modes, from core temp to a full tyre map.", cat: "Car & cockpit" },
  { icon: Gauge, name: "Pedal inputs", body: "Throttle, brake and clutch trace that makes trail-braking style visible.", cat: "Car & cockpit" },
  { icon: CircleDot, name: "Pedals (vertical)", body: "The same channels a quarter-turn round, with steering as a swept needle.", cat: "Car & cockpit" },
  { icon: Zap, name: "Motion", body: "G-force, rotation and attitude in three independently switchable modes.", cat: "Car & cockpit" },
  { icon: Wrench, name: "Damage & repair", body: "Component damage, repair seconds, and the live stop countdown.", cat: "Car & cockpit", lmuOnly: true },
  { icon: Sliders, name: "MFD control", body: "The in-game pit menu and driving aids — readable and fully controllable.", cat: "Strategy & pit", lmuOnly: true },
  { icon: Fuel, name: "Fuel calculator", body: "Per-lap use, laps remaining, fuel-to-finish and your pit window.", cat: "Strategy & pit" },
  { icon: ClipboardList, name: "Fuel planner", body: "Pre-race fuel and energy plan, live stint timer, fuel-ratio control.", cat: "Strategy & pit", lmuOnly: true },
  { icon: Sparkles, name: "Weather", body: "Current conditions plus the short forecast that decides your tyre call.", cat: "Strategy & pit" },
  { icon: Monitor, name: "Stream chat", body: "YouTube and Twitch chat merged into one scrolling column, Super Chats included.", cat: "Stream" },
];

export function WidgetCatalogue() {
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]>("All");
  const shown = filter === "All" ? WIDGETS : WIDGETS.filter((w) => w.cat === filter);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter widgets by category">
        {CATEGORIES.map((c) => {
          const active = c === filter;
          const count = c === "All" ? WIDGETS.length : WIDGETS.filter((w) => w.cat === c).length;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              aria-pressed={active}
              className={cn(
                "rounded-full border px-3.5 py-1.5 font-mono text-[12px] transition-colors",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                active
                  ? "border-accent/60 bg-accent/15 text-ink"
                  : "border-line bg-surface/50 text-muted hover:border-accent/40 hover:text-ink",
              )}
            >
              {c} <span className={cn(active ? "text-accent-2" : "text-subtle")}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((w) => (
          <Card key={w.name} variant="default" interactive className="p-5">
            <div className="flex items-start justify-between gap-3">
              <w.icon size={22} className="text-cyan" />
              <span className="flex items-center gap-2">
                {w.isNew && (
                  <span className="chip border-accent/50 px-2 py-0.5 text-[0.6rem] text-accent-2">New</span>
                )}
                {w.lmuOnly && (
                  <span className="font-mono text-[0.6rem] uppercase tracking-widest text-subtle">LMU only</span>
                )}
              </span>
            </div>
            <h3 className="mt-3 text-lg font-bold text-ink">{w.name}</h3>
            <p className="mt-1 text-sm text-muted">{w.body}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
