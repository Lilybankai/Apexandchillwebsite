'use client';

import { useMemo, useState } from 'react';
import type { ReplayPlaylist } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ReplayGrid } from './ReplayGrid';

export interface ReplayPlaylistsProps {
  /** Playlist groups to present, in the operator's declared order. */
  groups: ReplayPlaylist[];
  /**
   * Video id of the featured hero replay, filtered out of every tab so it never
   * appears twice on the page.
   */
  featuredId?: string;
}

/**
 * Renders replay playlists as switchable tabs — one tab per playlist, each
 * showing that playlist's videos in a {@link ReplayGrid} (with its lightbox).
 *
 * With a single playlist there are no tabs: it falls back to a plain grid that
 * keeps the GT7/LMU league filter chips. With several, the playlist itself is
 * the scope, so those per-grid chips are hidden and the tab bar drives which
 * playlist is shown.
 */
export function ReplayPlaylists({ groups, featuredId }: ReplayPlaylistsProps) {
  // Drop the featured hero from each group, then keep only non-empty playlists.
  const populated = useMemo(
    () =>
      groups
        .map((g) => ({ ...g, replays: g.replays.filter((r) => r.videoId !== featuredId) }))
        .filter((g) => g.replays.length > 0),
    [groups, featuredId],
  );

  const [activeId, setActiveId] = useState(populated[0]?.id);
  const active = populated.find((g) => g.id === activeId) ?? populated[0];

  if (!active) return null;

  // Single playlist → no tabs; keep the league filter chips on the grid.
  if (populated.length === 1) {
    return (
      <div>
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl text-ink">More Replays</h2>
        </div>
        <ReplayGrid replays={active.replays} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-display text-2xl text-ink">Browse by Playlist</h2>
      </div>

      {/* Tab bar — one tab per playlist. */}
      <div
        role="tablist"
        aria-label="Replay playlists"
        className="flex flex-wrap items-center gap-2 border-b border-line pb-3"
      >
        {populated.map((group) => {
          const isActive = group.id === active.id;
          return (
            <button
              key={group.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveId(group.id)}
              className={cn(
                'rounded-full border px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-widest transition-all duration-150',
                isActive
                  ? 'border-transparent bg-neon-primary text-white shadow-glow-soft'
                  : 'border-line text-muted hover:border-accent/50 hover:text-ink',
              )}
            >
              {group.label}
              <span className="ml-1.5 text-[0.65rem] opacity-70">{group.replays.length}</span>
            </button>
          );
        })}
      </div>

      {/* Active playlist grid. Keyed so state (filter/lightbox) resets per tab. */}
      <ReplayGrid key={active.id} replays={active.replays} showFilters={false} />
    </div>
  );
}
