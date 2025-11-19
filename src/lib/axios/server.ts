// lib/axios/server.ts
import axios from 'axios';
import { extractAuthToken } from '@/lib/auth/cookies';

const baseURL =
  process.env.API_BASE || // preferir variable privada de servidor
  process.env.NEXT_PUBLIC_API_BASE || // fallback si ya la tienes
  "http://localhost:8000/api";
if (!baseURL) {
  throw new Error('Falta NEXT_PUBLIC_API_BASE en .env.local');
}
console.log('[nestServer baseURL]', baseURL);

export const nestServer = axios.create({
  baseURL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

nestServer.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status ?? 500;
    const data = error?.response?.data ?? { message: 'Upstream error' };
    return Promise.reject({ status, data });
  },
);

/**
 * Helper function to create an axios instance with auth token from request
 * @param request NextRequest object
 * @returns Configured axios instance
 */
export function axiosServer(request: Request) {
  const token = extractAuthToken(request);
  
  return axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
}
