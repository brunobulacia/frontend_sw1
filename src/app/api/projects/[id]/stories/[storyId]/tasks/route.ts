import { NextRequest, NextResponse } from 'next/server';
import { nestServer } from '@/lib/axios/server';
import { extractAuthToken } from '@/lib/auth/cookies';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; storyId: string }> },
) {
  try {
    const { id, storyId } = await params;
    const token = extractAuthToken(req);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await nestServer.get(
      `/projects/${id}/stories/${storyId}/tasks`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching story tasks:', error);
    return NextResponse.json(
      {
        error: error.response?.data?.message || 'Failed to fetch story tasks',
      },
      { status: error.response?.status || 500 },
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; storyId: string }> },
) {
  try {
    const { id, storyId } = await params;
    const token = extractAuthToken(req);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const response = await nestServer.post(
      `/projects/${id}/stories/${storyId}/tasks`,
      body,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error creating task for story:', error);
    return NextResponse.json(
      {
        error: error.response?.data?.message || 'Failed to create task',
      },
      { status: error.response?.status || 500 },
    );
  }
}
