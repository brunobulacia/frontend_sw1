import { NextRequest, NextResponse } from 'next/server';
import { nestServer } from '@/lib/axios/server';
import { extractAuthToken } from '@/lib/auth/cookies';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { projectId } = await params;
    const token = extractAuthToken(req);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await nestServer.post(
      `/projects/${projectId}/configs/initialize-sprint0`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error initializing Sprint 0:', error);
    return NextResponse.json(
      {
        error: error.response?.data?.message || 'Failed to initialize Sprint 0',
      },
      { status: error.response?.status || 500 },
    );
  }
}
