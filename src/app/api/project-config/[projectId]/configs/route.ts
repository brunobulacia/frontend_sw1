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

    const response = await nestServer.get(`/projects/${projectId}/configs`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching project configs:', error);
    return NextResponse.json(
      {
        error: error.response?.data?.message || 'Failed to fetch project configs',
      },
      { status: error.response?.status || 500 },
    );
  }
}

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

    const body = await req.json();

    const response = await nestServer.post(
      `/projects/${projectId}/configs`,
      body,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error creating project config:', error);
    return NextResponse.json(
      {
        error: error.response?.data?.message || 'Failed to create project config',
      },
      { status: error.response?.status || 500 },
    );
  }
}
