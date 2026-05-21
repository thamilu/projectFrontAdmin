import { NextAuthOptions, Profile } from 'next-auth';
import { OAuthConfig } from 'next-auth/providers/oauth';
import { getKeycloakConfig } from './auth.config';
import {
  refreshAccessToken,
  shouldRefreshToken,
  extractRoles,
  logoutFromKeycloak
} from '../services/token.service';
import { logger } from '@/core/observability/logger';
import { AuthErrorCode } from '../types/errors';
import { APP_ROUTES } from '@/constants';

const keycloakConfig = getKeycloakConfig();

/**
 * Custom Keycloak OIDC provider for public PKCE clients.
 *
 * Using a hand-crafted OAuthConfig instead of KeycloakProvider because
 * openid-client v5's `checkBasicSupport()` silently downgrades
 * `token_endpoint_auth_method: 'none'` to `'client_secret_post'` whenever
 * the constructed Issuer does not list `'none'` in its
 * `token_endpoint_auth_methods_supported` array. KeycloakProvider + wellKnown:undefined
 * builds a manual Issuer without that field, which defaults to
 * `['client_secret_basic']`, triggering the silent downgrade and causing
 * Keycloak to reject the token exchange because the client is public.
 *
 * By using a raw OAuthConfig we skip next-auth's `openidClient()` helper
 * entirely for the issuer-construction step; next-auth will still call the
 * endpoints we provide directly, including PKCE code_challenge/verifier.
 */
function buildKeycloakProvider(): OAuthConfig<Profile> {
  const issuer = keycloakConfig.issuer;
  return {
    id: 'keycloak',
    name: 'Keycloak',
    type: 'oauth',
    version: '2.0',
    wellKnown: `${issuer}/.well-known/openid-configuration`,
    authorization: {
      url: `${issuer}/protocol/openid-connect/auth`,
      params: { scope: 'openid email profile offline_access' },
    },
    token: {
      url: `${issuer}/protocol/openid-connect/token`,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async request(context: any) {
        // Perform a PKCE public-client token exchange (no client_secret).
        // We intentionally bypass openid-client here: its checkBasicSupport()
        // silently downgrades token_endpoint_auth_method:'none' to
        // 'client_secret_post' when the Issuer is built without specifying
        // token_endpoint_auth_methods_supported, causing Keycloak to reject
        // the token request for public PKCE clients.
        const code_verifier =
          (context.checks as Record<string, string | undefined>).code_verifier;
        const params = new URLSearchParams({
          grant_type: 'authorization_code',
          code: String(context.params.code ?? ''),
          redirect_uri: context.provider.callbackUrl as string,
          client_id: String(context.provider.clientId ?? ''),
          ...(code_verifier ? { code_verifier } : {}),
        });

        const response = await fetch(`${issuer}/protocol/openid-connect/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString(),
        });

        const tokens = await response.json() as Record<string, unknown>;

        if (!response.ok) {
          logger.error('[keycloak] Token exchange failed', {
            status: response.status,
            error: tokens.error,
            description: tokens.error_description,
          });
          throw new Error(String(tokens.error_description ?? tokens.error ?? 'Token exchange failed'));
        }

        return { tokens };
      },
    },
    userinfo: `${issuer}/protocol/openid-connect/userinfo`,
    jwks_endpoint: `${issuer}/protocol/openid-connect/certs`,
    issuer,
    idToken: true,
    checks: ['pkce', 'state'],
    client: {
      token_endpoint_auth_method: 'none',
    },
    clientId: keycloakConfig.clientId,
    clientSecret: '',
    profile(profile: Profile) {
      return {
        id: profile.sub ?? '',
        name: (profile as Record<string, unknown>).name as string
          ?? (profile as Record<string, unknown>).preferred_username as string,
        email: profile.email ?? '',
        image: (profile as Record<string, unknown>).picture as string | null ?? null,
      };
    },
  };
}

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV !== 'production',
  providers: [buildKeycloakProvider()],

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: APP_ROUTES.AUTH.LOGIN,
    error: '/auth/error',
  },

  callbacks: {
    async redirect({ url, baseUrl }) {
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
          userId: token.sub || (token.userId as string),
          error: undefined,
        };
      }

      // Existing token check
      if (!token.refreshToken) return token;

      if (!shouldRefreshToken(token.accessTokenExpires as number)) {
        return token;
      }

      // Refresh needed
      logger.info('Refreshing token');
      return await refreshAccessToken(token, keycloakConfig);
    },

    async session({ session, token }) {
      if (token.error) {
        session.error = token.error as AuthErrorCode;
      }

      session.roles = token.roles as string[];

      if (session.user) {
        session.user.id = (token.sub || token.userId) as string;
        session.user.roles = token.roles as string[];
      }

      session.accessToken = token.accessToken as string;

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
