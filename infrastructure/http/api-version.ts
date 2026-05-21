/**
 * API Versioning Governance
 * 
 * Centralized definition of API versions to prevent drift and ensure
 * consistency across feature modules.
 */

export const API_VERSIONS = {
  V1: 'v1',
  V2: 'v2',
  LATEST: 'v1',
} as const;

export type ApiVersion = typeof API_VERSIONS[keyof typeof API_VERSIONS];

export const DEFAULT_API_VERSION = API_VERSIONS.V1;
