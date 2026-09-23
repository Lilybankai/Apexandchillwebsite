import { CheckCircle2, Download, Star, UploadCloud, Users } from "lucide-react";

/**
 * What the community setup browser looks like. The listings are illustrative
 * samples (the same two the hub's community section shows), not a live feed —
 * the caption under the mock says so.
 */
const SAMPLE_SETUPS = [
  {
    name: "Spa race — low drag",
    author: "Carl",
    carClass: "LMGT3",
    tags: ["Low drag", "Stable & safe"],
    lap: "2:15.032",
    delta: "+0.412s",
    rating: "4.8",
    downloads: "184",
  },
  {
    name: "Le Mans endurance",
    author: "Obsidian",
    carClass: "HYPERCAR",
    tags: ["Endurance", "Kerb-friendly"],
    lap: "3:25.881",
    delta: "+0.693s",
    rating: "4.7",
    downloads: "126",
  },
] as const;

const SORTS = ["Fastest lap", "Recommended", "Rating", "Downloads", "Newest"] as const;

function SampleCard({ setup }: { setup: (typeof SAMPLE_SETUPS)[number] }) {
  return (
    <article className="rounded-lg border border-line bg-elevated/55 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="font-display text-sm font-semibold uppercase tracking-wide text-ink">
            {setup.name}
          </span>
          <p className="mt-1 text-xs text-subtle">
            by {setup.author} · {setup.carClass}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded border border-success/35 bg-success/10 px-2 py-1 font-mono text-[9px] font-bold text-success">
          <CheckCircle2 size={10} /> VERIFIED
        </span>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto] items-end gap-4 rounded border border-line bg-base/60 p-3">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-widest text-subtle">
            Best clean lap on this setup
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-cyan">{setup.lap}</p>
        </div>
        <p className="text-right font-mono text-[9px] text-subtle">
          vs board best
          <strong className="mt-1 block text-ink">{setup.delta}</strong>
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {setup.tags.map((tag) => (
          <span key={tag} className="rounded bg-accent/10 px-2 py-1 text-[10px] text-accent-2">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
        <div className="flex gap-3 font-mono text-[10px] text-muted">
          <span className="inline-flex items-center gap-1">
            <Star size={11} className="fill-flag-gold text-flag-gold" /> {setup.rating}
          </span>
          <span className="inline-flex items-center gap-1">
            <Download size={11} /> {setup.downloads}
          </span>
        </div>
        <span className="rounded bg-neon-primary px-3 py-1.5 font-display text-[10px] font-semibold uppercase text-white">
          Get setup
        </span>
      </div>
    </article>
  );
}

export function SetupBrowserMock() {
  return (
    <figure>
      <div
        role="img"
        aria-label="Apex AIO community setup browser showing sample LMU setups with verified clean laps, handling tags, ratings and download counts"
        className="relative overflow-hidden rounded-card border border-line bg-[#080a0f] shadow-card"
      >
        <span
          aria-hidden
          className="motion-scanline pointer-events-none absolute inset-y-0 z-10 w-24 bg-gradient-to-r from-transparent via-cyan/5 to-transparent"
        />
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-elevated/80 px-4 py-3">
          <div className="flex items-center gap-2">
            <Users size={15} className="text-cyan" />
            <span className="font-display text-sm font-semibold uppercase tracking-widest text-ink">
              Community setups
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 font-mono text-[9px]">
            {SORTS.map((sort) => (
              <span
                key={sort}
                className={
                  sort === "Fastest lap"
                    ? "rounded border border-cyan/30 bg-cyan/10 px-2 py-1 text-cyan"
                    : "rounded border border-line px-2 py-1 text-muted"
                }
              >
                {sort}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-3 p-4 lg:grid-cols-2">
          {SAMPLE_SETUPS.map((setup) => (
            <SampleCard key={setup.name} setup={setup} />
          ))}
        </div>

        <div className="flex items-start gap-3 border-t border-line bg-surface/30 p-4">
          <span className="rounded-lg border border-accent/35 bg-accent/10 p-2 text-accent-2">
            <UploadCloud size={18} />
          </span>
          <div>
            <p className="font-display text-sm font-semibold uppercase tracking-wide text-ink">
              Publish your setup
            </p>
            <p className="mt-1 text-xs text-subtle">
              Track, car, class and handling tags attached · linked to your clean lap
            </p>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-xs text-subtle">
        What the browser looks like — the listings shown are illustrative samples, not a live feed.
      </figcaption>
    </figure>
  );
}
