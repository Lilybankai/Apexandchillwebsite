import { ShieldCheck, CalendarClock, Swords, MessageCircle, Youtube, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const DISCORD_URL = "https://discord.gg/MBew2Bb2hj";
const YOUTUBE_URL = "https://youtube.com/channel/UCu7lyaGuo3sY2wWZo42-LVw";

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Clean Racing",
    body: "A shared commitment to fair play, respect and racecraft — enforced by a real stewarding system.",
  },
  {
    icon: CalendarClock,
    title: "Weekly Commitment",
    body: "Regular race nights across GT7 and Le Mans Ultimate, so there's always a grid to line up on.",
  },
  {
    icon: Swords,
    title: "Competitive Spirit",
    body: "Drivers pushing each other to improve — from midfield battles to championship deciders.",
  },
];

/**
 * Closing calls-to-action: the "Ready To Race" values/join band followed by
 * the Discord + YouTube community band.
 */
export function CommunityCTA() {
  return (
    <>
      {/* Ready To Race — values + join */}
      <section className="relative overflow-hidden py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-grid-lines bg-grid opacity-20 [mask-image:radial-gradient(70%_60%_at_50%_50%,black,transparent)]"
        />
        <div className="container-rail relative">
          <div className="mx-auto max-w-2xl text-center">
            <span className="kicker mb-3 justify-center">Get On The Grid</span>
            <h2 className="text-4xl font-bold text-ink sm:text-6xl">Ready To Race?</h2>
            <p className="mt-4 text-muted">
              Join a premier multi-platform racing league and compete with some of the cleanest,
              fastest drivers in the community.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {VALUES.map((v) => (
              <Card key={v.title} variant="default" className="p-7 text-center">
                <v.icon size={30} className="mx-auto text-accent" />
                <h3 className="mt-4 text-xl font-bold text-ink">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{v.body}</p>
              </Card>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button href="/join" size="lg" clip>
              Join the League
            </Button>
            <Button
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
              size="lg"
            >
              Community Rules
            </Button>
          </div>
        </div>
      </section>

      {/* Community band — Discord + YouTube */}
      <section className="container-rail pb-24">
        <div className="grid gap-5 md:grid-cols-2">
          <Card variant="default" className="flex flex-col justify-between gap-6 p-8">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-card bg-[#5865F2]/15 text-[#8b93ff]">
                  <MessageCircle size={24} />
                </span>
                <div>
                  <h3 className="text-2xl font-bold text-ink">Discord Community</h3>
                  <p className="font-mono text-xs uppercase tracking-widest text-subtle">
                    Race coordination · Strategy · Events
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted">
                The beating heart of Apex &amp; Chill. Find a grid, talk setups, and get involved.
              </p>
            </div>
            <Button href={DISCORD_URL} target="_blank" rel="noopener noreferrer" variant="discord" size="md">
              Join Discord
              <ArrowRight size={17} />
            </Button>
          </Card>

          <Card variant="default" className="flex flex-col justify-between gap-6 p-8">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-card bg-flag-red/15 text-flag-red">
                  <Youtube size={24} />
                </span>
                <div>
                  <h3 className="text-2xl font-bold text-ink">YouTube Channel</h3>
                  <p className="font-mono text-xs uppercase tracking-widest text-subtle">
                    Full replays · Highlights · Weekly uploads
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted">
                Every race, replayed. Subscribe for full-length broadcasts and the best on-track
                moments.
              </p>
            </div>
            <Button href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" variant="outline" size="md">
              Subscribe on YouTube
              <ArrowRight size={17} />
            </Button>
          </Card>
        </div>
      </section>
    </>
  );
}
