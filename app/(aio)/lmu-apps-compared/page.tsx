import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AioFaq } from "@/components/aio/AioFaq";
import { AioPageHero } from "@/components/aio/AioPageHero";
import { AioTrialCta } from "@/components/aio/AioTrialCta";
import { JsonLd } from "@/components/aio/JsonLd";
import { SectionHeading } from "@/components/aio/SectionHeading";
import { formatChecked } from "@/components/aio/compare/ComparePage";
import { AIO_PRODUCT } from "@/lib/aio";
import { COMPARE_INDEX, COMPARE_PAGES } from "@/lib/aio-compare";
import { buildCompareBreadcrumbJsonLd, buildCompareMetadata, buildCompareWebPageJsonLd } from "@/lib/aio-compare/seo";
import { cn } from "@/lib/utils";

export const metadata = buildCompareMetadata(COMPARE_INDEX);

/** The trial buttons read the live release. */
export const revalidate = 1800;

const { priceDisplay, trialDays } = AIO_PRODUCT;

type Tool = {
  name: string;
  bestAt: string;
  price: string;
  /** Spotter, overlays, setups, pit wall, voice questions. */
  has: [boolean, boolean, boolean, boolean, boolean];
  href?: string;
};

/**
 * The one-screen summary. Every cell is a cut-down version of a row on that
 * tool's own comparison page, so keep the two in step.
 */
const TOOLS: Tool[] = [
  {
    name: "Apex AIO",
    bestAt: "LMU overlays, race engineer, setups, pit wall and lap review in one app",
    price: `${trialDays}-day trial, then ${priceDisplay}/mo`,
    has: [false, true, true, true, true],
  },
  {
    name: "RaceLab",
    bestAt: "Polished overlays across many sims, with VR",
    price: "Free tier, Pro €4.90/mo",
    has: [false, true, false, false, false],
    href: "/racelab-alternative",
  },
  {
    name: "SimHub",
    bestAt: "Rig hardware: shakers, LEDs, wind, motion and custom dashes",
    price: "Free, optional one-off licence",
    has: [false, true, false, false, false],
    href: "/simhub-alternative",
  },
  {
    name: "Crew Chief",
    bestAt: "The voice spotter, plus a long list of voice commands",
    price: "Free, open source",
    has: [true, false, false, false, true],
    href: "/crew-chief-alternative",
  },
  {
    name: "Coach Dave Delta",
    bestAt: "Pro-built setups for every car, with reference laps",
    price: "From £11.99/mo (UK)",
    has: [false, false, true, false, false],
    href: "/coach-dave-alternative",
  },
];

const COLUMNS = ["Voice spotter", "Overlays", "LMU setups", "Team pit wall", "Voice questions"];

const PAGE_FAQ = [
  {
    q: "What's the best app for Le Mans Ultimate?",
    a: "It depends on what you need. For overlays across several sims, RaceLab is very good. For rig hardware, SimHub. For a voice spotter, Crew Chief, and it's free. For pro setups, Coach Dave. Apex AIO is the one that puts LMU overlays, a voice race engineer, setups, a team pit wall and lap review in a single app.",
  },
  {
    q: "Which LMU apps can I run together?",
    a: "Most of them. A sensible pairing is SimHub for the rig, Crew Chief for spotting and Apex AIO for overlays, setups and the pit wall. They read LMU separately. If you run two voice apps, set one to speak only when asked so they don't talk over each other.",
  },
  {
    q: "Do I need a plugin for LMU overlays?",
    a: "Not for Apex AIO, which works over LMU's own API. RaceLab offers automatic or manual plugin setup. SimHub and Crew Chief now read most of their LMU data from the game's built-in shared memory.",
  },
  {
    q: "How often is this comparison checked?",
    a: "Each page shows the date its facts were last checked against the other tool's own site, and lists its sources. Prices and features change, so tell us on Discord if you spot something out of date.",
  },
];

export default function LmuAppsComparedPage() {
  const checked = formatChecked(COMPARE_INDEX.checked);
  return (
    <>
      <JsonLd data={buildCompareBreadcrumbJsonLd(COMPARE_INDEX)} />
      <JsonLd data={buildCompareWebPageJsonLd(COMPARE_INDEX)} />

      <AioPageHero
        kicker="Compare · Le Mans Ultimate · 2026"
        title={
          <>
            LMU apps, <span className="text-gradient">compared</span>
          </>
        }
        lead="RaceLab, SimHub, Crew Chief, Coach Dave and our own Apex AIO, side by side for Le Mans Ultimate. We make one of them, so we've listed what each of the others does better, and linked our sources."
        points={[`Facts checked ${checked}`, "Sources on every page"]}
      />

      <section className="container-rail py-16">
        <SectionHeading
          index="01"
          label="At a glance"
          title="What each one is for"
          lead="You'll often want two or three of these. The table shows what's built into each one, not what plugins can add."
        />
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[820px] border-collapse border border-line bg-base/70 text-left">
            <caption className="sr-only">Le Mans Ultimate apps compared</caption>
            <thead>
              <tr className="border-b border-line font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">
                <th scope="col" className="px-4 py-3 font-normal">
                  App
                </th>
                <th scope="col" className="px-4 py-3 font-normal">
                  Best at
                </th>
                {COLUMNS.map((column) => (
                  <th key={column} scope="col" className="px-2 py-3 text-center font-normal">
                    {column}
                  </th>
                ))}
                <th scope="col" className="px-4 py-3 font-normal">
                  Price
                </th>
              </tr>
            </thead>
            <tbody>
              {TOOLS.map((tool) => (
                <tr
                  key={tool.name}
                  className={cn("border-b border-line/70 last:border-0", !tool.href && "bg-cyan/[0.04]")}
                >
                  <th scope="row" className="px-4 py-4 align-top font-semibold text-ink">
                    {tool.href ? (
                      <Link href={tool.href} className="hover:text-cyan">
                        {tool.name}
                      </Link>
                    ) : (
                      <span className="text-cyan">{tool.name}</span>
                    )}
                  </th>
                  <td className="px-4 py-4 align-top text-sm text-muted">{tool.bestAt}</td>
                  {tool.has.map((yes, i) => (
                    <td key={COLUMNS[i]} className="px-2 py-4 text-center align-top font-mono text-xs uppercase">
                      {yes ? <span className="text-success">Yes</span> : <span className="text-subtle">No</span>}
                    </td>
                  ))}
                  <td className="px-4 py-4 align-top font-mono text-xs text-ink">{tool.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 max-w-3xl text-sm text-muted">
          &quot;No&quot; can hide a partial answer: RaceLab shares fuel between teammates, SimHub dashboards work in a
          browser on your home network, and Crew Chief has telemetry charts and subtitles on screen. The full pages
          below give the detail.
        </p>
      </section>

      <section className="border-t border-line py-16">
        <div className="container-rail">
          <SectionHeading index="02" label="Head to head" title="The full comparisons" />
          <ul className="border-t border-line">
            {COMPARE_PAGES.map((page) => (
              <li key={page.key} className="border-b border-line">
                <Link
                  href={page.path}
                  className="group grid gap-1 py-5 transition-colors hover:bg-surface/40 sm:grid-cols-[16rem_1fr_auto] sm:items-baseline sm:gap-6 sm:px-2"
                >
                  <span className="font-display text-xl font-bold uppercase tracking-wide text-ink group-hover:text-cyan">
                    {page.breadcrumb}
                  </span>
                  <span className="text-sm text-muted">{page.lead}</span>
                  <ArrowRight
                    size={16}
                    aria-hidden
                    className="hidden self-center text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-cyan sm:block"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <AioFaq items={PAGE_FAQ} heading="LMU apps: questions" className="border-t border-line" />

      <AioTrialCta body="See whether Apex AIO earns a place next to the tools you already use. The trial is the full app." />
    </>
  );
}
