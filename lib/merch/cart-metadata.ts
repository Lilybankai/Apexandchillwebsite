/**
 * Encode/decode a cart into Stripe Checkout Session metadata.
 *
 * The webhook (`POST /api/webhooks/stripe`) needs to know *which* variants were
 * bought so it can push the order to the right print-on-demand provider — but a
 * Stripe Checkout Session only carries the `price_data` we sent, not our variant
 * ids. So at checkout we stash a compact `[{ v: variantId, q: quantity }]` list
 * in the session `metadata`, and the webhook reads it back here.
 *
 * Stripe metadata values are capped at 500 characters (and 50 keys per object),
 * so the JSON is split into <=400-char chunks across `cart0`, `cart1`, … with a
 * `cart_chunks` count telling the decoder how many to reassemble.
 *
 * @packageDocumentation
 */

/** A single cart entry we trust server-side (variant id + quantity + optional personalisation). */
export interface CartMetadataLine {
  variantId: string;
  quantity: number;
  /** Buyer personalisation value (e.g. their chosen number), when present. */
  custom?: string;
}

const CHUNK_KEY = 'cart';
const CHUNK_COUNT_KEY = 'cart_chunks';
/** Well under Stripe's 500-char per-value limit, leaving headroom. */
const CHUNK_SIZE = 400;

/**
 * Encode cart lines into a Stripe-metadata-safe `Record<string, string>`.
 *
 * @param lines - The trusted cart lines (only `variantId` + `quantity` matter).
 * @returns Metadata keys `cart0…cartN` plus `cart_chunks`.
 */
export function encodeCartMetadata(lines: CartMetadataLine[]): Record<string, string> {
  const json = JSON.stringify(
    lines.map((l) => (l.custom ? { v: l.variantId, q: l.quantity, c: l.custom } : { v: l.variantId, q: l.quantity })),
  );
  const meta: Record<string, string> = {};
  let index = 0;
  for (let i = 0; i < json.length; i += CHUNK_SIZE) {
    meta[`${CHUNK_KEY}${index}`] = json.slice(i, i + CHUNK_SIZE);
    index += 1;
  }
  meta[CHUNK_COUNT_KEY] = String(index);
  return meta;
}

/**
 * Reassemble cart lines previously written by {@link encodeCartMetadata}.
 *
 * Defensive: returns `[]` for missing/garbled metadata rather than throwing, so
 * a malformed session can never crash the webhook.
 *
 * @param metadata - The Stripe session metadata (`session.metadata`).
 */
export function decodeCartMetadata(metadata: Record<string, string> | null | undefined): CartMetadataLine[] {
  if (!metadata) return [];
  const count = Number(metadata[CHUNK_COUNT_KEY] ?? 0);
  if (!Number.isInteger(count) || count <= 0) return [];

  let json = '';
  for (let i = 0; i < count; i += 1) {
    json += metadata[`${CHUNK_KEY}${i}`] ?? '';
  }

  try {
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed)) return [];
    const lines: CartMetadataLine[] = [];
    for (const raw of parsed) {
      const entry = raw as { v?: unknown; q?: unknown; c?: unknown };
      if (typeof entry.v === 'string' && entry.v.length > 0 && Number.isInteger(entry.q) && (entry.q as number) > 0) {
        const line: CartMetadataLine = { variantId: entry.v, quantity: entry.q as number };
        if (typeof entry.c === 'string' && entry.c.length > 0) line.custom = entry.c;
        lines.push(line);
      }
    }
    return lines;
  } catch {
    return [];
  }
}
