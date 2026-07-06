/**
 * Single-password admin gate for `/admin`.
 *
 * The operator signs in with `ADMIN_PASSWORD`; we never store the raw password in
 * the browser. Instead the login route sets an httpOnly cookie whose value is a
 * SHA-256 of the password (+ a static salt), and middleware re-derives the same
 * token from `ADMIN_PASSWORD` to validate each request. This module is
 * Edge-compatible (Web Crypto only, reads `process.env` directly) so it can be
 * imported by both `middleware.ts` (Edge) and the Node login route.
 *
 * NOTE: this is a lightweight shared-secret gate suited to a single operator —
 * not per-user accounts. Rotating `ADMIN_PASSWORD` invalidates all sessions.
 *
 * @packageDocumentation
 */

/** Cookie name holding the derived admin session token. */
export const ADMIN_COOKIE = 'ac_admin';

/** Static salt so the cookie value isn't a bare password hash. */
const SALT = 'apexchill-admin-session-v1';

/** SHA-256 → lowercase hex, via Web Crypto (works in Edge + Node). */
async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** The session-cookie value for a given password. */
export async function sessionTokenFor(password: string): Promise<string> {
  return sha256Hex(`${SALT}:${password}`);
}

/** The configured admin password (trimmed), or `undefined` when unset. */
export function adminPassword(): string | undefined {
  const v = process.env.ADMIN_PASSWORD;
  const trimmed = v?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

/** The expected session token for the configured password, or `null` if unset. */
export async function expectedSessionToken(): Promise<string | null> {
  const pw = adminPassword();
  return pw ? sessionTokenFor(pw) : null;
}

/** Length-safe string comparison (avoids trivial early-exit timing leaks). */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Validate a request's admin cookie against the configured password. */
export async function isValidAdminCookie(cookieValue: string | undefined): Promise<boolean> {
  if (!cookieValue) return false;
  const expected = await expectedSessionToken();
  if (!expected) return false;
  return safeEqual(cookieValue, expected);
}
