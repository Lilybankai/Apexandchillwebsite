/**
 * Centralised, typed access to environment configuration.
 *
 * Every external integration (SimGrid, Sim League Pro, YouTube, Supabase) is
 * driven by environment variables. Nothing throws at import time: when a key is
 * missing the corresponding client falls back to bundled sample data, so the
 * site renders in local dev and previews before the operator supplies real
 * credentials. Use {@link isConfigured} to check availability explicitly.
 *
 * See `.env.example` for the full list and setup instructions.
 *
 * @packageDocumentation
 */

/** Read an env var, returning `undefined` for missing *or* empty values. */
function read(name: string): string | undefined {
  const value = process.env[name];
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * SimGrid (GridOS) configuration — powers the LMU league and any other SimGrid
 * championships (standings, schedule + next race).
 * @see https://www.thesimgrid.com
 */
export const simgrid = {
  /** GridOS API base URL. Defaults to SimGrid's public v1 API host. */
  baseUrl: read('SIMGRID_API_BASE_URL') ?? 'https://www.thesimgrid.com/api/v1',
  /** Bearer token/key for the SimGrid API (`SIMGRID_API_KEY`, legacy alias `SIMGRID_API_TOKEN`). */
  token: read('SIMGRID_API_KEY') ?? read('SIMGRID_API_TOKEN'),
  /** SimGrid championship id for the current LMU season. */
  championshipId: read('SIMGRID_LMU_CHAMPIONSHIP_ID'),
  /**
   * Championship ids keyed by league id, so extra SimGrid leagues (e.g. the
   * Thursday league) are a config-only addition. `LMU` mirrors
   * {@link championshipId} for back-compat.
   */
  championships: {
    LMU: read('SIMGRID_LMU_CHAMPIONSHIP_ID'),
    THU: read('SIMGRID_THURSDAY_CHAMPIONSHIP_ID'),
  } as Record<string, string | undefined>,
} as const;

/**
 * Sim League Pro configuration — powers the GT7 league (standings + schedule).
 * @see https://simleague.pro
 */
export const simLeaguePro = {
  /** Public GridOS-style API base URL. */
  baseUrl: read('SIMLEAGUEPRO_API_BASE_URL') ?? 'https://simleaguepro.com/api/v1',
  /** Optional API key (the league endpoint is public, so usually unset). */
  apiKey: read('SIMLEAGUEPRO_API_KEY'),
  /** Sim League Pro league id for the current GT7 season. */
  leagueId: read('SIMLEAGUEPRO_GT7_LEAGUE_ID'),
  /** Optional season id (defaults to the league's active season). */
  seasonId: read('SIMLEAGUEPRO_GT7_SEASON_ID'),
} as const;

/**
 * Extract a bare YouTube playlist id from an operator-supplied string.
 *
 * Operators paste all sorts of things: a bare id (`PL…`, `UU…`, `FL…`, `OL…`),
 * a full playlist URL (`…/playlist?list=PL…`), or — most commonly — a "share"
 * fragment copied from a video that belongs to a playlist
 * (`VIDEOID&list=PL…` or `…/watch?v=VIDEOID&list=PL…`). In every case the real
 * playlist id is whatever follows `list=`. When there's no `list=` marker we
 * assume the input is already a bare id and return it unchanged.
 *
 * @param raw - The pasted playlist id, URL, or share fragment.
 * @returns The extracted playlist id, trimmed.
 */
export function extractPlaylistId(raw: string): string {
  const value = raw.trim();
  const match = value.match(/[?&]?list=([^&\s]+)/);
  return match ? match[1] : value;
}

/** A single configured YouTube playlist to surface on the replays page. */
export interface YoutubePlaylistConfig {
  /**
   * Operator-supplied section heading. `null` when none was given, in which case
   * the data layer falls back to the playlist's own title from YouTube.
   */
  label: string | null;
  /** The playlist id (`PL…`, `UU…`, …), already sanitised. */
  id: string;
}

/**
 * Parse the `YOUTUBE_PLAYLISTS` env var into an ordered list of playlists.
 *
 * Format: a comma-separated list of entries, each either a bare
 * URL/id or `Label | url-or-id` (the `|` separates an optional heading from the
 * playlist). Example:
 *
 * ```
 * YOUTUBE_PLAYLISTS=GT7 League | https://youtube.com/playlist?list=PLaaa, LMU League | PLbbb
 * ```
 *
 * @param raw - The raw env value (may be undefined).
 * @returns Configs in declared order; empty when nothing valid is present.
 */
function parsePlaylists(raw: string | undefined): YoutubePlaylistConfig[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const sep = entry.indexOf('|');
      if (sep === -1) return { label: null, id: extractPlaylistId(entry) };
      const label = entry.slice(0, sep).trim();
      return { label: label || null, id: extractPlaylistId(entry.slice(sep + 1)) };
    })
    .filter((p) => p.id.length > 0);
}

/**
 * YouTube Data API v3 configuration — powers the replays gallery.
 * @see https://developers.google.com/youtube/v3
 */
export const youtube = {
  /** YouTube Data API v3 key. This is the only value the operator must supply. */
  apiKey: read('YOUTUBE_API_KEY'),
  /** Channel id (`UC...`). Defaults to the Apex & Chill channel. */
  channelId: read('YOUTUBE_CHANNEL_ID') ?? 'UCu7lyaGuo3sY2wWZo42-LVw',
  /**
   * Single playlist to pull replays from (`YOUTUBE_UPLOADS_PLAYLIST_ID`). Any
   * playlist id works with `playlistItems`. Tolerant of pasted URLs / share
   * fragments (see {@link extractPlaylistId}). When unset, the channel's uploads
   * playlist is derived from {@link channelId}. Superseded by {@link playlists}
   * when that is configured.
   */
  uploadsPlaylistId: (() => {
    const raw = read('YOUTUBE_UPLOADS_PLAYLIST_ID');
    return raw ? extractPlaylistId(raw) : undefined;
  })(),
  /**
   * Multiple labelled playlists (`YOUTUBE_PLAYLISTS`), each rendered as its own
   * section on the replays page. Empty when unset, in which case the site shows
   * the single {@link uploadsPlaylistId} (or channel uploads) feed.
   */
  playlists: parsePlaylists(read('YOUTUBE_PLAYLISTS')),
} as const;

/**
 * Supabase configuration — persistence for join submissions and cached data.
 * @see https://supabase.com/docs
 */
export const supabase = {
  /** Project URL, e.g. `https://xxxx.supabase.co`. Safe to expose to browser. */
  url: read('NEXT_PUBLIC_SUPABASE_URL'),
  /** Anonymous (public) key — safe to expose to the browser. */
  anonKey: read('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  /** Service-role key — SERVER ONLY. Never expose this to the client. */
  serviceRoleKey: read('SUPABASE_SERVICE_ROLE_KEY'),
} as const;

/**
 * Reports whether a given integration has the minimum credentials it needs to
 * make live calls. Clients use this to decide between live data and the sample
 * fallback.
 *
 * @param integration - Which integration to check.
 * @returns `true` when the required keys are present.
 */
export function isConfigured(
  integration:
    | 'simgrid'
    | 'simleaguepro'
    | 'youtube'
    | 'supabase'
    | 'supabaseAdmin'
    | 'tapstitch'
    | 'printify'
    | 'stripe'
    | 'resend'
    | 'admin',
): boolean {
  switch (integration) {
    case 'simgrid':
      return Boolean(simgrid.token && simgrid.championshipId);
    case 'simleaguepro':
      // The league endpoint is public — only the league id is required.
      return Boolean(simLeaguePro.leagueId);
    case 'youtube':
      return Boolean(youtube.apiKey && (youtube.channelId || youtube.uploadsPlaylistId));
    case 'supabase':
      return Boolean(supabase.url && supabase.anonKey);
    case 'supabaseAdmin':
      return Boolean(supabase.url && supabase.serviceRoleKey);
    case 'tapstitch':
      return Boolean(tapstitch.apiKey);
    case 'printify':
      return Boolean(printify.apiKey && printify.shopId);
    case 'stripe':
      return Boolean(stripe.secretKey);
    case 'resend':
      return Boolean(resend.apiKey && resend.to);
    case 'admin':
      return Boolean(admin.password);
    default:
      return false;
  }
}

/**
 * Tapstitch configuration — a print-on-demand provider for the merch store.
 * @see https://www.tapstitch.com
 */
export const tapstitch = {
  /** API base URL. */
  baseUrl: read('TAPSTITCH_API_BASE_URL') ?? 'https://api.tapstitch.com',
  /** API key for the Tapstitch store. */
  apiKey: read('TAPSTITCH_API_KEY'),
  /** Tapstitch store id. */
  storeId: read('TAPSTITCH_STORE_ID'),
} as const;

/**
 * Printify configuration — a print-on-demand provider for the merch store.
 * @see https://developers.printify.com
 */
export const printify = {
  /** API base URL (all product/order calls are shop-scoped under `/shops/{id}`). */
  baseUrl: read('PRINTIFY_API_BASE_URL') ?? 'https://api.printify.com/v1',
  /** API key (Personal Access Token, Bearer) for the Printify account. */
  apiKey: read('PRINTIFY_API_KEY'),
  /** Printify shop id — required; every product/order call is scoped to one shop. */
  shopId: read('PRINTIFY_SHOP_ID'),
  /**
   * When `true`, orders pushed from the Stripe webhook are auto-confirmed (sent
   * to production, so Printify charges & fulfils immediately). When `false`
   * (default) the order is created but left for the operator to review and send
   * to production from the Printify dashboard — safer while going live. Set
   * `PRINTIFY_AUTO_CONFIRM=true` to ship automatically.
   */
  autoConfirm: read('PRINTIFY_AUTO_CONFIRM') === 'true',
} as const;

/**
 * Stripe configuration — powers merch checkout.
 * @see https://stripe.com/docs
 */
export const stripe = {
  /** Secret key — SERVER ONLY. Used to create Checkout Sessions. */
  secretKey: read('STRIPE_SECRET_KEY'),
  /** Publishable key — safe for the browser. */
  publishableKey: read('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
  /** Webhook signing secret — SERVER ONLY. */
  webhookSecret: read('STRIPE_WEBHOOK_SECRET'),
} as const;

/**
 * Resend configuration — sends the operator an email for every completed order
 * (used especially for manual-fulfilment Tapstitch items). Uses Resend's REST
 * API directly (no SDK), so nothing is sent when the key is absent.
 * @see https://resend.com/docs
 */
export const resend = {
  /** Resend API key (`re_...`). SERVER ONLY. */
  apiKey: read('RESEND_API_KEY'),
  /** Who order notifications are sent TO (the operator). Defaults to the store inbox. */
  to: read('ORDER_NOTIFICATION_EMAIL'),
  /**
   * The verified From address, e.g. `Apex & Chill <orders@apexandchill.com>`.
   * Must be on a domain verified in Resend. Defaults to Resend's shared sandbox
   * sender, which only delivers to the account owner's email while testing.
   */
  from: read('ORDER_EMAIL_FROM') ?? 'Apex & Chill Orders <onboarding@resend.dev>',
} as const;

/**
 * Admin dashboard access — a single shared password gate for `/admin`.
 * SERVER ONLY; the password is never sent to the browser (only an opaque,
 * httpOnly session cookie derived from it). When unset, `/admin` returns 503.
 */
export const admin = {
  /** The operator password required to sign in to `/admin`. */
  password: read('ADMIN_PASSWORD'),
} as const;

/** How long (seconds) to cache external API responses at the route layer. */
export const CACHE_TTL_SECONDS = 300;

/**
 * Shorter cache window (seconds) for the live-stream state, so a broadcast going
 * live (or ending) is reflected on the site within about a minute rather than
 * the five used for slower-moving data. Kept small on purpose — the underlying
 * YouTube calls are cheap (uploads + a single `videos.list`), so a 60s refresh
 * stays comfortably inside the Data API's default daily quota.
 */
export const LIVE_CACHE_TTL_SECONDS = 60;
