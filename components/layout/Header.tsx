"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ApexChevron } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

/** Primary navigation. Order confirmed by Scout report. */
const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/standings", label: "Standings" },
  { href: "/replays", label: "Replays" },
  { href: "/schedule", label: "Schedule" },
  { href: "/lmu-special-events", label: "LMU Events" },
  { href: "/about", label: "About" },
  { href: "/merch", label: "Merch" },
] as const;

const DISCORD_URL = "https://discord.gg/MBew2Bb2hj";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Solidify the bar once the user scrolls off the hero.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Prevent background scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-300",
        scrolled
          ? "border-line bg-base/85 backdrop-blur-md"
          : "border-transparent bg-gradient-to-b from-base/90 to-transparent",
      )}
    >
      <div className="container-rail flex h-16 items-center justify-between gap-4 lg:h-20">
        {/* Wordmark */}
        <Link href="/" className="group flex items-center gap-2.5" aria-label="Apex & Chill Racing home">
          <ApexChevron className="h-8 w-8 transition-transform group-hover:scale-105" />
          <span className="font-display text-xl font-bold leading-none tracking-wide text-ink lg:text-2xl">
            APEX <span className="text-gradient">&amp;</span> CHILL
            <span className="ml-1 hidden align-top font-mono text-[0.55rem] font-medium tracking-widest text-subtle sm:inline">
              RACING
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative px-3 py-2 font-display text-sm font-medium uppercase tracking-wide transition-colors",
                isActive(link.href) ? "text-accent" : "text-muted hover:text-ink",
              )}
            >
              {link.label}
              {isActive(link.href) && (
                <span className="absolute inset-x-3 -bottom-px h-0.5 bg-accent" />
              )}
            </Link>
          ))}
        </nav>

        {/* Persistent CTAs (desktop) */}
        <div className="hidden items-center gap-2 lg:flex">
          <Button href={DISCORD_URL} target="_blank" rel="noopener noreferrer" variant="outline" size="sm">
            Join Discord
          </Button>
          <Button href="/join" size="sm" clip>
            Join the League
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="inline-flex h-11 w-11 items-center justify-center border border-line bg-elevated text-ink lg:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        id="mobile-nav"
        className={cn(
          "lg:hidden fixed inset-x-0 top-16 z-40 origin-top border-b border-line bg-base/98 backdrop-blur-md transition-all duration-200",
          menuOpen ? "visible opacity-100" : "pointer-events-none invisible -translate-y-2 opacity-0",
        )}
      >
        <nav className="container-rail flex flex-col gap-1 py-4" aria-label="Mobile">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "border-l-2 px-4 py-3 font-display text-lg uppercase tracking-wide transition-colors",
                isActive(link.href)
                  ? "border-accent bg-elevated text-accent"
                  : "border-transparent text-muted hover:text-ink",
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button href={DISCORD_URL} target="_blank" rel="noopener noreferrer" variant="outline" size="md">
              Join Discord
            </Button>
            <Button href="/join" size="md" clip>
              Join League
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
