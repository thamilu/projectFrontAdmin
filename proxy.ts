import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NEXTAUTH_SESSION_COOKIE } from '@/core/auth/constants';

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    cookieName: NEXTAUTH_SESSION_COOKIE,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuth = !!token;
  const isAuthPage = request.nextUrl.pathname.startsWith('/api/auth/signin');

  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return null;
  }

  if (!isAuth && request.nextUrl.pathname.startsWith('/admin')) {
    let from = request.nextUrl.pathname;
    if (request.nextUrl.search) {
      from += request.nextUrl.search;
    }

    return NextResponse.redirect(
      new URL(`/auth/login?callbackUrl=${encodeURIComponent(from)}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
