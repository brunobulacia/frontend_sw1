import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';
const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'app_token';

// GET /api/estimation/sessions/:id - Ver detalles de sesión
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.cookies.get(COOKIE_NAME)?.value;

    const response = await fetch(
      `${BACKEND_URL}/api/estimation/sessions/${id}`,
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
    console.error('Error fetching session details:', error);
    return NextResponse.json(
      { error: 'Error al obtener detalles de sesión' },
      { status: 500 }
    );
  }
}