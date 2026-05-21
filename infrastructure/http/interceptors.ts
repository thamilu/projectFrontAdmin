import { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { DEFAULT_API_VERSION } from './api-version';
import { logger } from '@/core/observability/logger';

/**
 * Attaches correlation tracking, API versioning, and Keycloak access tokens to request headers.
 */
export async function requestInterceptor(config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> {
  // 1. Correlation tracking
  const correlationId = crypto.randomUUID();
  config.headers['X-Correlation-ID'] = correlationId;

  // 2. Automated API version prefixing (skip auth and already-versioned paths)
  const url = config.url ?? '';
  const isVersioned = url.includes('/v1/') || url.includes('/v2/');
  const isAuthRoute = url.startsWith('/auth/') || url.startsWith('auth/');
  if (!isVersioned && !isAuthRoute) {
    const versionPrefix = `/${DEFAULT_API_VERSION}`;
    if (config.url?.startsWith('/')) {
      config.url = `${versionPrefix}${config.url}`;
    } else {
      config.url = `${versionPrefix}/${config.url}`;
    }
  }

  // 3. Attach authentication tokens
  if (typeof window !== 'undefined') {
    // Client-side Session Retrieval
    const { getSession } = await import('next-auth/react');
    const session = await getSession();
    if (session?.accessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
  } else {
    // SSR Fallback (Retrieve from standard token storage if present)
    if (typeof localStorage !== 'undefined') {
      const storedToken = localStorage.getItem('access_token');
      if (storedToken && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${storedToken}`;
      }
    }
  }

  return config;
}

/**
 * Handles development logging for successful HTTP operations.
 */
export function responseInterceptor(response: AxiosResponse): AxiosResponse {
  if (process.env.NODE_ENV === 'development') {
    logger.debug('✅ API Success:', {
      status: response.status,
      url: response.config.url,
      correlationId: response.config.headers['X-Correlation-ID'],
    });
  }
  return response;
}
