import { nestServer } from '@/lib/axios/server';
import { normalizeError } from '@/lib/axios/normalizeError';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const forwardedFor = req.headers.get('x-forwarded-for') ?? undefined;
    const userAgent = req.headers.get('user-agent') ?? undefined;
    const headers: Record<string, string> = {};
    if (forwardedFor) headers['x-forwarded-for'] = forwardedFor;
    if (userAgent) headers['user-agent'] = userAgent;
    const { data, status } = await nestServer.post(
      '/auth/reset-password',
      body,
      { headers },
    );
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

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token') ?? '';
    const forwardedFor = req.headers.get('x-forwarded-for') ?? undefined;
    const userAgent = req.headers.get('user-agent') ?? undefined;
    const headers: Record<string, string> = {};
    if (forwardedFor) headers['x-forwarded-for'] = forwardedFor;
    if (userAgent) headers['user-agent'] = userAgent;
    const { data, status } = await nestServer.get(
      '/auth/reset-password/validate',
      {
        params: { token },
        headers,
      },
    );
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
