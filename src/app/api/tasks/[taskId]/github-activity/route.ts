import { NextRequest, NextResponse } from 'next/server';
import { axiosServer } from '@/lib/axios/server';
import { normalizeError } from '@/lib/axios/normalizeError';

/**
 * GET /api/tasks/:taskId/github-activity
 * HU12: Obtener commits y PRs vinculados a una tarea
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const response = await axiosServer(request).get(
      `/tasks/${params.taskId}/github-activity`
    );
    return NextResponse.json(response.data);
  } catch (error: any) {
    return normalizeError(error);
  }
}

