'use client';
import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Opcional: normaliza errores en cliente
api.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err?.response?.status ?? 500;
    const data = err?.response?.data ?? { error: 'Unexpected error' };
    return Promise.reject({ status, data });
  }
);
