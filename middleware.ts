/**
 * Edge middleware — gate the `/admin` dashboard and its `/api/admin` routes
 * behind the single-password session cookie (see `lib/admin-auth.ts`).
 *
 * The login page and the login/logout endpoints are exempt (you need to reach
 * them while signed out). Unauthenticated page requests are redirected to the
 * login form; unauthenticated API requests get a 401.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_COOKIE, isValidAdminCookie } from '@/lib/admin-auth';

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};

const PUBLIC_PATHS = new Set(['/admin/login', '/api/admin/login', '/api/admin/logout']);

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();

  const ok = await isValidAdminCookie(req.cookies.get(ADMIN_COOKIE)?.value);
  if (ok) return NextResponse.next();

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const url = req.nextUrl.clone();
  url.pathname = '/admin/login';
  url.searchParams.set('next', pathname);
  return NextResponse.redirect(url);
}
