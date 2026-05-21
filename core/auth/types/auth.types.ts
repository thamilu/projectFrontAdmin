import { z } from 'zod';
import type { AuthConfig } from '../config/auth.config';
import type { PkceState, SessionData } from '../services/session.service';
import { UserRole } from '@/types/index';

export type { AuthConfig, PkceState, SessionData };
export { UserRole };

export const CallbackParamsSchema = z.object({
  code: z.string().min(1),
  state: z.string().min(1),
});

export const OAuthErrorSchema = z.object({
  error: z.string().optional(),
  error_description: z.string().optional(),
  error_uri: z.string().optional(),
});

export const TokenResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string().optional(),
  id_token: z.string(),
  token_type: z.string().optional(),
  expires_in: z.number().optional(),
  refresh_expires_in: z.number().optional(),
});

export type TokenResponse = z.infer<typeof TokenResponseSchema>;

export interface KeycloakTokenPayload {
  iss?: string;
  sub: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  realm_access?: {
    roles: string[];
  };
  resource_access?: Record<string, { roles: string[] }>;
  nonce?: string;
  azp?: string;
  auth_time?: number;
  session_state?: string;
  sid?: string;
}

export interface TokenValidationResult {
  valid: boolean;
  payload?: KeycloakTokenPayload;
  error?: string;
  errorCode?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  permissions?: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
}

export interface AuthError {
  code: string;
  message: string;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
}
