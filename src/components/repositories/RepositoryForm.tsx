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
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 shadow-xl backdrop-blur">
      <div>
        <h2 className="text-2xl font-bold mb-4 text-white">
          {initialData ? 'Editar Repositorio' : 'Agregar Repositorio GitHub'}
        </h2>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wide text-white/60 mb-2">
          Nombre del repositorio *
        </label>
        <input
          id="name"
          type="text"
          required
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none placeholder:text-white/40"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Backend"
        />
      </div>

      <div>
        <label htmlFor="url" className="block text-xs font-semibold uppercase tracking-wide text-white/60 mb-2">
          URL de GitHub *
        </label>
        <input
          id="url"
          type="url"
          required
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none placeholder:text-white/40"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          placeholder="https://github.com/owner/repo"
        />
        <p className="text-xs text-white/50 mt-1">
          Debe tener el formato: https://github.com/owner/repo
        </p>
      </div>

      <div>
        <label htmlFor="mainBranch" className="block text-xs font-semibold uppercase tracking-wide text-white/60 mb-2">
          Rama principal
        </label>
        <input
          id="mainBranch"
          type="text"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none placeholder:text-white/40"
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
          className="w-4 h-4 text-emerald-500 bg-white/5 border-white/20 rounded focus:ring-emerald-500 focus:ring-2"
        />
        <label htmlFor="isPrimary" className="ml-2 text-sm text-white">
          Marcar como repositorio principal
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
        >
          {isSubmitting ? 'Guardando...' : initialData ? 'Actualizar' : 'Agregar Repositorio'}
        </button>
      </div>
    </form>
  );
}

