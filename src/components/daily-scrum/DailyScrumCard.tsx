'use client';

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

interface DailyScrumCardProps {
  entry: DailyScrumEntry;
  showDate?: boolean;
  onEdit?: () => void;
  canEdit?: boolean;
}

export default function DailyScrumCard({
  entry,
  showDate = false,
  onEdit,
  canEdit = false,
}: DailyScrumCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {entry.user.firstName} {entry.user.lastName}
          </h3>
          <p className="text-sm text-gray-600">@{entry.user.username}</p>
          {showDate && (
            <p className="text-xs text-gray-500 mt-1">
              {new Date(entry.date).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}
        </div>
        {canEdit && onEdit && (
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Editar
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">
            ¿Qué hice ayer?
          </h4>
          <p className="text-gray-600 text-sm whitespace-pre-wrap">
            {entry.whatDidYesterday}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">
            ¿Qué haré hoy?
          </h4>
          <p className="text-gray-600 text-sm whitespace-pre-wrap">
            {entry.whatWillDoToday}
          </p>
        </div>

        {entry.impediments && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <h4 className="text-sm font-medium text-red-800 mb-1 flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Impedimentos
            </h4>
            <p className="text-red-700 text-sm whitespace-pre-wrap">
              {entry.impediments}
            </p>
          </div>
        )}

        {entry.linkedStories.length > 0 && (
          <div className="border-t pt-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Historias relacionadas
            </h4>
            <div className="flex flex-wrap gap-2">
              {entry.linkedStories.map((story) => (
                <span
                  key={story.id}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {story.code}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

