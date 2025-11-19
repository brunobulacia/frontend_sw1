import { NextRequest, NextResponse } from 'next/server';
import { axiosServer } from '@/lib/axios/server';
import { normalizeError } from '@/lib/axios/normalizeError';

/**
 * GET /api/daily-scrum/sprint/:sprintId/consolidated - Vista consolidada
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { sprintId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const response = await axiosServer(request).get(
      `/daily-scrum/sprint/${params.sprintId}/consolidated?date=${date}`
    );
    return NextResponse.json(response.data);
  } catch (error: any) {
    return normalizeError(error);
  }
}

