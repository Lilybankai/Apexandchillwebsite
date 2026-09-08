import { ArrowRight, Globe, Laptop, Smartphone, Tablet, Wifi } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { AIO_PRODUCT } from "@/lib/aio";

const { webBoardsUrl: WEB_BOARDS_URL, webBoardsLabel: WEB_BOARDS_LABEL } = AIO_PRODUCT;

/**
 * The Team and Solo engineer boards are not locked inside the desktop app —
 * they are served on the web too. This band exists to make that address
 * impossible to miss, because it's the single feature people assume isn't
 * there.
 */
const DEVICES = [
  {
    icon: Smartphone,
    title: "On a phone",
    body: "Follow the stint from the sofa, the garage or the other side of the country.",
  },
  {
    icon: Tablet,
    title: "On a tablet",
    body: "A second pit-wall screen next to the wheel without a second PC.",
  },
  {
    icon: Laptop,
    title: "On any other machine",
    body: "Mac, Linux, a work laptop — anything with a browser opens the same board.",
  },
] as const;

export function RemoteBoards() {
  return (
    <section
      id="web-boards"
      className="scroll-mt-24 border-y border-accent/40 bg-gradient-to-r from-accent/15 via-accent-2/10 to-cyan/15"
    >
      <div className="container-rail py-16">
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <span className="kicker mb-4">Your boards, off your PC</span>
              <h2 className="text-4xl font-bold text-ink sm:text-5xl">
                The engineer boards open in{" "}
                <span className="text-gradient">any browser</span>
              </h2>
              <p className="mt-5 text-lg text-muted">
                The Team pit wall and the Solo engineer board don&apos;t only live in the app. Sign
                in on the web and the same live board — timing, fuel, tyres, strategy, weather and
                the track map — opens on whatever device is in your hand, for as long as an Apex
                AIO app is connected to the session.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Button
                  href={WEB_BOARDS_URL}
                  size="lg"
                  clip
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Globe size={18} />
                  Open your boards
                  <ArrowRight size={18} />
                </Button>
                <a
                  href={WEB_BOARDS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-2 rounded-card border border-cyan/40 bg-base/60 px-5 py-4 font-mono text-base font-semibold tracking-tight text-cyan transition-all duration-200 hover:border-cyan hover:bg-base/80 hover:shadow-glow-cyan sm:text-lg"
                >
                  {WEB_BOARDS_LABEL}
                  <ArrowRight
                    size={16}
                    aria-hidden
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </a>
              </div>

              <p className="mt-4 flex items-start gap-2 text-sm text-subtle">
                <Wifi size={16} aria-hidden className="mt-0.5 shrink-0 text-cyan" />
                Same Apex account as the app. The board goes live the moment a connected app starts
                relaying the session, and marks its data live, relayed or stale so nothing stale
                ever reads as current.
              </p>
            </div>

            <ul className="grid gap-3">
              {DEVICES.map((device) => (
                <li
                  key={device.title}
                  className="flex items-start gap-4 rounded-card border border-line bg-base/60 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan/40"
                >
                  <device.icon size={22} aria-hidden className="mt-0.5 shrink-0 text-cyan" />
                  <div>
                    <p className="font-display text-sm uppercase tracking-wide text-ink">
                      {device.title}
                    </p>
                    <p className="mt-1 text-sm text-subtle">{device.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
