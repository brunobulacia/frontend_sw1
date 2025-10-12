'use client';

import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/axios/client';

type User = {
  id: string;
  email: string;
  username?: string;
  isAdmin?: boolean;
  isActive?: boolean;
  lockedUntil?: string | null;
} | null;

type AuthContextValue = {
  user: User;
  loading: boolean;
  busy: boolean;
  isAuthenticated: boolean;
  refresh: () => Promise<void>;
  login: (
    data: { email: string; password: string },
    opts?: { redirect?: string },
  ) => Promise<{ ok: boolean; error?: string }>;
  register: (
    data: { email: string; username: string; password: string },
    opts?: { autoLogin?: boolean; redirect?: string },
  ) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const sp = useSearchParams();

  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/me', { validateStatus: () => true });
      if (res.status === 200 && res.data?.authenticated) {
        setUser((res.data?.user as User) ?? null);
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const login: AuthContextValue['login'] = useCallback(
    async (data, opts) => {
      setBusy(true);
      try {
        const res = await api.post('/auth/login', data, {
          validateStatus: () => true,
        });
        if (res.status >= 200 && res.status < 300) {
          await refresh();
          router.refresh();
          const redirectParam = opts?.redirect ?? sp.get('redirect');
          const destination =
            redirectParam && redirectParam !== '/' ? redirectParam : '/dashboard';
          router.replace(destination);
          return { ok: true };
        }
        const message =
          res.data?.error ?? res.data?.message ?? 'Credenciales invalidas';
        return { ok: false, error: message };
      } finally {
        setBusy(false);
      }
    },
    [refresh, router, sp],
  );

  const register: AuthContextValue['register'] = useCallback(
    async (data, opts) => {
      setBusy(true);
      try {
        const res = await api.post('/auth/register', data, {
          validateStatus: () => true,
        });
        if (res.status >= 200 && res.status < 300) {
          if (opts?.autoLogin) {
            await login(
              { email: data.email, password: data.password },
              { redirect: opts?.redirect },
            );
          }
          return { ok: true };
        }
        const message =
          res.data?.error ?? res.data?.message ?? 'Registro fallido';
        return { ok: false, error: message };
      } finally {
        setBusy(false);
      }
    },
    [login],
  );

  const logout = useCallback(async () => {
    setBusy(true);
    try {
      await api.post('/auth/logout', {}, { validateStatus: () => true });
      setUser(null);
      router.refresh();
      router.push('/login');
    } finally {
      setBusy(false);
    }
  }, [router]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      busy,
      isAuthenticated: !!user,
      refresh,
      login,
      register,
      logout,
    }),
    [user, loading, busy, refresh, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
