import { NextRequest, NextResponse } from 'next/server';
import { nestServer } from '@/lib/axios/server';
import { extractAuthToken } from '@/lib/auth/cookies';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { projectId } = await params;
    const token = extractAuthToken(req);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await nestServer.get(`/kanban/projects/${projectId}/board`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching kanban board:', error);
    return NextResponse.json(
      {
        error: error.response?.data?.message || 'Failed to fetch kanban board',
      },
      { status: error.response?.status || 500 },
    );
  }
}
