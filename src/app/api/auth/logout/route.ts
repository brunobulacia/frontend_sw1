import { serialize } from 'cookie';

export const runtime = 'nodejs';

export async function POST() {
  const cookie = serialize(process.env.AUTH_COOKIE_NAME || 'app_token', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.AUTH_COOKIE_SECURE === 'true',
    path: '/',
    maxAge: 0, 
  });

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Set-Cookie': cookie,
      'Content-Type': 'application/json',
    },
  });
}
