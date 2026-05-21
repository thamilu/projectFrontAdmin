import { NextResponse } from 'next/server';
import { env } from "@/env";
import { requireAuth, buildBackendUrl, proxyToBackend } from '@/infrastructure/http';

export async function GET(request: Request) {
  // Authenticate user
  const [session, errorResponse] = await requireAuth(request);
  if (errorResponse) return errorResponse;

  // Build backend URL with query params
  const backendUrl = buildBackendUrl(
    `${env.backendApiUrl}/api/v1/paymentAnalytics`,
    request
  );

  // Proxy to backend
  return proxyToBackend({
    session,
    backendUrl,
  });
}
