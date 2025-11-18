import { NextRequest, NextResponse } from 'next/server';
import { nestServer } from '@/lib/axios/server';
import { extractAuthToken } from '@/lib/auth/cookies';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; sprintId: string }> },
) {
  try {
    const { projectId, sprintId } = await params;
    const token = extractAuthToken(req);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await nestServer.get(
      `/projects/${projectId}/sprints/${sprintId}/metrics`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching sprint metrics:', error);
    return NextResponse.json(
      {
        error: error.response?.data?.message || 'Failed to fetch sprint metrics',
      },
      { status: error.response?.status || 500 },
    );
  }
}
