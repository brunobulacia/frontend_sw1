const metrics = [
  {
    label: 'Usuarios activos',
    value: '128',
    trend: '+12%',
    trendLabel: 'vs. ayer',
    accent: 'from-sky-400/20 to-sky-500/5',
  },
  {
    label: 'Tareas completadas',
    value: '342',
    trend: '+28%',
    trendLabel: 'este mes',
    accent: 'from-emerald-400/20 to-emerald-500/5',
  },
  {
    label: 'Incidencias abiertas',
    value: '8',
    trend: '-35%',
    trendLabel: 'últimos 7 días',
    accent: 'from-rose-400/20 to-rose-500/5',
  },
];

const activity = [
  {
    title: 'Nuevo usuario agregado',
    description: 'Mariana López fue invitada al espacio de trabajo de Administradores.',
    time: 'Hace 12 minutos',
  },
  {
    title: 'Revisión de tareas',
    description: 'Se completaron 5 tareas críticas en el sprint actual.',
    time: 'Hace 45 minutos',
  },
  {
    title: 'Actualización de permisos',
    description: 'Se actualizó el rol de 3 usuarios para acceso avanzado.',
    time: 'Ayer',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-10 text-foreground">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-sky-500/20 via-background to-background p-8 shadow-xl">
        <div className="absolute -top-24 right-10 h-48 w-48 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
              Panel general
            </p>
            <div>
              <h1 className="text-3xl font-semibold leading-tight text-white md:text-4xl">
                ¡Hola! Este es tu centro de operaciones
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-white/70 md:text-base">
                Revisa el pulso de tu organización, sigue las métricas clave y toma decisiones informadas en cuestión de segundos.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-white/70">
              <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-widest">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                Sistema estable
              </div>
              <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-widest">
                <span className="h-2 w-2 rounded-full bg-sky-300" />
                Datos al día
              </div>
            </div>
          </div>

          <div className="grid h-full gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-white shadow-lg md:w-80">
            <div className="space-y-1">
              <p className="text-xs uppercase text-white/60">Resumen semanal</p>
              <p className="text-3xl font-semibold">+18%</p>
            </div>
            <div className="relative h-24 overflow-hidden rounded-xl bg-white/10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(56,189,248,0.35),_transparent_65%)]" />
              <div className="absolute inset-x-6 bottom-4 flex items-end justify-between gap-3">
                {[48, 68, 56, 92, 76, 104].map((height, index) => (
                  <span
                    key={index}
                    style={{ height }}
                    className="w-6 rounded-full bg-gradient-to-t from-sky-400/70 to-white/70"
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-white/70">
              Métricas agregadas a partir de interacción de usuarios, rendimiento y estado de tareas durante las últimas 24 horas.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {metrics.map((metric) => (
          <article
            key={metric.label}
            className={`overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${metric.accent} p-6 shadow-lg backdrop-blur`}
          >
            <p className="text-xs uppercase text-white/60">{metric.label}</p>
            <div className="mt-4 flex items-end justify-between">
              <p className="text-4xl font-semibold text-white">{metric.value}</p>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white">
                {metric.trend}
              </span>
            </div>
            <p className="mt-2 text-sm text-white/70">{metric.trendLabel}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Actividad reciente</h2>
              <p className="text-sm text-white/60">
                Últimos eventos registrados en tus espacios de trabajo.
              </p>
            </div>
            <button className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:bg-white/10">
              Ver todo
            </button>
          </header>
          <div className="space-y-4">
            {activity.map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
              >
                <span className="mt-1 inline-flex h-2 w-2 shrink-0 rounded-full bg-emerald-300" />
                <div>
                  <p className="font-medium text-white">{item.title}</p>
                  <p className="text-sm text-white/70">{item.description}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/50">
                    {item.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-5 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
          <header>
            <h3 className="text-lg font-semibold text-white">Siguientes pasos</h3>
            <p className="text-sm text-white/60">
              Recomendaciones generadas a partir de la actividad reciente.
            </p>
          </header>
          <ul className="space-y-4 text-sm text-white/75">
            <li className="rounded-2xl border border-white/10 bg-white/10 p-4">
              Completa la revisión de accesos para los administradores recién agregados.
            </li>
            <li className="rounded-2xl border border-white/10 bg-white/10 p-4">
              Programa la reunión de seguimiento del sprint actual para mañana.
            </li>
            <li className="rounded-2xl border border-white/10 bg-white/10 p-4">
              Habilita notificaciones automáticas para incidencias críticas.
            </li>
          </ul>
        </aside>
      </section>
    </div>
  );
}
