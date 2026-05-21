import { authenticatedProxyRequest } from '@/infrastructure/http/authenticated-proxy';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  context: { params: Promise<{ role: string }> }
) {
  const { role } = await context.params;
  return authenticatedProxyRequest(request, `/api/v1/users/role/${encodeURIComponent(role)}`);
}
