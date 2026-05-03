import { JWT } from 'next-auth/jwt';
import { AUTH_ERRORS } from './errors';
import { logger } from '@/lib/observability/logger';

export const TOKEN_REFRESH_BUFFER_MS = 30_000; // 30 seconds

export function extractRoles(accessToken: string): string[] {
  try {
    const parts = accessToken.split('.');
    if (parts.length !== 3) return [];

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

    // 1. Standard Keycloak Realm Roles
    const realmRoles = payload.realm_access?.roles ?? [];

    // 2. Standard Keycloak Client/Resource Roles
    const resourceRoles = payload.resource_access
      ? Object.values(payload.resource_access).flatMap((r: any) => r.roles || [])
      : [];

    // 3. Root Level Roles (Generic OIDC)
    const rootRoles = payload.roles ?? [];

    // 4. Groups (often used as roles)
    const groups = payload.groups ?? [];

    const allRoles = [...realmRoles, ...resourceRoles, ...rootRoles, ...groups];
    return Array.from(new Set(allRoles.map(r => String(r))));
  } catch (error) {
    logger.warn('Failed to extract roles', { error });
    return [];
  }
}

export function shouldRefreshToken(expiresAt?: number): boolean {
  if (!expiresAt) return true;
  return Date.now() >= expiresAt - TOKEN_REFRESH_BUFFER_MS;
}

export async function refreshAccessToken(token: JWT, config: { issuer: string; clientId: string; clientSecret?: string }): Promise<JWT> {
  try {
    if (!token.refreshToken) throw new Error('No refresh token');

    const url = `${config.issuer}/protocol/openid-connect/token`;
    const formData = new URLSearchParams({
      client_id: config.clientId,
      grant_type: 'refresh_token',
      refresh_token: token.refreshToken as string,
    });

    if (config.clientSecret) {
      formData.append('client_secret', config.clientSecret);
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      logger.error('Refresh failed', { status: response.status, data });
      return { ...token, error: AUTH_ERRORS.REFRESH_FAILED };
    }

    return {
      ...token,
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? token.refreshToken,
      accessTokenExpires: Date.now() + data.expires_in * 1000,
      roles: extractRoles(data.access_token),
      error: undefined,
    };
  } catch (error) {
    logger.error('Refresh token error', { error });
    return { ...token, error: AUTH_ERRORS.NETWORK_ERROR };
  }
}

export async function logoutFromKeycloak(refreshToken: string, config: { issuer: string; clientId: string; clientSecret?: string }): Promise<void> {
  try {
    const url = `${config.issuer}/protocol/openid-connect/logout`;
    const formData = new URLSearchParams({
      client_id: config.clientId,
      refresh_token: refreshToken,
    });
    if (config.clientSecret) {
      formData.append('client_secret', config.clientSecret);
    }

    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    });
  } catch (error) {
    logger.error('Keycloak logout error', { error });
  }
}
