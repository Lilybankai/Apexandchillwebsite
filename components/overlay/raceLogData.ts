/**
 * One race, as the app's Race log tab reads it back: the data behind every
 * race-log mock on the incident review page.
 *
 * Built the way `raceLog.ts` builds a log from LMU's results file, so the
 * mocks can't contradict themselves: lap lines come from the lap times, the
 * race clock is those times added up, position lines are written only where
 * the place CHANGED at a crossing, and each incident is placed part-way
 * through its lap rather than typed as a clock value. The sentences are the
 * app's own wording (`Light contact with …`, `Track limits: warning, 2 of 4
 * points`, `Served the drive-through`).
 *
 * The drivers are invented. The circuit, classes and car naming follow LMU.
 */

export type RaceLogKind =
  | "start"
  | "flag"
  | "lap"
  | "position"
  | "contact"
  | "damage"
  | "limits"
  | "penalty"
  | "pit"
  | "driver"
  | "finish";

export type RaceLogEvent = {
  /** Seconds since the green flag. */
  raceS: number;
  /** The lap being driven, 0 on the grid. */
  lap: number;
  kind: RaceLogKind;
  text: string;
  /** How loud the row is, by the app's `toneOf` rule. */
  tone?: "bad" | "warn";
  /** A position line's direction. */
  dir?: "gain" | "loss";
  /** A lap line, split so the time can wear the lap sheet's colours. */
  lapTime?: string;
  lapRest?: string;
  lapRank?: "pb" | "class";
  lapInvalid?: boolean;
};

export const RL_TRACK = "Circuit de Spa-Francorchamps";
export const RL_CLASS = "LMGT3";
export const RL_CAR = "Ford Mustang LMGT3 Custom Team 2025 #397";
export const RL_CAR_NUMBER = "397";
export const RL_DRIVER = "Alex Carter";
export const RL_STARTED = "21:04";
export const RL_DATE = "30 Sept 2026";

/** Lap times in ms. Lap 8 carries the stop and its repair; lap 11 the drive-through. */
const LAP_MS = [
  154118, 140402, 139071, 140260, 138644, 151915, 142180, 188442, 139880, 139502, 161227, 139330,
  138902, 138215, 138480, 138911, 139240, 138760, 139105, 139622,
];

/** Overall and class place at the end of each lap; index 0 is the grid. */
export const RL_POS = [14, 12, 12, 11, 11, 10, 13, 13, 16, 16, 16, 18, 17, 16, 15, 15, 14, 13, 13, 12, 11];
export const RL_CLASS_POS = [6, 4, 4, 4, 4, 3, 5, 5, 7, 7, 7, 8, 7, 7, 6, 6, 5, 5, 5, 4, 4];

/** Laps whose line carries more than a time. */
const LAP_TAGS: Record<number, { rest?: string; rank?: "pb" | "class"; invalid?: boolean }> = {
  3: { rest: "personal best", rank: "pb" },
  5: { rest: "personal best · class best", rank: "class" },
  7: { rest: "pit in" },
  14: { rest: "invalid", invalid: true },
  15: { rest: "personal best", rank: "pb" },
};

/** Everything that isn't a lap or a place, placed a fraction of the way through its lap. */
const INCIDENTS: { lap: number; at: number; kind: RaceLogKind; text: string; tone?: "bad" | "warn" }[] = [
  { lap: 1, at: 0.34, kind: "contact", text: "Light contact with T. Lindqvist (#91)", tone: "warn" },
  { lap: 4, at: 0.62, kind: "limits", text: "Track limits: warning, 1 of 4 points", tone: "warn" },
  { lap: 5, at: 0.18, kind: "flag", text: "Yellow flag in S2 (R. Moreau)", tone: "warn" },
  { lap: 5, at: 0.55, kind: "flag", text: "Yellow flags cleared", tone: "warn" },
  { lap: 6, at: 0.41, kind: "contact", text: "Heavy contact with D. Varga (#23)", tone: "bad" },
  { lap: 6, at: 0.42, kind: "damage", text: "Major damage: bodywork, front-left suspension (1 part off)", tone: "bad" },
  { lap: 9, at: 0.71, kind: "limits", text: "Track limits: warning, 2 of 4 points", tone: "warn" },
  { lap: 10, at: 0.66, kind: "penalty", text: "Drive-through for track limits", tone: "bad" },
  { lap: 11, at: 0.97, kind: "penalty", text: "Served the drive-through" },
  { lap: 14, at: 0.29, kind: "limits", text: "Lap invalidated: cut the track", tone: "warn" },
  { lap: 17, at: 0.83, kind: "contact", text: "Light contact with the wall", tone: "warn" },
];

const where = (lap: number) => `P${RL_POS[lap]} (P${RL_CLASS_POS[lap]} in ${RL_CLASS})`;
const places = (n: number) => `${n} place${n === 1 ? "" : "s"}`;

/** `2:18.644` */
export function rlLap(ms: number) {
  const m = Math.floor(ms / 60000);
  const s = ((ms % 60000) / 1000).toFixed(3).padStart(6, "0");
  return `${m}:${s}`;
}

/** Race clock, `m:ss` (the race is under an hour, so the column stays one width). */
export function rlClock(sec: number) {
  const t = Math.floor(sec);
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
}

function build(): RaceLogEvent[] {
  const ends: number[] = [0];
  for (const ms of LAP_MS) ends.push(ends[ends.length - 1] + ms / 1000);

  const events: (RaceLogEvent & { order: number })[] = [];
  events.push({ raceS: 0, lap: 0, kind: "start", text: `Green flag. Started ${where(0)}`, order: 0 });

  LAP_MS.forEach((ms, i) => {
    const n = i + 1;
    const end = ends[n];
    const tag = LAP_TAGS[n] ?? {};
    events.push({
      raceS: end,
      lap: n,
      kind: "lap",
      text: `Lap ${n}  ${rlLap(ms)}${tag.rest ? `  ${tag.rest}` : ""}`,
      lapTime: rlLap(ms),
      lapRest: tag.rest,
      lapRank: tag.rank,
      lapInvalid: tag.invalid,
      order: 1,
    });
    if (tag.rest === "pit in") events.push({ raceS: end, lap: n, kind: "pit", text: "Pit stop", order: 2 });

    if (n === LAP_MS.length) return;
    const gained = RL_POS[n - 1] - RL_POS[n];
    const classGained = RL_CLASS_POS[n - 1] - RL_CLASS_POS[n];
    if (!gained && !classGained) return;
    const now = `now ${where(n)}`;
    const text = gained
      ? `${gained > 0 ? "Gained" : "Lost"} ${places(Math.abs(gained))}, ${now}`
      : `${classGained > 0 ? "Gained" : "Lost"} ${places(Math.abs(classGained))} in class, ${now}`;
    const up = gained ? gained > 0 : classGained > 0;
    events.push({ raceS: end, lap: n, kind: "position", text, dir: up ? "gain" : "loss", order: 3 });
  });

  for (const e of INCIDENTS) {
    const raceS = ends[e.lap - 1] + (ends[e.lap] - ends[e.lap - 1]) * e.at;
    events.push({ raceS, lap: e.lap, kind: e.kind, text: e.text, tone: e.tone, order: 1 });
  }

  const last = LAP_MS.length;
  events.push({
    raceS: ends[last],
    lap: last,
    kind: "finish",
    text: `Chequered flag. Finished ${where(last)}, ${last} laps`,
    order: 4,
  });

  return events
    .sort((a, b) => a.raceS - b.raceS || a.order - b.order)
    .map(({ order: _order, ...e }) => e);
}

export const RL_EVENTS: readonly RaceLogEvent[] = build();

export const RL_LAPS = LAP_MS.length;

/** The kinds a steward reads, and what the Incidents filter keeps. */
export const RL_INCIDENT_KINDS: ReadonlySet<RaceLogKind> = new Set(["contact", "damage", "limits", "penalty", "flag"]);

/** Rows that carry a Replay button: things that happened to the car at a moment. */
export const RL_REPLAYABLE: ReadonlySet<RaceLogKind> = new Set(["contact", "damage", "limits", "penalty"]);

export const RL_KIND_WORD: Record<RaceLogKind, string> = {
  start: "Start",
  flag: "Flag",
  lap: "Lap",
  position: "Position",
  contact: "Contact",
  damage: "Damage",
  limits: "Limits",
  penalty: "Penalty",
  pit: "Pit",
  driver: "Driver",
  finish: "Finish",
};

const count = (kind: RaceLogKind) =>
  RL_EVENTS.filter((e) => e.kind === kind && !/^Served\b/.test(e.text)).length;

export const RL_COUNTS = {
  contacts: count("contact"),
  limits: count("limits"),
  penalties: count("penalty"),
  incidents: RL_EVENTS.filter((e) => RL_REPLAYABLE.has(e.kind)).length,
};

/**
 * The incidents, as Copy as text pastes them into Discord or a protest: the
 * app's `copyText`, one heading line naming the race, then fixed columns.
 */
export function rlCopyText(): string {
  const shown = RL_EVENTS.filter((e) => RL_INCIDENT_KINDS.has(e.kind));
  const times = shown.map((e) => rlClock(e.raceS));
  const laps = shown.map((e) => (e.lap > 0 ? `L${e.lap}` : "-"));
  const tw = Math.max(...times.map((t) => t.length));
  const lw = Math.max(...laps.map((t) => t.length));
  const kw = Math.max(...shown.map((e) => RL_KIND_WORD[e.kind].length));
  const head = `${RL_TRACK} · ${RL_DATE} ${RL_STARTED} · #${RL_CAR_NUMBER} ${RL_CLASS}`;
  const lines = shown.map(
    (e, i) =>
      `${times[i].padStart(tw)}  ${laps[i].padEnd(lw)}  ${RL_KIND_WORD[e.kind].toUpperCase().padEnd(kw)}  ${e.text}`,
  );
  return [head, ...lines].join("\n");
}
