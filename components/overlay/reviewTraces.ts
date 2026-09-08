/**
 * The lap behind the Review mock.
 *
 * The app draws its channels against DISTANCE round the circuit rather than
 * against time — that is the whole reason two laps line up at the same corner
 * instead of drifting apart — so this does the same: one sample per fixed
 * slice of road, and every channel derived from one speed profile so the
 * traces cannot disagree with each other.
 *
 * The delta band and the micro-sector chips are integrated from the two speed
 * profiles rather than invented, which is why a chip that says it lost time is
 * always sitting under a stretch where the cyan line is below the dashed one.
 *
 * Deterministic and computed once at module load: there is no randomness here
 * and nothing to recompute per request.
 */

/** Samples round the lap. Enough to draw a braking edge as an edge. */
export const RV_SAMPLES = 340;

/** Circuit of the Americas, as the bundled circuit file measures it. */
export const RV_LENGTH_M = 5497;

type Corner = {
  /** Where the apex sits, 0–1 round the lap. */
  at: number;
  /** Minimum speed through it, kph. */
  v: number;
  /** How long the braking zone into it is, as a fraction of the lap. */
  brake: number;
  /** How long it takes to get back to full speed. */
  exit: number;
  /** Positive turns right. */
  hand: 1 | -1;
};

/**
 * COTA's braking points, near enough. Turn 1 is the steep left-hander at the
 * top of the hill, 11 is the hairpin at the end of the back straight, and the
 * esses between 3 and 6 are quick enough not to be braking events at all.
 */
const CORNERS: Corner[] = [
  { at: 0.048, v: 88, brake: 0.027, exit: 0.083, hand: -1 },
  { at: 0.108, v: 158, brake: 0.016, exit: 0.052, hand: 1 },
  { at: 0.146, v: 164, brake: 0.012, exit: 0.042, hand: -1 },
  { at: 0.182, v: 168, brake: 0.011, exit: 0.040, hand: 1 },
  { at: 0.222, v: 160, brake: 0.012, exit: 0.047, hand: -1 },
  { at: 0.278, v: 104, brake: 0.025, exit: 0.073, hand: 1 },
  { at: 0.352, v: 126, brake: 0.022, exit: 0.066, hand: -1 },
  { at: 0.422, v: 94, brake: 0.026, exit: 0.078, hand: 1 },
  { at: 0.508, v: 138, brake: 0.019, exit: 0.059, hand: -1 },
  { at: 0.586, v: 112, brake: 0.024, exit: 0.071, hand: 1 },
  { at: 0.702, v: 68, brake: 0.031, exit: 0.092, hand: -1 },
  { at: 0.782, v: 122, brake: 0.021, exit: 0.064, hand: 1 },
  { at: 0.834, v: 134, brake: 0.017, exit: 0.054, hand: -1 },
  { at: 0.884, v: 100, brake: 0.025, exit: 0.073, hand: 1 },
  { at: 0.948, v: 116, brake: 0.023, exit: 0.068, hand: -1 },
];

const VMAX = 250;

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

/** Distance round a closed lap, so a corner at 0.99 still slows the start. */
function wrapDelta(x: number, at: number) {
  let d = x - at;
  if (d > 0.5) d -= 1;
  if (d < -0.5) d += 1;
  return d;
}

/**
 * The speed profile. A corner is a well in the trace: braking into it is short
 * and steep, getting out of it is long and shallow, which is the asymmetry
 * that makes a speed trace look like a speed trace.
 */
function speedAt(x: number, wobble: number, lift: number) {
  let v = VMAX;
  for (const c of CORNERS) {
    const d = wrapDelta(x, c.at + wobble * 0.004 * Math.sin(c.at * 31));
    const reach = d < 0 ? c.brake : c.exit;
    const t = clamp(Math.abs(d) / reach, 0, 1);
    // Braking is close to linear; the exit is a curve that flattens out.
    const shape = d < 0 ? t : 1 - (1 - t) ** 2;
    const cv = c.v * (1 + lift * (0.03 + 0.06 * Math.sin(c.at * 17 + 1.3)));
    v = Math.min(v, cv + (VMAX - cv) * shape);
  }
  return v;
}

function buildSpeed(wobble: number, lift: number) {
  const out: number[] = [];
  for (let i = 0; i < RV_SAMPLES; i++) out.push(speedAt(i / RV_SAMPLES, wobble, lift));
  // One smoothing pass: the sim's own trace is not made of straight facets.
  return out.map((_, i) => {
    const a = out[(i - 1 + RV_SAMPLES) % RV_SAMPLES];
    const b = out[(i + 1) % RV_SAMPLES];
    return (a + 2 * out[i] + b) / 4;
  });
}

/**
 * The pedals, taken from the corner geometry rather than from the speed trace.
 *
 * Differentiating the speed profile gives a brake channel that saturates into
 * rectangles, because constant deceleration is a constant. A real trace has a
 * shape: pressure peaks the moment the pedal is hit and trails off all the way
 * to the apex, and the throttle comes back progressively on the way out.
 */
function pedals(wobble: number, lift: number) {
  const throttle: number[] = [];
  const brake: number[] = [];

  for (let i = 0; i < RV_SAMPLES; i++) {
    const x = i / RV_SAMPLES;
    let br = 0;
    let th = 100;

    for (const c of CORNERS) {
      const at = c.at + wobble * 0.004 * Math.sin(c.at * 31);
      const cv = c.v * (1 + lift * (0.03 + 0.06 * Math.sin(c.at * 17 + 1.3)));
      const d = wrapDelta(x, at);

      if (d < 0 && -d <= c.brake) {
        // Into the corner: full pressure on application, trailing to the apex.
        const u = 1 + d / c.brake; // 0 where the pedal goes down, 1 at the apex
        const peak = clamp(((VMAX - cv) / VMAX) * 138, 22, 100);
        br = Math.max(br, peak * (1 - u) ** 0.55);
        th = Math.min(th, 0);
      } else if (d >= 0 && d <= c.exit) {
        // Out of it: the throttle comes back progressively, not as a switch.
        const u = clamp(d / (c.exit * 0.55), 0, 1);
        th = Math.min(th, 18 + 82 * u ** 0.6);
      }
    }

    brake.push(br);
    throttle.push(th);
  }

  return { throttle, brake };
}

const GEARS = [0, 70, 105, 140, 178, 214, 250];

function gearsFrom(speed: number[]) {
  return speed.map((v) => {
    let g = 1;
    for (let i = 1; i < GEARS.length; i++) if (v >= GEARS[i]) g = i + 1;
    return g;
  });
}

/** Steering: which way the road is bending, and how hard, at this point. */
function steerFrom() {
  const out: number[] = [];
  for (let i = 0; i < RV_SAMPLES; i++) {
    const x = i / RV_SAMPLES;
    let s = 0;
    for (const c of CORNERS) {
      const d = wrapDelta(x, c.at);
      const reach = (c.brake + c.exit) * 0.9;
      const t = clamp(1 - Math.abs(d) / reach, 0, 1);
      s += c.hand * t * t * (1 - c.v / VMAX) * 96;
    }
    out.push(clamp(s, -62, 62));
  }
  return out;
}

const speedMine = buildSpeed(0, 0);
const speedRef = buildSpeed(1, 1);
const pedalsMine = pedals(0, 0);
const pedalsRef = pedals(1, 1);

/**
 * The delta, integrated from both speed profiles. Time to cover one slice of
 * road is that slice divided by the speed across it, so summing the difference
 * gives a delta that is genuinely the gap the two traces describe — positive
 * where the lap being studied is behind.
 */
function buildDelta() {
  const slice = RV_LENGTH_M / RV_SAMPLES;
  const out: number[] = [];
  let acc = 0;
  for (let i = 0; i < RV_SAMPLES; i++) {
    const mine = slice / Math.max(8, speedMine[i] / 3.6);
    const ref = slice / Math.max(8, speedRef[i] / 3.6);
    acc += mine - ref;
    out.push(acc);
  }
  return out;
}

const delta = buildDelta();

/** The lap being studied. */
export const RV_LAP = {
  speed: speedMine,
  throttle: pedalsMine.throttle,
  brake: pedalsMine.brake,
  gear: gearsFrom(speedMine),
  steer: steerFrom(),
} as const;

/** The lap it is laid over — drawn dashed, in each channel's own colour. */
export const RV_REF = {
  speed: speedRef,
  throttle: pedalsRef.throttle,
  brake: pedalsRef.brake,
} as const;

export const RV_DELTA: readonly number[] = delta;

/** Where traction control and ABS stepped in — the ticks under the pedals. */
export const RV_TC: readonly number[] = RV_LAP.throttle.map((t, i) =>
  t > 45 && t < 99 && RV_LAP.speed[i] < 165 ? 1 : 0,
);
export const RV_ABS: readonly number[] = RV_LAP.brake.map((b) => (b > 62 ? 1 : 0));

/**
 * The chips: one per stretch of road of about 500 m, carrying what that
 * stretch cost or gained. Taken as the change in the delta across it, so a
 * chip and the band above it always tell the same story.
 */
export const RV_MICRO = (() => {
  const count = Math.round(RV_LENGTH_M / 500);
  const per = RV_SAMPLES / count;
  const out: { no: number; delta: number }[] = [];
  for (let i = 0; i < count; i++) {
    const from = i === 0 ? 0 : delta[Math.floor(i * per) - 1];
    const to = delta[Math.min(RV_SAMPLES - 1, Math.floor((i + 1) * per) - 1)];
    out.push({ no: i + 1, delta: to - from });
  }
  return out;
})();

/** Lap times, integrated from the same profiles the traces are drawn from. */
function lapTimeMs(speed: number[]) {
  const slice = RV_LENGTH_M / RV_SAMPLES;
  let t = 0;
  for (const v of speed) t += slice / Math.max(8, v / 3.6);
  return Math.round(t * 1000);
}

export const RV_LAP_MS = lapTimeMs(speedMine);
export const RV_REF_MS = lapTimeMs(speedRef);

/** `1:46.695` — the one format every timing screen in the sport agrees on. */
export function rvLap(ms: number) {
  const m = Math.floor(ms / 60000);
  const s = (ms - m * 60000) / 1000;
  return `${m}:${s.toFixed(3).padStart(6, "0")}`;
}

/** `+0.29` / `-0.14`, with the sign always shown. */
export function rvDelta(seconds: number, dp = 2) {
  return `${seconds >= 0 ? "+" : "−"}${Math.abs(seconds).toFixed(dp)}`;
}

/** The point of road the cursor is parked on in the mock. */
export const RV_CURSOR = Math.round(RV_SAMPLES * 0.702);

export const RV_VMAX_MPH = Math.round((Math.max(...speedMine) / 1.609344) * 10) / 10;

/**
 * Turn a channel into an SVG path across a band. `min`/`max` fix the axis so
 * the lap and the lap under it are drawn to the same scale — the compare trace
 * rescaling itself would be a lie.
 */
export function rvPath(
  values: readonly number[],
  opts: { w: number; h: number; min: number; max: number; step?: boolean; close?: boolean },
) {
  const { w, h, min, max, step = false, close = false } = opts;
  const span = max - min || 1;
  const x = (i: number) => (i / (values.length - 1)) * w;
  const y = (v: number) => h - ((clamp(v, min, max) - min) / span) * h;

  let d = "";
  values.forEach((v, i) => {
    if (i === 0) {
      d += `M${x(i).toFixed(1)} ${y(v).toFixed(1)}`;
    } else if (step) {
      d += `H${x(i).toFixed(1)}V${y(v).toFixed(1)}`;
    } else {
      d += `L${x(i).toFixed(1)} ${y(v).toFixed(1)}`;
    }
  });
  if (close) d += `L${w} ${h}L0 ${h}Z`;
  return d;
}
