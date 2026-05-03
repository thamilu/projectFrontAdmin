/**
 * Session Management Utilities
 * 
 * Provides reusable session handling patterns for API routes
 * Eliminates duplicate authentication checks
 * 
 * @module lib/api/session-utils
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import type { Session } from 'next-auth';

/**
 * Gets session and returns error response if unauthorized
 * Returns [session, null] if authorized
 * Returns [null, errorResponse] if unauthorized
 * 
 * @example
 * ```ts
 * export async function GET(request: Request) {
 *   const [session, errorResponse] = await requireAuth();
 *   if (errorResponse) return errorResponse;
 *   
 *   // session is guaranteed to exist here
 *   const userId = session.user.id;
 * }
 * ```
 */
export async function requireAuth(
  requestId?: string
): Promise<[Session, null] | [null, NextResponse]> {
  const session = await getServerSession(authOptions);

  if (!session) {
    return [
      null,
      createUnauthorizedResponse('No session found', requestId),
    ];
  }

  if (!session.accessToken) {
    return [
      null,
      createUnauthorizedResponse('No access token in session', requestId),
    ];
  }

  return [session, null];
}

/**
 * Gets session or throws UnauthorizedError
 * Useful for cleaner async/await patterns
 * 
 * @example
 * ```ts
 * export async function GET(request: Request) {
 *   const session = await getAuthenticatedSession();
 *   // session is guaranteed to exist here
 * }
 * ```
 */
export async function getAuthenticatedSession(): Promise<Session> {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new SessionError('No session found');
  }

  if (!session.accessToken) {
    throw new SessionError('No access token in session');
  }

  return session;
}

/**
 * Checks if user has required role
 * 
 * @example
 * ```ts
 * const session = await getAuthenticatedSession();
 * 
 * if (!hasRole(session, 'admin')) {
 *   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
 * }
 * ```
 */
export function hasRole(session: Session, role: string): boolean {
  // Only check roles array for role membership
  return !!session.user?.roles?.includes(role);
}

/**
 * Requires specific role or returns forbidden response
 * 
 * @example
 * ```ts
 * export async function DELETE(request: Request) {
 *   const [session, errorResponse] = await requireRole('admin');
 *   if (errorResponse) return errorResponse;
 *   
 *   // User is admin
 * }
 * ```
 */
export async function requireRole(
  role: string,
  requestId?: string
): Promise<[Session, null] | [null, NextResponse]> {
  const [session, errorResponse] = await requireAuth(requestId);
  
  if (errorResponse) {
    return [null, errorResponse];
  }

  if (!hasRole(session, role)) {
    return [
      null,
      createForbiddenResponse(`Requires ${role} role`, requestId),
    ];
  }

  return [session, null];
}

/**
 * Checks if user has any of the required roles
 */
export function hasAnyRole(session: Session, roles: string[]): boolean {
  return roles.some((role) => hasRole(session, role));
}

/**
 * Requires any of the specified roles
 */
export async function requireAnyRole(
  roles: string[],
  requestId?: string
): Promise<[Session, null] | [null, NextResponse]> {
  const [session, errorResponse] = await requireAuth(requestId);
  
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

/**
 * Creates standardized unauthorized response
 */
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

/**
 * Creates standardized forbidden response
 */
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

// Custom Error Class
export class SessionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SessionError';
  }
}
