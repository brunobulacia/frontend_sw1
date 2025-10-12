import { nestServer } from '@/lib/axios/server';
import { normalizeError } from '@/lib/axios/normalizeError';

export const runtime = 'nodejs';

type RegisterBody = {
  email?: string;
  username?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  timezone?: string;
};

const getServerTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';
  } catch {
    return 'UTC';
  }
};

export async function POST(req: Request) {
  try {
    const body: RegisterBody = await req.json();

    const payload = {
      email: body?.email?.trim(),
      username: body?.username?.trim(),
      password: body?.password ?? '',
      firstName: body?.firstName?.trim(),
      lastName: body?.lastName?.trim(),
      timezone: body?.timezone?.trim() || getServerTimezone(),
    };

    const { data, status } = await nestServer.post('/auth/register', payload);
    return new Response(JSON.stringify(data), { status });
  } catch (e: any) {
    const { status, body } = normalizeError(e);
    return new Response(JSON.stringify(body), { status });
  }
}
