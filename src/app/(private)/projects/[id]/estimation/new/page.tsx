'use client';

import { use, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/axios/client';
import { useAuth } from '@/hooks/useAuth';

type ProjectMemberRole = 'PRODUCT_OWNER' | 'SCRUM_MASTER' | 'DEVELOPER';
type EstimationMethod = 'FIBONACCI' | 'TSHIRT' | 'POWERS_OF_TWO' | 'CUSTOM';

type Project = {
  id: string;
  owner: {
    id: string;
  };
  members: Array<{
    user: {
      id: string;
    };
    role: ProjectMemberRole;
  }>;
};

type Story = {
  id: string;
  code: string;
  title: string;
  status: string;
};

const methodOptions: { value: EstimationMethod; label: string; description: string }[] = [
  {
    value: 'FIBONACCI',
    label: 'Fibonacci',
    description: '1, 2, 3, 5, 8, 13, 21, ?',
  },
  {
    value: 'TSHIRT',
    label: 'T-Shirt Sizes',
    description: 'XS, S, M, L, XL, XXL, ?',
  },
  {
    value: 'POWERS_OF_TWO',
    label: 'Potencias de 2',
    description: '1, 2, 4, 8, 16, 32, ?',
  },
];

export default function NewEstimationSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [storiesLoading, setStoriesLoading] = useState(true);
  const [projectLoading, setProjectLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    storyId: '',
    method: 'FIBONACCI' as EstimationMethod,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    setProjectLoading(true);
    try {
      const response = await api.get(`/projects/${projectId}`);
      if (response.status >= 200 && response.status < 300) {
        setProject(response.data as Project);
      }
    } catch (err: any) {
      console.error('Error loading project:', err);
      setError('No se pudo cargar la información del proyecto');
    } finally {
      setProjectLoading(false);
    }
  }, [projectId]);

  const fetchStories = useCallback(async () => {
    setStoriesLoading(true);
    try {
      const response = await api.get(`/projects/${projectId}/stories`);
      if (response.status >= 200 && response.status < 300) {
        // Filtrar solo historias en BACKLOG o SELECTED
        const availableStories = (response.data as Story[]).filter(
          (story) => story.status === 'BACKLOG' || story.status === 'SELECTED'
        );
        setStories(availableStories);
      }
    } catch (err: any) {
      console.error('Error loading stories:', err);
    } finally {
      setStoriesLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchProject();
      fetchStories();
    }
  }, [authLoading, user, fetchProject, fetchStories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('El nombre de la sesión es requerido');
      return;
    }

    if (!formData.storyId) {
      setError('Debes seleccionar una historia de usuario');
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post('/estimation/sessions', {
        projectId,
        name: formData.name.trim(),
        storyId: formData.storyId,
        method: formData.method,
      });

      if (response.status >= 200 && response.status < 300) {
        const sessionId = response.data.id;
        router.push(`/projects/${projectId}/estimation/${sessionId}`);
      } else {
        setError(
          response.data?.error ??
            response.data?.message ??
            'No se pudo crear la sesión'
        );
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          'Error al crear la sesión'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Verificar si el usuario tiene permisos
  const canCreateSession = () => {
    if (!user || !project) return false;
    
    // El owner siempre puede (es Product Owner)
    if (project.owner.id === user.id) return true;
    
    // Verificar si es miembro con rol de Scrum Master
    const member = project.members.find((m) => m.user.id === user.id);
    return member?.role === 'SCRUM_MASTER';
  };

  if (authLoading || storiesLoading || projectLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-white/70">Cargando...</p>
      </div>
    );
  }

  // Mostrar mensaje de acceso denegado si no tiene permisos
  if (!canCreateSession()) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-12 text-center">
          <div className="mb-4 text-5xl">🚫</div>
          <h1 className="text-2xl font-semibold text-red-300">Acceso Denegado</h1>
          <p className="mt-4 text-white/70">
            Solo el <strong>Product Owner</strong> y el <strong>Scrum Master</strong> pueden crear sesiones de Planning Poker.
          </p>
          <p className="mt-2 text-sm text-white/50">
            Tu rol actual es: <strong>Developer</strong>
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href={`/projects/${projectId}/estimation`}
              className="rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              ← Ver sesiones
            </Link>
            <Link
              href={`/projects/${projectId}`}
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
            >
              Volver al proyecto
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Nueva Sesión de Planning Poker</h1>
        <p className="mt-2 text-sm text-white/70">
          Crea una sesión de estimación colaborativa para una historia de usuario
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nombre de la sesión */}
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-white">
            Nombre de la sesión *
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ej: Sprint 1 - Estimación de autenticación"
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            disabled={submitting}
          />
        </div>

        {/* Seleccionar historia */}
        <div className="space-y-2">
          <label htmlFor="storyId" className="block text-sm font-medium text-white">
            Historia de usuario *
          </label>
          {stories.length === 0 ? (
            <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4 text-yellow-300">
              No hay historias disponibles para estimar. Las historias deben estar en estado
              BACKLOG o SELECTED.
            </div>
          ) : (
            <select
              id="storyId"
              value={formData.storyId}
              onChange={(e) => setFormData({ ...formData, storyId: e.target.value })}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              disabled={submitting}
            >
              <option value="">Selecciona una historia...</option>
              {stories.map((story) => (
                <option key={story.id} value={story.id}>
                  {story.code} - {story.title}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Método de estimación */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-white">
            Método de estimación *
          </label>
          <div className="space-y-3">
            {methodOptions.map((method) => (
              <label
                key={method.value}
                className={`flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition ${
                  formData.method === method.value
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-white/20 bg-white/5 hover:border-white/30'
                }`}
              >
                <input
                  type="radio"
                  name="method"
                  value={method.value}
                  checked={formData.method === method.value}
                  onChange={(e) =>
                    setFormData({ ...formData, method: e.target.value as EstimationMethod })
                  }
                  className="mt-1"
                  disabled={submitting}
                />
                <div className="flex-1">
                  <p className="font-medium text-white">{method.label}</p>
                  <p className="text-sm text-white/60">{method.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting || stories.length === 0}
            className="flex-1 rounded-full bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creando...' : 'Crear Sesión'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            disabled={submitting}
            className="rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/5 disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}