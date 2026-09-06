import { CheckCircle2, Download, Gauge, Star, UploadCloud, Users } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

const COMMUNITY_SETUPS = [
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

function CommunitySetupCard({ setup }: { setup: (typeof COMMUNITY_SETUPS)[number] }) {
  return (
    <article className="rounded-lg border border-line bg-elevated/55 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-glow-soft">
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

function CommunitySetupsMock() {
  return (
    <div className="relative overflow-hidden rounded-card border border-line bg-[#080a0f] shadow-card">
      <span aria-hidden className="motion-scanline pointer-events-none absolute inset-y-0 z-10 w-24 bg-gradient-to-r from-transparent via-cyan/5 to-transparent" />
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-elevated/80 px-4 py-3">
        <div className="flex items-center gap-2">
          <Users size={15} className="text-cyan" />
          <span className="font-display text-sm font-semibold uppercase tracking-widest text-ink">
            Community setups
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[9px]">
          <span className="rounded border border-cyan/30 bg-cyan/10 px-2 py-1 text-cyan">
            Follow my car &amp; track
          </span>
          <span className="rounded border border-line px-2 py-1 text-muted">Recommended ▾</span>
        </div>
      </div>

      <div className="grid gap-3 p-4 lg:grid-cols-2">
        {COMMUNITY_SETUPS.map((setup) => (
          <CommunitySetupCard key={setup.name} setup={setup} />
        ))}
      </div>

      <div className="grid gap-4 border-t border-line bg-surface/30 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="flex items-start gap-3">
          <span className="rounded-lg border border-accent/35 bg-accent/10 p-2 text-accent-2">
            <UploadCloud size={18} />
          </span>
          <div>
            <p className="font-display text-sm font-semibold uppercase tracking-wide text-ink">
              Publish your setup
            </p>
            <p className="mt-1 text-xs text-subtle">
              Spa quali — sharp · linked clean lap 2:14.806 · 12 setup values fingerprinted
            </p>
          </div>
        </div>
        <span className="inline-flex items-center justify-center gap-2 rounded border border-accent/50 px-4 py-2 font-display text-xs uppercase text-accent-2">
          <UploadCloud size={13} /> Share setup
        </span>
      </div>
    </div>
  );
}

const COMMUNITY_POINTS = [
  "Publish your own .svm setup with handling tags, track, class and car attached.",
  "A verified clean lap stays linked to the exact setup as a genuine pace baseline.",
  "Sort by recommendation, fastest verified lap, rating, downloads or newest.",
  "Send a community setup straight to LMU, then rate it after you have actually used it.",
] as const;

export function CommunitySetups() {
  return (
    <section className="border-y border-line bg-surface/30 py-16">
      <div className="container-rail grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <Reveal>
          <span className="kicker mb-4">Community setups · Included</span>
          <h2 className="text-4xl font-bold text-ink sm:text-5xl">
            A fast baseline without the <span className="text-gradient">premium setup bill</span>
          </h2>
          <p className="mt-5 text-lg text-muted">
            Share what works and start from setups other LMU drivers have proved on track. The
            attached clean lap shows what each tune has already achieved, so you can choose a
            credible baseline instead of paying separately for a blind setup pack.
          </p>
          <ul className="mt-6 space-y-3">
            {COMMUNITY_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-muted">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 flex items-center gap-2 rounded-card border border-success/25 bg-success/5 p-4 text-sm text-subtle">
            <Gauge size={18} className="shrink-0 text-success" />
            Community publishing and downloads are part of Apex AIO — no per-setup charge.
          </p>
        </Reveal>

        <Reveal delay={140}>
          <CommunitySetupsMock />
        </Reveal>
      </div>
    </section>
  );
}
