import { NextRequest, NextResponse } from "next/server";
import { axiosServer } from "@/lib/axios/server";
import { normalizeError } from "@/lib/axios/normalizeError";

/**
 * GET /api/projects/:projectId/repositories - Obtener todos los repositorios
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const response = await axiosServer(request).get(
      `/projects/${projectId}/repositories`
    );
    return NextResponse.json(response.data);
  } catch (error: any) {
    return normalizeError(error);
  }
}

/**
 * POST /api/projects/:projectId/repositories - Crear repositorio
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await request.json();
    const response = await axiosServer(request).post(
      `/projects/${projectId}/repositories`,
      body
    );
    return NextResponse.json(response.data, { status: 201 });
  } catch (error: any) {
    return normalizeError(error);
  }
}
