import { NextRequest, NextResponse } from 'next/server';
import { axiosServer } from '@/lib/axios/server';
import { normalizeError } from '@/lib/axios/normalizeError';

export async function GET(
  request: NextRequest,
  { params }: { params: { sprintId: string } }
) {
  try {
    const response = await axiosServer(request).get(
      `/sprints/${params.sprintId}/psp-metrics`
    );
    return NextResponse.json(response.data);
  } catch (error: any) {
    return normalizeError(error);
  }
}

