/**
 * Providers Component
 *
 * Enterprise provider hierarchy with:
 * - React Query for data fetching and caching
 * - NextAuth authentication with Keycloak
 * - Theme provider for dark mode
 * - Toast notifications
 * - Analytics tracking
 * - Error boundaries
 * - Accessibility features
 *
 * @module app/providers
 */

'use client';

import { useState, type ReactNode, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from '@/app/providers/theme-provider';
// AuthProvider removed in favor of NextAuthProvider (SessionProvider)
import NextAuthProvider from '@/core/auth/components/next-auth-provider';
import { ToastProvider } from '@/app/providers/toast-provider';
import { Toaster } from 'sonner';
import { AnalyticsProvider } from '@/app/providers/analytics-provider';
import { ErrorBoundary } from '@/shared/feedback/error-boundary';
import { NetworkStatus } from '@/shared/ui/network-status';
import { ScreenReaderAnnouncer } from '@/shared/ui/screen-reader-announcer';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Create Query Client with enterprise configuration
 *
 * Features:
 * - Smart retry logic (don't retry 4xx errors)
 * - Exponential backoff
 * - Stale-while-revalidate caching
 * - Garbage collection
 * - Structural sharing for performance
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data considered fresh for 5 minutes (reduced refetching)
        staleTime: 5 * 60 * 1000,
        // Unused data garbage collected after 10 minutes
        gcTime: 10 * 60 * 1000,
        // Smart retry logic
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors (client errors)
          if (error instanceof Error && 'status' in error) {
            const status = (error as { status: number }).status;
            if (status >= 400 && status < 500) {
              return false;
            }
          }
          // Retry up to 2 times for server errors
          return failureCount < 2;
        },
        // Exponential backoff: 1s, 2s, 4s (max 30s)
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Disable aggressive refetching to reduce API calls
        refetchOnWindowFocus: false, // Changed from production check
        refetchOnReconnect: false, // Disable reconnect refetch
        refetchOnMount: false, // Only fetch if data is stale
        // Structural sharing for better performance
        structuralSharing: true,
      },
      mutations: {
        retry: 1,
        retryDelay: 1000,
      },
    },
  });
}

// Singleton for browser, new instance per request on server
let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Get or create Query Client
 *
 * Server: Always create new instance per request
 * Browser: Reuse singleton instance
 */
function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  }

  // Browser: make a new query client if we don't already have one
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }

  return browserQueryClient;
}

// Legacy integrations removed

/**
 * Providers Wrapper Component
 *
 * Provides context providers in optimal nesting order:
 * 1. Error Boundary (outermost - catches all errors)
 * 2. Query Client (data fetching with Keycloak auth)
 * 3. Theme Provider (appearance)
 * 4. Auth Provider (authentication state)
 * 5. Toast Provider (notifications - using sonner)
 * 6. Analytics Provider (tracking)
 *
 * Also includes:
 * - Screen reader announcements
 * - Network status indicator
 * - Cookie consent banner
 * - React Query DevTools (development only)
 * - Legacy integrations (backward compatibility)
 *
 * @example
 * ```tsx
 * <Providers>
 *   <App />
 * </Providers>
 * ```
 */
export function Providers({ children }: ProvidersProps) {
  // Use a client-specific QueryClient in the browser, server gets a fresh one
  const [qc] = useState(() => getQueryClient());

  return (
    <ErrorBoundary>
      <QueryClientProvider client={qc}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="eshop-theme"
        >
          <NextAuthProvider>

            <ToastProvider />
            <Suspense fallback={null}>
              <AnalyticsProvider>
                <ScreenReaderAnnouncer />
                <NetworkStatus />

                {children}

                <Toaster position="top-right" richColors closeButton />

                {process.env.NODE_ENV === 'development' && (
                  <ReactQueryDevtools initialIsOpen={false} />
                )}
              </AnalyticsProvider>
            </Suspense>
          </NextAuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary >
  );
}
