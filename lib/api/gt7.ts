/**
 * GT7 league data: SimGrid when a GT7 championship is configured, Sim League
 * Pro otherwise.
 *
 * GT7 moved to SimGrid from its next season. Set the championship id in
 * `lib/seasons.ts` (or `SIMGRID_GT7_CHAMPIONSHIP_ID`) and standings, schedule
 * and next race all switch over; until then they keep reading Sim League Pro.
 * Every page imports GT7 data from here so there is one switch, not five.
 *
 * @packageDocumentation
 */

import type { ApiResult, NextRace, Schedule, Standings } from '@/lib/types';
import { simgrid as cfg } from '@/lib/env';
import {
  fetchSimgridNextRace,
  fetchSimgridSchedule,
  fetchSimgridStandings,
  type SimgridLeagueOptions,
} from '@/lib/api/simgrid';
import * as simleaguepro from '@/lib/api/simleaguepro';

/** Whether GT7 reads from SimGrid rather than Sim League Pro. */
export function isGt7OnSimgrid(): boolean {
  return Boolean(cfg.championships.GT7);
}

const GT7_SIMGRID_OPTIONS: SimgridLeagueOptions = {
  championshipId: cfg.championships.GT7,
  // GT7 rounds change class (Gr.3, Gr.2…) and SimGrid's race payload doesn't
  // say which, so the cards name the game rather than guess a class.
  classLabel: 'GT7',
  sampleStandings: simleaguepro.SAMPLE_GT7_STANDINGS,
  sampleNextRace: simleaguepro.SAMPLE_GT7_NEXT_RACE,
  sampleSchedule: simleaguepro.SAMPLE_GT7_SCHEDULE,
};

/** GT7 championship standings. Never throws. */
export function fetchGt7Standings(): Promise<ApiResult<Standings>> {
  return isGt7OnSimgrid()
    ? fetchSimgridStandings('GT7', GT7_SIMGRID_OPTIONS)
    : simleaguepro.fetchGt7Standings();
}

/** The next GT7 race. Never throws. */
export function fetchGt7NextRace(): Promise<ApiResult<NextRace>> {
  return isGt7OnSimgrid()
    ? fetchSimgridNextRace('GT7', GT7_SIMGRID_OPTIONS)
    : simleaguepro.fetchGt7NextRace();
}

/** The GT7 season calendar. Never throws. */
export function fetchGt7Schedule(): Promise<ApiResult<Schedule>> {
  return isGt7OnSimgrid()
    ? fetchSimgridSchedule('GT7', GT7_SIMGRID_OPTIONS)
    : simleaguepro.fetchGt7Schedule();
}
