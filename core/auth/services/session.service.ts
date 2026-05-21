/**
 * Enterprise Session & Auth Utilities Service
 * 
 * @module core/auth/services/session.service
 */

import { cookies } from 'next/headers';
import { z } from 'zod';
import { SignJWT, jwtVerify } from 'jose';
import { logger } from '@/core/observability/logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '../config/next-auth.config';
import { redirect } from 'next/navigation';
import { APP_ROUTES } from '@/constants';

const SESSION_COOKIE_NAME = 'auth_session';
const PKCE_COOKIE_NAME = 'pkce_state';
const PKCE_STATE_MAX_AGE_SECONDS = 60 * 5;
const SESSION_REFRESH_THRESHOLD = 0.8;

const PkceStateSchema = z.object({
  codeVerifier: z.string().min(43).max(128),
  state: z.string().min(32),
  nonce: z.string().min(32),
  redirectTo: z.string().optional(),
  createdAt: z.number(),
});

export type PkceState = z.infer<typeof PkceStateSchema>;

const SessionDataSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  idToken: z.string(),
  expiresAt: z.number(),
  userId: z.string(),
  email: z.string().email().optional(),
  name: z.string().optional(),
  roles: z.array(z.string()),
});

export type SessionData = z.infer<typeof SessionDataSchema>;

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  
  if (!secret) {
    if (process.env.NODE_ENV !== 'production') {
      logger.warn('SESSION_SECRET is not set in environment (dev-only diagnostic)');
    }
    throw new Error(
      'SESSION_SECRET environment variable is required.'
    );
  }
  
  if (secret.length < 32) {
    if (process.env.NODE_ENV !== 'production') {
      logger.warn('SESSION_SECRET length is less than 32 characters (dev-only diagnostic).');
    }
    throw new Error(
      'SESSION_SECRET must be at least 32 characters for adequate security.'
    );
  }
  
  return new TextEncoder().encode(secret);
}

// ============================================================================
// PKCE State Management
// ============================================================================

export async function storePkceState(state: PkceState): Promise<void> {
  const validatedState = PkceStateSchema.parse(state);
  
  const encrypted = await new SignJWT(validatedState as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${PKCE_STATE_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  
  cookieStore.set(PKCE_COOKIE_NAME, encrypted, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: PKCE_STATE_MAX_AGE_SECONDS,
    path: '/',
  });
}

export async function retrievePkceState(): Promise<PkceState | null> {
  const cookieStore = await cookies();
  const encrypted = cookieStore.get(PKCE_COOKIE_NAME)?.value;
  
  if (!encrypted) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(encrypted, getSecretKey());
    const state = PkceStateSchema.parse(payload);
    
    const ageMs = Date.now() - state.createdAt;
    const maxAgeMs = PKCE_STATE_MAX_AGE_SECONDS * 1000;
    
    if (ageMs > maxAgeMs) {
      await clearPkceState();
      return null;
    }
    
    return state;
  } catch {
    await clearPkceState();
    return null;
  }
}

export async function clearPkceState(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(PKCE_COOKIE_NAME);
}

// ============================================================================
// Session Management (Custom Cookie Flows)
// ============================================================================

export async function createSession(data: SessionData): Promise<void> {
  const validatedData = SessionDataSchema.parse(data);
  const expiresInSeconds = Math.floor((validatedData.expiresAt - Date.now()) / 1000);
  
  const token = await new SignJWT(validatedData as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresInSeconds)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: expiresInSeconds,
    path: '/',
  });
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    const session = SessionDataSchema.parse(payload);
    
    if (session.expiresAt < Date.now()) {
      await destroySession();
      return null;
    }
    
    return session;
  } catch {
    await destroySession();
    return null;
  }
}

export function shouldRefreshSession(session: SessionData): boolean {
  const now = Date.now();
  const issued = session.expiresAt - (session.expiresAt - now);
  const lifetime = session.expiresAt - issued;
  const elapsed = now - issued;
  
  return elapsed > lifetime * SESSION_REFRESH_THRESHOLD;
}

export async function updateSession(updates: Partial<SessionData>): Promise<void> {
  const currentSession = await getSession();
  
  if (!currentSession) {
    throw new Error('No active session to update');
  }
  
  const updatedSession: SessionData = {
    ...currentSession,
    ...updates,
  };
  
  await createSession(updatedSession);
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null && session.expiresAt > Date.now();
}

export async function getUserRoles(): Promise<string[]> {
  const session = await getSession();
  return session?.roles || [];
}

export async function hasRole(role: string): Promise<boolean> {
  const roles = await getUserRoles();
  return roles.includes(role);
}

export async function hasAnyRole(roles: string[]): Promise<boolean> {
  const userRoles = await getUserRoles();
  return roles.some(role => userRoles.includes(role));
}

export async function hasAllRoles(roles: string[]): Promise<boolean> {
  const userRoles = await getUserRoles();
  return roles.every(role => userRoles.includes(role));
}

// ============================================================================
// NextAuth Core Helpers (Server Side)
// ============================================================================

export async function getNextAuthSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getNextAuthSession();

  if (!session?.user) {
    redirect(APP_ROUTES.AUTH.LOGIN);
  }

  return session.user;
}

export async function hasNextAuthRole(role: string): Promise<boolean> {
  const session = await getNextAuthSession();
  return session?.user?.roles?.includes(role) ?? false;
}

export async function requireRole(role: string) {
  const session = await getNextAuthSession();

  if (!session?.user?.roles?.includes(role)) {
    redirect('/403');
  }

  return session.user;
}
