import Link from "next/link";
import { MessageCircle, Youtube, Twitch, HeartHandshake, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ApexChevron } from "@/components/ui/Logo";

const DISCORD_URL = "https://discord.gg/MBew2Bb2hj";
const YOUTUBE_URL = "https://youtube.com/channel/UCu7lyaGuo3sY2wWZo42-LVw";
const TWITCH_URL = "#"; // TBC — operator to supply Twitch channel
const CONTACT_EMAIL = "apexandchillracing@outlook.com";
const ANDYS_MAN_CLUB_URL = "https://andysmanclub.co.uk/";

/** Community stats surfaced across the site (source: Scout report). */
const COMMUNITY_STATS = [
  { value: "2025", label: "Founded" },
  { value: "200+", label: "Drivers · 12 Countries" },
  { value: "5", label: "Seasons" },
  { value: "100+", label: "Races" },
] as const;

const FOOTER_NAV = {
  Racing: [
    { href: "/standings", label: "Standings" },
    { href: "/schedule", label: "Schedule" },
    { href: "/lmu-special-events", label: "LMU Special Events" },
    { href: "/replays", label: "Replays" },
  ],
  League: [
    { href: "/join", label: "Join the League" },
    { href: "/about", label: "About Us" },
    { href: "/merch", label: "Merch Store" },
  ],
  Connect: [
    { href: DISCORD_URL, label: "Discord", external: true },
    { href: YOUTUBE_URL, label: "YouTube", external: true },
    { href: `mailto:${CONTACT_EMAIL}`, label: "Contact", external: true },
  ],
} as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-24 border-t border-line bg-surface/50">
      {/* Andy's Man Club — exclusive mental-health partnership band */}
      <div className="border-b border-line bg-gradient-to-r from-accent/15 via-surface to-cyan/10">
        <div className="container-rail flex flex-col items-start gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <HeartHandshake className="mt-0.5 shrink-0 text-pink" size={26} />
            <div>
              <p className="kicker mb-1">Exclusive Partner · Mental Health</p>
              <p className="max-w-xl text-sm text-muted">
                Apex &amp; Chill Racing is a proud partner of{" "}
                <span className="font-semibold text-ink">Andy&apos;s Man Club</span> — a
                men&apos;s mental-health charity. It&apos;s okay to talk.{" "}
                <span className="font-mono font-semibold text-pink">#ITSOKAYTOTALK</span>
              </p>
            </div>
          </div>
          <Button
            href={ANDYS_MAN_CLUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
            size="sm"
          >
            Find Support
          </Button>
        </div>
      </div>

      {/* Community stat bar */}
      <div className="border-b border-line">
        <div className="container-rail grid grid-cols-2 gap-px py-8 sm:grid-cols-4">
          {COMMUNITY_STATS.map((stat) => (
            <div key={stat.label} className="px-2 text-center">
              <div className="tabular text-3xl font-bold text-gradient">{stat.value}</div>
              <div className="mt-1 font-mono text-[0.65rem] uppercase tracking-widest text-subtle">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main footer grid */}
      <div className="container-rail grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Apex & Chill Racing home">
            <ApexChevron className="h-8 w-8" />
            <span className="font-display text-xl font-bold tracking-wide text-ink">
              APEX <span className="text-gradient">&amp;</span> CHILL
            </span>
          </Link>
          <p className="max-w-sm text-sm leading-relaxed text-muted">
            A multi-platform sim racing community running competitive Gran Turismo 7 and Le Mans
            Ultimate leagues. Clean, wheel-to-wheel racing — and a community that actually chills.
          </p>
          <div className="flex items-center gap-2">
            <SocialLink href={DISCORD_URL} label="Discord">
              <MessageCircle size={18} />
            </SocialLink>
            <SocialLink href={YOUTUBE_URL} label="YouTube">
              <Youtube size={18} />
            </SocialLink>
            <SocialLink href={TWITCH_URL} label="Twitch (coming soon)">
              <Twitch size={18} />
            </SocialLink>
            <SocialLink href={`mailto:${CONTACT_EMAIL}`} label="Email">
              <Mail size={18} />
            </SocialLink>
          </div>
        </div>

        {(Object.keys(FOOTER_NAV) as Array<keyof typeof FOOTER_NAV>).map((group) => (
          <div key={group}>
            <h4 className="mb-4 font-mono text-xs font-semibold uppercase tracking-widest text-subtle">
              {group}
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_NAV[group].map((item) => (
                <li key={item.label}>
                  <FooterLink
                    href={item.href}
                    external={"external" in item ? item.external : false}
                  >
                    {item.label}
                  </FooterLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Partners strip */}
      <div className="border-t border-line">
        <div className="container-rail flex flex-col items-center gap-4 py-6 sm:flex-row sm:justify-between">
          <p className="font-mono text-xs uppercase tracking-widest text-subtle">
            Proudly partnered with
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <PartnerBadge href="https://uk.mozaracing.com/?ref=Apexandchillracing" name="MOZA Racing" />
            <PartnerBadge
              href="https://rogueenergy.com/discount/ApexandChill?ref=vsodjwaa"
              name="Rogue Energy"
              note="Code: apexandchill"
            />
            <PartnerBadge href="https://simendurance.com/" name="Sim Endurance" />
            <PartnerBadge href={ANDYS_MAN_CLUB_URL} name="Andy's Man Club" highlight />
            <Link
              href="/partners"
              className="font-mono text-xs uppercase tracking-widest text-cyan hover:underline"
            >
              All partners →
            </Link>
          </div>
        </div>
      </div>

      {/* Legal bar */}
      <div className="border-t border-line">
        <div className="container-rail flex flex-col items-center justify-between gap-2 py-5 text-xs text-subtle sm:flex-row">
          <p>© {year} Apex &amp; Chill Racing. All rights reserved.</p>
          <p className="font-mono uppercase tracking-widest">
            Multi-Platform · GT7 &amp; Le Mans Ultimate
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex h-10 w-10 items-center justify-center border border-line bg-elevated text-muted transition-colors hover:border-cyan/50 hover:text-cyan"
    >
      {children}
    </a>
  );
}

function PartnerBadge({
  href,
  name,
  note,
  highlight,
}: {
  href?: string;
  name: string;
  note?: string;
  highlight?: boolean;
}) {
  const content = (
    <div
      className={
        "flex flex-col items-center rounded-card border px-4 py-2 text-center transition-colors " +
        (highlight
          ? "border-pink/50 bg-pink/5 hover:border-pink"
          : "border-line bg-elevated hover:border-cyan/40")
      }
    >
      <span className="font-display text-sm font-semibold uppercase tracking-wide text-ink">
        {name}
      </span>
      {note ? (
        <span className="font-mono text-[0.6rem] uppercase tracking-widest text-subtle">{note}</span>
      ) : null}
    </div>
  );
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }
  return content;
}

function FooterLink({
  href,
  external,
  children,
}: {
  href: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  const className = "text-sm text-muted transition-colors hover:text-cyan";
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
