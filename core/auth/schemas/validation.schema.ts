/**
 * Security & Request Validation Utilities
 * 
 * @module core/auth/schemas/validation.schema
 */

import { NextRequest } from 'next/server';

const ALLOWED_REDIRECT_PREFIXES = [
  '/',
  '/customer/dashboard',
  '/products',
  '/account',
  '/customer',
  '/admin',
  '/orders',
  '/cart',
  '/auth/popup-finish',
  '/auth/pkce-callback',
] as const;

const BLOCKED_REDIRECT_PATHS = [
  '/api/',
  '/auth/signout',
  '/auth/error',
  '//localhost',
  '/\\',
] as const;

export function validateRedirectUrl(
  redirectTo: string,
  appUrl: string,
  logger?: { warn: (msg: string, ctx?: unknown) => void }
): string {
  if (!redirectTo || redirectTo.trim() === '') {
    return '/';
  }

  if (redirectTo.startsWith('//')) {
    logger?.warn('Blocked protocol-relative redirect', { redirectTo });
    return '/';
  }

  if (redirectTo.includes('\\')) {
    logger?.warn('Blocked backslash in redirect', { redirectTo });
    return '/';
  }

  if (redirectTo.startsWith('/') && !redirectTo.startsWith('//')) {
    const isBlocked = BLOCKED_REDIRECT_PATHS.some((blocked) =>
      redirectTo.toLowerCase().startsWith(blocked.toLowerCase())
    );

    if (isBlocked) {
      logger?.warn('Blocked sensitive path redirect', { redirectTo });
      return '/';
    }

    const isAllowed = ALLOWED_REDIRECT_PREFIXES.some((allowed) =>
      redirectTo.startsWith(allowed)
    );

    if (!isAllowed) {
      logger?.warn('Redirect path not in allowlist', { redirectTo });
      return '/';
    }

    return redirectTo;
  }

  try {
    const targetUrl = new URL(redirectTo);
    const appUrlObj = new URL(appUrl);

    if (targetUrl.origin === appUrlObj.origin) {
      return validateRedirectUrl(targetUrl.pathname + targetUrl.search + targetUrl.hash, appUrl, logger);
    }

    logger?.warn('Blocked cross-origin redirect', { redirectTo, targetOrigin: targetUrl.origin });
    return '/';
  } catch {
    logger?.warn('Blocked malformed redirect URL', { redirectTo });
    return '/';
  }
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function isNavigationRequest(req: NextRequest): boolean {
  const secFetchMode = req.headers.get('sec-fetch-mode');
  const secFetchUser = req.headers.get('sec-fetch-user');
  const secFetchDest = req.headers.get('sec-fetch-dest');

  if (
    secFetchMode === 'navigate' ||
    secFetchUser === '?1' ||
    secFetchDest === 'document'
  ) {
    return true;
  }

  const accept = req.headers.get('accept') || '';
  return accept.includes('text/html');
}

export interface ValidatedAuthRequest {
  redirectTo: string;
  usePopup: boolean;
  direct: boolean;
  isNavigation: boolean;
  prompt?: 'none' | 'login' | 'consent' | 'select_account';
}

export function validateAuthRequest(
  req: NextRequest,
  appUrl: string,
  logger?: { warn: (msg: string, ctx?: unknown) => void }
): ValidatedAuthRequest {
  const url = new URL(req.url);

  const rawRedirect = url.searchParams.get('redirectTo') || '/';
  const redirectTo = validateRedirectUrl(rawRedirect, appUrl, logger);

  const popup = url.searchParams.get('popup');
  const usePopup = popup === '1' || popup === 'true';

  const direct = url.searchParams.get('direct') === '1';
  const isNavigation = isNavigationRequest(req);

  const promptParam = url.searchParams.get('prompt');
  const prompt =
    promptParam === 'login' ||
    promptParam === 'consent' ||
    promptParam === 'select_account' ||
    promptParam === 'none'
      ? promptParam
      : undefined;

  return {
    redirectTo,
    usePopup,
    direct,
    isNavigation,
    prompt,
  };
}
