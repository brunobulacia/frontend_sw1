import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { parseCookies } from '@/lib/auth/cookies';

const COOKIE = process.env.AUTH_COOKIE_NAME || 'app_token';

export function middleware(req: NextRequest) {
  const publicPaths = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/api',
    '/_next',
    '/favicon.ico',
  ];
  if (publicPaths.some(p => req.nextUrl.pathname.startsWith(p))) return NextResponse.next();

  const cookies = parseCookies(req.headers.get('cookie'));
  if (!cookies[COOKIE]) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/:path*'] };
