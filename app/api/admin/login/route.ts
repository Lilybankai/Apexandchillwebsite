/**
 * `POST /api/admin/login` — exchange the admin password for a session cookie.
 *
 * Verifies the posted password against `ADMIN_PASSWORD` and, on success, sets the
 * httpOnly session cookie the middleware checks. The raw password is never
 * returned or stored client-side — only the derived token in the cookie.
 *
 * @packageDocumentation
 */

import { NextResponse } from 'next/server';
import { admin, isConfigured } from '@/lib/env';
import { ADMIN_COOKIE, sessionTokenFor, safeEqual } from '@/lib/admin-auth';

export const runtime = 'nodejs';

/** 30 days, in seconds. */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export async function POST(request: Request): Promise<NextResponse> {
  if (!isConfigured('admin')) {
    return NextResponse.json(
      { ok: false, error: 'Admin access isn’t configured yet. Set ADMIN_PASSWORD in your environment.' },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Malformed request.' }, { status: 400 });
  }

  const password = typeof (body as { password?: unknown })?.password === 'string'
    ? ((body as { password: string }).password)
    : '';

  if (!password || !safeEqual(password, admin.password!)) {
    return NextResponse.json({ ok: false, error: 'Incorrect password.' }, { status: 401 });
  }

  const token = await sessionTokenFor(admin.password!);
  const res = NextResponse.json({ ok: true, error: null });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });
  return res;
}
