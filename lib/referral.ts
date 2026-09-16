/**
 * Partner referral codes — the website's half.
 *
 * A partner is issued a code in the Apex AIO admin panel and promotes
 * `apexandchillracing.co.uk/r/THEIRCODE`. Anyone who arrives that way and
 * enters the code in the desktop app gets 10% off for as long as they stay
 * subscribed. The partner is paid nothing today; this is a promotion tool.
 *
 * ## Why the link cannot just apply the discount
 * The click happens here, in a browser. The payment happens a week later inside
 * a signed desktop app, after a 285 MB download, an install and a sign-up. No
 * cookie, session or query parameter survives that journey. So this side's job
 * is narrow and worth stating plainly:
 *
 *   1. confirm the code is real, and say whose it is ("Craig sent you"),
 *   2. count that the link was opened,
 *   3. put the CODE in front of the visitor so memorably that they still have
 *      it when the app asks — which is the one thing that actually carries the
 *      discount across the gap.
 *
 * Everything here fails soft. A referral is a discount, not an entitlement: if
 * Supabase is unreachable or the code is nonsense, the visitor gets the normal
 * landing page and the normal download rather than an error. Someone who came
 * to download a product must always be able to download the product.
 *
 * @packageDocumentation
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * The APEX AIO Supabase project — deliberately NOT the one `lib/supabase.ts`
 * returns.
 *
 * This site and the Apex AIO app are two different Supabase projects:
 *
 *   yfgvsiqrrxuucrkkqmqy   this website — join submissions, merch orders
 *   svtyxuhbsbbodsecbnsc   Apex AIO — accounts, billing, referral codes
 *
 * The referral tables live in the second one, so `getSupabaseBrowserClient()`
 * would query a database that has never heard of `referral_codes` and quietly
 * return nothing for every code. That is exactly what it did: the banner never
 * appeared and no click was ever recorded, with no error anywhere, because
 * "unknown code" and "wrong database" are indistinguishable from here.
 *
 * Hardcoded with an env override, the same shape `electron/auth.js` uses in the
 * app. The anon key is public by construction — it ships inside every installer
 * — so there is nothing to protect, and a default that works means the banner
 * cannot be broken by a missing deploy variable. Given the failure mode is
 * silent, that matters more than the tidiness of requiring configuration.
 */
const AIO_URL =
  process.env.NEXT_PUBLIC_APEX_AIO_SUPABASE_URL ?? 'https://svtyxuhbsbbodsecbnsc.supabase.co';
const AIO_ANON_KEY =
  process.env.NEXT_PUBLIC_APEX_AIO_SUPABASE_ANON_KEY ??
  'sb_publishable_Q-0gsoTW_r-AzgKQ6NqNSQ_vGegMK8w';

let aioClient: SupabaseClient | null = null;

/** Memoised anon client for the Apex AIO project. */
function getAioClient(): SupabaseClient | null {
  if (!AIO_URL || !AIO_ANON_KEY) return null;
  if (aioClient) return aioClient;
  aioClient = createClient(AIO_URL, AIO_ANON_KEY, { auth: { persistSession: false } });
  return aioClient;
}

/** A referral code, resolved against the database. */
export type Referral = {
  /** Normalised, as it should be displayed and typed: `CRAIG`. */
  code: string;
  /** The partner's display name, for "Craig sent you". Possibly empty. */
  ownerName: string;
  /** How much comes off, as a whole percent. */
  percentOff: number;
};

/**
 * The same normalisation the database applies (`referral_normalise`).
 *
 * Kept identical on purpose: a code typed with a dash, a space or the wrong
 * case has to resolve the same way on the landing page and in the app, or the
 * banner promises a discount the app then refuses.
 */
export function normaliseCode(raw: string | null | undefined): string {
  return (raw ?? '').replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 24);
}

/**
 * Look up a code and return the partner behind it, or `null`.
 *
 * Uses the Apex AIO project's ANON client: `referral_code_lookup` is a
 * security-definer function granted to `anon` precisely so this page can call
 * it, and it returns only the owner's display name — never an email, a user id,
 * or how the code is performing. A public endpoint that answered any of those
 * would let anyone enumerate the partner list and its results from outside.
 *
 * @param raw The code as it appeared in the URL.
 * @returns The resolved referral, or `null` when unknown, revoked, or when
 *          Supabase is not configured/reachable.
 */
export async function lookupReferral(raw: string | null | undefined): Promise<Referral | null> {
  const code = normaliseCode(raw);
  if (code.length < 3) return null;

  const supabase = getAioClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.rpc('referral_code_lookup', { p_code: code });
    if (error || !data) return null;
    const row = data as { ok?: boolean; code?: string; ownerName?: string; percentOff?: number };
    if (!row.ok || !row.code) return null;
    return {
      code: row.code,
      ownerName: typeof row.ownerName === 'string' ? row.ownerName : '',
      percentOff: Number(row.percentOff) || 10,
    };
  } catch {
    // Network, DNS, a cold database — the page still has a job to do.
    return null;
  }
}

/**
 * Count that a partner's link was opened.
 *
 * Called from the `/r/<code>` route handler, server-side, with the Apex AIO
 * project's anon key. It cannot use a service-role key: the only one this site
 * holds belongs to a DIFFERENT Supabase project (see the note at the top), and
 * handing a marketing site the AIO project's service key — which bypasses RLS
 * on accounts, billing and lap data — to increment a counter would be a
 * spectacularly bad trade.
 *
 * So `referral_record_click` is granted to `anon` and capped per code per day
 * (migration 0025). What that concedes is a wrong number in a column nobody is
 * paid on; `redeemed` and `paying` both need a real account and a real Stripe
 * subscription, so neither can be faked from outside, and those are the two
 * that decide whether a partnership continues.
 *
 * Stores a per-day count and nothing else — no IP, no user agent, no referrer.
 * Never throws and never blocks the response it rides along with.
 *
 * @param raw The code as it appeared in the URL.
 */
export async function recordReferralClick(raw: string | null | undefined): Promise<void> {
  const code = normaliseCode(raw);
  if (code.length < 3) return;

  const supabase = getAioClient();
  if (!supabase) return;

  try {
    await supabase.rpc('referral_record_click', { p_code: code });
  } catch {
    // A counter must never cost someone their download.
  }
}
