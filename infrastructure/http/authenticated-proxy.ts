/**
 * Authenticated BFF proxy — forwards requests to Spring Boot with the session access token.
 */

import { NextResponse } from 'next/server';
import { env } from '@/env';
import { requireAuth } from '@/infrastructure/http/session-utils';
import { buildBackendUrl, proxyToBackend } from '@/infrastructure/http/backend-fetch';
import type { BackendFetchOptions } from '@/infrastructure/http/backend-fetch';

export async function authenticatedProxyRequest(
  request: Request,
  backendPath: string,
  options?: Partial<BackendFetchOptions>
): Promise<NextResponse> {
  const [session, errorResponse] = await requireAuth(request);
  if (errorResponse) return errorResponse;

  const path = backendPath.startsWith('/') ? backendPath : `/${backendPath}`;
  const backendUrl = buildBackendUrl(`${env.backendApiUrl}${path}`, request);

  const method = (options?.method ?? request.method) as BackendFetchOptions['method'];
  let body = options?.body;

  if (body === undefined && method && !['GET', 'HEAD', 'DELETE'].includes(method)) {
    try {
      body = await request.json();
    } catch {
      body = undefined;
    }
  }

  return proxyToBackend({
    session,
    backendUrl,
    options: {
      method: method ?? 'GET',
      body,
      headers: options?.headers,
      timeout: options?.timeout,
      cache: options?.cache,
    },
  });
}
