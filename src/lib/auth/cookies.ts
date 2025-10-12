const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'app_token';

type CookieRecord = Record<string, string>;

type SerializeOptions = {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'lax' | 'strict' | 'none';
  path?: string;
  domain?: string;
  maxAge?: number;
  expires?: Date;
};

export function parseCookies(header?: string | null): CookieRecord {
  if (!header) return {};
  return header.split(';').reduce<CookieRecord>((acc, part) => {
    const [rawKey, ...rest] = part.split('=');
    if (!rawKey) return acc;
    const key = rawKey.trim();
    if (!key) return acc;
    const value = rest.join('=').trim();
    if (!value) {
      acc[key] = '';
      return acc;
    }
    try {
      acc[key] = decodeURIComponent(value);
    } catch {
      acc[key] = value;
    }
    return acc;
  }, {});
}

export function serializeCookie(
  name: string,
  value: string,
  options: SerializeOptions = {},
): string {
  const segments = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
  ];
  const { maxAge, domain, path, expires, httpOnly, secure, sameSite } = options;
  if (typeof maxAge === 'number') {
    segments.push(`Max-Age=${Math.floor(maxAge)}`);
  }
  if (domain) segments.push(`Domain=${domain}`);
  if (path) segments.push(`Path=${path}`);
  if (expires instanceof Date) segments.push(`Expires=${expires.toUTCString()}`);
  if (httpOnly) segments.push('HttpOnly');
  if (secure) segments.push('Secure');
  if (sameSite) {
    const normalized =
      sameSite.charAt(0).toUpperCase() + sameSite.slice(1).toLowerCase();
    segments.push(`SameSite=${normalized}`);
  }
  return segments.join('; ');
}

export function extractAuthToken(req: Request): string | null {
  const cookies = parseCookies(req.headers.get('cookie'));
  return cookies[COOKIE_NAME] ?? null;
}
