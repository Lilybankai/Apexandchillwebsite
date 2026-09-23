import {
  RaceControlMock,
  RelativeMock,
  SpeedoMock,
  StandingsMock,
  TrackMapMock,
} from "@/components/overlay/OverlayMocks";
import { HeroVideoLayer } from "@/components/aio/broadcast/BroadcastClient";
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
 * It is a still: the widgets' own ambient motion is switched off here
 * (`.bf-still`), and the canvas behind them is plain, so the frame shows the
 * product and nothing pretends to be footage.
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

/** The stage's top strip: what the frame is, stated plainly. */
function CanvasBar() {
  return (
    <div className="absolute inset-x-0 top-0 flex h-[40px] items-center justify-between border-b border-white/[0.06] px-[28px] font-mono text-[13px] uppercase tracking-[0.2em] text-white/40">
      <span>OBS canvas · 1920×1080</span>
      <span>Apex AIO overlays · LMU race, lap 12 of 40</span>
    </div>
  );
}

export function BroadcastFrame({ className }: { className?: string }) {
  return (
    <figure className={cn("relative", className)}>
      <ScaledStage className="rounded-[10px] border border-line bg-[#04050a] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]">
        {/* A plain, still canvas: no painted scenery. Real gameplay goes
            behind the overlays only once HERO_VIDEO points at a capture. */}
        <HeroVideoLayer />
        <CanvasBar />

        {/* The overlays, where a stream puts them. Hidden from assistive tech:
            the legend below says what they show in words. */}
        <div aria-hidden className="bf-still absolute inset-0">
          <StandingsMock className="absolute left-[28px] top-[64px] w-[440px]" />
          <RaceControlMock className="absolute left-1/2 top-[64px] w-[300px] -translate-x-1/2" />
          <RelativeMock className="absolute right-[28px] top-[64px] w-[440px]" />
          <SpeedoMock className="absolute bottom-[20px] left-1/2 w-[540px] -translate-x-1/2" />
          <TrackMapMock className="absolute bottom-[28px] right-[28px] w-[380px]" />
        </div>
      </ScaledStage>

      <figcaption>
        <span className="sr-only">
          Apex AIO overlays laid out on a 1920×1080 stream canvas.{" "}
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
