import { NextRequest, NextResponse } from 'next/server';
import { axiosServer } from '@/lib/axios/server';
import { normalizeError } from '@/lib/axios/normalizeError';

/**
 * GET /api/repositories/:repositoryId/refactoring
 * Obtener sugerencias de refactoring de un repositorio
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { repositoryId: string } }
) {
  try {
    const response = await axiosServer(request).get(
      `/repositories/${params.repositoryId}/refactoring`
    );
    return NextResponse.json(response.data);
  } catch (error: any) {
    return normalizeError(error);
  }
}

