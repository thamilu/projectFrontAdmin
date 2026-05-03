export const AUTH_ERRORS = {
  REFRESH_FAILED: 'RefreshAccessTokenError',
  TOKEN_EXPIRED: 'TokenExpired',
  NETWORK_ERROR: 'NetworkError',
  INVALID_SESSION: 'InvalidSession',
  INVALID_TOKEN_RESPONSE: 'InvalidTokenResponse',
} as const;

export type AuthErrorCode = (typeof AUTH_ERRORS)[keyof typeof AUTH_ERRORS];
