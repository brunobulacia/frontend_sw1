// src/app/api/ml/risk-prediction/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { axiosServer } from '@/lib/axios/server';
import { normalizeError } from '@/lib/axios/normalizeError';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body?.sprintId) {
      return NextResponse.json(
        { message: 'sprintId es requerido' },
        { status: 400 },
      );
    }

    const client = axiosServer(request);

    const response = await client.post('/ml/risk-prediction', body);

    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    return normalizeError(error);
  }
}
