import { Mic, Radio } from "lucide-react";
import {
  DamagePredictorMock,
  FuelMock,
  RaceControlMock,
  RadarMock,
  RefPaceMock,
  RelativeMock,
  TrackLimitsMock,
  TyreTempMock,
} from "@/components/overlay/OverlayMocks";
import type { StintBeat } from "@/components/aio/broadcast/StintStory";

/**
 * The stint story's beats, built on the server so the mocks render there.
 *
 * The radar carries a fixed SVG id: this is its only appearance on the hub
 * (the hero frame has the track map and speedo, for the same reason).
 *
 * The laps line up with the mocks' own data: the fuel and relative widgets
 * are drawn on lap 12 of 40, with 10.1 laps of energy left.
 */
export const STINT_TOTAL_LAPS = 40;

/** Two lines of push-to-talk radio, in the engineer panel's styling. */
function RadioExchange() {
  const lines = [
    { who: "you", text: "Fuel to the end?" },
    { who: "eng", text: "Energy's the limit. Ten laps in it, twelve in the fuel. You'll need a stop." },
  ] as const;
  return (
    <ul
      aria-label="Example race engineer radio exchange"
      className="space-y-2 rounded-lg border border-line bg-[#080a0f] p-3"
    >
      {lines.map((line) => (
        <li
          key={line.text}
          className={
            line.who === "you"
              ? "ml-10 flex items-start gap-3 rounded-md border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-ink"
              : "mr-10 flex items-start gap-3 rounded-md border border-line bg-surface/60 px-3 py-2 text-sm text-muted"
          }
        >
          {line.who === "you" ? (
            <Mic size={15} className="mt-0.5 shrink-0 text-accent-2" aria-label="You, on push-to-talk" />
          ) : (
            <Radio size={15} className="mt-0.5 shrink-0 text-cyan" aria-label="Engineer" />
          )}
          <span className="flex-1">{line.text}</span>
        </li>
      ))}
    </ul>
  );
}

export const STINT_BEATS: readonly StintBeat[] = [
  {
    id: "lights-out",
    lap: 1,
    label: "Lights out",
    title: "Five reds, then green",
    body: (
      <>
        <p>
          Race Control shows the start lights and the race state, then keeps a sector rail up for
          the whole race. A local yellow in S2 lights S2 and nothing else.
        </p>
        <p>
          Track limits count in the stewards&apos; own points from the first corner: allowance
          left, what each cut was charged, and any penalty named as it lands.
        </p>
      </>
    ),
    onScreen: "Race Control · Track Limits",
    visual: (
      <div className="grid gap-4">
        <RaceControlMock />
        <TrackLimitsMock />
      </div>
    ),
  },
  {
    id: "traffic",
    lap: 6,
    label: "Traffic",
    title: "Hypercars coming through",
    body: (
      <>
        <p>
          The radar draws every car to one scale on both axes, so a car alongside is drawn
          alongside. A faster class closing from behind gets a halo.
        </p>
        <p>
          The relative puts a blue-flag banner over the list with the car lapping you and the gap
          to it. Cars to yield to are tinted blue and traffic amber.
        </p>
      </>
    ),
    onScreen: "Radar · Relative",
    visual: (
      <div className="grid items-center gap-4 sm:grid-cols-[200px_minmax(0,1fr)]">
        <RadarMock className="rounded-lg border border-line bg-[#080a0f] p-3" />
        <RelativeMock />
      </div>
    ),
  },
  {
    id: "fuel-call",
    lap: 12,
    label: "Fuel call",
    title: "Fuel to the end?",
    body: (
      <>
        <p>
          Press the button on your wheel and ask. The answer comes back over radio effects in under
          a second, worked out from your live telemetry.
        </p>
        <p>
          28 questions like this one are answered on your PC, offline and free. Anything else goes
          to the AI engineer, with your voice transcribed locally.
        </p>
      </>
    ),
    onScreen: "Race engineer · Fuel",
    visual: (
      <div className="grid gap-4">
        <RadioExchange />
        <FuelMock />
      </div>
    ),
  },
  {
    id: "pit-window",
    lap: 22,
    label: "Pit window",
    title: "In the box",
    body: (
      <>
        <p>
          Pit changes go over LMU&apos;s own REST API. Fuel, tyres and pressures are set from a
          wheel button with the in-game MFD off screen, and every value is read back from the game.
        </p>
        <p>
          When the car stops, the damage panel becomes a countdown to release, built from the
          sim&apos;s own repair estimate. Repair and tyre time sit side by side, never summed.
        </p>
      </>
    ),
    onScreen: "Damage & Repair · Tyre Temps",
    visual: (
      <div className="grid gap-4">
        <DamagePredictorMock />
        <TyreTempMock />
      </div>
    ),
  },
  {
    id: "chequered-flag",
    lap: 40,
    label: "Chequered flag",
    title: "Where the time went",
    body: (
      <>
        <p>
          Every lap was written to a file as you drove it. Review reads them back with no account
          and no upload: speed, pedals, gear and steering against distance, a second lap laid
          underneath, and a chip per 500 m showing what each stretch cost.
        </p>
        <p>
          Reference Pace puts your best lap against alien pace for your class and layout, on Ohne
          Speed&apos;s reference times.
        </p>
      </>
    ),
    onScreen: "Reference Pace · Review",
    visual: <RefPaceMock large />,
  },
];
