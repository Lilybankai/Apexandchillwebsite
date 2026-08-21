import Link from "next/link";

/**
 * Shared shell for the static legal pages (`/terms`, `/privacy`).
 *
 * Keeps both documents visually identical to the rest of the site (grid hero,
 * kicker, container rail) while giving the long-form body a readable measure
 * that the marketing pages don't need.
 */
export function LegalPage({
  kicker,
  title,
  intro,
  lastUpdated,
  children,
}: {
  kicker: string;
  title: string;
  intro: string;
  /** ISO date (YYYY-MM-DD) this document was last revised. */
  lastUpdated: string;
  children: React.ReactNode;
}) {
  const formatted = new Date(`${lastUpdated}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="pb-8">
      <section className="relative overflow-hidden border-b border-line">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-grid-lines bg-grid opacity-25 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-accent/15 blur-[120px]"
        />
        <div className="container-rail relative py-20">
          <span className="kicker mb-4">{kicker}</span>
          <h1 className="max-w-3xl text-5xl font-bold text-ink sm:text-6xl">{title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{intro}</p>
          <p className="mt-6 font-mono text-xs uppercase tracking-widest text-subtle">
            Last updated{" "}
            <time dateTime={lastUpdated} className="text-cyan">
              {formatted}
            </time>
          </p>
        </div>
      </section>

      <div className="container-rail py-14">
        <div className="max-w-3xl space-y-10">{children}</div>

        <div className="mt-14 max-w-3xl border-t border-line pt-6">
          <p className="text-sm text-muted">
            See also:{" "}
            <Link href="/terms" className="text-cyan hover:underline">
              Terms of Service
            </Link>{" "}
            ·{" "}
            <Link href="/privacy" className="text-cyan hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

/** A numbered top-level clause. */
export function Clause({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="mb-3 font-display text-2xl font-bold text-ink">
        <span className="mr-3 font-mono text-base text-subtle">
          {String(number).padStart(2, "0")}
        </span>
        {title}
      </h2>
      <div className="space-y-3 text-[0.95rem] leading-relaxed text-muted [&_a]:text-cyan [&_a:hover]:underline [&_strong]:text-ink">
        {children}
      </div>
    </section>
  );
}

/** Bulleted list styled for legal body copy. */
export function LegalList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="ml-1 space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-cyan" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
