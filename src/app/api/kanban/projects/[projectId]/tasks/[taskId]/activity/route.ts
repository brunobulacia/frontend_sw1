import { NextRequest, NextResponse } from 'next/server';
import { nestServer } from '@/lib/axios/server';
import { extractAuthToken } from '@/lib/auth/cookies';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; taskId: string }> },
) {
  try {
    const { projectId, taskId } = await params;
    const token = extractAuthToken(req);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await nestServer.get(
      `/kanban/projects/${projectId}/tasks/${taskId}/activity`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching task activity:', error);
    return NextResponse.json(
      {
        error: error.response?.data?.message || 'Failed to fetch task activity',
      },
      { status: error.response?.status || 500 },
    );
  }
}
