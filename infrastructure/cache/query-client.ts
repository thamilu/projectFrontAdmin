import { QueryClient, DefaultOptions } from '@tanstack/react-query';

/**
 * Enterprise Infrastructure: Query Client
 * 
 * Centralized server state management configuration.
 * Optimizes for:
 * - Reduced redundant fetches (staleTime)
 * - Automatic background refetching
 * - Smart retry policies (avoiding retries on 4xx)
 */

const queryConfig: DefaultOptions = {
  queries: {
    staleTime: 5 * 60 * 1000, // 5 minutes (standard for admin data)
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
    refetchOnWindowFocus: true,
    refetchOnReconnect: 'always',
    retry: (failureCount, error: unknown) => {
      // Don't retry on client errors (4xx)
      const status = error && typeof error === 'object' && 'status' in error
        ? (error as { status: number }).status
        : undefined;

      if (status !== undefined && status >= 400 && status < 500) {
        return false;
      }
      return failureCount < 2; // Maximum 2 retries for 5xx/network errors
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },
  mutations: {
    retry: false, // Don't retry mutations by default (to prevent duplicate side effects)
  },
};

export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});
