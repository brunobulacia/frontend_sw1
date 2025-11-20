import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';
const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'app_token';

// POST /api/estimation/sessions - Crear sesión
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/estimation/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error creating estimation session:', error);
    return NextResponse.json(
      { error: 'Error al crear sesión de estimación' },
      { status: 500 }
    );
  }
}