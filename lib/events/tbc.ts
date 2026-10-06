/**
 * Placeholder values for event details that aren't confirmed yet. Kept free of
 * env/config imports so any component can render them.
 *
 * @packageDocumentation
 */

/** An unconfirmed event detail — rendered as a clearly marked placeholder. */
export interface Tbc {
  tbc: true;
  /** What the organisers still need to confirm, shown to visitors. */
  note: string;
}

/** A detail that is either confirmed copy or a {@link Tbc} placeholder. */
export type EventDetail = string | Tbc;

/** Mark an event detail as unconfirmed. */
export function tbc(note: string): Tbc {
  return { tbc: true, note };
}

/** Narrow an {@link EventDetail} to its placeholder form. */
export function isTbc(detail: EventDetail): detail is Tbc {
  return typeof detail === 'object' && detail.tbc === true;
}
