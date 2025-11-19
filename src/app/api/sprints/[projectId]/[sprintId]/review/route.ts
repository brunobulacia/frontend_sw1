import { NextRequest, NextResponse } from "next/server";
import { axiosServer } from "@/lib/axios/server";
import { normalizeError } from "@/lib/axios/normalizeError";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; sprintId: string }> }
) {
  try {
    const { projectId, sprintId } = await params;
    const body = await request.json();
    const response = await axiosServer(request).post(
      `/projects/${projectId}/sprints/${sprintId}/review`,
      body
    );
    return NextResponse.json(response.data, { status: 201 });
  } catch (error: any) {
    return normalizeError(error);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; sprintId: string }> }
) {
  try {
    const { projectId, sprintId } = await params;
    const response = await axiosServer(request).get(
      `/projects/${projectId}/sprints/${sprintId}/review`
    );
    return NextResponse.json(response.data);
  } catch (error: any) {
    return normalizeError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; sprintId: string }> }
) {
  try {
    const { projectId, sprintId } = await params;
    const body = await request.json();
    const response = await axiosServer(request).put(
      `/projects/${projectId}/sprints/${sprintId}/review`,
      body
    );
    return NextResponse.json(response.data);
  } catch (error: any) {
    return normalizeError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; sprintId: string }> }
) {
  try {
    const { projectId, sprintId } = await params;
    const response = await axiosServer(request).delete(
      `/projects/${projectId}/sprints/${sprintId}/review`
    );
    return NextResponse.json(response.data);
  } catch (error: any) {
    return normalizeError(error);
  }
}
