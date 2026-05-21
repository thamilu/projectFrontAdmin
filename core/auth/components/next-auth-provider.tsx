/**
 * NextAuth Session Provider Wrapper
 *
 * Wraps the app with NextAuth SessionProvider for authentication state management.
 * Configured with automatic session refetch and window focus refetch.
 * Handles expired sessions by forcing re-authentication.
 *
 * @module core/auth/components/next-auth-provider
 */

'use client';

import React, { useEffect } from 'react';
import { SessionProvider, useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

interface Props {
  children: React.ReactNode;
}

/**
 * Session Error Handler - forces logout on token errors
 * Optimized to prevent excessive session checks
 */
function SessionErrorHandler({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession();
  const pathname = usePathname();
  const hasHandledErrorRef = React.useRef(false);
  const retryAttemptedRef = React.useRef(false);

  useEffect(() => {
    if (!session?.error || status !== 'authenticated' || hasHandledErrorRef.current) {
      return;
    }

    // Retry token refresh once before signing out (transient Keycloak/network errors)
    if (!retryAttemptedRef.current) {
      retryAttemptedRef.current = true;
      void update().then((refreshed) => {
        if (!refreshed?.error) {
          retryAttemptedRef.current = false;
        }
      });
      return;
    }

    console.warn('[NextAuthProvider] Session error persists after refresh, signing out:', session.error);
    hasHandledErrorRef.current = true;

    signOut({
      callbackUrl: `/auth/login?error=SessionExpired&callbackUrl=${encodeURIComponent(pathname)}`,
    });
  }, [session?.error, status, pathname, update]);

  return <>{children}</>;
}

/**
 * NextAuth Provider Component
 *
 * Optimized session management:
 * - No automatic polling (only fetches when explicitly needed)
 * - No refetch on window focus (prevents excessive API calls)
 * - Token refresh handled automatically by NextAuth JWT callback
 *
 * Should be placed high in the component tree (typically in root layout)
 *
 * @example
 * ```tsx
 * <NextAuthProvider>
 *   <App />
 * </NextAuthProvider>
 * ```
 */
export default function NextAuthProvider({ children }: Props) {
  return (
    <SessionProvider
      // Re-fetch before Keycloak access tokens expire (~5 min); triggers JWT refresh callback
      refetchInterval={4 * 60}
      refetchOnWindowFocus
      refetchWhenOffline={false}
    >
      <SessionErrorHandler>{children}</SessionErrorHandler>
    </SessionProvider>
  );
}
