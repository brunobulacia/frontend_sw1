const metrics = [
  {
    label: 'Usuarios activos',
    value: '128',
    trend: '+12%',
    trendLabel: 'vs. ayer',
    accent: 'from-blue-500/20 via-slate-800/50 to-slate-900',
  },
  {
    label: 'Tareas completadas',
    value: '342',
    trend: '+28%',
    trendLabel: 'este mes',
    accent: 'from-emerald-500/20 via-slate-800/50 to-slate-900',
  },
  {
    label: 'Incidencias abiertas',
    value: '8',
    trend: '-35%',
    trendLabel: 'últimos 7 días',
    accent: 'from-red-500/20 via-slate-800/50 to-slate-900',
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
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-700/50 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-4 sm:p-6 lg:p-8 shadow-xl">
        <div className="absolute -top-24 right-10 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3 sm:space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full border border-slate-600/50 bg-slate-700/30 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-300">
              Panel general
            </p>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight text-white">
                ¡Hola! Este es tu centro de operaciones
              </h1>
              <p className="mt-2 sm:mt-3 max-w-2xl text-sm sm:text-base text-slate-300">
                Revisa el pulso de tu organización, sigue las métricas clave y toma decisiones informadas en cuestión de segundos.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-slate-300">
              <div className="flex items-center gap-3 rounded-full border border-slate-600/50 bg-slate-700/30 px-4 py-2 text-xs font-semibold uppercase tracking-widest">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Sistema estable
              </div>
              <div className="flex items-center gap-3 rounded-full border border-slate-600/50 bg-slate-700/30 px-4 py-2 text-xs font-semibold uppercase tracking-widest">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                Datos al día
              </div>
            </div>
          </div>

          <div className="grid h-full gap-3 sm:gap-4 rounded-2xl border border-slate-600/50 bg-slate-800/50 p-4 sm:p-6 text-white shadow-lg w-full sm:w-full lg:w-80">
            <div className="space-y-1">
              <p className="text-xs uppercase text-slate-400">Resumen semanal</p>
              <p className="text-2xl sm:text-3xl font-semibold text-white">+18%</p>
            </div>
            <div className="relative h-20 sm:h-24 overflow-hidden rounded-xl bg-slate-700/50">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(59,130,246,0.4),_transparent_65%)]" />
              <div className="absolute inset-x-4 sm:inset-x-6 bottom-3 sm:bottom-4 flex items-end justify-between gap-2 sm:gap-3">
                {[48, 68, 56, 92, 76, 104].map((height, index) => (
                  <span
                    key={index}
                    style={{ height: `${height * 0.8}px` }}
                    className="w-4 sm:w-6 rounded-full bg-gradient-to-t from-blue-500 to-blue-300"
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-300">
              Métricas agregadas a partir de interacción de usuarios, rendimiento y estado de tareas durante las últimas 24 horas.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <article
            key={metric.label}
            className={`overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-700/50 bg-gradient-to-br ${metric.accent} backdrop-blur-sm p-4 sm:p-6 shadow-lg`}
          >
            <p className="text-xs uppercase text-slate-400 font-medium">{metric.label}</p>
            <div className="mt-3 sm:mt-4 flex items-end justify-between">
              <p className="text-3xl sm:text-4xl font-semibold text-white">{metric.value}</p>
              <span className="rounded-full bg-slate-700/50 border border-slate-600/50 px-2 py-1 sm:px-3 text-xs font-semibold uppercase tracking-widest text-white">
                {metric.trend}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-300">{metric.trendLabel}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4 sm:space-y-5 rounded-2xl sm:rounded-3xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm p-4 sm:p-6 shadow-lg">
          <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Actividad reciente</h2>
              <p className="text-sm text-slate-400">
                Últimos eventos registrados en tus espacios de trabajo.
              </p>
            </div>
            <button className="rounded-full border border-slate-600/50 bg-slate-700/50 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300 transition hover:bg-slate-600/50 self-start">
              Ver todo
            </button>
          </header>
          <div className="space-y-4">
            {activity.map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 rounded-2xl border border-slate-600/50 bg-slate-700/30 p-4 transition hover:bg-slate-600/30"
              >
                <span className="mt-1 inline-flex h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                <div>
                  <p className="font-medium text-white">{item.title}</p>
                  <p className="text-sm text-slate-300">{item.description}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                    {item.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-4 sm:space-y-5 rounded-2xl sm:rounded-3xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm p-4 sm:p-6 shadow-lg">
          <header>
            <h3 className="text-lg font-semibold text-white">Siguientes pasos</h3>
            <p className="text-sm text-slate-400">
              Recomendaciones generadas a partir de la actividad reciente.
            </p>
          </header>
          <ul className="space-y-3 sm:space-y-4 text-sm text-slate-300">
            <li className="rounded-xl sm:rounded-2xl border border-slate-600/50 bg-slate-700/40 p-3 sm:p-4 hover:bg-slate-600/40 transition-colors cursor-pointer">
              Completa la revisión de accesos para los administradores recién agregados.
            </li>
            <li className="rounded-xl sm:rounded-2xl border border-slate-600/50 bg-slate-700/40 p-3 sm:p-4 hover:bg-slate-600/40 transition-colors cursor-pointer">
              Programa la reunión de seguimiento del sprint actual para mañana.
            </li>
            <li className="rounded-xl sm:rounded-2xl border border-slate-600/50 bg-slate-700/40 p-3 sm:p-4 hover:bg-slate-600/40 transition-colors cursor-pointer">
              Habilita notificaciones automáticas para incidencias críticas.
            </li>
          </ul>
        </aside>
      </section>
    </div>
  );
}
