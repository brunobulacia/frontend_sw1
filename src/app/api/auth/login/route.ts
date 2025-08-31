import { serialize } from 'cookie';
import { nestServer } from '@/lib/axios/server';
import { normalizeError } from '@/lib/axios/normalizeError';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json(); // { email, password }
    const { data, status } = await nestServer.post('/auth/login', body);

    const token: string | undefined = data?.access_token;
    if (!token) {
      return new Response(JSON.stringify({ error: 'No token received' }), { status: 502 });
    }

    const cookie = serialize(process.env.AUTH_COOKIE_NAME || 'app_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.AUTH_COOKIE_SECURE === 'true',
      path: '/',
      maxAge: 60 * 60,
    });

    return new Response(JSON.stringify({ ok: true }), {
      status,
      headers: {
        'Set-Cookie': cookie,
        'Content-Type': 'application/json',
      },
    });
  } catch (e: any) {
    const { status, body } = normalizeError(e);
    return new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
