import { NextRequest, NextResponse } from 'next/server';
import { axiosServer } from '@/lib/axios/server';
import { normalizeError } from '@/lib/axios/normalizeError';

export async function POST(
  request: NextRequest,
  { params }: { params: { sprintId: string } }
) {
  try {
    const body = await request.json();
    const response = await axiosServer(request).post(
      `/sprints/${params.sprintId}/retrospective`,
      body
    );
    return NextResponse.json(response.data, { status: 201 });
  } catch (error: any) {
    return normalizeError(error);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { sprintId: string } }
) {
  try {
    const response = await axiosServer(request).get(
      `/sprints/${params.sprintId}/retrospective`
    );
    return NextResponse.json(response.data);
  } catch (error: any) {
    return normalizeError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { sprintId: string } }
) {
  try {
    const body = await request.json();
    const response = await axiosServer(request).put(
      `/sprints/${params.sprintId}/retrospective`,
      body
    );
    return NextResponse.json(response.data);
  } catch (error: any) {
    return normalizeError(error);
  }
}

