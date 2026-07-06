import { Button } from "@/components/ui/Button";
import { Marquee } from "@/components/ui/Marquee";

/**
 * PLACEHOLDER home page — ships with the foundation so `next build` succeeds
 * and the design system is demonstrable. The full homepage (hero, next race,
 * standings preview, replays, partners, Andy's Man Club, community CTA) is
 * built in the "Homepage" task once the data layer is consumed.
 */
export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden">
        {/* grid backdrop */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-grid-lines bg-grid opacity-[0.35] [mask-image:radial-gradient(80%_60%_at_50%_0%,black,transparent)]"
        />
        <div className="container-rail relative flex min-h-[68vh] flex-col justify-center py-24">
          <span className="kicker mb-5">Multi-Platform Sim Racing</span>
          <h1 className="max-w-4xl text-5xl font-bold leading-[0.9] text-ink sm:text-7xl">
            The Ultimate
            <br />
            <span className="text-gradient">Racing Community</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted">
            Competitive GT7 &amp; Le Mans Ultimate leagues. Clean, wheel-to-wheel racing, live
            standings, weekly replays — and a community that actually chills.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button href="/replays" size="lg" clip>
              Watch Replays
            </Button>
            <Button href="/join" variant="outline" size="lg">
              Join the League
            </Button>
          </div>
        </div>
      </section>
      <Marquee />
    </>
  );
}
