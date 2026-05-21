/**
 * Proof Key for Code Exchange (PKCE) Utilities Service
 * 
 * @module core/auth/services/pkce.service
 */

import { randomBytes, createHash } from 'crypto';

const VERIFIER_LENGTH_BYTES = 32;
const STATE_LENGTH_BYTES = 16;
const NONCE_LENGTH_BYTES = 16;

export interface PKCEChallenge {
  verifier: string;
  challenge: string;
  state: string;
  nonce: string;
}

export interface OAuthParams {
  redirectUri: string;
  codeChallenge: string;
  state: string;
  nonce: string;
  scope?: string;
  loginHint?: string;
  prompt?: 'none' | 'login' | 'consent' | 'select_account';
  uiLocales?: string;
  acrValues?: string;
}

function generateSecureRandom(length: number): string {
  try {
    const buffer = randomBytes(length);
    return base64url(buffer);
  } catch (error) {
    throw new Error(
      `Failed to generate secure random bytes: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

function base64url(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function sha256(input: string): Buffer {
  return createHash('sha256').update(input).digest();
}

export function generatePKCEChallenge(): PKCEChallenge {
  const verifier = generateSecureRandom(VERIFIER_LENGTH_BYTES);
  const challenge = base64url(sha256(verifier));
  const state = generateSecureRandom(STATE_LENGTH_BYTES);
  const nonce = generateSecureRandom(NONCE_LENGTH_BYTES);

  return {
    verifier,
    challenge,
    state,
    nonce,
  };
}

export function isValidVerifier(verifier: string): boolean {
  if (!verifier || typeof verifier !== 'string') {
    return false;
  }
  if (verifier.length < 43 || verifier.length > 128) {
    return false;
  }
  const validPattern = /^[A-Za-z0-9\-._~]+$/;
  return validPattern.test(verifier);
}

export function isValidState(state: string): boolean {
  if (!state || typeof state !== 'string') {
    return false;
  }
  if (state.length < 16) {
    return false;
  }
  const validPattern = /^[A-Za-z0-9\-_]+$/;
  return validPattern.test(state);
}

export function isValidNonce(nonce: string): boolean {
  return isValidState(nonce);
}

export function buildAuthorizationUrl(
  authorizationEndpoint: string,
  clientId: string,
  params: OAuthParams
): string {
  const url = new URL(authorizationEndpoint);
  
  let redirectUri = params.redirectUri;
  if (!/^https?:\/\//i.test(String(redirectUri))) {
    const appBase = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    redirectUri = `${appBase.replace(/\/$/, '')}/${String(redirectUri).replace(/^\//, '')}`;
  }

  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', params.scope || 'openid profile email');
  
  url.searchParams.set('code_challenge', params.codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');
  
  url.searchParams.set('state', params.state);
  
  url.searchParams.set('nonce', params.nonce);
  
  if (params.loginHint) {
    url.searchParams.set('login_hint', params.loginHint);
  }
  
  if (params.prompt) {
    url.searchParams.set('prompt', params.prompt);
  }
  
  if (params.uiLocales) {
    url.searchParams.set('ui_locales', params.uiLocales);
  }
  
  if (params.acrValues) {
    url.searchParams.set('acr_values', params.acrValues);
  }

  return url.toString();
}
