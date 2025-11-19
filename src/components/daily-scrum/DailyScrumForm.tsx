'use client';

import { useState } from 'react';

interface Story {
  id: string;
  code: string;
  title: string;
  status: string;
}

interface DailyScrumFormProps {
  sprintId: string;
  availableStories: Story[];
  initialData?: {
    whatDidYesterday: string;
    whatWillDoToday: string;
    impediments?: string;
    storyIds: string[];
  };
  onSubmit: (data: {
    sprintId: string;
    date: string;
    whatDidYesterday: string;
    whatWillDoToday: string;
    impediments?: string;
    storyIds: string[];
  }) => Promise<void>;
  onCancel?: () => void;
}

export default function DailyScrumForm({
  sprintId,
  availableStories,
  initialData,
  onSubmit,
  onCancel,
}: DailyScrumFormProps) {
  const [formData, setFormData] = useState({
    whatDidYesterday: initialData?.whatDidYesterday || '',
    whatWillDoToday: initialData?.whatWillDoToday || '',
    impediments: initialData?.impediments || '',
    storyIds: initialData?.storyIds || [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      await onSubmit({
        sprintId,
        date: today,
        ...formData,
        impediments: formData.impediments || undefined,
      });
    } catch (error) {
      console.error('Error al enviar daily scrum:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStoryToggle = (storyId: string) => {
    setFormData((prev) => ({
      ...prev,
      storyIds: prev.storyIds.includes(storyId)
        ? prev.storyIds.filter((id) => id !== storyId)
        : [...prev.storyIds, storyId],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Daily Scrum - {new Date().toLocaleDateString()}
        </h2>
        <p className="text-gray-600 mb-4">
          Responde las tres preguntas clave del Daily Scrum
        </p>
      </div>

      <div>
        <label htmlFor="whatDidYesterday" className="block text-sm font-medium text-gray-700 mb-2">
          ¿Qué hice ayer? *
        </label>
        <textarea
          id="whatDidYesterday"
          required
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.whatDidYesterday}
          onChange={(e) =>
            setFormData({ ...formData, whatDidYesterday: e.target.value })
          }
          placeholder="Describe qué tareas completaste ayer..."
        />
      </div>

      <div>
        <label htmlFor="whatWillDoToday" className="block text-sm font-medium text-gray-700 mb-2">
          ¿Qué haré hoy? *
        </label>
        <textarea
          id="whatWillDoToday"
          required
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.whatWillDoToday}
          onChange={(e) =>
            setFormData({ ...formData, whatWillDoToday: e.target.value })
          }
          placeholder="Describe qué tareas planeas hacer hoy..."
        />
      </div>

      <div>
        <label htmlFor="impediments" className="block text-sm font-medium text-gray-700 mb-2">
          ¿Qué impedimentos tengo?
        </label>
        <textarea
          id="impediments"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.impediments}
          onChange={(e) =>
            setFormData({ ...formData, impediments: e.target.value })
          }
          placeholder="Describe cualquier impedimento que tengas (opcional)..."
        />
      </div>

      {availableStories.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Historias/Tareas relacionadas
          </label>
          <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
            {availableStories.map((story) => (
              <label
                key={story.id}
                className="flex items-center space-x-3 py-2 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.storyIds.includes(story.id)}
                  onChange={() => handleStoryToggle(story.id)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  <span className="font-medium">{story.code}</span> - {story.title}
                  <span className="ml-2 text-xs text-gray-500">({story.status})</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4 border-t">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
        >
          {isSubmitting ? 'Guardando...' : 'Guardar Daily Scrum'}
        </button>
      </div>
    </form>
  );
}

