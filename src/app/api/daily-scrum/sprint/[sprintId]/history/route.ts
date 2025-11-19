import { NextRequest, NextResponse } from 'next/server';
import { axiosServer } from '@/lib/axios/server';
import { normalizeError } from '@/lib/axios/normalizeError';

/**
 * GET /api/daily-scrum/sprint/:sprintId/history - Historial de Dailies
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { sprintId: string } }
) {
  try {
    const response = await axiosServer(request).get(
      `/daily-scrum/sprint/${params.sprintId}/history`
    );
    return NextResponse.json(response.data);
  } catch (error: any) {
    return normalizeError(error);
  }
}

