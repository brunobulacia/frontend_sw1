type NormalizedError = {
  status: number;
  body: Record<string, unknown>;
};

const DEFAULT_ERROR = { message: 'Unexpected server error' };

export function normalizeError(err: any): NormalizedError {
  if (!err) {
    return { status: 500, body: DEFAULT_ERROR };
  }

  if (typeof err.status === 'number' && err.data) {
    return { status: err.status, body: err.data };
  }

  const response = err?.response;
  if (response) {
    return {
      status: response.status ?? 500,
      body: response.data ?? DEFAULT_ERROR,
    };
  }

  if (err instanceof Error) {
    return { status: 500, body: { message: err.message } };
  }

  return { status: 500, body: DEFAULT_ERROR };
}
