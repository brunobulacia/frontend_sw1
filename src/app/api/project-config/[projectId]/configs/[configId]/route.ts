import { NextRequest, NextResponse } from 'next/server';
import { nestServer } from '@/lib/axios/server';
import { extractAuthToken } from '@/lib/auth/cookies';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; configId: string }> },
) {
  try {
    const { projectId, configId } = await params;
    const token = extractAuthToken(req);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const response = await nestServer.patch(
      `/projects/${projectId}/configs/${configId}`,
      body,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error updating project config:', error);
    return NextResponse.json(
      {
        error: error.response?.data?.message || 'Failed to update project config',
      },
      { status: error.response?.status || 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; configId: string }> },
) {
  try {
    const { projectId, configId } = await params;
    const token = extractAuthToken(req);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await nestServer.delete(
      `/projects/${projectId}/configs/${configId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error deleting project config:', error);
    return NextResponse.json(
      {
        error: error.response?.data?.message || 'Failed to delete project config',
      },
      { status: error.response?.status || 500 },
    );
  }
}
