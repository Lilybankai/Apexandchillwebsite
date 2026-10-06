import type { Metadata } from 'next';
import type { ApiResult, League, Standings } from '@/lib/types';
import { fetchGt7Schedule, fetchGt7Standings } from '@/lib/api/gt7';
import {
  fetchLmuSchedule,
  fetchLmuStandings,
  fetchThursdaySchedule,
  fetchThursdayStandings,
} from '@/lib/api/simgrid';
import { isThursdayConfigured } from '@/lib/leagues';
import { Button } from '@/components/ui/Button';
import { LeagueTabs } from '@/components/standings/LeagueTabs';
import { PastChampions } from '@/components/standings/PastChampions';
import { JsonLd } from '@/components/aio/JsonLd';
import { buildBreadcrumbJsonLd } from '@/lib/seo';
import { formatUkDate, latestCompletedRoundDate } from '@/lib/freshness';

export const metadata: Metadata = {
  title: 'Standings',
  alternates: { canonical: '/standings' },
  description:
    'Live driver championship standings for the Apex & Chill GT7 and LMU leagues on SimGrid — points, wins, podiums and more.',
};

/** Revalidate the standings snapshot every 5 minutes (matches the data layer). */
export const revalidate = 300;

/**
 * Full standings page with a GT7 / LMU segmented control.
 *
 * Data is read on the server directly from the same clients that back
 * `GET /api/standings` (SimGrid, or Sim League Pro for GT7 until its SimGrid
 * championship is set), so it renders
 * fast and SEO-complete; the `/api/standings` route exposes the identical
 * payload for any client-side consumers. Both clients degrade gracefully to
 * sample data, surfaced via a "sample data" chip in {@link LeagueTabs}.
 */
export default async function StandingsPage() {
  const thuActive = isThursdayConfigured();
  const [gt7, lmu, thu, gt7Schedule, lmuSchedule, thuSchedule] = await Promise.all([
    fetchGt7Standings(),
    fetchLmuStandings(),
    thuActive ? fetchThursdayStandings() : Promise.resolve(undefined),
    // Calendars only date the "Updated after racing on" line (same cached snapshots
    // the Schedule page reads).
    fetchGt7Schedule(),
    fetchLmuSchedule(),
    thuActive ? fetchThursdaySchedule() : Promise.resolve(undefined),
  ]);
  const standings: Partial<Record<League, ApiResult<Standings>>> = { GT7: gt7, LMU: lmu };
  if (thu) standings.THU = thu;
  const resultsThrough = latestCompletedRoundDate({ GT7: gt7Schedule, LMU: lmuSchedule, THU: thuSchedule });

  return (
    <>
      <JsonLd data={buildBreadcrumbJsonLd([{ name: 'Standings', path: '/standings' }])} />
      {/* Page header */}
      <section className="relative overflow-hidden border-b border-line">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-grid-lines bg-grid opacity-25 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]"
        />
        <div className="container-rail relative py-16 sm:py-20">
          <span className="kicker mb-4">Championship</span>
          <h1 className="text-4xl font-bold text-ink sm:text-6xl">
            Live <span className="text-gradient">Standings</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            Where the season is won and lost. Track the title fight across both
            leagues — updated as results are confirmed.
          </p>
          {resultsThrough && (
            <p className="mt-3 font-mono text-xs uppercase tracking-widest text-muted">
              Updated after racing on <time dateTime={resultsThrough}>{formatUkDate(resultsThrough)}</time>
            </p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/schedule" variant="outline">
              View Schedule
            </Button>
            <Button href="/join">Join the League</Button>
          </div>
        </div>
      </section>

      {/* Standings tables */}
      <section className="container-rail py-12 sm:py-16">
        <LeagueTabs standings={standings} />
      </section>

      <PastChampions />
    </>
  );
}
