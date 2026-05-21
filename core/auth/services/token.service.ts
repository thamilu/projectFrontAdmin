import { JWT } from 'next-auth/jwt';
import { AUTH_ERRORS } from '../types/errors';
import { logger } from '@/core/observability/logger';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import { loadAuthConfig } from '../config/auth.config';
import { KeycloakTokenPayload, TokenValidationResult } from '../types/auth.types';

export const TOKEN_REFRESH_BUFFER_MS = 30_000; // 30 seconds

export function extractRoles(accessToken: string): string[] {
  try {
    const parts = accessToken.split('.');
    if (parts.length !== 3) return [];

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString()) as {
      realm_access?: { roles?: string[] };
      resource_access?: Record<string, { roles?: string[] }>;
      roles?: string[];
      groups?: string[];
    };

    const realmRoles = payload.realm_access?.roles ?? [];
    const resourceRoles = payload.resource_access
      ? Object.values(payload.resource_access).flatMap((r) => r.roles || [])
      : [];
    const rootRoles = payload.roles ?? [];
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

export async function refreshAccessToken(
  token: JWT,
  config: { issuer: string; clientId: string; clientSecret?: string }
): Promise<JWT> {
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

export async function logoutFromKeycloak(
  refreshToken: string,
  config: { issuer: string; clientId: string; clientSecret?: string }
): Promise<void> {
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

// ============================================================================
// JWKS CACHE & ID/ACCESS TOKEN VALIDATION
// ============================================================================

let jwksCache: ReturnType<typeof createRemoteJWKSet> | null = null;
let jwksCacheTime = 0;
const JWKS_CACHE_TTL = 60 * 60 * 1000; // 1 hour

function getJWKS(): ReturnType<typeof createRemoteJWKSet> {
  const now = Date.now();
  if (jwksCache && (now - jwksCacheTime) < JWKS_CACHE_TTL) {
    return jwksCache;
  }
  const config = loadAuthConfig();
  if (!config) {
    throw new Error('Auth configuration not loaded');
  }
  const jwksUri = `${config.keycloakBaseUrl.replace(/\/$/, '')}/realms/${config.realm}/protocol/openid-connect/certs`;
  jwksCache = createRemoteJWKSet(new URL(jwksUri), {
    cooldownDuration: 30000,
    cacheMaxAge: 60000,
  });
  jwksCacheTime = now;
  return jwksCache;
}

export function clearJWKSCache(): void {
  jwksCache = null;
  jwksCacheTime = 0;
}

export async function validateIdToken(
  idToken: string,
  expectedNonce?: string
): Promise<TokenValidationResult> {
  try {
    const config = loadAuthConfig();
    if (!config) {
      return {
        valid: false,
        error: 'Auth configuration not loaded',
        errorCode: 'CONFIG_MISSING',
      };
    }
    
    const result = await jwtVerify(
      idToken,
      getJWKS(),
      {
        issuer: `${config.keycloakBaseUrl.replace(/\/$/, '')}/realms/${config.realm}`,
        audience: config.clientId,
        algorithms: ['RS256'],
      }
    );
    
    const keycloakPayload = result.payload as unknown as KeycloakTokenPayload;
    
    if (expectedNonce && keycloakPayload.nonce !== expectedNonce) {
      logger.warn('Nonce mismatch detected', {
        expected: expectedNonce.substring(0, 8),
        received: keycloakPayload.nonce?.substring(0, 8),
      });
      return {
        valid: false,
        error: 'Nonce mismatch',
        errorCode: 'NONCE_MISMATCH',
      };
    }
    
    if (!keycloakPayload.sub) {
      return {
        valid: false,
        error: 'Missing subject claim',
        errorCode: 'INVALID_TOKEN',
      };
    }
    
    return {
      valid: true,
      payload: keycloakPayload,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    let errorCode = 'INVALID_TOKEN';
    if (errorMessage.includes('expired')) {
      errorCode = 'TOKEN_EXPIRED';
    } else if (errorMessage.includes('signature')) {
      errorCode = 'INVALID_SIGNATURE';
    } else if (errorMessage.includes('audience')) {
      errorCode = 'INVALID_AUDIENCE';
    } else if (errorMessage.includes('issuer')) {
      errorCode = 'INVALID_ISSUER';
    }
    logger.error('ID token validation failed', { error: errorMessage, errorCode });
    return {
      valid: false,
      error: errorMessage,
      errorCode,
    };
  }
}

export async function validateAccessToken(
  accessToken: string
): Promise<TokenValidationResult> {
  try {
    const config = loadAuthConfig();
    if (!config) {
      return {
        valid: false,
        error: 'Auth configuration not loaded',
        errorCode: 'CONFIG_MISSING',
      };
    }
    
    const result = await jwtVerify(
      accessToken,
      getJWKS(),
      {
        issuer: `${config.keycloakBaseUrl.replace(/\/$/, '')}/realms/${config.realm}`,
        algorithms: ['RS256'],
      }
    );
    
    const keycloakPayload = result.payload as unknown as KeycloakTokenPayload;
    
    if (!keycloakPayload.sub) {
      return {
        valid: false,
        error: 'Missing subject claim',
        errorCode: 'INVALID_TOKEN',
      };
    }
    
    return {
      valid: true,
      payload: keycloakPayload,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    let errorCode = 'INVALID_TOKEN';
    if (errorMessage.includes('expired')) {
      errorCode = 'TOKEN_EXPIRED';
    } else if (errorMessage.includes('signature')) {
      errorCode = 'INVALID_SIGNATURE';
    }
    logger.error('Access token validation failed', { error: errorMessage, errorCode });
    return {
      valid: false,
      error: errorMessage,
      errorCode,
    };
  }
}
