export function normalizeError(e: any) {
  const status = e?.status ?? e?.response?.status ?? 500;
  const payload =
    e?.data ?? e?.response?.data ?? { error: 'Unexpected error' };
  const body = typeof payload === 'string' ? { error: payload } : payload;
  return { status, body };
}
