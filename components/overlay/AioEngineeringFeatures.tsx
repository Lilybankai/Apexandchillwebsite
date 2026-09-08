import { CheckCircle2, Gauge, SlidersHorizontal, Smartphone, Users } from "lucide-react";
import { CommunitySetups } from "@/components/overlay/CommunitySetups";
import { SetupOptimiserMock } from "@/components/overlay/SetupOptimiserMock";
import { TeamPitWallMock } from "@/components/overlay/TeamPitWallMock";
import { Reveal } from "@/components/ui/Reveal";

const SETUP_POINTS = [
  "Ten intent sliders turn handling feedback into balanced, car-specific changes.",
  "Every proposed value is staged first — review it, apply it, or revert it.",
  "The live editor follows all six LMU garage pages and skips settings fixed by the ruleset.",
] as const;

const PIT_WALL_POINTS = [
  "One engineer board for timing, strategy, fuel, tyres, weather, maps and lap trends.",
  "Team relay follows whoever is driving, with a visible data-age state so stale telemetry never looks live.",
  "Strategy replans from real consumption and shows pit windows plus the save target needed to reach them.",
  "The same board opens in a browser on any device — you don't have to be at a PC to engineer the stint.",
] as const;

const PIT_WALL_CALLOUTS = [
  {
    icon: Users,
    title: "Automatic handover",
    body: "The relay follows the teammate sending fresh driving data.",
  },
  {
    icon: Gauge,
    title: "Live strategy",
    body: "Consumption, laps remaining and stop plans update as the race changes.",
  },
  {
    icon: SlidersHorizontal,
    title: "Engineer presets",
    body: "Switch between Engineer, Strategist and Car board layouts.",
  },
  {
    icon: Smartphone,
    title: "Any device",
    body: "The Team and Solo boards open in a browser, not just in the app.",
  },
] as const;

function FeaturePoints({ points }: { points: readonly string[] }) {
  return (
    <ul className="mt-6 space-y-3">
      {points.map((point) => (
        <li key={point} className="flex items-start gap-3 text-muted">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success" />
          <span>{point}</span>
        </li>
      ))}
    </ul>
  );
}

export function AioEngineeringFeatures() {
  return (
    <>
      <section className="border-y border-line bg-surface/30 py-16">
        <div className="container-rail grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <Reveal>
            <span className="kicker mb-4">Setups · Race engineer</span>
            <h2 className="text-4xl font-bold text-ink sm:text-5xl">
              A setup optimiser that <span className="text-gradient">shows its work</span>
            </h2>
            <p className="mt-5 text-lg text-muted">
              Ask for more turn-in, better traction, braking stability or speed over the kerbs.
              The Race engineer translates that intent into real setup changes for the car you are
              driving — without silently overwriting the garage.
            </p>
            <FeaturePoints points={SETUP_POINTS} />
            <div className="mt-6 flex items-center gap-2 rounded-card border border-cyan/25 bg-cyan/5 p-4 text-sm text-subtle">
              <SlidersHorizontal aria-hidden size={18} className="shrink-0 text-cyan" />
              This is intent-based setup engineering, not a black-box lap-time promise.
            </div>
          </Reveal>
          <Reveal delay={140}>
            <SetupOptimiserMock />
          </Reveal>
        </div>
      </section>

      <CommunitySetups />

      <section className="container-rail py-16">
        <div className="mb-10 grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <Reveal>
            <span className="kicker mb-4">Team engineering · Endurance</span>
            <h2 className="text-4xl font-bold text-ink sm:text-5xl">
              The whole race on <span className="text-gradient">one pit wall</span>
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-lg text-muted">
              Follow the active team car from another PC — or from a phone, a tablet or any browser
              at all — with the same fuel, tyre, damage and strategy data the driver sees. No tab
              hunting: the Engineer board keeps every decision-making signal visible together.
            </p>
            <FeaturePoints points={PIT_WALL_POINTS} />
          </Reveal>
        </div>

        <Reveal>
          <TeamPitWallMock />
        </Reveal>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PIT_WALL_CALLOUTS.map((item, index) => (
            <Reveal key={item.title} delay={index * 90} className="h-full">
              <div className="h-full rounded-card border border-line bg-surface/40 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-cyan/40">
                <item.icon aria-hidden size={18} className="text-cyan" />
                <p className="mt-3 font-display text-sm uppercase tracking-wide text-ink">
                  {item.title}
                </p>
                <p className="mt-1 text-sm text-subtle">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <p className="mt-4 text-center text-xs text-subtle">
          Team relay requires each crew member to run Apex AIO and have their own active subscription.
        </p>
      </section>
    </>
  );
}
