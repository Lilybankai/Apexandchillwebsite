'use client';

import { useState } from 'react';
import { Play, Eye } from 'lucide-react';
import type { Replay } from '@/lib/types';
import { formatRaceDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { formatDuration, formatViews, LeagueTag } from './ReplayCard';

export interface FeaturedReplayProps {
  /** The replay to feature — typically the most recent upload. */
  replay: Replay;
}

/**
 * Cinematic hero for the latest replay. Shows a large thumbnail that swaps to
 * an inline, autoplaying YouTube embed when activated, alongside the title,
 * description, and race metadata. Uses the privacy-enhanced `youtube-nocookie`
 * domain for the embed.
 */
export function FeaturedReplay({ replay }: FeaturedReplayProps) {
  const [playing, setPlaying] = useState(false);
  const duration = formatDuration(replay.duration);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-center">
      {/* Player / thumbnail */}
      <div className="relative aspect-video overflow-hidden rounded-card border border-line shadow-glow-soft">
        {playing ? (
          <iframe
            className="h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${replay.videoId}?autoplay=1&rel=0`}
            title={replay.title}
            allow="accelerated-hd; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 h-full w-full"
            aria-label={`Play ${replay.title}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={replay.thumbnail}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-base/85 via-base/20 to-transparent" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-neon-primary text-white shadow-glow transition-transform duration-200 group-hover:scale-110">
                <Play className="h-8 w-8 translate-x-1 fill-current" />
              </span>
            </span>
            {duration && (
              <span className="tabular absolute bottom-3 right-3 rounded bg-base/85 px-2 py-1 text-sm font-medium text-ink">
                {duration}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Details */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <span className="kicker">Latest Replay</span>
          <LeagueTag league={replay.league} />
        </div>
        <h2 className="text-2xl font-bold leading-tight text-ink sm:text-3xl">
          {replay.title}
        </h2>
        {replay.description && (
          <p className="mt-4 line-clamp-3 text-muted">{replay.description}</p>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-4 font-mono text-sm text-subtle">
          {replay.viewCount !== undefined && (
            <span className="inline-flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              {formatViews(replay.viewCount)}
            </span>
          )}
          <span>{formatRaceDate(replay.publishedAt)}</span>
        </div>
        <div className="mt-7 flex flex-wrap gap-3">
          {!playing && (
            <Button type="button" onClick={() => setPlaying(true)} clip>
              <Play className="h-4 w-4 fill-current" />
              Watch Now
            </Button>
          )}
          <Button href={replay.url} variant="outline" target="_blank" rel="noopener noreferrer">
            Open on YouTube
          </Button>
        </div>
      </div>
    </div>
  );
}
