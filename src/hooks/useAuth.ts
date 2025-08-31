'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/axios/client'; // o: import axios from 'axios';

export type AuthUser = {
  id: number | string;
  email: string;

};

type LoginInput = { email: string; password: string };
type RegisterInput = { email: string; password: string; /* otros campos */ };

export function useAuth() {
  const router = useRouter();
  const sp = useSearchParams();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const isAuthenticated = !!user;

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/me', { validateStatus: () => true });
      if (res.status === 200 && res.data?.authenticated) {
        setUser(res.data.user as AuthUser);
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(
    async (data: LoginInput, opts?: { redirect?: string }) => {
      setBusy(true);
      try {
        const res = await api.post('/auth/login', data, { validateStatus: () => true });
        if (res.status >= 200 && res.status < 300) {
          await refresh();
          // redirección post-login
          const dest = opts?.redirect ?? sp.get('redirect') ?? '/dashboard';
          router.push(dest);
          return { ok: true };
        }
        return { ok: false, error: res.data?.error ?? 'Credenciales inválidas' };
      } catch (e: any) {
        return { ok: false, error: e?.data?.error ?? 'Error inesperado' };
      } finally {
        setBusy(false);
      }
    },
    [refresh, router, sp],
  );

  const register = useCallback(
    async (data: RegisterInput, opts?: { autoLogin?: boolean; redirect?: string }) => {
      setBusy(true);
      try {
        const res = await api.post('/auth/register', data, { validateStatus: () => true });
        if (res.status >= 200 && res.status < 300) {
          if (opts?.autoLogin) {
            await login({ email: (data as any).email, password: (data as any).password }, { redirect: opts?.redirect });
          }
          return { ok: true, data: res.data };
        }
        return { ok: false, error: res.data?.error ?? 'Registro fallido' };
      } catch (e: any) {
        return { ok: false, error: e?.data?.error ?? 'Error inesperado' };
      } finally {
        setBusy(false);
      }
    },
    [login],
  );

  const logout = useCallback(async () => {
    setBusy(true);
    try {
      await api.post('/auth/logout');
      setUser(null);
      router.push('/login');
    } finally {
      setBusy(false);
    }
  }, [router]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ user, loading, busy, isAuthenticated, login, register, logout, refresh }),
    [user, loading, busy, isAuthenticated, login, register, logout, refresh],
  );

  return value;
}
