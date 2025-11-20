import { NextResponse } from "next/server";

const DEFAULT_ERROR = { message: "Unexpected server error" };

export function normalizeError(err: any): NextResponse {
  if (!err) {
    return NextResponse.json(DEFAULT_ERROR, { status: 500 });
  }

  if (typeof err.status === "number" && err.data) {
    return NextResponse.json(err.data, { status: err.status });
  }

  const response = err?.response;
  if (response) {
    return NextResponse.json(response.data ?? DEFAULT_ERROR, {
      status: response.status ?? 500,
    });
  }

  if (err instanceof Error) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }

  return NextResponse.json(DEFAULT_ERROR, { status: 500 });
}
