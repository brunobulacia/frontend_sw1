import { NextRequest, NextResponse } from 'next/server';
import { axiosServer } from '@/lib/axios/server';
import { normalizeError } from '@/lib/axios/normalizeError';

/**
 * GET /api/stories/:storyId/github-activity
 * HU12: Obtener commits y PRs vinculados a una historia
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { storyId: string } }
) {
  try {
    const response = await axiosServer(request).get(
      `/stories/${params.storyId}/github-activity`
    );
    return NextResponse.json(response.data);
  } catch (error: any) {
    return normalizeError(error);
  }
}

