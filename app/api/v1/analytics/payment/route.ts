import { NextResponse } from 'next/server';
import { env } from "@/env";
import { requireAuth } from '@/lib/api/session-utils';
import { buildBackendUrl, proxyToBackend } from '@/lib/api/backend-fetch';

export async function GET(request: Request) {
  // Authenticate user
  const [session, errorResponse] = await requireAuth();
  if (errorResponse) return errorResponse;

  // Build backend URL with query params
  const backendUrl = buildBackendUrl(
    `${env.apiBaseUrl}/api/v1/paymentAnalytics`,
    request
  );

  // Proxy to backend
  return proxyToBackend({
    session,
    backendUrl,
  });
}
