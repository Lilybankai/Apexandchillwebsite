import type { ApiResult, League, NextRace } from "@/lib/types";
import { fetchGt7Standings, fetchGt7NextRace } from "@/lib/api/simleaguepro";
import { fetchLmuStandings, fetchLmuNextRace } from "@/lib/api/simgrid";
import { fetchReplays } from "@/lib/api/youtube";
import { Marquee } from "@/components/ui/Marquee";
import { Hero } from "@/components/home/Hero";
import { NextRaceCard } from "@/components/home/NextRaceCard";
import { SeriesCovered } from "@/components/home/SeriesCovered";
import { MiniStandings } from "@/components/home/MiniStandings";
import { LatestReplays } from "@/components/home/LatestReplays";
import { PartnersStrip } from "@/components/home/PartnersStrip";
import { AndysManClub } from "@/components/home/AndysManClub";
import { CommunityCTA } from "@/components/home/CommunityCTA";

// Standings/next-race snapshots refresh in the background; keep the homepage
// statically rendered and revalidated so it's fast but not stale.
export const revalidate = 300;

/** Pick the league whose next race is soonest (future first), else earliest. */
function soonest(
  entries: { league: League; result: ApiResult<NextRace> }[],
): { league: League; result: ApiResult<NextRace> } {
  const now = Date.now();
  const withTime = entries.map((e) => ({
    ...e,
    ts: new Date(`${e.result.data.date}T${e.result.data.time || "00:00"}`).getTime(),
  }));
  const future = withTime
    .filter((e) => Number.isFinite(e.ts) && e.ts >= now)
    .sort((a, b) => a.ts - b.ts);
  if (future.length) return future[0];
  // No future race found — fall back to the earliest known.
  return withTime.sort((a, b) => (a.ts || Infinity) - (b.ts || Infinity))[0] ?? entries[0];
}

export default async function HomePage() {
  // Fetch everything the homepage needs in parallel. Every call returns an
  // ApiResult that degrades to bundled sample data, so this never throws.
  const [gt7Next, lmuNext, gt7Standings, lmuStandings, replays] = await Promise.all([
    fetchGt7NextRace(),
    fetchLmuNextRace(),
    fetchGt7Standings(),
    fetchLmuStandings(),
    fetchReplays(6),
  ]);

  const nextRace = soonest([
    { league: "GT7", result: gt7Next },
    { league: "LMU", result: lmuNext },
  ]);

  return (
    <>
      <Hero />
      <Marquee />
      <NextRaceCard primary={nextRace} />
      <SeriesCovered />
      <MiniStandings gt7={gt7Standings} lmu={lmuStandings} />
      <LatestReplays result={replays} />
      <AndysManClub />
      <PartnersStrip />
      <CommunityCTA />
    </>
  );
}
