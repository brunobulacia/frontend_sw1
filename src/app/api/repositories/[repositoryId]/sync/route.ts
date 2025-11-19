import { NextRequest, NextResponse } from 'next/server';
import { axiosServer } from '@/lib/axios/server';
import { normalizeError } from '@/lib/axios/normalizeError';

export async function POST(
  request: NextRequest,
  { params }: { params: { repositoryId: string } }
) {
  try {
    const body = await request.json();
    const response = await axiosServer(request).post(
      `/repositories/${params.repositoryId}/sync`,
      body
    );
    return NextResponse.json(response.data, { status: 201 });
  } catch (error: any) {
    return normalizeError(error);
  }
}

