import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAioPage, type AioPageKey } from "@/lib/aio-pages";

/**
 * The apps the league builds, linked from the home page by the words people
 * search for. The home page is the strongest page on the site, and until this
 * block it only reached Apex AIO through the header's Apps menu, which left the
 * topic pages two clicks deep for search engines.
 */
const AIO_LINKS: { key: AioPageKey; blurb: string }[] = [
  { key: "overlays", blurb: "Twenty overlays for OBS or over the sim, including a working MFD." },
  { key: "setups", blurb: "Community setups ranked by verified laps, plus a live setup editor." },
  { key: "race-engineer", blurb: "Ask for gaps, fuel or pit windows on push-to-talk." },
  { key: "pit-wall", blurb: "A live endurance pit wall for the crew, in the app or a browser." },
  { key: "telemetry", blurb: "Every lap you've driven, your optimal lap and lap-vs-lap traces." },
];

export function LeagueApps() {
  return (
    <section className="container-rail py-20">
      <header className="mb-10 max-w-2xl">
        <span className="kicker mb-3">Built by the league</span>
        <h2 className="text-4xl font-bold text-ink sm:text-5xl">Our Le Mans Ultimate apps</h2>
        <p className="mt-4 text-muted">
          We race LMU every week, so we built the tools we wanted. Apex AIO is the all-in-one app we
          built for LMU. LMU Livery Studio is free for everyone.
        </p>
      </header>

      <div className="grid gap-px border border-line bg-line lg:grid-cols-[1.4fr_1fr]">
        <div className="bg-base p-6 sm:p-8">
          <Link
            href={getAioPage("overview").path}
            className="group inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-widest text-cyan"
          >
            Apex AIO · 7 days free
            <ArrowRight size={14} aria-hidden className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <ul className="mt-4 border-t border-line">
            {AIO_LINKS.map(({ key, blurb }) => {
              const page = getAioPage(key);
              return (
                <li key={key} className="border-b border-line">
                  <Link
                    href={page.path}
                    className="group grid gap-1 py-3.5 sm:grid-cols-[12rem_1fr_auto] sm:items-baseline sm:gap-4"
                  >
                    <span className="font-display text-lg font-bold uppercase tracking-wide text-ink group-hover:text-cyan">
                      {page.breadcrumb}
                    </span>
                    <span className="text-sm text-muted">{blurb}</span>
                    <ArrowRight size={14} aria-hidden className="hidden text-subtle group-hover:text-cyan sm:block" />
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            href="/lmu-apps-compared"
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted underline decoration-line underline-offset-4 hover:text-cyan"
          >
            How it compares with SimHub, RaceLab and Crew Chief
          </Link>
        </div>

        <Link href="/lmu-livery-studio" className="group flex flex-col justify-between bg-base p-6 sm:p-8">
          <div>
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-accent">Free</span>
            <h3 className="mt-2 text-3xl font-bold text-ink group-hover:text-cyan">LMU Livery Studio</h3>
            <p className="mt-3 text-muted">
              Design Hypercar, LMP2, LMP3 and LMGT3 liveries in your browser, then let the companion app install them
              into the game.
            </p>
          </div>
          <span className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-ink group-hover:text-cyan">
            Open the livery creator
            <ArrowRight size={14} aria-hidden className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>
    </section>
  );
}
