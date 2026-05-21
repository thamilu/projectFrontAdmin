/**
 * Session Management Utilities
 *
 * BFF route handlers must resolve auth from the incoming Request (cookies + Bearer).
 * `getServerSession()` alone often returns null in App Router route handlers.
 *
 * @module infrastructure/http/session-utils
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getToken } from 'next-auth/jwt';
import type { JWT } from 'next-auth/jwt';
import { decodeJwt } from 'jose';
import { authOptions } from '@/core/auth/server';
import { NEXTAUTH_SESSION_COOKIE } from '@/core/auth/constants';
import { extractRoles } from '@/core/auth/services/token.service';
import type { Session } from 'next-auth';

/**
 * Resolves an authenticated session from the incoming API request.
 * Order: NextAuth JWT cookie → Authorization Bearer → legacy getServerSession.
 */
export async function resolveRequestSession(request?: Request): Promise<Session | null> {
  if (request) {
    const token = await getToken({
      req: request as NextRequest,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: NEXTAUTH_SESSION_COOKIE,
    });

    if (token?.accessToken && !token.error) {
      return jwtToSession(token);
    }

    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const accessToken = authHeader.slice(7).trim();
      if (accessToken) {
        const session = bearerToSession(accessToken);
        if (session) return session;
      }
    }
  }

  const session = await getServerSession(authOptions);
  if (session?.accessToken && !session.error) {
    return session;
  }

  return null;
}

function jwtToSession(token: JWT): Session {
  const roles = (token.roles as string[]) ?? [];
  const userId = (token.sub ?? token.userId) as string;

  return {
    user: {
      id: userId,
      email: (token.email as string) ?? undefined,
      name: (token.name as string) ?? undefined,
      roles,
    },
    expires: token.accessTokenExpires
      ? new Date(token.accessTokenExpires as number).toISOString()
      : new Date(Date.now() + 86400000).toISOString(),
    accessToken: token.accessToken as string,
    roles,
  };
}

function bearerToSession(accessToken: string): Session | null {
  try {
    const decoded = decodeJwt(accessToken);
    if (!decoded.sub) return null;

    const realmAccess = decoded.realm_access as { roles?: string[] } | undefined;
    const resourceAccess =
      (decoded.resource_access as Record<string, { roles?: string[] }> | undefined) ?? {};
    const roles = Array.from(
      new Set([
        ...extractRoles(accessToken),
        ...(decoded.roles as string[] | undefined ?? []),
        ...(realmAccess?.roles ?? []),
        ...Object.values(resourceAccess).flatMap((r) => r.roles ?? []),
      ])
    );

    return {
      user: {
        id: decoded.sub,
        email: (decoded.email as string) ?? undefined,
        name:
          (decoded.name as string) ??
          (decoded.preferred_username as string | undefined) ??
          undefined,
        roles,
      },
      expires: decoded.exp
        ? new Date((decoded.exp as number) * 1000).toISOString()
        : new Date(Date.now() + 300000).toISOString(),
      accessToken,
      roles,
    };
  } catch {
    return null;
  }
}

/**
 * Gets session and returns error response if unauthorized.
 */
export async function requireAuth(
  request: Request,
  requestId?: string
): Promise<[Session, null] | [null, NextResponse]> {
  const session = await resolveRequestSession(request);

  if (!session) {
    return [null, createUnauthorizedResponse('No session found', requestId)];
  }

  if (session.error) {
    return [null, createUnauthorizedResponse('Session expired', requestId)];
  }

  if (!session.accessToken) {
    return [null, createUnauthorizedResponse('No access token in session', requestId)];
  }

  return [session, null];
}

export async function getAuthenticatedSession(request: Request): Promise<Session> {
  const session = await resolveRequestSession(request);

  if (!session) {
    throw new SessionError('No session found');
  }

  if (!session.accessToken) {
    throw new SessionError('No access token in session');
  }

  return session;
}

export function hasRole(session: Session, role: string): boolean {
  const normalized = role.toUpperCase();
  const userRoles = [
    ...(session.user?.roles ?? []),
    ...(session.roles ?? []),
  ].map((r) => String(r).toUpperCase());

  return userRoles.some((r) => r === normalized || r.includes(normalized));
}

export async function requireRole(
  request: Request,
  role: string,
  requestId?: string
): Promise<[Session, null] | [null, NextResponse]> {
  const [session, errorResponse] = await requireAuth(request, requestId);

  if (errorResponse) {
    return [null, errorResponse];
  }

  if (!hasRole(session, role)) {
    return [null, createForbiddenResponse(`Requires ${role} role`, requestId)];
  }

  return [session, null];
}

export function hasAnyRole(session: Session, roles: string[]): boolean {
  return roles.some((role) => hasRole(session, role));
}

export async function requireAnyRole(
  request: Request,
  roles: string[],
  requestId?: string
): Promise<[Session, null] | [null, NextResponse]> {
  const [session, errorResponse] = await requireAuth(request, requestId);

  if (errorResponse) {
    return [null, errorResponse];
  }

  if (!hasAnyRole(session, roles)) {
    return [
      null,
      createForbiddenResponse(`Requires one of: ${roles.join(', ')}`, requestId),
    ];
  }

  return [session, null];
}

function createUnauthorizedResponse(
  message: string,
  requestId?: string
): NextResponse {
  const headers: Record<string, string> = {};
  if (requestId) {
    headers['X-Request-ID'] = requestId;
  }

  return NextResponse.json(
    { error: 'Unauthorized', message },
    { status: 401, headers }
  );
}

function createForbiddenResponse(
  message: string,
  requestId?: string
): NextResponse {
  const headers: Record<string, string> = {};
  if (requestId) {
    headers['X-Request-ID'] = requestId;
  }

  return NextResponse.json(
    { error: 'Forbidden', message },
    { status: 403, headers }
  );
}

export class SessionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SessionError';
  }
}
