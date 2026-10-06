/**
 * Andy's Man Club charity fundraiser — the content behind `/andys-man-club-fundraiser`.
 *
 * Two sources of fact live here:
 *  - **From SimGrid** — read from the SimGrid championship (27985) on 2026-10-06
 *    and kept as {@link AMC_EVENT_SNAPSHOT}. The page prefers the live SimGrid
 *    response and only falls back to this snapshot when the API is unavailable.
 *  - **Organiser-confirmed** — everything SimGrid doesn't carry (classes,
 *    format, fee, target, broadcast) and the corrected race date, in
 *    {@link AMC_EVENT}. If a new detail is still unconfirmed, give it a
 *    `tbc()` value from `lib/events/tbc` and the page shows a "TBC" chip.
 *
 * @packageDocumentation
 */

import type { SimgridEvent } from '@/lib/types';
import { simgrid } from '@/lib/env';

/** Route of the landing page. */
export const AMC_EVENT_PATH = '/andys-man-club-fundraiser';

/** SimGrid championship id for the fundraiser (env-overridable, see `lib/env.ts`). */
export const AMC_CHAMPIONSHIP_ID = simgrid.events.AMC;

/** Apex & Chill's existing Andy's Man Club JustGiving page (also on the homepage). */
export const AMC_DONATE_URL =
  'https://www.justgiving.com/page/apexandchillracing?utm_medium=FA&utm_source=CL';

/** Andy's Man Club — find a group. */
export const ANDYS_MAN_CLUB_URL = 'https://andysmanclub.co.uk/';

/** Community Discord (same invite as the header/footer). */
export const DISCORD_URL = 'https://discord.gg/MBew2Bb2hj';

/**
 * Confirmed championship details as SimGrid reported them on 2026-10-06 —
 * the fallback when the live API can't be reached. The live entry count is
 * deliberately not trusted from here: the page only shows a count when
 * `source === 'simgrid'`.
 */
export const AMC_EVENT_SNAPSHOT: SimgridEvent = {
  id: AMC_CHAMPIONSHIP_ID,
  name: 'Apex and Chill Andys Man Club Fundraiser',
  game: 'Le Mans Ultimate',
  url: `https://www.thesimgrid.com/championships/${AMC_CHAMPIONSHIP_ID}`,
  resultsUrl: `https://www.thesimgrid.com/championships/${AMC_CHAMPIONSHIP_ID}/results`,
  races: [
    {
      name: 'Daytona 3 hours special andys man club fundraiser',
      track: 'Daytona International Speedway Road Course',
      startsAt: '2026-12-07T18:00:00.000Z',
      ended: false,
    },
  ],
  capacity: 66,
  spotsTaken: 0,
  acceptingRegistrations: true,
  teamsEnabled: false,
  entryFeeCents: 1300,
  source: 'sample',
};

/** Apex & Chill Racing League YouTube channel (same as the footer). */
export const YOUTUBE_URL = 'https://youtube.com/channel/UCu7lyaGuo3sY2wWZo42-LVw';

/**
 * Page copy and organiser-confirmed details (confirmed 2026-10-06).
 *
 * Where these disagree with SimGrid, the organisers win: SimGrid still lists
 * the race on 7 December with a 1300 entry fee, but the confirmed race is
 * Saturday 12 December at 18:00 UK time and entry is £10. SimGrid stays the
 * source for places taken and whether registrations are open.
 */
export const AMC_EVENT = {
  title: "The Daytona 3 Hours for Andy's Man Club",
  /** Race start — 18:00 UK time (GMT in December). */
  raceStart: '2026-12-12T18:00:00.000Z',
  /** Confirmed by the race name on SimGrid ("Daytona 3 hours special"). */
  raceLength: '3 Hours',
  summary:
    "A one-off Le Mans Ultimate endurance race around the Daytona road course, raising money for Andy's Man Club — the men's mental-health charity we're proud to partner with.",
  carClasses: ['Hypercar', 'LMP2', 'LMGT3'],
  carClass: 'Hypercar, LMP2 & LMGT3',
  gridSize: 66,
  sessionFormat: '15 min practice · 15 min qualifying',
  entryFee: '£10',
  /** Schema.org offer price, in GBP. */
  entryFeeGbp: 10,
  feeDestination: "All money raised on the day goes to Andy's Man Club",
  fundraisingTarget: '£1,000',
  broadcast: 'Live on the Apex & Chill Racing League YouTube channel from 18:00 UK time',
} as const;
