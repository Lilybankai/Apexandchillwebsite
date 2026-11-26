import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Minus, X } from "lucide-react";
import { AioFaq } from "@/components/aio/AioFaq";
import { AioPageHero } from "@/components/aio/AioPageHero";
import { AioTrialCta } from "@/components/aio/AioTrialCta";
import { JsonLd } from "@/components/aio/JsonLd";
import { SectionHeading } from "@/components/aio/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { COMPARE_PAGES, COMPARE_INDEX } from "@/lib/aio-compare";
import { buildCompareBreadcrumbJsonLd, buildCompareWebPageJsonLd } from "@/lib/aio-compare/seo";
import type { CompareCell, ComparePageData, ComparePoint } from "@/lib/aio-compare/types";
import { getAioPage } from "@/lib/aio-pages";
import { cn } from "@/lib/utils";

/** "26 November 2026", the way the page says when it was checked. */
export function formatChecked(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

const VERDICT = {
  yes: { Icon: Check, label: "Yes", tone: "text-success" },
  partly: { Icon: Minus, label: "Partly", tone: "text-flag-amber" },
  no: { Icon: X, label: "No", tone: "text-subtle" },
} as const;

function Cell({ cell, strong }: { cell: CompareCell; strong?: boolean }) {
  const { Icon, label, tone } = VERDICT[cell.v];
  return (
    <td className={cn("px-4 py-4 align-top", strong && "bg-cyan/[0.04]")}>
      <span className={cn("inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em]", tone)}>
        <Icon size={14} aria-hidden />
        {label}
      </span>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{cell.note}</p>
    </td>
  );
}

function PointList({ points, accent }: { points: ComparePoint[]; accent: "cyan" | "muted" }) {
  return (
    <ul className="border-t border-line">
      {points.map((point) => (
        <li key={point.title} className="border-b border-line py-5">
          <h3 className={cn("font-semibold", accent === "cyan" ? "text-cyan" : "text-ink")}>{point.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{point.body}</p>
          {point.page && (
            <Link
              href={getAioPage(point.page).path}
              className="mt-2 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-cyan hover:underline"
            >
              {getAioPage(point.page).breadcrumb}
              <ArrowRight size={12} aria-hidden />
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}

/**
 * An "X alternative" page: an honest side-by-side of Apex AIO and one other
 * tool, for people already searching for a replacement. It leads with what the
 * other tool does better on purpose. Readers who use that tool know, and a page
 * that pretends otherwise reads as an advert and doesn't get shared.
 */
export function ComparePage({ data }: { data: ComparePageData }) {
  const checked = formatChecked(data.checked);
  const others = COMPARE_PAGES.filter((page) => page.key !== data.key);

  return (
    <>
      <JsonLd data={buildCompareBreadcrumbJsonLd(data, COMPARE_INDEX)} />
      <JsonLd data={buildCompareWebPageJsonLd(data)} />

      <AioPageHero
        kicker={data.kicker}
        title={
          <>
            {data.h1[0]} <span className="text-gradient">{data.h1[1]}</span>
          </>
        }
        lead={data.lead}
        stats={data.stats}
        points={[`Facts checked ${checked}`, "Sources listed at the bottom"]}
        visualCaption={`Apex AIO vs ${data.competitor}`}
        visualMeta=""
        visual={
          <dl className="divide-y divide-line font-mono text-xs">
            {data.rows.slice(0, 6).map((row) => (
              <div key={row.feature} className="grid grid-cols-[1fr_4.5rem_4.5rem] items-center gap-3 py-2.5">
                <dt className="uppercase tracking-[0.14em] text-muted">{row.feature}</dt>
                {[row.apex, row.them].map((cell, i) => {
                  const { Icon, label, tone } = VERDICT[cell.v];
                  return (
                    <dd key={i} className={cn("inline-flex items-center gap-1 uppercase tracking-wider", tone)}>
                      <Icon size={12} aria-hidden />
                      {label}
                      <span className="sr-only">{i === 0 ? " in Apex AIO" : ` in ${data.competitor}`}</span>
                    </dd>
                  );
                })}
              </div>
            ))}
            <div className="grid grid-cols-[1fr_4.5rem_4.5rem] gap-3 pt-3 text-[10px] uppercase tracking-[0.2em] text-subtle">
              <span />
              <span className="text-cyan">Apex</span>
              <span>{data.competitor.split(" ")[0]}</span>
            </div>
          </dl>
        }
      />

      <section className="container-rail py-16">
        <Reveal>
          <SectionHeading index="01" label="The short version" title={`Apex AIO or ${data.competitor}?`} />
          <div className="max-w-3xl space-y-4 text-lg leading-relaxed text-muted">
            {data.summary.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="border-y border-line bg-surface/30 py-16">
        <div className="container-rail">
          <SectionHeading
            index="02"
            label="Side by side"
            title="Feature by feature, for Le Mans Ultimate"
            lead={`What each tool does in LMU today. "Partly" means it's there with a catch, and the note says what the catch is.`}
          />
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[640px] border-collapse border border-line bg-base/70 text-left">
              <caption className="sr-only">
                Apex AIO compared with {data.competitor} for Le Mans Ultimate
              </caption>
              <thead>
                <tr className="border-b border-line font-mono text-[10px] uppercase tracking-[0.24em] text-subtle">
                  <th scope="col" className="w-[28%] px-4 py-3 font-normal">
                    Feature
                  </th>
                  <th scope="col" className="w-[36%] bg-cyan/[0.04] px-4 py-3 font-normal text-cyan">
                    Apex AIO
                  </th>
                  <th scope="col" className="w-[36%] px-4 py-3 font-normal text-ink">
                    {data.competitor}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row) => (
                  <tr key={row.feature} className="border-b border-line/70 last:border-0">
                    <th
                      scope="row"
                      className="px-4 py-4 align-top font-mono text-[11px] font-normal uppercase tracking-[0.18em] text-ink"
                    >
                      {row.feature}
                    </th>
                    <Cell cell={row.apex} strong />
                    <Cell cell={row.them} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-subtle">
            Checked against {data.competitor}&apos;s own site and docs on {checked}. Spotted something out of date?
            Tell us on Discord and we&apos;ll fix it.
          </p>
        </div>
      </section>

      <section className="container-rail py-16">
        <div className="grid gap-12 lg:grid-cols-2">
          <Reveal>
            <SectionHeading index="03" label={`Where ${data.competitor} wins`} title={`What ${data.competitor} does better`} />
            <PointList points={data.theyDoBetter} accent="muted" />
          </Reveal>
          <Reveal delay={100}>
            <SectionHeading index="04" label="Where Apex AIO wins" title="What Apex AIO does better in LMU" />
            <PointList points={data.apexDoesBetter} accent="cyan" />
          </Reveal>
        </div>
      </section>

      {data.together && (
        <section className="border-t border-line py-16">
          <div className="container-rail">
            <Reveal>
              <SectionHeading index="05" label="Using both" title={data.together.title} />
              <div className="max-w-3xl space-y-4 text-lg leading-relaxed text-muted">
                {data.together.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      <section className="border-t border-line py-16">
        <div className="container-rail">
          <SectionHeading index={data.together ? "06" : "05"} label="Who it suits" title="Stay, switch, or run both" />
          <div className="grid gap-px border border-line bg-line md:grid-cols-2">
            {(
              [
                [`Stick with ${data.competitor} if`, data.whoFor.stay, "text-ink"],
                ["Try Apex AIO if", data.whoFor.switch, "text-cyan"],
              ] as const
            ).map(([heading, items, tone]) => (
              <div key={heading} className="bg-base p-6 sm:p-8">
                <h3 className={cn("font-display text-xl font-bold uppercase tracking-wide", tone)}>{heading}</h3>
                <ul className="mt-4 space-y-3 text-muted">
                  {items.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span aria-hidden className="mt-[0.7em] h-px w-3 shrink-0 bg-cyan/70" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AioFaq items={data.faq} heading={`Apex AIO and ${data.competitor}: questions`} className="border-t border-line" />

      <AioTrialCta body={data.ctaBody} />

      <section className="border-t border-line py-12">
        <div className="container-rail grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <h2 className="font-mono text-[11px] uppercase tracking-[0.28em] text-subtle">Sources · checked {checked}</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {data.sources.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-1.5 text-muted underline decoration-line underline-offset-4 hover:text-cyan"
                  >
                    {source.label}
                    <ArrowUpRight size={12} aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-4 max-w-md text-xs leading-relaxed text-subtle">
              {data.competitor} is a trademark of its owners. Apex &amp; Chill Racing isn&apos;t affiliated with or
              endorsed by them. Prices and features change, so check their site before you buy.
            </p>
          </div>
          <div>
            <h2 className="font-mono text-[11px] uppercase tracking-[0.28em] text-subtle">Other comparisons</h2>
            <ul className="mt-4 border-t border-line">
              {others.map((page) => (
                <li key={page.key} className="border-b border-line">
                  <Link
                    href={page.path}
                    className="group flex items-center justify-between gap-4 py-3 text-ink hover:text-cyan"
                  >
                    {page.breadcrumb}
                    <ArrowRight size={14} aria-hidden className="text-subtle group-hover:text-cyan" />
                  </Link>
                </li>
              ))}
              <li className="border-b border-line">
                <Link
                  href={COMPARE_INDEX.path}
                  className="group flex items-center justify-between gap-4 py-3 text-ink hover:text-cyan"
                >
                  {COMPARE_INDEX.breadcrumb}
                  <ArrowRight size={14} aria-hidden className="text-subtle group-hover:text-cyan" />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
