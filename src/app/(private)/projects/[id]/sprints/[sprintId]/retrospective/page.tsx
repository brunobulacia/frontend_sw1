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

type ImprovementAction = {
  id: string;
  description: string;
  responsible: string | null;
  dueDate: string | null;
  status: string;
};

type SprintRetrospective = {
  id: string;
  sprintId: string;
  whatWentWell: string;
  whatToImprove: string;
  whatToStopDoing: string;
  improvementActions: ImprovementAction[];
  createdById: string;
  createdBy?: {
    firstName: string;
    lastName: string;
  };
};

export default function SprintRetrospectivePage({
  params,
}: {
  params: Promise<{ id: string; sprintId: string }>;
}) {
  const { id: projectId, sprintId } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [existingRetro, setExistingRetro] = useState<SprintRetrospective | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    whatWentWell: '',
    whatToImprove: '',
    whatToStopDoing: '',
    improvementActions: [{ description: '', responsible: '', dueDate: '' }],
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

      // Fetch existing retrospective
      try {
        const retroResponse = await fetch(`/api/sprints/${projectId}/${sprintId}/retrospective`);
        if (retroResponse.ok) {
          const data = await retroResponse.json();
          setExistingRetro(data);
          setFormData({
            whatWentWell: data.whatWentWell,
            whatToImprove: data.whatToImprove,
            whatToStopDoing: data.whatToStopDoing,
            improvementActions: data.improvementActions.length > 0
              ? data.improvementActions.map((a: ImprovementAction) => ({
                  description: a.description,
                  responsible: a.responsible || '',
                  dueDate: a.dueDate ? a.dueDate.split('T')[0] : '',
                }))
              : [{ description: '', responsible: '', dueDate: '' }],
          });
        }
      } catch {
        // No retrospective exists yet
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const addAction = () => {
    setFormData({
      ...formData,
      improvementActions: [
        ...formData.improvementActions,
        { description: '', responsible: '', dueDate: '' },
      ],
    });
  };

  const removeAction = (index: number) => {
    setFormData({
      ...formData,
      improvementActions: formData.improvementActions.filter((_, i) => i !== index),
    });
  };

  const updateAction = (index: number, field: string, value: string) => {
    const newActions = [...formData.improvementActions];
    newActions[index] = { ...newActions[index], [field]: value };
    setFormData({ ...formData, improvementActions: newActions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    setError(null);
    setSuccess(null);

    // Validate at least one improvement action
    const hasValidAction = formData.improvementActions.some(
      (action) => action.description.trim() !== ''
    );

    if (!hasValidAction) {
      setError('Es obligatorio registrar al menos una acción de mejora');
      return;
    }

    setIsSubmitting(true);

    try {
      const method = existingRetro ? 'PUT' : 'POST';
      const response = await fetch(`/api/sprints/${projectId}/${sprintId}/retrospective`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar');
      }

      const data = await response.json();
      setExistingRetro(data);
      setSuccess(existingRetro ? 'Retrospective actualizada exitosamente' : 'Retrospective creada exitosamente');
    } catch (err: any) {
      setError(err.message || 'Error al guardar Sprint Retrospective');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!canEdit || !existingRetro) return;
    if (!confirm('¿Estás seguro de eliminar esta Sprint Retrospective?')) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/sprints/${projectId}/${sprintId}/retrospective`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar');
      }

      setSuccess('Retrospective eliminada exitosamente');
      setTimeout(() => router.back(), 1500);
    } catch (err: any) {
      setError(err.message || 'Error al eliminar Sprint Retrospective');
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
            Sprint Retrospective - Sprint {sprint?.number}
          </h1>
          <p className="text-sm text-white/60 mt-1">
            {sprint?.name}
          </p>
        </div>

        {!canEdit && (
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-2">
            <p className="text-sm text-yellow-300">
              Solo el Scrum Master puede editar esta Retrospective
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
                ¿Qué salió bien? *
              </label>
              <textarea
                required
                rows={4}
                value={formData.whatWentWell}
                onChange={(e) => setFormData({ ...formData, whatWentWell: e.target.value })}
                placeholder="Describe las cosas positivas del sprint..."
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-pink-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-white/60">
                ¿Qué podemos mejorar? *
              </label>
              <textarea
                required
                rows={4}
                value={formData.whatToImprove}
                onChange={(e) => setFormData({ ...formData, whatToImprove: e.target.value })}
                placeholder="Describe las áreas de mejora identificadas..."
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-pink-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-white/60">
                ¿Qué dejar de hacer? *
              </label>
              <textarea
                required
                rows={4}
                value={formData.whatToStopDoing}
                onChange={(e) => setFormData({ ...formData, whatToStopDoing: e.target.value })}
                placeholder="Describe las prácticas que deberían detenerse..."
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-pink-500 focus:outline-none"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase text-white/60">
                  Acciones de Mejora *
                </label>
                <button
                  type="button"
                  onClick={addAction}
                  className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                >
                  + Agregar Acción
                </button>
              </div>

              {formData.improvementActions.map((action, index) => (
                <div key={index} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
                  <input
                    type="text"
                    value={action.description}
                    onChange={(e) => updateAction(index, 'description', e.target.value)}
                    placeholder="Descripción de la acción de mejora"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-pink-500 focus:outline-none"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={action.responsible}
                      onChange={(e) => updateAction(index, 'responsible', e.target.value)}
                      placeholder="Responsable"
                      className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-pink-500 focus:outline-none"
                    />
                    <input
                      type="date"
                      value={action.dueDate}
                      onChange={(e) => updateAction(index, 'dueDate', e.target.value)}
                      className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-pink-500 focus:outline-none"
                    />
                  </div>
                  {formData.improvementActions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAction(index)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Eliminar acción
                    </button>
                  )}
                </div>
              ))}
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
                {existingRetro && (
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
                className="rounded-full bg-pink-500 px-8 py-2 text-sm font-semibold text-white transition hover:bg-pink-600 disabled:opacity-50"
              >
                {isSubmitting ? 'Guardando...' : existingRetro ? 'Actualizar Retrospective' : 'Crear Retrospective'}
              </button>
            </div>
          </form>
        ) : (
          // View-only mode for non-SM users
          <div className="space-y-6">
            {existingRetro ? (
              <>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase text-white/60">¿Qué salió bien?</p>
                  <p className="whitespace-pre-wrap text-white/90">{existingRetro.whatWentWell}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase text-white/60">¿Qué podemos mejorar?</p>
                  <p className="whitespace-pre-wrap text-white/90">{existingRetro.whatToImprove}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase text-white/60">¿Qué dejar de hacer?</p>
                  <p className="whitespace-pre-wrap text-white/90">{existingRetro.whatToStopDoing}</p>
                </div>

                {existingRetro.improvementActions.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase text-white/60">Acciones de Mejora</p>
                    {existingRetro.improvementActions.map((action) => (
                      <div key={action.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm text-white">{action.description}</p>
                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-white/50">
                          {action.responsible && (
                            <span>Responsable: {action.responsible}</span>
                          )}
                          {action.dueDate && (
                            <span>
                              Fecha límite: {new Date(action.dueDate).toLocaleDateString('es-ES')}
                            </span>
                          )}
                          <span className={`rounded-full px-2 py-0.5 ${
                            action.status === 'COMPLETED'
                              ? 'bg-green-500/20 text-green-300'
                              : action.status === 'IN_PROGRESS'
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-gray-500/20 text-gray-300'
                          }`}>
                            {action.status === 'COMPLETED' ? 'Completada' :
                             action.status === 'IN_PROGRESS' ? 'En progreso' : 'Pendiente'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {existingRetro.createdBy && (
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-xs text-white/50">
                      Creado por {existingRetro.createdBy.firstName} {existingRetro.createdBy.lastName}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="py-8 text-center">
                <p className="text-white/60">
                  No hay Sprint Retrospective registrada para este sprint.
                </p>
                <p className="mt-2 text-sm text-white/40">
                  El Scrum Master debe crear la Retrospective.
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
