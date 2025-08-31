// lib/axios/server.ts
import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_BASE;
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
