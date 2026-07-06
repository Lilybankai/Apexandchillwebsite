'use client';

import Image from 'next/image';
import { Play, Eye, Clock } from 'lucide-react';
import type { Replay } from '@/lib/types';
import { cn, compactNumber, formatRaceDate } from '@/lib/utils';

/**
 * Format an ISO-8601 duration (e.g. `PT1H48M30S`) as `H:MM:SS` / `M:SS`.
 * Returns an empty string for missing/invalid input.
 */
export function formatDuration(iso: string | undefined): string {
  if (!iso) return '';
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return '';
  const h = Number(m[1] ?? 0);
  const min = Number(m[2] ?? 0);
  const s = Number(m[3] ?? 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(min)}:${pad(s)}` : `${min}:${pad(s)}`;
}

/** Format a view count compactly, e.g. `4210` -> `4.2K views`. */
export function formatViews(views: number | undefined): string {
  if (views === undefined) return '';
  return `${compactNumber(views)} view${views === 1 ? '' : 's'}`;
}

/** Small league tag chip; hidden when a replay isn't league-classified. */
export function LeagueTag({ league }: { league: Replay['league'] }) {
  if (!league) return null;
  return (
    <span
      className={cn(
        'chip !px-2 !py-0.5 !text-[0.6rem]',
        league === 'GT7' ? '!border-success/50 !text-success' : '!border-cyan/50 !text-cyan',
      )}
    >
      {league}
    </span>
  );
}

export interface ReplayCardProps {
  replay: Replay;
  /** Called with the video id when the card is activated (opens the lightbox). */
  onPlay: (replay: Replay) => void;
}

/**
 * A single replay tile: thumbnail with a hover play affordance, duration badge,
 * league tag, title, and date/view metadata. Activating it calls `onPlay`.
 */
export function ReplayCard({ replay, onPlay }: ReplayCardProps) {
  const duration = formatDuration(replay.duration);
  return (
    <button
      type="button"
      onClick={() => onPlay(replay)}
      className="group flex w-full flex-col overflow-hidden rounded-card border border-line bg-surface/40 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-glow-soft focus-visible:border-cyan"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-elevated">
        <Image
          src={replay.thumbnail}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-base/80 via-transparent to-transparent" />

        {/* Play overlay */}
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-neon-primary text-white opacity-0 shadow-glow transition-all duration-200 group-hover:scale-110 group-hover:opacity-100">
            <Play className="h-6 w-6 translate-x-0.5 fill-current" />
          </span>
        </span>

        {/* League tag */}
        <span className="absolute left-2 top-2">
          <LeagueTag league={replay.league} />
        </span>

        {/* Duration badge */}
        {duration && (
          <span className="tabular absolute bottom-2 right-2 inline-flex items-center gap-1 rounded bg-base/85 px-1.5 py-0.5 text-[0.7rem] font-medium text-ink">
            <Clock className="h-3 w-3 text-subtle" />
            {duration}
          </span>
        )}
      </div>

      {/* Meta */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 font-display text-base leading-tight text-ink transition-colors group-hover:text-cyan">
          {replay.title}
        </h3>
        <div className="mt-auto flex items-center gap-3 font-mono text-xs text-subtle">
          {replay.viewCount !== undefined && (
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {formatViews(replay.viewCount)}
            </span>
          )}
          <span>{formatRaceDate(replay.publishedAt)}</span>
        </div>
      </div>
    </button>
  );
}
