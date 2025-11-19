'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/axios/client';
import { useAuth } from '@/hooks/useAuth';

type ProjectMemberRole = 'PRODUCT_OWNER' | 'SCRUM_MASTER' | 'DEVELOPER';

type ProjectMember = {
  id: string;
  role: ProjectMemberRole;
  user: {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
  };
};

type Project = {
  id: string;
  name: string;
  owner: {
    id: string;
  };
  members: ProjectMember[];
};

type Sprint = {
  id: string;
  number: number;
  name: string;
  status: string;
};

type SprintReview = {
  id: string;
  sprintId: string;
  date: string;
  participants: string;
  summary: string;
  feedbackGeneral: string | null;
  createdById: string;
  createdBy?: {
    firstName: string;
    lastName: string;
  };
};

export default function SprintReviewPage({
  params,
}: {
  params: Promise<{ id: string; sprintId: string }>;
}) {
  const { id: projectId, sprintId } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [existingReview, setExistingReview] = useState<SprintReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    participants: '',
    summary: '',
    feedbackGeneral: '',
  });

  // Determine user role
  const userRole = project?.members.find(m => m.user.id === user?.id)?.role ||
    (project?.owner.id === user?.id ? 'PRODUCT_OWNER' : null);

  const isScrumMaster = userRole === 'SCRUM_MASTER';
  const canEdit = isScrumMaster;

  useEffect(() => {
    if (!authLoading && user) {
      fetchData();
    }
  }, [authLoading, user, projectId, sprintId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch project to get user role
      const projectResponse = await api.get(`/projects/${projectId}`);
      setProject(projectResponse.data);

      // Fetch sprint info
      const sprintResponse = await api.get(`/sprints/${projectId}/${sprintId}`);
      setSprint(sprintResponse.data);

      // Fetch existing review
      try {
        const reviewResponse = await fetch(`/api/sprints/${projectId}/${sprintId}/review`);
        if (reviewResponse.ok) {
          const data = await reviewResponse.json();
          setExistingReview(data);
          setFormData({
            date: data.date.split('T')[0],
            participants: data.participants,
            summary: data.summary,
            feedbackGeneral: data.feedbackGeneral || '',
          });
        }
      } catch {
        // No review exists yet
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const method = existingReview ? 'PUT' : 'POST';
      const response = await fetch(`/api/sprints/${projectId}/${sprintId}/review`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar');
      }

      const data = await response.json();
      setExistingReview(data);
      setSuccess(existingReview ? 'Review actualizada exitosamente' : 'Review creada exitosamente');
    } catch (err: any) {
      setError(err.message || 'Error al guardar Sprint Review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!canEdit || !existingReview) return;
    if (!confirm('¿Estás seguro de eliminar esta Sprint Review?')) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/sprints/${projectId}/${sprintId}/review`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar');
      }

      setSuccess('Review eliminada exitosamente');
      setTimeout(() => router.back(), 1500);
    } catch (err: any) {
      setError(err.message || 'Error al eliminar Sprint Review');
    } finally {
      setIsDeleting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-white/60">Cargando...</p>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              href={`/projects/${projectId}`}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              ← Volver al proyecto
            </Link>
          </div>
          <h1 className="text-2xl font-semibold text-white">
            Sprint Review - Sprint {sprint?.number}
          </h1>
          <p className="text-sm text-white/60 mt-1">
            {sprint?.name}
          </p>
        </div>

        {!canEdit && (
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-2">
            <p className="text-sm text-yellow-300">
              Solo el Scrum Master puede editar esta Review
            </p>
          </div>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300">
          {success}
        </div>
      )}

      {/* Form / View */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
        {canEdit ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-white/60">
                Fecha *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-white/60">
                Participantes *
              </label>
              <input
                type="text"
                required
                value={formData.participants}
                onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                placeholder="Scrum Master, Product Owner, Developers, Stakeholders"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-white/60">
                Resumen de lo completado *
              </label>
              <textarea
                required
                rows={6}
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Describe qué historias de usuario se completaron, qué funcionalidades se entregaron, demos realizadas..."
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-white/60">
                Feedback General
              </label>
              <textarea
                rows={4}
                value={formData.feedbackGeneral}
                onChange={(e) => setFormData({ ...formData, feedbackGeneral: e.target.value })}
                placeholder="Feedback del Product Owner y stakeholders sobre el incremento entregado..."
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="rounded-full border border-white/20 px-6 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Cancelar
                </button>
                {existingReview && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="rounded-full border border-red-500/40 bg-red-500/10 px-6 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                  >
                    {isDeleting ? 'Eliminando...' : 'Eliminar'}
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-purple-500 px-8 py-2 text-sm font-semibold text-white transition hover:bg-purple-600 disabled:opacity-50"
              >
                {isSubmitting ? 'Guardando...' : existingReview ? 'Actualizar Review' : 'Crear Review'}
              </button>
            </div>
          </form>
        ) : (
          // View-only mode for non-SM users
          <div className="space-y-6">
            {existingReview ? (
              <>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase text-white/60">Fecha</p>
                  <p className="text-white">
                    {new Date(existingReview.date).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase text-white/60">Participantes</p>
                  <p className="text-white">{existingReview.participants}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase text-white/60">Resumen de lo completado</p>
                  <p className="whitespace-pre-wrap text-white/90">{existingReview.summary}</p>
                </div>

                {existingReview.feedbackGeneral && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase text-white/60">Feedback General</p>
                    <p className="whitespace-pre-wrap text-white/90">{existingReview.feedbackGeneral}</p>
                  </div>
                )}

                {existingReview.createdBy && (
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-xs text-white/50">
                      Creado por {existingReview.createdBy.firstName} {existingReview.createdBy.lastName}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="py-8 text-center">
                <p className="text-white/60">
                  No hay Sprint Review registrada para este sprint.
                </p>
                <p className="mt-2 text-sm text-white/40">
                  El Scrum Master debe crear la Review.
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-full border border-white/20 px-6 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Volver
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
