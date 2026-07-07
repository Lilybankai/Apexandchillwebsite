import type { Metadata } from "next";
import Image from "next/image";
import { MessageCircle, Youtube, ShieldCheck, Globe, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "About",
  description:
    "The story of Apex & Chill Racing — a multi-platform sim racing community founded in 2025, now 200+ drivers strong across 12 countries, racing competitive GT7 and Le Mans Ultimate leagues.",
};

const DISCORD_URL = "https://discord.gg/MBew2Bb2hj";
const YOUTUBE_URL = "https://youtube.com/channel/UCu7lyaGuo3sY2wWZo42-LVw";

const STATS = [
  { v: "2025", l: "Founded" },
  { v: "200+", l: "Drivers" },
  { v: "12", l: "Countries" },
  { v: "5", l: "Seasons" },
  { v: "100+", l: "Races Run" },
];

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Clean Racing First",
    body: "A proper stewarding system and a shared respect for racecraft. We race hard, but we race fair — every single week.",
  },
  {
    icon: Globe,
    title: "Multi-Platform",
    body: "Console or PC, GT7 or Le Mans Ultimate — there's a competitive grid for you, whatever your setup or experience level.",
  },
  {
    icon: HeartHandshake,
    title: "Community Beyond The Track",
    body: "As an exclusive partner of Andy's Man Club, we look out for each other off the track as much as on it. It's okay to talk.",
  },
];

export default function AboutPage() {
  return (
    <div className="pb-8">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-line">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-grid-lines bg-grid opacity-25 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-accent/15 blur-[120px]"
        />
        <div className="container-rail relative py-20">
          <span className="kicker mb-4">Our Story</span>
          <h1 className="max-w-3xl text-5xl font-bold text-ink sm:text-6xl">
            More Than Lap Times.
            <br />
            <span className="text-gradient">We&apos;re A Community.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">
            Apex &amp; Chill Racing started in 2025 with a simple idea: competitive sim racing
            doesn&apos;t have to mean toxic lobbies and dirty driving. Build a place where drivers
            take racing seriously but keep it welcoming — and the community will follow.
          </p>
        </div>
      </section>

      {/* Story + brand accent */}
      <section className="container-rail grid gap-10 py-16 lg:grid-cols-[1.3fr_1fr] lg:items-center">
        <div className="space-y-4 text-muted">
          <p>
            What began as a handful of friends looking for clean races has grown into a genuine
            multi-platform community — <span className="text-ink">200+ drivers across 12 countries</span>,
            five seasons deep, with over 100 races run that we&apos;re fiercely proud of.
          </p>
          <p>
            Today we run two flagship championships: a Gran Turismo 7 league on PlayStation and a Le
            Mans Ultimate endurance league on PC. Every race is broadcast on YouTube, coordinated
            through an active Discord, and governed by a rulebook that keeps the racing fair.
          </p>
          <p>
            But the thing we&apos;re proudest of isn&apos;t on any timing screen. It&apos;s the
            community itself — and our exclusive partnership with{" "}
            <span className="text-ink">Andy&apos;s Man Club</span>, making sure the people behind the
            wheels are looked after too.
          </p>
        </div>

        <Card variant="default" className="overflow-hidden">
          <div className="relative aspect-[300/147] bg-elevated">
            <Image
              src="/brand/about.png"
              alt="Apex & Chill Racing neon car render"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
          <div className="border-t border-line p-4 text-center font-mono text-[0.65rem] uppercase tracking-widest text-subtle">
            Apex &amp; Chill Racing · Est. 2025
          </div>
        </Card>
      </section>

      {/* Stat band */}
      <section className="border-y border-line bg-surface/40">
        <div className="container-rail grid grid-cols-2 gap-px py-10 sm:grid-cols-3 lg:grid-cols-5">
          {STATS.map((s) => (
            <div key={s.l} className="px-3 text-center">
              <div className="tabular text-3xl font-bold text-gradient">{s.v}</div>
              <div className="mt-1 font-mono text-[0.6rem] uppercase tracking-widest text-subtle">
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="container-rail py-16">
        <header className="mb-8 max-w-2xl">
          <span className="kicker mb-3">What We Stand For</span>
          <h2 className="text-4xl font-bold text-ink sm:text-5xl">The Apex &amp; Chill Way</h2>
        </header>
        <div className="grid gap-5 md:grid-cols-3">
          {VALUES.map((v) => (
            <Card key={v.title} variant="default" className="p-7">
              <v.icon size={30} className="text-accent" />
              <h3 className="mt-4 text-xl font-bold text-ink">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{v.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Community strength */}
      <section className="container-rail py-8">
        <div className="grid gap-5 md:grid-cols-2">
          <Card variant="default" className="flex flex-col justify-between gap-6 p-8">
            <div>
              <MessageCircle size={28} className="text-[#8b93ff]" />
              <h3 className="mt-4 text-2xl font-bold text-ink">A Living Discord</h3>
              <p className="mt-2 text-sm text-muted">
                Race sign-ups, setup talk, banter and support — our Discord is where the community
                actually lives between race nights.
              </p>
            </div>
            <Button href={DISCORD_URL} target="_blank" rel="noopener noreferrer" variant="discord" size="md">
              Join the Discord
            </Button>
          </Card>
          <Card variant="default" className="flex flex-col justify-between gap-6 p-8">
            <div>
              <Youtube size={28} className="text-flag-red" />
              <h3 className="mt-4 text-2xl font-bold text-ink">Every Race, Broadcast</h3>
              <p className="mt-2 text-sm text-muted">
                Full-length replays and highlights on our YouTube channel — the best seat in the
                house for our championships.
              </p>
            </div>
            <Button href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" variant="outline" size="md">
              Watch on YouTube
            </Button>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="container-rail py-16">
        <div className="flex flex-col items-center gap-5 rounded-card border border-accent/40 bg-surface/50 p-10 text-center shadow-glow-soft">
          <h2 className="text-4xl font-bold text-ink">Come Race With Us</h2>
          <p className="max-w-xl text-muted">
            Whether you&apos;re chasing championships or just want clean, competitive races with good
            people — there&apos;s a spot on the grid for you.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button href="/join" size="lg" clip>
              Join the League
            </Button>
            <Button href="/standings" variant="outline" size="lg">
              View Standings
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
