'use client';

import { useState } from 'react';

interface RepositoryFormProps {
  initialData?: {
    name: string;
    url: string;
    mainBranch: string;
    isPrimary: boolean;
  };
  onSubmit: (data: {
    name: string;
    url: string;
    mainBranch: string;
    isPrimary: boolean;
  }) => Promise<void>;
  onCancel?: () => void;
}

export default function RepositoryForm({
  initialData,
  onSubmit,
  onCancel,
}: RepositoryFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    url: initialData?.url || '',
    mainBranch: initialData?.mainBranch || 'main',
    isPrimary: initialData?.isPrimary || false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const validateGithubUrl = (url: string): boolean => {
    const githubUrlPattern = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/;
    return githubUrlPattern.test(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateGithubUrl(formData.url)) {
      setError('La URL debe tener el formato https://github.com/owner/repo');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || 'Error al guardar el repositorio');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          {initialData ? 'Editar Repositorio' : 'Agregar Repositorio GitHub'}
        </h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Nombre del repositorio *
        </label>
        <input
          id="name"
          type="text"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Frontend App"
        />
      </div>

      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
          URL de GitHub *
        </label>
        <input
          id="url"
          type="url"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          placeholder="https://github.com/owner/repo"
        />
        <p className="text-xs text-gray-500 mt-1">
          Debe tener el formato: https://github.com/owner/repo
        </p>
      </div>

      <div>
        <label htmlFor="mainBranch" className="block text-sm font-medium text-gray-700 mb-2">
          Rama principal
        </label>
        <input
          id="mainBranch"
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.mainBranch}
          onChange={(e) => setFormData({ ...formData, mainBranch: e.target.value })}
          placeholder="main"
        />
      </div>

      <div className="flex items-center">
        <input
          id="isPrimary"
          type="checkbox"
          checked={formData.isPrimary}
          onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="isPrimary" className="ml-2 text-sm text-gray-700">
          Marcar como repositorio principal
        </label>
      </div>

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
          {isSubmitting ? 'Guardando...' : initialData ? 'Actualizar' : 'Agregar Repositorio'}
        </button>
      </div>
    </form>
  );
}

