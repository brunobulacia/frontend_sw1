import { NextRequest, NextResponse } from "next/server";
import { axiosServer } from "@/lib/axios/server";
import { normalizeError } from "@/lib/axios/normalizeError";

/**
 * GET /api/projects/:projectId/repositories/:repositoryId - Obtener repositorio por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; repositoryId: string }> }
) {
  try {
    const { projectId, repositoryId } = await params;
    const response = await axiosServer(request).get(
      `/projects/${projectId}/repositories/${repositoryId}`
    );
    return NextResponse.json(response.data);
  } catch (error: any) {
    return normalizeError(error);
  }
}

/**
 * PUT /api/projects/:projectId/repositories/:repositoryId - Actualizar repositorio
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; repositoryId: string }> }
) {
  try {
    const { projectId, repositoryId } = await params;
    const body = await request.json();
    const response = await axiosServer(request).put(
      `/projects/${projectId}/repositories/${repositoryId}`,
      body
    );
    return NextResponse.json(response.data);
  } catch (error: any) {
    return normalizeError(error);
  }
}

/**
 * DELETE /api/projects/:projectId/repositories/:repositoryId - Eliminar repositorio
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; repositoryId: string }> }
) {
  try {
    const { projectId, repositoryId } = await params;
    const response = await axiosServer(request).delete(
      `/projects/${projectId}/repositories/${repositoryId}`
    );
    return NextResponse.json(response.data);
  } catch (error: any) {
    return normalizeError(error);
  }
}
