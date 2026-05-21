import { authenticatedProxyRequest } from '@/infrastructure/http/authenticated-proxy';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return authenticatedProxyRequest(request, '/api/v1/users');
}
