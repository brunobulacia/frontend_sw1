import { NextRequest, NextResponse } from 'next/server';
import { axiosServer } from '@/lib/axios/server';
import { normalizeError } from '@/lib/axios/normalizeError';

/**
 * GET /api/projects/:projectId/repositories/:id - Obtener repositorio por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string; id: string } }
) {
  try {
    const response = await axiosServer(request).get(
      `/projects/${params.projectId}/repositories/${params.id}`
    );
    return NextResponse.json(response.data);
  } catch (error: any) {
    return normalizeError(error);
  }
}

/**
 * PUT /api/projects/:projectId/repositories/:id - Actualizar repositorio
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { projectId: string; id: string } }
) {
  try {
    const body = await request.json();
    const response = await axiosServer(request).put(
      `/projects/${params.projectId}/repositories/${params.id}`,
      body
    );
    return NextResponse.json(response.data);
  } catch (error: any) {
    return normalizeError(error);
  }
}

/**
 * DELETE /api/projects/:projectId/repositories/:id - Eliminar repositorio
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string; id: string } }
) {
  try {
    const response = await axiosServer(request).delete(
      `/projects/${params.projectId}/repositories/${params.id}`
    );
    return NextResponse.json(response.data);
  } catch (error: any) {
    return normalizeError(error);
  }
}

