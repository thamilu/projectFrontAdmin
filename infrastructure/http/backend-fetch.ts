/**
 * Backend Fetch Utility
 * 
 * Provides reusable functions for making authenticated requests to the backend API
 * Eliminates code duplication across API route handlers
 * 
 * @module lib/api/backend-fetch
 */

import { NextResponse } from 'next/server';
import { Session } from 'next-auth';

export interface BackendFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
  cache?: RequestCache;
}

export interface BackendFetchConfig {
  session: Session | null;
  backendUrl: string;
  options?: BackendFetchOptions;
  requestId?: string;
}

/**
 * Makes an authenticated request to the backend API
 * Handles common patterns: authorization, error handling, timeout, parsing
 * 
 * @example
 * ```ts
 * const session = await getServerSession(authOptions);
 * const data = await fetchFromBackend({
 *   session,
 *   backendUrl: `${env.apiBaseUrl}/api/v1/users`,
 *   options: { method: 'GET' }
 * });
 * ```
 */
export async function fetchFromBackend<T = unknown>(
  config: BackendFetchConfig
): Promise<T> {
  const { session, backendUrl, options = {}, requestId } = config;
  const { 
    method = 'GET', 
    body, 
    headers = {}, 
    timeout = 30000,
    cache = 'no-store'
  } = options;

  if (!session?.accessToken) {
    throw new UnauthorizedError('No access token available');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const fetchHeaders: Record<string, string> = {
      'Authorization': `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json',
      ...headers,
    };

    if (requestId) {
      fetchHeaders['X-Request-ID'] = requestId;
    }

    const response = await fetch(backendUrl, {
      method,
      headers: fetchHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      cache,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      await handleBackendError(response);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      throw new TimeoutError('Request timeout', timeout);
    }

    if (error instanceof BackendError) {
      throw error;
    }

    throw new NetworkError('Backend connection failed', error);
  }
}

/**
 * Makes an authenticated request and returns a NextResponse
 * Handles all error scenarios and returns appropriate HTTP responses
 * 
 * @example
 * ```ts
 * export async function GET(request: Request) {
 *   const session = await getServerSession(authOptions);
 *   return proxyToBackend({
 *     session,
 *     backendUrl: `${env.apiBaseUrl}/api/v1/products`,
 *   });
 * }
 * ```
 */
export async function proxyToBackend(
  config: BackendFetchConfig
): Promise<NextResponse> {
  try {
    const data = await fetchFromBackend(config);
    return NextResponse.json(data);
  } catch (error) {
    return handleErrorResponse(error, config.requestId);
  }
}

/**
 * Builds a backend URL with query parameters from a request
 */
export function buildBackendUrl(
  baseUrl: string,
  request: Request
): string {
  const { searchParams } = new URL(request.url);
  const url = new URL(baseUrl);

  searchParams.forEach((value, key) => {
    url.searchParams.append(key, value);
  });

  return url.toString();
}

/**
 * Extracts client metadata for audit trails
 */
export function extractClientMetadata(request: Request): {
  clientIp: string;
  userAgent: string;
} {
  const clientIp = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  return { clientIp, userAgent };
}

/**
 * Handles backend error responses
 */
async function handleBackendError(response: Response): Promise<never> {
  const errorText = await response.text();
  
  try {
    const errorJson = JSON.parse(errorText);
    throw new BackendError(
      errorJson.error || errorJson.message || 'Backend error',
      response.status,
      errorJson
    );
  } catch (e) {
    if (e instanceof BackendError) throw e;
    
    throw new BackendError(
      `Backend error: ${response.statusText}`,
      response.status,
      { details: errorText }
    );
  }
}

/**
 * Converts errors to NextResponse with appropriate status codes
 */
function handleErrorResponse(
  error: unknown,
  requestId?: string
): NextResponse {
  const headers: Record<string, string> = {};
  if (requestId) {
    headers['X-Request-ID'] = requestId;
  }

  if (error instanceof UnauthorizedError) {
    return NextResponse.json(
      { error: error.message },
      { status: 401, headers }
    );
  }

  if (error instanceof TimeoutError) {
    return NextResponse.json(
      { error: error.message, timeout: error.timeout },
      { 
        status: 504, 
        headers: { ...headers, 'Retry-After': '30' }
      }
    );
  }

  if (error instanceof BackendError) {
    return NextResponse.json(
      error.details || { error: error.message },
      { status: error.statusCode, headers }
    );
  }

  if (error instanceof NetworkError) {
    return NextResponse.json(
      { error: 'Backend connection failed', details: error.message },
      { status: 502, headers }
    );
  }

  console.error('Unhandled error:', error);
  return NextResponse.json(
    { error: 'Internal Server Error' },
    { status: 500, headers }
  );
}

// Custom Error Classes
export class BackendError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'BackendError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class TimeoutError extends Error {
  constructor(
    message: string = 'Request timeout',
    public timeout?: number
  ) {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class NetworkError extends Error {
  constructor(
    message: string = 'Network error',
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}
