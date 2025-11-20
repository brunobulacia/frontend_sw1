import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';
const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'app_token';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; sprintId: string }> }
) {
  try {
    const { projectId, sprintId } = await params;
    const token = request.cookies.get(COOKIE_NAME)?.value;
    const body = await request.json();

    const response = await fetch(
      `${BACKEND_URL}/api/projects/${projectId}/sprints/${sprintId}/status`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error changing sprint status:', error);
    return NextResponse.json(
      { error: 'Error al cambiar el estado del sprint' },
      { status: 500 }
    );
  }
}
