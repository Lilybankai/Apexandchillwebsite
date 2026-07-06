import Image from "next/image";
import { HeartHandshake, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

const ANDYS_MAN_CLUB_URL = "https://andysmanclub.co.uk/";

/**
 * Prominent, site-wide feature for Apex & Chill's exclusive mental-health
 * partner, Andy's Man Club. Uses the operator's white partner logos on a dark
 * neon surface (per brand asset rules).
 */
export function AndysManClub() {
  return (
    <section className="container-rail py-16">
      <div className="relative overflow-hidden rounded-card border border-pink/40 shadow-glow-soft">
        {/* neon wash background */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/15 via-base to-cyan/10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-pink/20 blur-[90px]"
        />

        <div className="relative grid gap-10 p-8 sm:p-12 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 bg-pink/15 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-widest text-pink">
              <HeartHandshake size={14} />
              Exclusive Partner · Mental Health
            </span>
            <h2 className="mt-5 text-4xl font-bold leading-tight text-ink sm:text-5xl">
              Racing For A Reason.
              <br />
              <span className="text-gradient">It&apos;s Okay To Talk.</span>
            </h2>
            <p className="mt-5 max-w-xl text-muted">
              We&apos;re proud to be an exclusive partner of{" "}
              <span className="font-semibold text-ink">Andy&apos;s Man Club</span> — a men&apos;s
              mental-health charity running free, judgement-free talking groups across the UK.
              Sim racing brings our community together; this partnership makes sure no one in it
              races alone.
            </p>
            <ul className="mt-6 grid gap-2 text-sm text-muted sm:grid-cols-2">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rotate-45 bg-pink" /> Free weekly talking groups
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rotate-45 bg-pink" /> #ITSOKAYTOTALK, every Monday
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rotate-45 bg-pink" /> Featured across our leagues
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rotate-45 bg-pink" /> No sign-up, no referral needed
              </li>
            </ul>
            <div className="mt-8">
              <Button href={ANDYS_MAN_CLUB_URL} target="_blank" rel="noopener noreferrer" size="lg">
                Find Support
                <ArrowRight size={18} />
              </Button>
            </div>
          </div>

          {/* Partner logos — white variants on dark surface */}
          <div className="flex flex-col items-center gap-8 rounded-card border border-line bg-base/50 p-8">
            <Image
              src="/brand/andysmanclub-logo-white.png"
              alt="Andy's Man Club"
              width={1000}
              height={200}
              className="h-auto w-full max-w-[280px] object-contain"
            />
            <Image
              src="/brand/itsokaytotalk-logo-white.png"
              alt="#ITSOKAYTOTALK"
              width={1000}
              height={200}
              className="h-auto w-full max-w-[220px] object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
