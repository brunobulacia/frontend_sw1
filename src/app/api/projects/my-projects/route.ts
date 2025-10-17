import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';
const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'app_token';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    const response = await fetch(`${BACKEND_URL}/api/projects/my-projects`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching my projects:', error);
    return NextResponse.json(
      { error: 'Error al obtener tus proyectos' },
      { status: 500 }
    );
  }
}



