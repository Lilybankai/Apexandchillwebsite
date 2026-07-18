"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ApexChevron } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

/** A leaf link, or a parent with a dropdown of `children`. */
type NavItem = {
  href: string;
  label: string;
  children?: readonly { href: string; label: string; description?: string }[];
};

/** Primary navigation. Order confirmed by Scout report. */
const NAV_LINKS: readonly NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/live", label: "Live" },
  { href: "/standings", label: "Standings" },
  { href: "/replays", label: "Replays" },
  { href: "/schedule", label: "Schedule" },
  { href: "/lmu-special-events", label: "LMU Events" },
  {
    href: "/apps",
    label: "Apps",
    children: [
      {
        href: "/lmu-livery-studio",
        label: "LMU Livery Studio",
        description: "Free Le Mans Ultimate livery creator + installer",
      },
    ],
  },
  { href: "/about", label: "About" },
  { href: "/merch", label: "Merch" },
] as const;

const DISCORD_URL = "https://discord.gg/MBew2Bb2hj";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Solidify the bar once the user scrolls off the hero.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile drawer + any open dropdown whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  // Close the desktop dropdown on outside click or Escape.
  useEffect(() => {
    if (!openDropdown) return;
    const onPointer = (e: PointerEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenDropdown(null);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [openDropdown]);

  // Prevent background scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  /** A parent is "active" when the current route matches any of its children. */
  const isItemActive = (item: NavItem) =>
    item.children
      ? item.children.some((c) => isActive(c.href))
      : isActive(item.href);

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
          {NAV_LINKS.map((link) =>
            link.children ? (
              <div
                key={link.href}
                ref={dropdownRef}
                className="relative"
                onMouseEnter={() => setOpenDropdown(link.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown((cur) => (cur === link.label ? null : link.label))
                  }
                  className={cn(
                    "relative inline-flex items-center gap-1 px-3 py-2 font-display text-sm font-medium uppercase tracking-wide transition-colors",
                    isItemActive(link) ? "text-accent" : "text-muted hover:text-ink",
                  )}
                  aria-haspopup="true"
                  aria-expanded={openDropdown === link.label}
                >
                  {link.label}
                  <ChevronDown
                    size={14}
                    className={cn(
                      "transition-transform",
                      openDropdown === link.label && "rotate-180",
                    )}
                  />
                  {isItemActive(link) && (
                    <span className="absolute inset-x-3 -bottom-px h-0.5 bg-accent" />
                  )}
                </button>

                <div
                  className={cn(
                    "absolute right-0 top-full z-50 w-72 pt-2 transition-all duration-150",
                    openDropdown === link.label
                      ? "visible opacity-100"
                      : "pointer-events-none invisible -translate-y-1 opacity-0",
                  )}
                >
                  <div className="glass overflow-hidden rounded-card p-1.5 shadow-glow-soft">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "block rounded-[10px] px-3 py-2.5 transition-colors",
                          isActive(child.href)
                            ? "bg-elevated text-accent"
                            : "text-muted hover:bg-elevated hover:text-ink",
                        )}
                      >
                        <span className="font-display text-sm font-medium uppercase tracking-wide">
                          {child.label}
                        </span>
                        {child.description && (
                          <span className="mt-0.5 block text-xs normal-case tracking-normal text-subtle">
                            {child.description}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
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
            ),
          )}
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
          "lg:hidden fixed inset-x-0 top-16 z-40 origin-top border-b border-line bg-base shadow-2xl transition-all duration-200",
          menuOpen ? "visible opacity-100" : "pointer-events-none invisible -translate-y-2 opacity-0",
        )}
      >
        <nav className="container-rail flex flex-col gap-1 py-4" aria-label="Mobile">
          {NAV_LINKS.map((link) =>
            link.children ? (
              <div key={link.href}>
                <span className="block border-l-2 border-transparent px-4 pb-1 pt-3 font-display text-sm uppercase tracking-widest text-muted">
                  {link.label}
                </span>
                {link.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={cn(
                      "block border-l-2 px-4 py-3 pl-7 font-display text-base uppercase tracking-wide transition-colors",
                      isActive(child.href)
                        ? "border-accent bg-elevated text-accent"
                        : "border-transparent text-muted hover:text-ink",
                    )}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ) : (
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
            ),
          )}
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
