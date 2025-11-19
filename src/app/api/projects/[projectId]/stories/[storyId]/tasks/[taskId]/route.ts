import { NextRequest, NextResponse } from "next/server";
import { nestServer } from "@/lib/axios/server";
import { extractAuthToken } from "@/lib/auth/cookies";

export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ projectId: string; storyId: string; taskId: string }>;
  }
) {
  try {
    const { projectId, storyId, taskId } = await params;
    const token = extractAuthToken(req);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const response = await nestServer.patch(
      `/projects/${projectId}/stories/${storyId}/tasks/${taskId}`,
      body,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      {
        error: error.response?.data?.message || "Failed to update task",
      },
      { status: error.response?.status || 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ projectId: string; storyId: string; taskId: string }>;
  }
) {
  try {
    const { projectId, storyId, taskId } = await params;
    const token = extractAuthToken(req);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await nestServer.delete(
      `/projects/${projectId}/stories/${storyId}/tasks/${taskId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      {
        error: error.response?.data?.message || "Failed to delete task",
      },
      { status: error.response?.status || 500 }
    );
  }
}
