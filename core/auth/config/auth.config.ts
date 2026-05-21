/**
 * Keycloak & Auth Configuration Service
 * 
 * Enterprise-grade configuration management for OAuth2/OIDC flows.
 * Includes type-safe validation, caching, and SSRF host protections.
 * 
 * @module core/auth/config/auth.config
 */

import { z } from 'zod';
import { logger } from '@/core/observability/logger';

export const AuthConfigSchema = z.object({
  keycloakBaseUrl: z.string().url('KEYCLOAK_BASE_URL must be a valid URL'),
  realm: z.string().min(1, 'KEYCLOAK_REALM is required'),
  clientId: z.string().min(1, 'KEYCLOAK_CLIENT_ID is required'),
  clientSecret: z.string().optional(),
  appUrl: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),
  allowedHosts: z.array(z.string()).optional(),
  scope: z.string().optional(),
});

export type AuthConfig = z.infer<typeof AuthConfigSchema>;

export interface ConfigValidationResult {
  success: boolean;
  config?: AuthConfig;
  errors?: string[];
  missingVars?: string[];
}

export interface KeycloakConfig {
  clientId: string;
  clientSecret?: string;
  issuer: string;
}

let cachedConfig: AuthConfig | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL_MS = 60_000; // 1 minute cache in development

function getEnvVar(serverKey: string, publicKey: string): string | undefined {
  return process.env[serverKey] || process.env[publicKey];
}

function validateKeycloakHost(baseUrl: string, allowedHosts?: string[]): boolean {
  if (!allowedHosts || allowedHosts.length === 0) {
    if (process.env.NODE_ENV !== 'production') {
      return true;
    }
    
    logger.warn(
      '[auth-config] ALLOWED_AUTH_HOSTS not configured in production. ' +
      'This is a security risk (SSRF vulnerability). ' +
      'Set ALLOWED_AUTH_HOSTS to comma-separated list of allowed Keycloak domains.'
    );
    return false;
  }

  try {
    const url = new URL(baseUrl);
    const isAllowed = allowedHosts.includes(url.host);
    
    if (!isAllowed) {
      logger.error(
        `[auth-config] Keycloak host ${url.host} not in allowed list: ${allowedHosts.join(', ')}`
      );
    }
    
    return isAllowed;
  } catch (error) {
    logger.error('[auth-config] Invalid Keycloak base URL', { baseUrl, error });
    return false;
  }
}

export function loadAuthConfig(): AuthConfig | null {
  const now = Date.now();
  const cacheValid = process.env.NODE_ENV === 'production' 
    ? cachedConfig !== null
    : cachedConfig !== null && (now - cacheTimestamp) < CACHE_TTL_MS;
  
  if (cacheValid) {
    return cachedConfig;
  }

  const rawConfig = {
    keycloakBaseUrl: getEnvVar('KEYCLOAK_BASE_URL', 'NEXT_PUBLIC_KEYCLOAK_URL'),
    realm: getEnvVar('KEYCLOAK_REALM', 'NEXT_PUBLIC_KEYCLOAK_REALM'),
    clientId: getEnvVar('KEYCLOAK_CLIENT_ID', 'NEXT_PUBLIC_KEYCLOAK_CLIENT_ID'),
    clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    allowedHosts: process.env.ALLOWED_AUTH_HOSTS?.split(',').map(h => h.trim()).filter(Boolean),
    scope: getEnvVar('KEYCLOAK_SCOPE', 'NEXT_PUBLIC_KEYCLOAK_SCOPE'),
  };

  const result = AuthConfigSchema.safeParse(rawConfig);
  
  if (!result.success) {
    const errors = result.error.flatten();
    logger.error('[auth-config] Invalid authentication configuration', {
      fieldErrors: errors.fieldErrors,
      formErrors: errors.formErrors,
    });
    
    cachedConfig = null;
    return null;
  }

  if (!validateKeycloakHost(result.data.keycloakBaseUrl, result.data.allowedHosts)) {
    cachedConfig = null;
    return null;
  }

  cachedConfig = result.data;
  cacheTimestamp = now;
  
  return cachedConfig;
}

export function validateAuthConfig(): ConfigValidationResult {
  const config = loadAuthConfig();
  
  if (config) {
    return { success: true, config };
  }

  const missingVars: string[] = [];
  
  if (!getEnvVar('KEYCLOAK_BASE_URL', 'NEXT_PUBLIC_KEYCLOAK_URL')) {
    missingVars.push('KEYCLOAK_BASE_URL or NEXT_PUBLIC_KEYCLOAK_URL');
  }
  if (!getEnvVar('KEYCLOAK_REALM', 'NEXT_PUBLIC_KEYCLOAK_REALM')) {
    missingVars.push('KEYCLOAK_REALM or NEXT_PUBLIC_KEYCLOAK_REALM');
  }
  if (!getEnvVar('KEYCLOAK_CLIENT_ID', 'NEXT_PUBLIC_KEYCLOAK_CLIENT_ID')) {
    missingVars.push('KEYCLOAK_CLIENT_ID or NEXT_PUBLIC_KEYCLOAK_CLIENT_ID');
  }

  return {
    success: false,
    errors: ['Authentication configuration incomplete or invalid'],
    missingVars,
  };
}

export function clearConfigCache(): void {
  cachedConfig = null;
  cacheTimestamp = 0;
}

export function getAuthorizationEndpoint(config: AuthConfig): string {
  const baseUrl = config.keycloakBaseUrl.replace(/\/$/, '');
  return `${baseUrl}/realms/${config.realm}/protocol/openid-connect/auth`;
}

export function getTokenEndpoint(config: AuthConfig): string {
  const baseUrl = config.keycloakBaseUrl.replace(/\/$/, '');
  return `${baseUrl}/realms/${config.realm}/protocol/openid-connect/token`;
}

export function getLogoutEndpoint(config: AuthConfig): string {
  const baseUrl = config.keycloakBaseUrl.replace(/\/$/, '');
  return `${baseUrl}/realms/${config.realm}/protocol/openid-connect/logout`;
}

export function getKeycloakConfig(): KeycloakConfig {
  const clientId = process.env.KEYCLOAK_CLIENT_ID;
  const issuer = process.env.KEYCLOAK_ISSUER;

  if (!clientId || !issuer) {
    throw new Error('Missing required Keycloak environment variables: KEYCLOAK_CLIENT_ID, KEYCLOAK_ISSUER');
  }

  return {
    clientId,
    clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
    issuer,
  };
}

export function getLogoutUrl(redirectUri?: string): string {
  const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'eshop';
  const appBase = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const keycloakUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL || process.env.KEYCLOAK_BASE_URL || 'http://localhost:8080';
  let logoutUri: string;

  if (!redirectUri) {
    logoutUri = appBase;
  } else if (/^https?:\/\//i.test(redirectUri)) {
    logoutUri = redirectUri;
  } else {
    logoutUri = `${appBase.replace(/\/$/, '')}/${String(redirectUri).replace(/^\//, '')}`;
  }

  return `${keycloakUrl}/realms/${realm}/protocol/openid-connect/logout?redirect_uri=${encodeURIComponent(logoutUri)}`;
}

export function getRegistrationUrl(redirectUri?: string): string {
  const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'eshop';
  const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'eshop-client';
  const appBase = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const keycloakUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL || process.env.KEYCLOAK_BASE_URL || 'http://localhost:8080';
  
  const redirect = `${appBase.replace(/\/$/, '')}/api/auth/callback/keycloak`;
  const registrationUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/registrations?client_id=${clientId}&response_type=code&scope=openid%20profile%20email&redirect_uri=${encodeURIComponent(redirect)}`;
  
  if (redirectUri && typeof window !== 'undefined') {
    sessionStorage.setItem('post_register_redirect', redirectUri);
  }
  
  return registrationUrl;
}

export function getKeycloakIssuer(): string {
  const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'eshop';
  const keycloakUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL || process.env.KEYCLOAK_BASE_URL || 'http://localhost:8080';
  return `${keycloakUrl}/realms/${realm}`;
}
