import { NextRequest, NextResponse } from 'next/server';
import { axiosServer } from '@/lib/axios/server';
import { normalizeError } from '@/lib/axios/normalizeError';

/**
 * PATCH /api/projects/:projectId/repositories/:id/set-primary - Marcar como principal
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { projectId: string; id: string } }
) {
  try {
    const response = await axiosServer(request).patch(
      `/projects/${params.projectId}/repositories/${params.id}/set-primary`
    );
    return NextResponse.json(response.data);
  } catch (error: any) {
    return normalizeError(error);
  }
}

