import { parse } from 'cookie';
import { nestServer } from '@/lib/axios/server';
import { normalizeError } from '@/lib/axios/normalizeError';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const cookieHeader = req.headers.get('cookie');
  const cookies = cookieHeader ? parse(cookieHeader) : {};
  const token = cookies[process.env.AUTH_COOKIE_NAME || 'app_token'];

  if (!token) {
    return new Response(JSON.stringify({ authenticated: false }), { status: 401 });
  }

  try {
    const { data } = await nestServer.get('/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return new Response(JSON.stringify({ authenticated: true, user: data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    const { status } = normalizeError(e);
    return new Response(JSON.stringify({ authenticated: false }), { status: status || 401 });
  }
}
