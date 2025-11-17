import { NextRequest, NextResponse } from 'next/server';
import { nestServer } from '@/lib/axios/server';
import { extractAuthToken } from '@/lib/auth/cookies';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; taskId: string }> },
) {
  try {
    const { projectId, taskId } = await params;
    const token = extractAuthToken(req);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const response = await nestServer.post(
      `/kanban/projects/${projectId}/tasks/${taskId}/assign`,
      body,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error assigning task:', error);
    return NextResponse.json(
      {
        error: error.response?.data?.message || 'Failed to assign task',
      },
      { status: error.response?.status || 500 },
    );
  }
}
