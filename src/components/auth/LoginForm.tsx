'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/axios/client';
import { useAuth } from '@/hooks/useAuth';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const sp = useSearchParams();
  const { refresh } = useAuth();

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await api.post('/auth/login', { email, password });
      await refresh();
      const redirectParam = sp.get('redirect');
      const destination =
        redirectParam && redirectParam !== '/' ? redirectParam : '/dashboard';
      router.replace(destination);
    } catch (err: any) {
      setError(err?.data?.error || err?.data?.message || 'Credenciales invalidas');
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-white/80">
          Correo electrónico
        </label>
        <input
          id="email"
          className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 shadow-inner transition hover:border-white/30 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
          placeholder="nombre@empresa.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-white/80">
          Contraseña
        </label>
        <input
          id="password"
          className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 shadow-inner transition hover:border-white/30 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
          placeholder="••••••••"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      {error && (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-200">
          {error}
        </p>
      )}

      <button
        className="w-full rounded-xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-300"
        type="submit"
      >
        Ingresar
      </button>
      <p className="text-center text-sm text-white/70">
        <a className="font-medium text-sky-300 hover:text-sky-200" href="/forgot-password">
          ¿Olvidaste tu contraseña?
        </a>
      </p>
    </form>
  );
}
