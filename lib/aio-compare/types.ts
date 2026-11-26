import type { AioPageKey } from "@/lib/aio-pages";

/** How fully a tool covers one row of the comparison. */
export type CompareVerdict = "yes" | "partly" | "no";

export type CompareCell = {
  v: CompareVerdict;
  /** One short line saying what "yes" or "partly" actually means here. */
  note: string;
};

export type CompareRow = {
  feature: string;
  apex: CompareCell;
  them: CompareCell;
};

export type ComparePoint = {
  title: string;
  body: string;
  /** An Apex AIO topic page that covers this point in depth. */
  page?: AioPageKey;
};

export type CompareSource = {
  label: string;
  url: string;
};

/**
 * One "X alternative" page. Every claim about the other tool must be backed by
 * an entry in `sources`, checked on `checked`. When their pricing or LMU
 * support changes, update the facts here and move `checked` on; the page shows
 * the date so readers can see how fresh it is.
 */
export type ComparePageData = {
  key: string;
  path: string;
  /** The other tool's name as its makers write it. */
  competitor: string;
  /** `<title>`, around 60 characters, led by the search phrase. */
  title: string;
  description: string;
  breadcrumb: string;
  /** Social card headline and tagline. */
  social: { headline: string; tagline: string };
  kicker: string;
  /** H1 in two parts; the second is set in the page's one gradient span. */
  h1: [string, string];
  lead: string;
  /** Hero stat strip: short facts about the other tool and about Apex AIO. */
  stats: { value: string; label: string }[];
  /** "The short version": two or three plain paragraphs, no sales voice. */
  summary: string[];
  rows: CompareRow[];
  /** What the other tool genuinely does better. Required, and meant honestly. */
  theyDoBetter: ComparePoint[];
  /** Where Apex AIO is the better fit for LMU. */
  apexDoesBetter: ComparePoint[];
  /** Running both side by side, where that makes sense. */
  together?: { title: string; body: string[] };
  /** Who should stay put, and who should try Apex AIO. */
  whoFor: { stay: string[]; switch: string[] };
  faq: { q: string; a: string }[];
  sources: CompareSource[];
  /** ISO date the facts on the page were last checked against the sources. */
  checked: string;
  /** Closing call to action body. */
  ctaBody: string;
};
