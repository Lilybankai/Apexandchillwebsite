import type { Metadata } from 'next';
import Image from 'next/image';
import { Info, Youtube } from 'lucide-react';
import { fetchReplayGroups } from '@/lib/api/youtube';
import { youtube } from '@/lib/env';
import { Button } from '@/components/ui/Button';
import { FeaturedReplay } from '@/components/replays/FeaturedReplay';
import { ReplayPlaylists } from '@/components/replays/ReplayPlaylists';

export const metadata: Metadata = {
  title: 'Replays',
  description:
    'Watch every Apex & Chill GT7 and Le Mans Ultimate race replay — full broadcasts, highlights and season reviews, straight from our YouTube channel.',
};

/** Revalidate the replays feed every 5 minutes (matches the data layer). */
export const revalidate = 300;

/** Channel subscribe link (opens the confirm-subscription dialog). */
const SUBSCRIBE_URL = `https://www.youtube.com/channel/${youtube.channelId}?sub_confirmation=1`;

/**
 * Independent replays gallery. Fetches recent uploads on the server (same
 * source `GET /api/replays` wraps), features the latest as a hero player, and
 * presents the rest in a filterable grid with a lightbox. Degrades gracefully
 * to sample replays with a notice when the YouTube key is absent.
 */
export default async function ReplaysPage() {
  const result = await fetchReplayGroups(12);
  const groups = result.data;

  // Feature the single newest replay across every playlist as the hero, and hide
  // it from its section grid below so it never appears twice on the page.
  const featured = groups
    .flatMap((g) => g.replays)
    .reduce<(typeof groups)[number]['replays'][number] | undefined>(
      (newest, r) => (!newest || r.publishedAt.localeCompare(newest.publishedAt) > 0 ? r : newest),
      undefined,
    );

  return (
    <>
      {/* Header */}
      <section className="relative overflow-hidden border-b border-line">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-grid-lines bg-grid opacity-25 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]"
        />
        <div className="container-rail relative flex flex-col gap-10 py-16 sm:py-20 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="kicker mb-4">On Demand</span>
            <h1 className="text-4xl font-bold text-ink sm:text-6xl">
              Race <span className="text-gradient">Replays</span>
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted">
              Every round, every battle. Full broadcasts and highlights from both
              leagues — relive the action or catch what you missed.
            </p>
            <div className="mt-8">
              <Button href={SUBSCRIBE_URL} target="_blank" rel="noopener noreferrer" clip>
                <Youtube className="h-5 w-5" />
                Subscribe on YouTube
              </Button>
            </div>
          </div>
          {/* Operator-supplied brand art (300x147) — used at native size as a
              section accent, never stretched into a full-bleed hero. */}
          <Image
            src="/brand/replays.png"
            alt=""
            width={300}
            height={147}
            priority
            className="hidden shrink-0 rounded-card border border-line shadow-glow-soft md:block"
          />
        </div>
      </section>

      <div className="container-rail space-y-14 py-12 sm:py-16">
        {result.source === 'sample' && (
          <div className="flex items-start gap-2 rounded-card border border-flag-amber/30 bg-flag-amber/5 px-4 py-3 text-sm text-muted">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-flag-amber" aria-hidden />
            <span>
              Showing sample replays. Live videos from our YouTube channel appear
              here once the channel feed is connected.
            </span>
          </div>
        )}

        {/* Featured latest replay */}
        {featured && (
          <section>
            <FeaturedReplay replay={featured} />
          </section>
        )}

        {/* Playlists. Multiple configured playlists render as switchable tabs;
            a single feed reads as one "More Replays" grid. The featured hero is
            filtered out so it never appears twice. */}
        <section>
          <ReplayPlaylists groups={groups} featuredId={featured?.videoId} />
        </section>

        {/* Subscribe band */}
        <section className="relative overflow-hidden rounded-card border border-line bg-surface/50 p-8 text-center sm:p-12">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-neon-cyan opacity-[0.07]"
          />
          <div className="relative">
            <h2 className="text-2xl font-bold text-ink sm:text-3xl">
              Never Miss A <span className="text-gradient">Race</span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted">
              Subscribe for full race broadcasts, highlights and season reviews —
              new replays every race week.
            </p>
            <div className="mt-6 flex justify-center">
              <Button href={SUBSCRIBE_URL} target="_blank" rel="noopener noreferrer" size="lg" clip>
                <Youtube className="h-5 w-5" />
                Subscribe on YouTube
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
