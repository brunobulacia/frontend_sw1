import { NextRequest, NextResponse } from "next/server";
import { axiosServer } from "@/lib/axios/server";
import { normalizeError } from "@/lib/axios/normalizeError";

/**
 * PATCH /api/projects/:projectId/repositories/:repositoryId/set-primary - Marcar repositorio como principal
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; repositoryId: string }> }
) {
  try {
    const { projectId, repositoryId } = await params;
    const response = await axiosServer(request).patch(
      `/projects/${projectId}/repositories/${repositoryId}/set-primary`
    );
    return NextResponse.json(response.data);
  } catch (error: any) {
    return normalizeError(error);
  }
}
