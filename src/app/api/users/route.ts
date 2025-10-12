import { nestServer } from '@/lib/axios/server';
import { normalizeError } from '@/lib/axios/normalizeError';
import { extractAuthToken } from '@/lib/auth/cookies';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const token = extractAuthToken(req);
  if (!token) {
    return new Response(JSON.stringify({ error: 'No autenticado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { data, status } = await nestServer.get('/users', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    const { status, body } = normalizeError(e);
    return new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

