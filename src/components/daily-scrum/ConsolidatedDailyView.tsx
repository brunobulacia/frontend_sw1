'use client';

import DailyScrumCard from './DailyScrumCard';

interface DailyScrumEntry {
  id: string;
  userId: string;
  date: string;
  whatDidYesterday: string;
  whatWillDoToday: string;
  impediments?: string;
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  linkedStories: {
    id: string;
    code: string;
    title: string;
    status: string;
  }[];
}

interface ConsolidatedDaily {
  date: string;
  sprintId: string;
  sprintName: string;
  sprintNumber: number;
  entries: DailyScrumEntry[];
  impediments: {
    userId: string;
    userName: string;
    impediment: string;
  }[];
}

interface ConsolidatedDailyViewProps {
  consolidatedData: ConsolidatedDaily;
}

export default function ConsolidatedDailyView({
  consolidatedData,
}: ConsolidatedDailyViewProps) {
  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Daily Scrum Consolidado - {consolidatedData.sprintName}
        </h2>
        <p className="text-gray-600">
          {new Date(consolidatedData.date).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        <p className="text-sm text-gray-600 mt-1">
          {consolidatedData.entries.length} miembro(s) del equipo reportaron
        </p>
      </div>

      {/* Impedimentos destacados */}
      {consolidatedData.impediments.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Impedimentos Reportados ({consolidatedData.impediments.length})
          </h3>
          <div className="space-y-3">
            {consolidatedData.impediments.map((imp, idx) => (
              <div
                key={idx}
                className="bg-white rounded-md p-4 border border-red-300"
              >
                <p className="font-medium text-gray-800 mb-1">{imp.userName}</p>
                <p className="text-gray-700 text-sm">{imp.impediment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de dailies */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Reportes del Equipo
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {consolidatedData.entries.map((entry) => (
            <DailyScrumCard key={entry.id} entry={entry} />
          ))}
        </div>
      </div>

      {consolidatedData.entries.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            No hay reportes de Daily Scrum para esta fecha
          </p>
        </div>
      )}
    </div>
  );
}

