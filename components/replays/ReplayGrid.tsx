'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { League, Replay } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ReplayCard } from './ReplayCard';

/** Filter options for the grid. `ALL` shows every replay. */
type Filter = 'ALL' | League;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'GT7', label: 'GT7' },
  { key: 'LMU', label: 'LMU' },
];

export interface ReplayGridProps {
  /** Replays to display in the grid. */
  replays: Replay[];
  /**
   * Whether to show the GT7/LMU league filter chips. Defaults to `true`. Set
   * `false` when the grid is already scoped (e.g. one playlist section) so the
   * chips aren't redundant.
   */
  showFilters?: boolean;
}

/**
 * Filterable replay grid with an accessible lightbox player.
 *
 * League filter chips scope the grid (chips with no matching replays are
 * disabled). Selecting a card opens a modal YouTube embed; the modal closes on
 * Escape, backdrop click, or the close button.
 */
export function ReplayGrid({ replays, showFilters = true }: ReplayGridProps) {
  const [filter, setFilter] = useState<Filter>('ALL');
  const [active, setActive] = useState<Replay | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  /** The element that opened the lightbox, so focus can be restored on close. */
  const triggerRef = useRef<HTMLElement | null>(null);

  const counts = useMemo(() => {
    return {
      ALL: replays.length,
      GT7: replays.filter((r) => r.league === 'GT7').length,
      LMU: replays.filter((r) => r.league === 'LMU').length,
    } satisfies Record<Filter, number>;
  }, [replays]);

  const visible = useMemo(
    () => (filter === 'ALL' ? replays : replays.filter((r) => r.league === filter)),
    [replays, filter],
  );

  // While the lightbox is open: lock body scroll, close on Escape, move focus
  // into the dialog, trap Tab/Shift+Tab within it, and restore focus to the
  // triggering card on close (WCAG 2.1.2 No Keyboard Trap / 2.4.3 Focus Order).
  useEffect(() => {
    if (!active) return;

    // Remember what had focus so we can return to it when the dialog closes.
    triggerRef.current = document.activeElement as HTMLElement | null;

    const dialog = dialogRef.current;
    const getFocusable = (): HTMLElement[] =>
      dialog
        ? Array.from(
            dialog.querySelectorAll<HTMLElement>(
              'button, iframe, a[href], input, [tabindex]:not([tabindex="-1"])',
            ),
          )
        : [];

    // Move focus into the dialog (first focusable, else the dialog itself).
    (getFocusable()[0] ?? dialog)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActive(null);
        return;
      }
      if (e.key !== 'Tab') return;
      const items = getFocusable();
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const el = document.activeElement;
      if (e.shiftKey) {
        if (el === first || !dialog?.contains(el)) {
          e.preventDefault();
          last.focus();
        }
      } else if (el === last || !dialog?.contains(el)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      // Restore focus to the card that opened the lightbox.
      triggerRef.current?.focus?.();
    };
  }, [active]);

  return (
    <div className="space-y-8">
      {/* Filter chips */}
      {showFilters && (
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map(({ key, label }) => {
          const count = counts[key];
          const disabled = count === 0;
          const isActive = key === filter;
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => setFilter(key)}
              className={cn(
                'rounded-full border px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-widest transition-all duration-150',
                isActive
                  ? 'border-transparent bg-neon-primary text-white shadow-glow-soft'
                  : 'border-line text-muted hover:border-accent/50 hover:text-ink',
                disabled && 'cursor-not-allowed opacity-40 hover:border-line hover:text-muted',
              )}
            >
              {label}
              <span className="ml-1.5 text-[0.65rem] opacity-70">{count}</span>
            </button>
          );
        })}
      </div>
      )}

      {/* Grid */}
      {visible.length === 0 ? (
        <div className="glass rounded-card p-10 text-center text-muted">
          No replays in this category yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((replay) => (
            <ReplayCard key={replay.videoId} replay={replay} onPlay={setActive} />
          ))}
        </div>
      )}

      {/* Lightbox */}
      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
          onClick={() => setActive(null)}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-base/90 p-4 backdrop-blur-sm animate-rise"
        >
          <div
            ref={dialogRef}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl focus:outline-none"
          >
            <button
              type="button"
              onClick={() => setActive(null)}
              aria-label="Close player"
              className="absolute -top-11 right-0 inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-muted transition-colors hover:text-ink"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="aspect-video overflow-hidden rounded-card border border-line shadow-glow">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${active.videoId}?autoplay=1&rel=0`}
                title={active.title}
                allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            </div>
            <h3 className="mt-4 font-display text-lg text-ink">{active.title}</h3>
          </div>
        </div>
      )}
    </div>
  );
}
