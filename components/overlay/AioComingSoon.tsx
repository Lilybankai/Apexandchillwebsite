import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  FuelMock,
  RelativeMock,
  StandingsMock,
  TrackMapMock,
  TyreTempMock,
} from "@/components/overlay/OverlayMocks";

const DISCORD_URL = "https://discord.gg/MBew2Bb2hj";

const TEASERS = [
  { call: "Voice engineer", reply: "Push-to-talk. 28 questions answered offline." },
  { call: "Twenty overlays", reply: "OBS, over the sim, or both at once." },
  { call: "Live setups", reply: "The garage in a panel. Community tunes." },
  { call: "Stream bot", reply: "Twitch and YouTube from the same window." },
] as const;

/**
 * Public stand-in for `/apex-overlay-system` until launch.
 *
 * The signature is a held F1 start gantry — five red lamps, not yet out —
 * in front of a dimmed pit wall of the real overlay widgets. No installer,
 * no trial, no price: Discord is the only next step.
 *
 * Gated by {@link AIO_COMING_SOON} in `lib/aio.ts`. Flip that flag and this
 * component stops rendering.
 */
export function AioComingSoon() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid-lines bg-grid opacity-25 [mask-image:radial-gradient(70%_60%_at_50%_35%,black,transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-accent/15 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-[-8%] h-[320px] w-[320px] rounded-full bg-flag-red/10 blur-[110px]"
      />

      {/* Dimmed pit wall — the product, visible through the garage glass. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden opacity-[0.22] lg:block [mask-image:radial-gradient(55%_50%_at_50%_42%,transparent_18%,black)]"
      >
        <div className="container-rail grid h-full grid-cols-3 items-center gap-6 pt-16">
          <div className="space-y-4">
            <StandingsMock />
            <FuelMock />
          </div>
          <div className="translate-y-8">
            <TrackMapMock large />
          </div>
          <div className="space-y-4">
            <RelativeMock />
            <TyreTempMock />
          </div>
        </div>
      </div>

      <div className="container-rail relative flex min-h-[calc(100dvh-5rem)] flex-col items-center justify-center py-20 text-center">
        <span className="kicker mb-8">Le Mans Ultimate · rFactor 2 · Windows</span>

        {/* Held start lights — the one thing this page should be remembered by. */}
        <StartGantry />

        <p className="mt-8 font-mono text-xs font-semibold uppercase tracking-[0.28em] text-flag-red">
          Formation lap
        </p>

        <h1 className="mt-4 max-w-4xl text-5xl font-bold text-ink sm:text-6xl lg:text-7xl">
          Apex <span className="text-gradient">AIO System</span>
        </h1>

        <p className="mt-5 max-w-xl text-lg text-muted">
          The pit wall is built. Lights out soon.
        </p>
        <p className="mt-3 max-w-2xl text-muted">
          Twenty telemetry overlays, a push-to-talk voice race engineer, live setup
          engineering and a stream bot — one app, one subscription. We&apos;re not on
          the grid yet.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Button href={DISCORD_URL} target="_blank" rel="noopener noreferrer" size="lg" clip>
            <MessageCircle size={18} />
            Join Discord — hear it first
          </Button>
          <Button href="/" variant="outline" size="lg">
            Back to the league
          </Button>
        </div>

        <ul className="mt-14 grid w-full max-w-3xl gap-px overflow-hidden rounded-card border border-line bg-line/60 text-left sm:grid-cols-2">
          {TEASERS.map((row) => (
            <li key={row.call} className="bg-base/80 px-5 py-4">
              <p className="font-display text-sm uppercase tracking-wide text-ink">{row.call}</p>
              <p className="mt-1 text-sm text-muted">{row.reply}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Five red F1 start lamps, held — lights not yet out. */
function StartGantry() {
  return (
    <div
      className="inline-flex flex-col items-center gap-3"
      role="img"
      aria-label="Five red start lights held on, waiting for lights out"
    >
      <div className="rounded-card border border-line bg-elevated/80 px-5 py-3 shadow-glow-soft backdrop-blur-sm">
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              className="h-6 w-6 rounded-full bg-flag-red shadow-[0_0_16px_rgb(var(--color-red)/0.9)] ring-1 ring-flag-red/40 sm:h-7 sm:w-7"
            />
          ))}
        </div>
      </div>
      <span className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-subtle">
        Starting grid · holding
      </span>
    </div>
  );
}
