import axios, { AxiosError } from 'axios';
import { logger } from '@/core/observability/logger';

export interface AppApiError {
  message: string;
  status: number;
  correlationId?: string;
  errors?: Record<string, string[]>;
  code?: string;
}

/**
 * Normalizes an Axios or Network error into a standardized AppApiError object.
 */
export function handleApiError(error: AxiosError): Promise<never> {
  // If the error has already been normalized or is not an AxiosError, reject it directly.
  if (!axios.isAxiosError(error)) {
    return Promise.reject(error);
  }

  const status = error.response?.status;
  const url = error.config?.url;
  const correlationId = error.config?.headers?.['X-Correlation-ID'] as string | undefined;

  if (process.env.NODE_ENV === 'development') {
    const resolvedUrl =
      error.config?.baseURL && error.config?.url
        ? `${String(error.config.baseURL).replace(/\/$/, '')}/${String(error.config.url).replace(/^\//, '')}`
        : url;
    logger.error('❌ API Failure:', {
      status,
      url,
      resolvedUrl,
      correlationId,
      message: error.message,
    });
  }

  // Handle 401 — only redirect when there is no restorable NextAuth session
  if (status === 401 && typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    const isAuthRoute =
      currentPath.startsWith('/auth/login') || currentPath.startsWith('/api/auth');

    if (!isAuthRoute) {
      void (async () => {
        const { getSession } = await import('next-auth/react');
        const session = await getSession();
        if (session?.accessToken && !session.error) {
          return;
        }
        window.location.href = `/auth/login?callbackUrl=${encodeURIComponent(currentPath)}`;
      })();
    }
  }

  const responseData = error.response?.data as Record<string, unknown> | undefined;

  const apiError: AppApiError = {
    message: (responseData?.message as string) || (responseData?.error as string) || 'An unexpected error occurred',
    status: status || 500,
    correlationId,
    errors: responseData?.errors as Record<string, string[]> | undefined,
    code: responseData?.code as string | undefined,
  };

  return Promise.reject(apiError);
}
