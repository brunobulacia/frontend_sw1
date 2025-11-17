import { NextRequest, NextResponse } from 'next/server';
import { nestServer } from '@/lib/axios/server';
import { extractAuthToken } from '@/lib/auth/cookies';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; sprintId: string }> },
) {
  try {
    const { projectId, sprintId } = await params;
    const token = extractAuthToken(req);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const response = await nestServer.post(
      `/projects/${projectId}/sprints/${sprintId}/remove-stories`,
      body,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error removing stories from sprint:', error);
    return NextResponse.json(
      {
        error:
          error.response?.data?.message ||
          'Failed to remove stories from sprint',
      },
      { status: error.response?.status || 500 },
    );
  }
}
