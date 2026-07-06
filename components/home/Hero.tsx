import { Play, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";

const DISCORD_URL = "https://discord.gg/MBew2Bb2hj";

/** Community-identity hero: platforms, headline, primary CTAs and quick stats. */
export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Layered neon backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid-lines bg-grid opacity-30 [mask-image:radial-gradient(75%_55%_at_50%_0%,black,transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-accent/20 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-10%] top-24 h-[360px] w-[360px] rounded-full bg-cyan/10 blur-[110px]"
      />

      <div className="container-rail relative flex min-h-[82vh] flex-col justify-center py-24">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="chip text-cyan">Gran Turismo 7</span>
          <span aria-hidden className="text-subtle">
            /
          </span>
          <span className="chip text-accent">Le Mans Ultimate</span>
        </div>

        <h1 className="max-w-4xl text-6xl font-bold leading-[0.86] text-ink sm:text-7xl lg:text-8xl">
          The Ultimate
          <br />
          Multi-Platform
          <br />
          <span className="text-gradient">Racing Community</span>
        </h1>

        <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted">
          Competitive GT7 &amp; Le Mans Ultimate leagues, run for drivers who take racing seriously
          but keep it clean. Live standings, weekly replays, high-stakes events — and a community
          that actually chills.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Button href="/replays" size="lg" clip>
            <Play size={18} className="fill-current" />
            Watch Replays
          </Button>
          <Button href="/join" variant="outline" size="lg">
            Join the League
          </Button>
          <Button
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            variant="ghost"
            size="lg"
          >
            <Users size={18} />
            Join Discord
          </Button>
        </div>

        {/* Quick stats */}
        <dl className="mt-14 grid max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line/60 sm:grid-cols-4">
          {[
            { v: "50+", l: "Drivers" },
            { v: "12", l: "Countries" },
            { v: "5", l: "Seasons" },
            { v: "99.2%", l: "Clean Races" },
          ].map((s) => (
            <div key={s.l} className="bg-base/80 px-5 py-4">
              <dt className="tabular text-2xl font-bold text-ink">{s.v}</dt>
              <dd className="mt-0.5 font-mono text-[0.65rem] uppercase tracking-widest text-subtle">
                {s.l}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
