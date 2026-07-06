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
 * SimGrid configuration — powers the LMU league (standings + next race).
 * @see https://www.simgrid.com
 */
export const simgrid = {
  /** API base URL. Defaults to SimGrid's public API host. */
  baseUrl: read('SIMGRID_API_BASE_URL') ?? 'https://www.simgrid.com/api',
  /** Bearer token/key for the SimGrid API (`SIMGRID_API_KEY`, legacy alias `SIMGRID_API_TOKEN`). */
  token: read('SIMGRID_API_KEY') ?? read('SIMGRID_API_TOKEN'),
  /** SimGrid championship id for the current LMU season. */
  championshipId: read('SIMGRID_LMU_CHAMPIONSHIP_ID'),
} as const;

/**
 * Sim League Pro configuration — powers the GT7 league (standings + schedule).
 * @see https://simleague.pro
 */
export const simLeaguePro = {
  /** API base URL. */
  baseUrl: read('SIMLEAGUEPRO_API_BASE_URL') ?? 'https://api.simleague.pro',
  /** API key for Sim League Pro. */
  apiKey: read('SIMLEAGUEPRO_API_KEY'),
  /** Sim League Pro league id for the current GT7 season. */
  leagueId: read('SIMLEAGUEPRO_GT7_LEAGUE_ID'),
  /** Optional season id (defaults to the league's active season). */
  seasonId: read('SIMLEAGUEPRO_GT7_SEASON_ID'),
} as const;

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
   * Playlist to pull replays from. Defaults to the curated Apex & Chill replays
   * playlist. Any playlist id works with `playlistItems`; when unset, the
   * channel's uploads playlist is derived from {@link channelId}.
   */
  uploadsPlaylistId: read('YOUTUBE_UPLOADS_PLAYLIST_ID') ?? 'PLHRp_wnmBUBcaFRSJwhWdgNvyzzUobCu0',
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
    | 'printful'
    | 'stripe',
): boolean {
  switch (integration) {
    case 'simgrid':
      return Boolean(simgrid.token && simgrid.championshipId);
    case 'simleaguepro':
      return Boolean(simLeaguePro.apiKey && simLeaguePro.leagueId);
    case 'youtube':
      return Boolean(youtube.apiKey && (youtube.channelId || youtube.uploadsPlaylistId));
    case 'supabase':
      return Boolean(supabase.url && supabase.anonKey);
    case 'supabaseAdmin':
      return Boolean(supabase.url && supabase.serviceRoleKey);
    case 'tapstitch':
      return Boolean(tapstitch.apiKey);
    case 'printful':
      return Boolean(printful.apiKey);
    case 'stripe':
      return Boolean(stripe.secretKey);
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
 * Printful configuration — a print-on-demand provider for the merch store.
 * @see https://developers.printful.com
 */
export const printful = {
  /** API base URL. */
  baseUrl: read('PRINTFUL_API_BASE_URL') ?? 'https://api.printful.com',
  /** API key (Bearer token) for the Printful store. */
  apiKey: read('PRINTFUL_API_KEY'),
  /** Optional Printful store id (required for account-level tokens). */
  storeId: read('PRINTFUL_STORE_ID'),
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

/** How long (seconds) to cache external API responses at the route layer. */
export const CACHE_TTL_SECONDS = 300;
