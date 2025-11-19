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
      `/projects/${projectId}/sprints/${sprintId}/snapshots`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching snapshots:', error);
    return NextResponse.json(
      {
        error: error.response?.data?.message || 'Failed to fetch snapshots',
      },
      { status: error.response?.status || 500 },
    );
  }
}

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

    const response = await nestServer.post(
      `/projects/${projectId}/sprints/${sprintId}/snapshots`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error creating snapshot:', error);
    return NextResponse.json(
      {
        error: error.response?.data?.message || 'Failed to create snapshot',
      },
      { status: error.response?.status || 500 },
    );
  }
}
