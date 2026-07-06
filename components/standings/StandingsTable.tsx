'use client';

import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import type { StandingRow } from '@/lib/types';
import { cn } from '@/lib/utils';

/**
 * Columns that can be sorted, mapped to the {@link StandingRow} key they read.
 * `position` sorts ascending by default (P1 first); the counting stats sort
 * descending by default (most first).
 */
type SortKey =
  | 'position'
  | 'driver'
  | 'points'
  | 'wins'
  | 'podiums'
  | 'avgQuali'
  | 'avgFinish'
  | 'penalties';

type SortDir = 'asc' | 'desc';

interface Column {
  /** Sortable columns use a {@link SortKey}; `team` is a non-sortable column. */
  key: SortKey | 'team';
  label: string;
  /** Short label used for the mobile stacked `data-label`. */
  short: string;
  /** Default direction when the column is first selected. */
  defaultDir: SortDir;
  /** Right-align + tabular numerals for numeric columns. */
  numeric: boolean;
  /** Whether the header exposes click-to-sort. Team has no comparable key. */
  sortable: boolean;
}

/**
 * Column definitions in render order. This drives the `<thead>`; the count and
 * order MUST match the `<td>` cells rendered per row (Pos, Driver, Team, then
 * the six numeric stats) so headers line up over their columns on desktop.
 */
const COLUMNS: Column[] = [
  { key: 'position', label: 'Pos', short: 'Pos', defaultDir: 'asc', numeric: true, sortable: true },
  { key: 'driver', label: 'Driver', short: 'Driver', defaultDir: 'asc', numeric: false, sortable: true },
  { key: 'team', label: 'Team', short: 'Team', defaultDir: 'asc', numeric: false, sortable: false },
  { key: 'points', label: 'Points', short: 'Pts', defaultDir: 'desc', numeric: true, sortable: true },
  { key: 'wins', label: 'Wins', short: 'Wins', defaultDir: 'desc', numeric: true, sortable: true },
  { key: 'podiums', label: 'Podiums', short: 'Pod', defaultDir: 'desc', numeric: true, sortable: true },
  { key: 'avgQuali', label: 'Avg Quali', short: 'Avg Q', defaultDir: 'asc', numeric: true, sortable: true },
  { key: 'avgFinish', label: 'Avg Finish', short: 'Avg F', defaultDir: 'asc', numeric: true, sortable: true },
  { key: 'penalties', label: 'Penalties', short: 'Pen', defaultDir: 'asc', numeric: true, sortable: true },
];

/** Accent colour for the top-three championship positions. */
function positionColor(position: number): string | null {
  switch (position) {
    case 1:
      return 'rgb(var(--color-success))';
    case 2:
      return 'rgb(var(--color-cyan))';
    case 3:
      return 'rgb(var(--color-pink))';
    default:
      return null;
  }
}

/** Format a numeric cell; shows `—` for a zero average (unpopulated) and a
 * negative sign for penalties, matching the legacy WordPress presentation. */
function formatCell(row: StandingRow, key: SortKey): string {
  switch (key) {
    case 'avgQuali':
    case 'avgFinish': {
      const v = row[key];
      return v > 0 ? v.toFixed(1) : '—';
    }
    case 'penalties':
      return row.penalties > 0 ? `-${row.penalties}` : '0';
    default:
      return String(row[key]);
  }
}

export interface StandingsTableProps {
  /** Championship rows to display, already league-scoped. */
  rows: StandingRow[];
}

/**
 * A sortable, responsive driver-championship table.
 *
 * - Click any column header to sort; click again to flip direction.
 * - On desktop it renders a classic timing-board table; on mobile each row
 *   stacks into a card with `data-label` captions (no horizontal scroll).
 * - The top three positions carry the signature neon accent bars.
 */
export function StandingsTable({ rows }: StandingsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('position');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      let cmp: number;
      if (typeof av === 'number' && typeof bv === 'number') {
        cmp = av - bv;
      } else {
        cmp = String(av).localeCompare(String(bv));
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  function toggleSort(col: Column) {
    if (!col.sortable) return;
    const key = col.key as SortKey;
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(col.defaultDir);
    }
  }

  if (rows.length === 0) {
    return (
      <div className="glass rounded-card p-10 text-center text-muted">
        Season data coming soon.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-card glass">
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">
          Driver championship standings. Column headers are buttons that sort the
          table.
        </caption>
        <thead className="hidden md:table-header-group">
          <tr className="border-b border-line">
            {COLUMNS.map((col) => {
              const active = col.sortable && col.key === sortKey;
              return (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    'px-4 py-3 font-mono text-[0.7rem] font-semibold uppercase tracking-widest text-subtle',
                    col.numeric ? 'text-right' : 'text-left',
                    col.key === 'driver' && 'min-w-[8rem]',
                  )}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col)}
                      className={cn(
                        'inline-flex items-center gap-1 transition-colors hover:text-ink',
                        col.numeric && 'flex-row-reverse',
                        active && 'text-cyan',
                      )}
                      aria-label={`Sort by ${col.label}`}
                    >
                      {col.label}
                      {active ? (
                        sortDir === 'asc' ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-3 w-3 opacity-40" />
                      )}
                    </button>
                  ) : (
                    <span>{col.label}</span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="block md:table-row-group">
          {sorted.map((row) => {
            const accent = positionColor(row.position);
            return (
              <tr
                key={`${row.driver}-${row.position}`}
                className={cn(
                  'group relative mb-3 block rounded-card border border-line bg-surface/40 p-4',
                  'md:mb-0 md:table-row md:rounded-none md:border-0 md:border-b md:border-line/70 md:bg-transparent md:p-0',
                  'md:transition-colors md:hover:bg-elevated/50',
                )}
              >
                {/* Position */}
                <td
                  data-label="Pos"
                  className="tabular flex items-center justify-between py-1 before:font-mono before:text-[0.7rem] before:uppercase before:tracking-widest before:text-subtle before:content-[attr(data-label)] md:table-cell md:py-3 md:pl-4 md:before:hidden"
                >
                  <span
                    className="inline-flex h-7 min-w-7 items-center justify-center rounded-md px-2 text-sm font-bold"
                    style={
                      accent
                        ? { color: '#05060a', background: accent }
                        : { color: 'rgb(var(--color-muted))', background: 'rgb(var(--color-elevated))' }
                    }
                  >
                    {row.position}
                  </span>
                </td>

                {/* Driver */}
                <td
                  data-label="Driver"
                  className="flex items-center justify-between py-1 before:font-mono before:text-[0.7rem] before:uppercase before:tracking-widest before:text-subtle before:content-[attr(data-label)] md:table-cell md:py-3 md:before:hidden"
                >
                  <span className="font-semibold text-ink">{row.driver}</span>
                </td>

                {/* Team (with colour dot) */}
                <td
                  data-label="Team"
                  className="flex items-center justify-between py-1 before:font-mono before:text-[0.7rem] before:uppercase before:tracking-widest before:text-subtle before:content-[attr(data-label)] md:table-cell md:py-3 md:before:hidden"
                >
                  <span className="inline-flex items-center gap-2 text-muted">
                    <span
                      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: row.teamColor, boxShadow: `0 0 8px ${row.teamColor}` }}
                      aria-hidden
                    />
                    {row.team || '—'}
                  </span>
                </td>

                {/* Numeric stats */}
                {(['points', 'wins', 'podiums', 'avgQuali', 'avgFinish', 'penalties'] as const).map((key) => {
                  const col = COLUMNS.find((c) => c.key === key)!;
                  return (
                    <td
                      key={key}
                      data-label={col.short}
                      className={cn(
                        'tabular flex items-center justify-between py-1 before:font-mono before:text-[0.7rem] before:uppercase before:tracking-widest before:text-subtle before:content-[attr(data-label)] md:table-cell md:py-3 md:text-right md:before:hidden',
                        key === 'penalties' && 'md:pr-4',
                        key === 'points' && 'font-bold text-ink',
                        key === 'penalties' && row.penalties > 0 && 'text-flag-red',
                      )}
                    >
                      {formatCell(row, key)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
