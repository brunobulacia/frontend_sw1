import { NextRequest, NextResponse } from 'next/server';
import { axiosServer } from '@/lib/axios/server';
import { normalizeError } from '@/lib/axios/normalizeError';

/**
 * GET /api/daily-scrum/:id - Obtener Daily Scrum por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await axiosServer(request).get(`/daily-scrum/${params.id}`);
    return NextResponse.json(response.data);
  } catch (error: any) {
    return normalizeError(error);
  }
}

/**
 * PUT /api/daily-scrum/:id - Actualizar Daily Scrum
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const response = await axiosServer(request).put(
      `/daily-scrum/${params.id}`,
      body
    );
    return NextResponse.json(response.data);
  } catch (error: any) {
    return normalizeError(error);
  }
}

