import type { ApiResult, League, NextRace, Standings } from "@/lib/types";
import { fetchGt7Standings, fetchGt7NextRace } from "@/lib/api/simleaguepro";
import {
  fetchLmuStandings,
  fetchLmuNextRace,
  fetchThursdayStandings,
  fetchThursdayNextRace,
} from "@/lib/api/simgrid";
import { isThursdayConfigured } from "@/lib/leagues";
import { fetchReplays, fetchLiveStreams } from "@/lib/api/youtube";
import { Marquee } from "@/components/ui/Marquee";
import { Hero } from "@/components/home/Hero";
import { LiveStreamSection } from "@/components/live/LiveStreamSection";
import { NextRaceCard } from "@/components/home/NextRaceCard";
import { SeriesCovered } from "@/components/home/SeriesCovered";
import { MiniStandings } from "@/components/home/MiniStandings";
import { LatestReplays } from "@/components/home/LatestReplays";
import { PartnersStrip } from "@/components/home/PartnersStrip";
import { AndysManClub } from "@/components/home/AndysManClub";
import { CommunityCTA } from "@/components/home/CommunityCTA";
import type { Metadata } from "next";

// Home uses the site-default title/description from the root layout; it only
// needs its own canonical so it isn't left to inherit or infer one.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Standings/next-race snapshots refresh in the background; keep the homepage
// statically rendered and revalidated so it's fast but not stale.
export const revalidate = 300;

/**
 * Pick the league whose next race to feature in the banner.
 *
 * Live data wins over sample data, so the banner never shows a fabricated
 * sample date ahead of a real upcoming race (e.g. a placeholder GT7 date must
 * not outrank the live LMU round). Within the same tier we prefer the soonest
 * future race, falling back to the earliest known.
 */
function soonest(
  entries: { league: League; result: ApiResult<NextRace> }[],
): { league: League; result: ApiResult<NextRace> } {
  const now = Date.now();
  const withTime = entries.map((e) => ({
    ...e,
    ts: new Date(`${e.result.data.date}T${e.result.data.time || "00:00"}`).getTime(),
    isLive: e.result.source !== "sample",
  }));
  const byTs = (a: { ts: number }, b: { ts: number }) => a.ts - b.ts;
  const future = withTime.filter((e) => Number.isFinite(e.ts) && e.ts >= now);

  // Prefer a live upcoming race, then any upcoming race.
  const liveFuture = future.filter((e) => e.isLive).sort(byTs);
  if (liveFuture.length) return liveFuture[0];
  const anyFuture = [...future].sort(byTs);
  if (anyFuture.length) return anyFuture[0];

  // No upcoming race — fall back to the earliest known, still preferring live.
  const liveKnown = withTime.filter((e) => e.isLive && Number.isFinite(e.ts)).sort(byTs);
  if (liveKnown.length) return liveKnown[0];
  return withTime.sort((a, b) => (a.ts || Infinity) - (b.ts || Infinity))[0] ?? entries[0];
}

export default async function HomePage() {
  // Fetch everything the homepage needs in parallel. Every call returns an
  // ApiResult that degrades to bundled sample data, so this never throws.
  const thuActive = isThursdayConfigured();
  const [gt7Next, lmuNext, thuNext, gt7Standings, lmuStandings, thuStandings, replays, live] =
    await Promise.all([
      fetchGt7NextRace(),
      fetchLmuNextRace(),
      thuActive ? fetchThursdayNextRace() : Promise.resolve(undefined),
      fetchGt7Standings(),
      fetchLmuStandings(),
      thuActive ? fetchThursdayStandings() : Promise.resolve(undefined),
      fetchReplays(6),
      fetchLiveStreams(),
    ]);

  const nextRaceEntries: { league: League; result: ApiResult<NextRace> }[] = [
    { league: "GT7", result: gt7Next },
    { league: "LMU", result: lmuNext },
  ];
  if (thuNext) nextRaceEntries.push({ league: "THU", result: thuNext });
  const nextRace = soonest(nextRaceEntries);

  const miniStandings: Partial<Record<League, ApiResult<Standings>>> = {
    GT7: gt7Standings,
    LMU: lmuStandings,
  };
  if (thuStandings) miniStandings.THU = thuStandings;

  return (
    <>
      <Hero />
      <Marquee />
      <LiveStreamSection initial={live} variant="home" />
      <NextRaceCard primary={nextRace} />
      <SeriesCovered />
      <MiniStandings standings={miniStandings} />
      <LatestReplays result={replays} />
      <AndysManClub />
      <PartnersStrip />
      <CommunityCTA />
    </>
  );
}
