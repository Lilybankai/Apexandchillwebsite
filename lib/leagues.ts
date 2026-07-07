/**
 * League activation — the single source of truth for *which* leagues are live
 * on the site right now.
 *
 * `GT7` and `LMU` are always present. The `THU` (Midweek Endurance / Thursday)
 * league is a SimGrid championship that only appears once its championship id is
 * configured (`SIMGRID_THURSDAY_CHAMPIONSHIP_ID`), so the site never shows an
 * empty or sample-only third league before the operator wires it up.
 *
 * Server components compute {@link activeLeagues} and pass the result down to
 * client components (standings tabs, schedule toggle, join form) so the UI and
 * the data layer agree on the league set.
 *
 * @packageDocumentation
 */

import type { League } from '@/lib/types';
import { simgrid } from '@/lib/env';

/** Whether the Thursday (Midweek Endurance) SimGrid league is configured. */
export function isThursdayConfigured(): boolean {
  return Boolean(simgrid.token && simgrid.championships.THU);
}

/**
 * The leagues that should be shown across the site, in display order.
 *
 * @returns `['GT7', 'LMU']`, plus `'THU'` when the Thursday championship id is set.
 */
export function activeLeagues(): League[] {
  const leagues: League[] = ['GT7', 'LMU'];
  if (isThursdayConfigured()) leagues.push('THU');
  return leagues;
}
