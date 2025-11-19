'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DailyScrumForm from '@/components/daily-scrum/DailyScrumForm';

export default function DailyScrumPage() {
  const params = useParams();
  const router = useRouter();
  const sprintId = params.sprintId as string;
  const projectId = params.id as string;

  const [availableStories, setAvailableStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAvailableStories();
  }, [sprintId]);

  const fetchAvailableStories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/sprints/${projectId}/${sprintId}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar las historias');
      }

      const sprint = await response.json();
      
      // Extraer historias del sprint
      const stories = sprint.stories || [];
      setAvailableStories(stories);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/daily-scrum', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al guardar el daily scrum');
      }

      // Redirigir a la vista consolidada
      router.push(`/projects/${projectId}/sprints/${sprintId}/daily/consolidated`);
    } catch (err: any) {
      alert(err.message);
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
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
      </div>

      <DailyScrumForm
        sprintId={sprintId}
        availableStories={availableStories}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </div>
  );
}

