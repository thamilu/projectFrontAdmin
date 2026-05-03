import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// This must match the cookie name configured in lib/auth.ts
const COOKIE_NAME = 'eshop-admin-session-token';

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    cookieName: COOKIE_NAME
  });

  const isAuth = !!token;
  const isAuthPage = request.nextUrl.pathname.startsWith('/api/auth/signin');

  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return null;
  }

  if (!isAuth && request.nextUrl.pathname.startsWith('/admin')) {
    let from = request.nextUrl.pathname;
    if (request.nextUrl.search) {
      from += request.nextUrl.search;
    }

    return NextResponse.redirect(
      new URL(`/api/auth/signin?callbackUrl=${encodeURIComponent(from)}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
