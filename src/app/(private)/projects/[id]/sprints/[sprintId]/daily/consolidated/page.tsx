'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ConsolidatedDailyView from '@/components/daily-scrum/ConsolidatedDailyView';

export default function ConsolidatedDailyPage() {
  const params = useParams();
  const router = useRouter();
  const sprintId = params.sprintId as string;
  const projectId = params.id as string;

  const [consolidatedData, setConsolidatedData] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchConsolidatedData();
  }, [sprintId, selectedDate]);

  const fetchConsolidatedData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/daily-scrum/sprint/${sprintId}/consolidated?date=${selectedDate}`
      );

      if (!response.ok) {
        throw new Error('Error al cargar los datos consolidados');
      }

      const data = await response.json();
      setConsolidatedData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
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
        <button
          onClick={() => router.push(`/projects/${projectId}/sprints/${sprintId}`)}
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
          Volver al Sprint
        </button>

        <div className="flex items-center space-x-4">
          <label htmlFor="date-select" className="text-gray-700 font-medium">
            Seleccionar fecha:
          </label>
          <input
            id="date-select"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => router.push(`/projects/${projectId}/sprints/${sprintId}/daily/history`)}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Ver Historial
          </button>
        </div>
      </div>

      {consolidatedData && <ConsolidatedDailyView consolidatedData={consolidatedData} />}
    </div>
  );
}

