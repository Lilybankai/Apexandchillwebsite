import {
  RaceControlMock,
  RelativeMock,
  SpeedoMock,
  StandingsMock,
  TrackMapMock,
} from "@/components/overlay/OverlayMocks";
import { HeroVideoLayer, Timecode } from "@/components/aio/broadcast/BroadcastClient";
import { ScaledStage } from "@/components/aio/broadcast/ScaledStage";
import { cn } from "@/lib/utils";

/**
 * The hub hero's picture: a paused frame of an LMU stream, with the real
 * widgets (rebuilt from the app's own rendering code) sitting where streamers
 * actually put them. Standings down the left, race control top centre,
 * relative top right, speedo bottom centre, track map bottom right.
 *
 * The track map and speedo carry fixed SVG ids, so this is the only place on
 * the hub they may appear. The radar lives in the stint story for the same
 * reason.
 *
 * Everything inside the stage is laid out in 1600×900 logical pixels and
 * scaled as one piece by ScaledStage.
 */

/** What is where, for the legend under the frame and for screen readers. */
const LEGEND: readonly { where: string; name: string; body: string }[] = [
  {
    where: "Top left",
    name: "Standings",
    body: "The whole field grouped by class, with gaps, average and best laps.",
  },
  {
    where: "Top centre",
    name: "Race control",
    body: "Flags, start lights and local yellows by sector, without the stock HUD.",
  },
  {
    where: "Top right",
    name: "Relative",
    body: "The cars around you, and a blue-flag banner when a faster class is lapping you.",
  },
  {
    where: "Bottom centre",
    name: "Speedo",
    body: "Speed, gear and revs, with fuel and energy in the left well.",
  },
  {
    where: "Bottom right",
    name: "Track map",
    body: "Every car as a dot in its class colour, in true world coordinates.",
  },
];

/** The fallback "sim viewport": dark sky over asphalt, a road to a vanishing point. */
function SimViewport() {
  const vp = { x: 800, y: 500 };
  // Faint streaks running out from the vanishing point, like trackside
  // detail rushing past at speed. [end x, end y, duration s, delay s]
  const streaks: [number, number, number, number][] = [
    [0, 610, 2.4, 0],
    [0, 780, 1.9, -0.7],
    [160, 900, 1.6, -1.1],
    [1600, 640, 2.2, -0.4],
    [1600, 800, 1.8, -1.3],
    [1440, 900, 1.5, -0.2],
  ];

  return (
    <svg
      aria-hidden
      viewBox="0 0 1600 900"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
    >
      <defs>
        <linearGradient id="bfSky" x1="0" y1="0" x2="0" y2="500" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#020308" />
          <stop offset="0.7" stopColor="#0a0e1b" />
          <stop offset="1" stopColor="#141b2e" />
        </linearGradient>
        <linearGradient id="bfGround" x1="0" y1="500" x2="0" y2="900" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0c0f16" />
          <stop offset="1" stopColor="#040509" />
        </linearGradient>
        <linearGradient id="bfRoad" x1="0" y1="500" x2="0" y2="900" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#12151d" />
          <stop offset="1" stopColor="#0a0c12" />
        </linearGradient>
      </defs>

      <rect width="1600" height="500" fill="url(#bfSky)" />
      <rect y="500" width="1600" height="400" fill="url(#bfGround)" />

      {/* A low treeline on the horizon */}
      <path
        d="M0 500 L0 478 Q120 466 260 474 T560 468 T860 476 T1180 466 T1460 474 L1600 470 L1600 500 Z"
        fill="#06080e"
      />
      <line x1="0" y1="500" x2="1600" y2="500" stroke="rgba(130,170,255,0.14)" strokeWidth="1.5" />

      {/* The road */}
      <path d={`M${vp.x - 18} ${vp.y} L${vp.x + 18} ${vp.y} L1480 900 L120 900 Z`} fill="url(#bfRoad)" />
      <path
        d={`M${vp.x - 18} ${vp.y} L120 900 M${vp.x + 18} ${vp.y} L1480 900`}
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="3"
        fill="none"
      />
      <path
        d={`M${vp.x} ${vp.y + 4} L${vp.x} 900`}
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="5"
        strokeDasharray="30 50"
        className="bf-dash"
        fill="none"
      />

      {streaks.map(([x, y, dur, delay]) => (
        <path
          key={`${x}-${y}`}
          d={`M${vp.x} ${vp.y} L${x} ${y}`}
          stroke="rgba(170,200,255,0.06)"
          strokeWidth="2"
          strokeDasharray="70 330"
          className="bf-streak"
          style={{ animationDuration: `${dur}s`, animationDelay: `${delay}s` }}
          fill="none"
        />
      ))}
    </svg>
  );
}

/** The broadcast bug: LIVE, the lap, and the stream timecode. */
function BroadcastBug() {
  return (
    <div className="absolute bottom-[28px] left-[28px] flex items-stretch overflow-hidden rounded-[4px] border border-white/10 font-mono text-[14px] uppercase leading-none tracking-[0.12em] text-white/85 shadow-[0_4px_14px_rgba(0,0,0,0.55)]">
      <span className="flex items-center gap-2 bg-[#e0243d] px-3 py-[9px] font-bold text-white">
        <span className="bf-rec h-[8px] w-[8px] rounded-full bg-white" />
        Live
      </span>
      <span className="flex items-center bg-[#090a12]/90 px-3 tabular-nums">Lap 12/40</span>
      <span className="flex items-center border-l border-white/10 bg-[#090a12]/90 px-3 text-white/55">
        LMU · Race
      </span>
      <span className="flex items-center border-l border-white/10 bg-[#090a12]/90 px-3 tabular-nums text-white/70">
        <Timecode />
      </span>
    </div>
  );
}

export function BroadcastFrame({ className }: { className?: string }) {
  return (
    <figure className={cn("relative", className)}>
      <ScaledStage className="rounded-[10px] border border-line bg-[#04050a] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]">
        <SimViewport />
        <HeroVideoLayer />
        {/* Vignette: the edges fall away so the overlays carry the frame */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 75% 70% at 50% 52%, transparent 40%, rgba(0,0,0,0.7) 100%)" }}
        />

        {/* The overlays, where a stream puts them. Hidden from assistive tech:
            the legend below says what they show in words. */}
        <div aria-hidden className="absolute inset-0">
          <StandingsMock className="absolute left-[28px] top-[28px] w-[440px]" />
          <RaceControlMock className="absolute left-1/2 top-[28px] w-[300px] -translate-x-1/2" />
          <RelativeMock className="absolute right-[28px] top-[28px] w-[440px]" />
          <SpeedoMock className="absolute bottom-[20px] left-1/2 w-[540px] -translate-x-1/2" />
          <TrackMapMock className="absolute bottom-[28px] right-[28px] w-[380px]" />
          <BroadcastBug />
        </div>
      </ScaledStage>

      <figcaption>
        <span className="sr-only">
          A paused frame of a Le Mans Ultimate stream with Apex AIO overlays on it.{" "}
        </span>
        <ol className="mt-4 grid gap-x-6 gap-y-3 border-t border-line pt-4 sm:grid-cols-2 lg:grid-cols-5">
          {LEGEND.map((item, i) => (
            <li key={item.name} className={cn("text-sm", i > 2 && "hidden sm:block")}>
              <span className="block font-mono text-[10px] uppercase tracking-[0.22em] text-subtle">
                <span className="tabular-nums text-cyan">{String(i + 1).padStart(2, "0")}</span> · {item.where}
              </span>
              <span className="mt-1 block text-muted">
                <strong className="font-semibold text-ink">{item.name}.</strong> {item.body}
              </span>
            </li>
          ))}
        </ol>
      </figcaption>
    </figure>
  );
}
