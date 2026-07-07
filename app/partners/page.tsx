import type { Metadata } from "next";
import { PartnerGrid } from "@/components/partners/PartnerGrid";
import { AndysManClubFeature } from "@/components/partners/AndysManClubFeature";

export const metadata: Metadata = {
  title: "Partners",
  description:
    "The brands and partners behind Apex & Chill Racing — including MOZA Racing, Rogue Energy, Sim Endurance, and our exclusive mental-health charity partner, Andy's Man Club.",
};

export default function PartnersPage() {
  return (
    <div className="pb-8">
      {/* Page header */}
      <section className="relative overflow-hidden border-b border-line">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-grid-lines bg-grid opacity-25 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]"
        />
        <div className="container-rail relative py-20">
          <span className="kicker mb-4">Who We Work With</span>
          <h1 className="max-w-3xl text-5xl font-bold text-ink sm:text-6xl">
            Our <span className="text-gradient">Partners</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted">
            We&apos;re proud to work alongside brands and organisations that share our standard for
            clean, competitive racing — and our commitment to the community beyond the track.
          </p>
        </div>
      </section>

      {/* Andy's Man Club — lead with the exclusive partnership */}
      <section className="container-rail py-16">
        <AndysManClubFeature />
      </section>

      {/* Commercial partners */}
      <section className="container-rail pb-20">
        <header className="mb-8 max-w-2xl">
          <span className="kicker mb-3">Trusted By Drivers</span>
          <h2 className="text-4xl font-bold text-ink sm:text-5xl">Racing Partners</h2>
          <p className="mt-4 text-muted">
            The hardware and platforms our drivers rely on, race after race.
          </p>
        </header>
        <PartnerGrid />
      </section>

      {/* Become a partner CTA */}
      <section className="container-rail pb-8">
        <div className="flex flex-col items-center gap-4 rounded-card border border-line bg-surface/50 p-10 text-center">
          <h2 className="text-3xl font-bold text-ink">Partner With Apex &amp; Chill</h2>
          <p className="max-w-xl text-muted">
            A growing, engaged multi-platform sim racing community — 200+ drivers across 12 countries,
            weekly broadcasts and an active Discord. If your brand fits, we&apos;d love to talk.
          </p>
          <a
            href="mailto:apexandchillracing@outlook.com"
            className="font-display text-sm font-semibold uppercase tracking-wide text-cyan hover:underline"
          >
            apexandchillracing@outlook.com →
          </a>
        </div>
      </section>
    </div>
  );
}
