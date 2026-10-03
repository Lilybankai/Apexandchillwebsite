'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';
import type { ApiResult, DataSource, League, Standings } from '@/lib/types';
import { LEAGUES, LEAGUE_LABELS } from '@/lib/types';
import { cn } from '@/lib/utils';
import { StandingsTable } from './StandingsTable';

/** The provider named for each live data source. */
const SOURCE_LABEL: Partial<Record<DataSource, string>> = {
  simgrid: 'SimGrid',
  simleaguepro: 'Sim League Pro',
};

export interface LeagueTabsProps {
  /** Standings payload per league, each an {@link ApiResult}. */
  standings: Partial<Record<League, ApiResult<Standings>>>;
  /** Which league to show first. Defaults to `GT7`. */
  initialLeague?: League;
}

/**
 * Segmented GT7 / LMU control wrapping a {@link StandingsTable}.
 *
 * Renders the season badge, the data-source provider, and a subtle "sample
 * data" chip when live credentials are absent (so the standings never silently
 * fake being live). Tab state is client-side; the standings data itself is
 * fetched on the server and passed in as props.
 */
export function LeagueTabs({ standings, initialLeague = 'GT7' }: LeagueTabsProps) {
  const available = LEAGUES.filter((l) => standings[l]);
  const [active, setActive] = useState<League>(
    available.includes(initialLeague) ? initialLeague : (available[0] ?? 'GT7'),
  );

  const current = standings[active];

  return (
    <div className="space-y-6">
      {/* Segmented control */}
      <div
        role="tablist"
        aria-label="League"
        className="inline-flex rounded-card border border-line bg-surface/60 p-1"
      >
        {available.map((league) => {
          const isActive = league === active;
          return (
            <button
              key={league}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => setActive(league)}
              className={cn(
                'relative rounded-[10px] px-5 py-2.5 font-display text-sm uppercase tracking-wide transition-all duration-150',
                isActive
                  ? 'bg-neon-primary text-white shadow-glow-soft'
                  : 'text-muted hover:text-ink',
              )}
            >
              {LEAGUE_LABELS[league]}
            </button>
          );
        })}
      </div>

      {current && (
        <div className="space-y-4">
          {/* Meta row: season badge + provider + sample chip */}
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-2xl text-ink">
              Driver Championship
            </h2>
            <span className="chip !border-accent/40 !text-accent">
              {current.data.seasonLabel}
            </span>
            <span className="ml-auto font-mono text-xs uppercase tracking-widest text-subtle">
              Data: {SOURCE_LABEL[current.source] ?? 'Sample'}
            </span>
          </div>

          {current.source === 'sample' && (
            <div className="flex items-start gap-2 rounded-card border border-flag-amber/30 bg-flag-amber/5 px-4 py-3 text-sm text-muted">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-flag-amber" aria-hidden />
              <span>
                Showing sample standings. Live data appears here once the{' '}
                {LEAGUE_LABELS[active]} season feed is connected.
              </span>
            </div>
          )}

          <StandingsTable
            rows={current.data.rows}
            emptyMessage={`${current.data.seasonLabel} hasn't raced yet. Standings appear here after round 1.`}
          />
        </div>
      )}
    </div>
  );
}
