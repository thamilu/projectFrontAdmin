import { NextResponse } from 'next/server';
import { env } from "@/env";
import { requireAuth, proxyToBackend, parseRequestBody } from '@/lib/api';
import { ApproveSellerRequestSchema, RejectSellerRequestSchema } from '@/lib/validation/schemas/seller-request';

type Action = 'approve' | 'reject';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string; action: string }> }
) {
  // Authenticate user
  const [session, errorResponse] = await requireAuth();
  if (errorResponse) return errorResponse;

  const { id, action } = await context.params;

  // Validate action
  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  // Parse request body
  const rawBody = await parseRequestBody(request);

  let body = undefined;
  if (action === 'reject') {
    const result = RejectSellerRequestSchema.safeParse(rawBody || {});
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    body = result.data;
  } else if (action === 'approve') {
    const result = ApproveSellerRequestSchema.safeParse(rawBody || {});
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    body = result.data;
  }

  // Proxy to backend
  const backendUrl = `${env.apiBaseUrl}/api/v1/sellers/requests/${id}/${action}`;
  console.log(`Proxying seller action to: ${backendUrl}`);

  return proxyToBackend({
    session,
    backendUrl,
    options: {
      method: 'POST',
      body,
    },
  });
}
