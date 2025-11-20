import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';
const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'app_token';

// GET /api/estimation/projects/:projectId - Listar sesiones del proyecto
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const token = request.cookies.get(COOKIE_NAME)?.value;

    const response = await fetch(
      `${BACKEND_URL}/api/estimation/projects/${projectId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error fetching project sessions:', error);
    return NextResponse.json(
      { error: 'Error al obtener sesiones del proyecto' },
      { status: 500 }
    );
  }
}