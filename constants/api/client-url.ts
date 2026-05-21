/**
 * Resolves browser-facing API paths for fetch() and other non-axios callers.
 * Axios uses env.clientApiBaseUrl (`/api`) + relative paths from API_ENDPOINTS.
 */
export const CLIENT_API_PREFIX = '/api';

export function clientApiUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (normalized.startsWith(`${CLIENT_API_PREFIX}/`)) {
    return normalized;
  }
  return `${CLIENT_API_PREFIX}${normalized}`;
}
