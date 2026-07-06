import Image from "next/image";
import { HeartHandshake, ArrowRight, Users, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";

const ANDYS_MAN_CLUB_URL = "https://andysmanclub.co.uk/";

/**
 * Prominent, standalone Andy's Man Club exclusive-partnership feature. Renders
 * the real operator white logos on a dark neon surface (per brand asset rules)
 * with the partnership mission, the #ITSOKAYTOTALK message, and why it matters.
 *
 * Reused on the Partners page and available for the About page. Pass
 * `compact` to drop the stat row for tighter placements.
 */
export function AndysManClubFeature({ compact = false }: { compact?: boolean }) {
  return (
    <section
      aria-labelledby="amc-heading"
      className="relative overflow-hidden rounded-card border border-pink/40 shadow-glow-soft"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/15 via-base to-cyan/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-16 h-72 w-72 rounded-full bg-pink/20 blur-[100px]"
      />

      <div className="relative grid gap-10 p-8 sm:p-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 bg-pink/15 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-widest text-pink">
            <HeartHandshake size={14} />
            Exclusive Partner · Mental Health
          </span>
          <h2 id="amc-heading" className="mt-5 text-4xl font-bold leading-tight text-ink sm:text-5xl">
            Andy&apos;s Man Club
            <br />
            <span className="text-gradient">#ITSOKAYTOTALK</span>
          </h2>
          <p className="mt-5 max-w-xl text-muted">
            Andy&apos;s Man Club is a men&apos;s mental-health charity offering free, judgement-free
            peer-to-peer support groups across the United Kingdom. Every Monday, thousands of men
            come together to talk — because talking saves lives.
          </p>
          <p className="mt-4 max-w-xl text-muted">
            As Apex &amp; Chill&apos;s <span className="text-ink">exclusive charity partner</span>,
            we carry that message across everything we do. Our community is more than lap times —
            it&apos;s a place to belong, on and off the track. If you&apos;re struggling, you are
            not alone, and it&apos;s okay to talk.
          </p>

          {!compact && (
            <dl className="mt-7 grid grid-cols-3 gap-px overflow-hidden rounded-card border border-line bg-line/60">
              {[
                { icon: Calendar, v: "Every Monday", l: "Free groups" },
                { icon: MapPin, v: "UK-wide", l: "Locations" },
                { icon: Users, v: "No referral", l: "Just turn up" },
              ].map((s) => (
                <div key={s.l} className="bg-base/70 px-4 py-4">
                  <s.icon size={16} className="text-pink" />
                  <dt className="mt-2 font-display text-base font-semibold uppercase text-ink">
                    {s.v}
                  </dt>
                  <dd className="font-mono text-[0.6rem] uppercase tracking-widest text-subtle">
                    {s.l}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-8">
            <Button href={ANDYS_MAN_CLUB_URL} target="_blank" rel="noopener noreferrer" size="lg">
              Find Your Nearest Group
              <ArrowRight size={18} />
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-8 rounded-card border border-line bg-base/50 p-8">
          <Image
            src="/brand/andysmanclub-logo-white.png"
            alt="Andy's Man Club"
            width={1000}
            height={200}
            className="h-auto w-full max-w-[300px] object-contain"
          />
          <div aria-hidden className="h-px w-24 bg-line" />
          <Image
            src="/brand/itsokaytotalk-logo-white.png"
            alt="#ITSOKAYTOTALK"
            width={1000}
            height={200}
            className="h-auto w-full max-w-[240px] object-contain"
          />
        </div>
      </div>
    </section>
  );
}
