import { NextAuthOptions } from 'next-auth';
import KeycloakProvider from 'next-auth/providers/keycloak';
import { getKeycloakConfig } from '@/lib/auth/env-config';
import {
  refreshAccessToken,
  shouldRefreshToken,
  extractRoles,
  logoutFromKeycloak
} from '@/lib/auth/token-service';
import { logger } from '@/lib/observability/logger';
import { AuthErrorCode } from '@/lib/auth/errors';

const keycloakConfig = getKeycloakConfig();

export const authOptions: NextAuthOptions = {
  debug: true,
  providers: [
    KeycloakProvider({
      clientId: keycloakConfig.clientId,
      // @ts-ignore - Runtime undefined is safe for public clients
      clientSecret: keycloakConfig.clientSecret || undefined,
      issuer: keycloakConfig.issuer,
      checks: ['pkce'], // Simplify checks
      client: {
        token_endpoint_auth_method: 'none',
      },
      authorization: {
        params: { scope: 'openid email profile' },
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: 'jwt',
  },

  callbacks: {
    async redirect({ url, baseUrl }) {
      // Avoid redirect loops
      if (url.includes('/auth/signin')) return baseUrl;
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },

    async jwt({ token, account }) {
      // Initial sign in
      if (account?.access_token) {
        const roles = extractRoles(account.access_token);
        logger.info('Role extraction', { roleCount: roles.length });

        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at ? account.expires_at * 1000 : Date.now() + 300_000,
          roles,
          error: undefined,
        };
      }

      // Existing token check
      if (!token.refreshToken) return token;

      if (!shouldRefreshToken(token.accessTokenExpires)) {
        return token;
      }

      // Refresh needed
      logger.info('Refreshing token');
      return await refreshAccessToken(token, keycloakConfig);
    },

    async session({ session, token }) {
      // Pass token error to client
      if (token.error) {
        session.error = token.error as AuthErrorCode;
      }

      session.roles = token.roles;

      if (session.user) {
        session.user.id = token.sub as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).roles = token.roles;
      }

      // Expose accessToken to server-side only
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (session as any).accessToken = token.accessToken;

      return session;
    },
  },

  events: {
    async signOut({ token }) {
      if (token?.refreshToken) {
        await logoutFromKeycloak(token.refreshToken as string, keycloakConfig);
      }
    }
  },
  cookies: {
    sessionToken: {
      name: `eshop-admin-session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    callbackUrl: {
      name: `eshop-admin-callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: `eshop-admin-csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    pkceCodeVerifier: {
      name: `eshop-admin-pkce-code-verifier`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    state: {
      name: `eshop-admin-state`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    nonce: {
      name: `eshop-admin-nonce`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
};
