'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/axios/client';
import { useRouter } from 'next/navigation';

const detectTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';
  } catch {
    return 'UTC';
  }
};

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [timezone, setTimezone] = useState(detectTimezone());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  useEffect(() => {
    setTimezone(detectTimezone());
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);

    try {
      const res = await api.post('/auth/register', {
        email,
        firstName,
        lastName,
        username,
        password,
        timezone,
      });

      if (res.status >= 200 && res.status < 300) {
        router.push('/login');
      } else {
        setError(res.data?.error || 'Error al registrar');
      }
    } catch (err: any) {
      const message = err?.response?.data?.message ?? err?.data?.message;
      const formattedMessage = Array.isArray(message)
        ? message.join('\n')
        : message;
      setError(
        formattedMessage ||
          err?.response?.data?.error ||
          err?.data?.error ||
          'Error inesperado',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.3),_transparent_55%),radial-gradient(circle_at_bottom_left,_rgba(251,191,36,0.2),_transparent_45%)]" />
      <section className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-16 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl space-y-6 text-center md:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
            Crear cuenta
          </span>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            Potencia tu equipo con{' '}
            <span className="text-amber-300">flujos colaborativos</span>
          </h1>
          <p className="text-base text-white/70 md:text-lg">
            Regístrate para acceder a dashboards interactivos, gestión de usuarios y automatizaciones listas para usarse.
          </p>
          <div className="hidden gap-3 md:flex">
            <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/80">
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
              Usuarios ilimitados
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/80">
              <div className="h-2 w-2 rounded-full bg-amber-300" />
              Roles personalizados
            </div>
          </div>
        </div>

        <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/10 px-8 py-10 shadow-2xl backdrop-blur">
          <header className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold text-white">
              Crea tu cuenta
            </h2>
            <p className="text-sm text-white/70">
              Completa la información para empezar a colaborar
            </p>
          </header>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="firstName" className="block text-sm font-medium text-white/80">
                  Nombre
                </label>
                <input
                  id="firstName"
                  type="text"
                  placeholder="Camila"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 shadow-inner transition hover:border-white/30 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/40"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="block text-sm font-medium text-white/80">
                  Apellido
                </label>
                <input
                  id="lastName"
                  type="text"
                  placeholder="García"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 shadow-inner transition hover:border-white/30 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/40"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-white/80">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                placeholder="nombre@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 shadow-inner transition hover:border-white/30 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/40"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-white/80">
                Nombre de usuario
              </label>
              <input
                id="username"
                type="text"
                placeholder="camilag"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 shadow-inner transition hover:border-white/30 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/40"
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-white/80">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 shadow-inner transition hover:border-white/30 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/40"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/80">
                  Confirmar contraseña
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 shadow-inner transition hover:border-white/30 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/40"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/80">
                Zona horaria detectada
              </label>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
                <span>{timezone}</span>
                <button
                  type="button"
                  onClick={() => setTimezone(detectTimezone())}
                  className="text-xs font-semibold text-amber-200 hover:text-amber-100"
                >
                  Recalcular
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200 whitespace-pre-line">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-amber-300 via-amber-200 to-amber-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:from-amber-200 hover:via-amber-100 hover:to-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </button>
          </form>

          <footer className="mt-6 text-center text-sm text-white/70">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="font-semibold text-amber-200 hover:text-amber-100">
              Inicia sesión
            </Link>
          </footer>
        </div>
      </section>
    </main>
  );
}
