import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";
const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "app_token";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; storyId: string }> },
) {
  try {
    const { id, storyId } = await params;
    const token = request.cookies.get(COOKIE_NAME)?.value;
    const body = await request.json();

    const response = await fetch(
      `${BACKEND_URL}/api/projects/${id}/stories/${storyId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(body),
      },
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error updating story:", error);
    return NextResponse.json(
      { error: "Error al actualizar historia" },
      { status: 500 },
    );
  }
}
