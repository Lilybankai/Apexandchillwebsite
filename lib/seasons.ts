/**
 * Season roll-over and the league's roll of honour.
 *
 * When a SimGrid season ends: add its winners to {@link PAST_CHAMPIONS}, then
 * point {@link CURRENT_SIMGRID_CHAMPIONSHIPS} at the new championship (the
 * numeric id in its SimGrid URL, thesimgrid.com/championships/<id>). Standings,
 * schedule and next race all follow the id; nothing else needs editing.
 *
 * An id set here wins over the matching `SIMGRID_*_CHAMPIONSHIP_ID` env var,
 * so a season change is a reviewed commit rather than a hosting setting that
 * can quietly drift. Leave a league out to keep using its env var.
 *
 * @packageDocumentation
 */

import type { League } from '@/lib/types';

/** The live SimGrid championship per league. */
export const CURRENT_SIMGRID_CHAMPIONSHIPS: Partial<Record<League, string>> = {
  /** Midweek Endurance, Season 2. thesimgrid.com/championships/28052 */
  THU: '28052',
  /** GT7, first season on SimGrid (was Sim League Pro). thesimgrid.com/championships/27807 */
  GT7: '27807',
};

export type ClassChampion = {
  /** The class as SimGrid names it, e.g. `LMGT3`, `LMP2`, `Hypercar`. */
  className: string;
  driver: string;
};

export type SeasonChampions = {
  league: League;
  /** Display label, e.g. `Season 1`. */
  seasonLabel: string;
  champions: readonly ClassChampion[];
};

/** Every finished season's champions, newest first. */
export const PAST_CHAMPIONS: readonly SeasonChampions[] = [
  {
    league: 'THU',
    seasonLabel: 'Season 1',
    champions: [
      { className: 'LMGT3', driver: 'Andy Winters' },
      { className: 'LMP2', driver: 'Tom Mould' },
    ],
  },
];
