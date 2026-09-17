import Image from "next/image";
import { ExternalLink } from "lucide-react";

/**
 * A channel partner — a community, team or creator we work alongside.
 *
 * Deliberately separate from `PartnerGrid`'s commercial/affiliate partners
 * (MOZA, Rogue Energy, Sim Endurance). Those carry discount codes and referral
 * links; these are relationships, so the logo is the point and there is no
 * benefits list or creator code to show.
 */
interface ChannelPartner {
  name: string;
  /** What they are, in three or four words. */
  kind: string;
  /** Their own strapline, where they have one. */
  tagline?: string;
  logo: string;
  /** Intrinsic size of the source file — next/image wants both. */
  width: number;
  height: number;
  /** Per-logo sizing: a round badge and a wide wordmark can't share one rule. */
  logoClassName: string;
  /** Omitted until the operator supplies it; the link then hides itself. */
  href?: string;
}

/**
 * The partner list, shared by the home page and the Apex AIO landing page so
 * the two can never drift. Logos are operator-supplied, background-removed
 * PNGs — both read correctly on our dark surfaces, so they sit on a plain
 * tile rather than a white plate.
 */
const CHANNEL_PARTNERS: ChannelPartner[] = [
  {
    name: "Obsidian Endurance Racing",
    kind: "Endurance racing team",
    tagline: "Forged in darkness. Built to endure.",
    logo: "/brand/partners/obsidian-endurance-racing.png",
    width: 500,
    height: 500,
    logoClassName: "h-32 w-32 sm:h-36 sm:w-36",
  },
  {
    name: "Yamas Gaming",
    kind: "Gaming community",
    logo: "/brand/partners/yamas-gaming.png",
    width: 866,
    height: 288,
    logoClassName: "h-auto w-full max-w-[280px]",
  },
];

interface ChannelPartnersProps {
  /** Small label above the heading. */
  kicker?: string;
  heading?: React.ReactNode;
  /** Lead paragraph — the AIO page words this for its own context. */
  blurb?: string;
  /** Outer section classes, so a caller can add a full-bleed rule/background. */
  className?: string;
}

/** Logo-forward band for our channel partners. */
export function ChannelPartners({
  kicker = "Channel Partners",
  heading = (
    <>
      Racing <span className="text-gradient">alongside us</span>
    </>
  ),
  blurb = "Teams and communities we work with across our leagues, our broadcasts and our Discord.",
  className = "py-16",
}: ChannelPartnersProps) {
  return (
    <section className={className}>
      <div className="container-rail">
        <header className="mb-8 max-w-2xl">
          <span className="kicker mb-3">{kicker}</span>
          <h2 className="text-4xl font-bold text-ink sm:text-5xl">{heading}</h2>
          <p className="mt-4 text-muted">{blurb}</p>
        </header>

        <div className="grid gap-5 sm:grid-cols-2">
          {CHANNEL_PARTNERS.map((p) => (
            <div
              key={p.name}
              className="group flex flex-col items-center gap-6 rounded-card border border-line bg-surface/50 p-8 text-center transition-colors hover:border-cyan/40"
            >
              {/* The logo tile: a fixed height so a round badge and a wide
                  wordmark still line up across the grid. */}
              <div className="flex h-44 w-full items-center justify-center rounded-card border border-line bg-base/60 px-6">
                <Image
                  src={p.logo}
                  alt={p.name}
                  width={p.width}
                  height={p.height}
                  className={`object-contain ${p.logoClassName}`}
                />
              </div>

              <div>
                <h3 className="font-display text-xl font-semibold uppercase tracking-wide text-ink">
                  {p.name}
                </h3>
                <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-widest text-subtle">
                  {p.kind}
                </p>
                {p.tagline && <p className="mt-3 text-sm text-muted">{p.tagline}</p>}
                {p.href && (
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 font-display text-sm font-semibold uppercase tracking-wide text-cyan hover:underline"
                  >
                    Visit {p.name}
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
