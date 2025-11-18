interface SprintMetrics {
  effortCompleted: number;
  effortRemaining: number;
  totalEffort: number;
  storiesCompleted: number;
  storiesInProgress: number;
  storiesTotal: number;
  velocity: number;
  daysElapsed: number;
  daysRemaining: number;
  totalDays: number;
  onTrack: boolean;
}

interface MetricsCardsProps {
  metrics: SprintMetrics;
}

export default function MetricsCards({ metrics }: MetricsCardsProps) {
  // Validar y normalizar todos los valores numéricos
  const effortCompleted = Number(metrics.effortCompleted) || 0;
  const effortRemaining = Number(metrics.effortRemaining) || 0;
  const totalEffort = Number(metrics.totalEffort) || 0;
  const storiesCompleted = Number(metrics.storiesCompleted) || 0;
  const storiesInProgress = Number(metrics.storiesInProgress) || 0;
  const storiesTotal = Number(metrics.storiesTotal) || 0;
  const velocity = Number(metrics.velocity) || 0;
  const daysElapsed = Number(metrics.daysElapsed) || 0;
  const daysRemaining = Number(metrics.daysRemaining) || 0;
  const totalDays = Number(metrics.totalDays) || 1; // Evitar división por cero

  const completionPercentage = totalEffort > 0 
    ? Math.round((effortCompleted / totalEffort) * 100) 
    : 0;

  const timePercentage = totalDays > 0
    ? Math.round((daysElapsed / totalDays) * 100)
    : 0;

  const storiesPending = Math.max(0, storiesTotal - storiesCompleted - storiesInProgress);

  const isOnTrack = metrics.onTrack;
  const isCompleted = effortRemaining === 0 && effortCompleted > 0;
  
  // Determinar texto y color del badge
  const badgeText = isCompleted ? 'Completado' : (isOnTrack ? 'En tiempo' : 'Retrasado');
  const badgeColor = isCompleted ? 'bg-blue-100 text-blue-800' : (isOnTrack ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Esfuerzo */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600">Esfuerzo</h3>
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${badgeColor}`}
          >
            {badgeText}
          </span>
        </div>
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">
              {effortCompleted}
            </p>
            <p className="text-sm text-gray-500">/ {totalEffort} hrs</p>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {effortRemaining} hrs restantes
          </p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2 text-right">
          {completionPercentage}% completado
        </p>
      </div>

      {/* Historias */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Historias</h3>
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">
              {storiesCompleted}
            </p>
            <p className="text-sm text-gray-500">/ {storiesTotal}</p>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {storiesInProgress} en progreso
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Completadas</span>
            <span className="font-semibold text-green-600">
              {storiesCompleted}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">En progreso</span>
            <span className="font-semibold text-blue-600">
              {storiesInProgress}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Pendientes</span>
            <span className="font-semibold text-gray-600">
              {storiesPending}
            </span>
          </div>
        </div>
      </div>

      {/* Velocidad */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Velocidad</h3>
        <div className="mb-4">
          <p className="text-3xl font-bold text-gray-900">
            {velocity.toFixed(1)}
          </p>
          <p className="text-sm text-gray-500 mt-1">horas / día</p>
        </div>
        <div className="mt-6">
          <div className="flex items-center gap-2">
            <div className="w-full bg-gray-200 rounded-full h-2 flex-1">
              <div
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full"
                style={{
                  width: `${Math.min((velocity / (totalEffort / totalDays)) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Ritmo promedio de trabajo
          </p>
        </div>
      </div>

      {/* Línea de tiempo */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-sm font-medium text-gray-600 mb-2">
          Línea de tiempo
        </h3>
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">
              {daysElapsed}
            </p>
            <p className="text-sm text-gray-500">/ {totalDays} días</p>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {daysRemaining} días restantes
          </p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${timePercentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2 text-right">
          {timePercentage}% del tiempo transcurrido
        </p>
      </div>
    </div>
  );
}
