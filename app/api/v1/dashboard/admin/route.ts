import { env } from "@/env";
import { requireAuth } from '@/lib/api/session-utils';
import { buildBackendUrl, proxyToBackend } from '@/lib/api/backend-fetch';

// Dashboard data is user-specific, so we use private caching only
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const [session, errorResponse] = await requireAuth();
  if (errorResponse) return errorResponse;

  const backendUrl = buildBackendUrl(
    `${env.apiBaseUrl}/api/v1/dashboard/admin`,
    request
  );

  const response = await proxyToBackend({ session, backendUrl });

  // Allow browser to cache for 10s; serve stale up to 30s while revalidating in background
  response.headers.set('Cache-Control', 'private, max-age=10, stale-while-revalidate=30');

  return response;
}

