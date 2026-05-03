/**
 * Environment Configuration
 * 
 * Centralized environment variable access with type safety.
 * Reconstructed based on types/env-module.d.ts and .env.local
 */

export const env = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8082',
  apiAuthUrl: process.env.NEXT_PUBLIC_API_AUTH_URL || 'http://localhost:8082/api/auth',
  keycloakUrl: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
  appName: 'EShop Admin',
  enableOAuth: true,
  enableDirectLogin: true,
};
