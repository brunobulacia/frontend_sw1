import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Iniciar sesion',
};

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.3),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(168,85,247,0.25),_transparent_45%)]" />
      <section className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-16 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl space-y-6 text-center md:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
            Bienvenido
          </span>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            Conecta con tu <span className="text-sky-300">panel de control</span>{' '}
            en segundos
          </h1>
          <p className="text-base text-white/70 md:text-lg">
            Gestiona tus proyectos, revisa el estado de los usuarios y mantén tu equipo alineado desde un único lugar.
          </p>
          <div className="hidden gap-3 text-sm font-medium text-white/70 md:flex">
            <div className="flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Infraestructura operativa</span>
            </div>
            <div className="flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2">
              <div className="h-2 w-2 rounded-full bg-sky-400" />
              <span>Acceso seguro</span>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur">
          <header className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold text-white">Inicia sesión</h2>
            <p className="text-sm text-white/70">
              Ingresa tus credenciales para continuar
            </p>
          </header>

          <div className="mt-6">
            <LoginForm />
          </div>

          <footer className="mt-6 space-y-2 text-center text-sm text-white/70">
            <p>
              No tienes cuenta?{' '}
              <Link href="/register" className="font-semibold text-sky-300 hover:text-sky-200">
                Registrate
              </Link>
            </p>
          </footer>
        </div>
      </section>
    </main>
  );
}
