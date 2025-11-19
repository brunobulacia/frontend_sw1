import { NextRequest, NextResponse } from 'next/server';
import { axiosServer } from '@/lib/axios/server';
import { normalizeError } from '@/lib/axios/normalizeError';

/**
 * GET /api/daily-scrum/sprint/:sprintId - Obtener Dailies del Sprint
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { sprintId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const memberId = searchParams.get('memberId');

    let url = `/daily-scrum/sprint/${params.sprintId}`;
    const queryParams = [];
    if (date) queryParams.push(`date=${date}`);
    if (memberId) queryParams.push(`memberId=${memberId}`);
    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }

    const response = await axiosServer(request).get(url);
    return NextResponse.json(response.data);
  } catch (error: any) {
    return normalizeError(error);
  }
}

