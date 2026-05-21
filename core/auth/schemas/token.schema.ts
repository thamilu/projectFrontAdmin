/**
 * Keycloak Token Response Schema
 * 
 * @module core/auth/schemas/token.schema
 */

import { z } from 'zod';

export const KeycloakTokenResponseSchema = z.object({
  access_token: z.string().min(1),
  token_type: z.string().default('Bearer'),
  expires_in: z.number().int().positive().optional(),
  refresh_token: z.string().optional(),
  id_token: z.string().optional(),
  scope: z.string().optional(),
  'not-before-policy': z.number().optional(),
  session_state: z.string().optional(),
  refresh_expires_in: z.number().optional(),
});

export type KeycloakTokenResponse = z.infer<typeof KeycloakTokenResponseSchema>;

export const DEFAULT_TOKEN_EXPIRY_SECONDS = 3600;

export const KeycloakErrorResponseSchema = z.object({
  error: z.string(),
  error_description: z.string().optional(),
  error_uri: z.string().optional(),
});

export type KeycloakErrorResponse = z.infer<typeof KeycloakErrorResponseSchema>;

export function parseTokenResponse(
  data: unknown
): { success: true; data: KeycloakTokenResponse } | { success: false; error: string } {
  const result = KeycloakTokenResponseSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errorMessages = result.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ');

  return {
    success: false,
    error: errorMessages,
  };
}

export function parseErrorResponse(data: unknown): KeycloakErrorResponse | null {
  const result = KeycloakErrorResponseSchema.safeParse(data);
  return result.success ? result.data : null;
}
