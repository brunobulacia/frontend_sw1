import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";
const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "app_token";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/refactor-code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error refactoring code:", error);
    return NextResponse.json(
      { error: "Error al refactorizar código" },
      { status: 500 }
    );
  }
}
