// src/app/api/ml/assignment-suggestion/route.ts
import { NextRequest, NextResponse } from "next/server";
import { axiosServer } from "@/lib/axios/server";

/**
 * Proxy hacia Nest:
 * POST /api/ml/assignment-suggestion  (Next)
 * -> POST /ml/assignment-suggestion   (Nest)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const { storyId, taskId, taskContext } = body || {};

    if (!storyId) {
      return NextResponse.json(
        { message: "storyId es requerido" },
        { status: 400 },
      );
    }

    const client = axiosServer(req as unknown as Request);

    const payload: any = { storyId };
    if (taskId) payload.taskId = taskId;
    if (taskContext) payload.taskContext = taskContext;

    const response = await client.post("/ml/assignment-suggestion", payload);
    console.log(response);
    return NextResponse.json(response.data, { status: 201 });
  } catch (err: any) {
    console.error("[ML assignment route] Error:", err);

    const status =
      err?.status ??
      err?.response?.status ??
      500;

    const data =
      err?.data ??
      err?.response?.data ??
      { message: "Error al generar sugerencia de asignación" };

    return NextResponse.json(data, { status });
  }
}
