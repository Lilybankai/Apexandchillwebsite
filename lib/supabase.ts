/**
 * Supabase client factories.
 *
 * Two clients are exposed:
 *  - {@link getSupabaseBrowserClient} — uses the public anon key, safe for the
 *    browser and RSC. Subject to Row Level Security.
 *  - {@link getSupabaseAdminClient} — uses the service-role key, SERVER ONLY,
 *    bypasses RLS. Use for trusted writes such as storing join submissions.
 *
 * Both return `null` when the relevant credentials are absent, so callers must
 * handle the "not configured" case and fall back gracefully rather than crash.
 *
 * @packageDocumentation
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { supabase as supabaseEnv, isConfigured } from './env';

let browserClient: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

/**
 * Returns a memoised Supabase client authenticated with the public anon key.
 *
 * @returns A configured client, or `null` when `NEXT_PUBLIC_SUPABASE_URL` /
 *          `NEXT_PUBLIC_SUPABASE_ANON_KEY` are not set.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!isConfigured('supabase')) return null;
  if (browserClient) return browserClient;

  browserClient = createClient(supabaseEnv.url!, supabaseEnv.anonKey!, {
    auth: { persistSession: false },
  });
  return browserClient;
}

/**
 * Returns a memoised Supabase client authenticated with the service-role key.
 *
 * SECURITY: only call this from server-side code (route handlers, server
 * actions). The service-role key bypasses Row Level Security and must never
 * reach the browser bundle.
 *
 * @returns A privileged client, or `null` when the service-role key is unset.
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  if (!isConfigured('supabaseAdmin')) return null;
  if (adminClient) return adminClient;

  adminClient = createClient(supabaseEnv.url!, supabaseEnv.serviceRoleKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return adminClient;
}
