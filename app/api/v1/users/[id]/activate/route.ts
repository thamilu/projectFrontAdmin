import { authenticatedProxyRequest } from '@/infrastructure/http/authenticated-proxy';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  return authenticatedProxyRequest(request, `/api/v1/users/${id}/activate`, { method: 'PUT' });
}
