'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function DailyHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const sprintId = params.sprintId as string;
  const projectId = params.id as string;

  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  useEffect(() => {
    fetchHistory();
  }, [sprintId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/daily-scrum/sprint/${sprintId}/history`);

      if (!response.ok) {
        throw new Error('Error al cargar el historial');
      }

      const data = await response.json();
      setHistory(data);

      // Extraer miembros únicos del equipo
      const members = new Map();
      data.forEach((day: any) => {
        day.entries.forEach((entry: any) => {
          if (!members.has(entry.userId)) {
            members.set(entry.userId, {
              id: entry.userId,
              name: `${entry.user.firstName} ${entry.user.lastName}`,
            });
          }
        });
      });
      setTeamMembers(Array.from(members.values()));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = selectedMember
    ? history.map((day) => ({
        ...day,
        entries: day.entries.filter((e: any) => e.userId === selectedMember),
      })).filter((day) => day.entries.length > 0)
    : history;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando historial...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Volver
          </button>
          <h1 className="text-3xl font-bold text-gray-800">
            Historial de Daily Scrums
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <label htmlFor="member-filter" className="text-gray-700 font-medium">
            Filtrar por miembro:
          </label>
          <select
            id="member-filter"
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            {teamMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-6">
        {filteredHistory.map((day) => (
          <div
            key={day.date}
            className="bg-white rounded-lg shadow border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {new Date(day.date).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h2>
              <span className="text-sm text-gray-600">
                {day.entries.length} reporte(s)
              </span>
            </div>

            {day.impediments.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                <p className="text-sm font-medium text-red-800 mb-2">
                  Impedimentos:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  {day.impediments.map((imp: any, idx: number) => (
                    <li key={idx} className="text-sm text-red-700">
                      <span className="font-medium">{imp.userName}:</span>{' '}
                      {imp.impediment}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {day.entries.map((entry: any) => (
                <div
                  key={entry.id}
                  className="bg-gray-50 rounded-md p-4 border border-gray-200"
                >
                  <h3 className="font-semibold text-gray-800 mb-2">
                    {entry.user.firstName} {entry.user.lastName}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-gray-600 font-medium">Ayer:</p>
                      <p className="text-gray-700 line-clamp-2">
                        {entry.whatDidYesterday}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">Hoy:</p>
                      <p className="text-gray-700 line-clamp-2">
                        {entry.whatWillDoToday}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredHistory.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No hay historial de Daily Scrums</p>
          </div>
        )}
      </div>
    </div>
  );
}

