'use client';

import { use, useCallback, useEffect, useState, FormEvent } from 'react';
import { api } from '@/lib/axios/client';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Project = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  visibility: 'PUBLIC' | 'PRIVATE';
  productObjective: string | null;
  definitionOfDone: string | null;
  sprintDuration: number;
  qualityCriteria: number | null;
  status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';
  startDate: string;
  endDate: string | null;
  owner: {
    id: string;
  };
};

export default function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    visibility: 'PRIVATE' as 'PUBLIC' | 'PRIVATE',
    productObjective: '',
    definitionOfDone: '',
    sprintDuration: 2,
    qualityCriteria: '',
    status: 'PLANNING' as 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED',
    startDate: '',
    endDate: '',
  });

  const fetchProject = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/projects/${id}`, {
        validateStatus: () => true,
      });
      if (response.status >= 200 && response.status < 300) {
        const proj = response.data as Project;
        setProject(proj);

        // Llenar el formulario
        setFormData({
          name: proj.name,
          description: proj.description || '',
          visibility: proj.visibility,
          productObjective: proj.productObjective || '',
          definitionOfDone: proj.definitionOfDone || '',
          sprintDuration: proj.sprintDuration,
          qualityCriteria: proj.qualityCriteria?.toString() || '',
          status: proj.status,
          startDate: proj.startDate.split('T')[0],
          endDate: proj.endDate ? proj.endDate.split('T')[0] : '',
        });
      } else {
        setError(
          response.data?.error ??
            response.data?.message ??
            'No se pudo obtener el proyecto.',
        );
      }
    } catch (err: any) {
      setError(
        err?.data?.error ||
          err?.data?.message ||
          'Error inesperado al cargar el proyecto.',
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchProject();
    }
  }, [authLoading, user, fetchProject]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload: any = {
        name: formData.name,
        visibility: formData.visibility,
        sprintDuration: formData.sprintDuration,
        status: formData.status,
        startDate: formData.startDate,
      };

      if (formData.description) payload.description = formData.description;
      if (formData.productObjective)
        payload.productObjective = formData.productObjective;
      if (formData.definitionOfDone)
        payload.definitionOfDone = formData.definitionOfDone;
      if (formData.qualityCriteria)
        payload.qualityCriteria = parseInt(formData.qualityCriteria);
      if (formData.endDate) payload.endDate = formData.endDate;

      const response = await api.patch(`/projects/${id}`, payload, {
        validateStatus: () => true,
      });

      if (response.status >= 200 && response.status < 300) {
        setSuccess('¡Proyecto actualizado exitosamente!');
        setTimeout(() => {
          router.push(`/projects/${id}`);
        }, 1500);
      } else {
        setError(
          response.data?.message ||
            response.data?.error ||
            'No se pudo actualizar el proyecto.',
        );
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Error inesperado al actualizar el proyecto.',
      );
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <main className="p-6">
        <p className="text-white/70">Cargando...</p>
      </main>
    );
  }

  if (error && !project) {
    return (
      <main className="space-y-6">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">
          {error}
        </div>
        <Link
          href="/projects"
          className="inline-block rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          ← Volver a Proyectos
        </Link>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="p-6">
        <p className="text-white/70">Proyecto no encontrado</p>
      </main>
    );
  }

  // Verificar permisos
  const isOwner = user?.id === project.owner.id;
  const canEdit = isOwner || user?.isAdmin;

  if (!canEdit) {
    return (
      <main className="space-y-6">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">
          No tienes permisos para editar este proyecto
        </div>
        <Link
          href={`/projects/${id}`}
          className="inline-block rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          ← Volver al Proyecto
        </Link>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
            {project.code}
          </p>
          <h1 className="text-3xl font-semibold text-white">Editar Proyecto</h1>
          <p className="mt-2 text-sm text-white/70">
            Actualiza la configuración del proyecto
          </p>
        </div>
        <Link
          href={`/projects/${id}`}
          className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          ← Cancelar
        </Link>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-green-300">
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg backdrop-blur"
      >
        <div className="space-y-6">
          {/* Información básica */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Información Básica</h2>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Nombre del Proyecto *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-primary focus:outline-none"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Visibilidad *
                </label>
                <select
                  value={formData.visibility}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      visibility: e.target.value as 'PUBLIC' | 'PRIVATE',
                    })
                  }
                  className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-primary focus:outline-none"
                >
                  <option value="PRIVATE">Privado</option>
                  <option value="PUBLIC">Público</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Estado *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as any,
                    })
                  }
                  className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-primary focus:outline-none"
                >
                  <option value="PLANNING">Planificación</option>
                  <option value="ACTIVE">Activo</option>
                  <option value="ON_HOLD">En Pausa</option>
                  <option value="COMPLETED">Completado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Configuración Scrum */}
          <div className="space-y-4 border-t border-white/10 pt-6">
            <h2 className="text-lg font-semibold text-white">Configuración Scrum</h2>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Objetivo del Producto
              </label>
              <textarea
                value={formData.productObjective}
                onChange={(e) =>
                  setFormData({ ...formData, productObjective: e.target.value })
                }
                rows={2}
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Definition of Done (DoD)
              </label>
              <textarea
                value={formData.definitionOfDone}
                onChange={(e) =>
                  setFormData({ ...formData, definitionOfDone: e.target.value })
                }
                rows={3}
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-primary focus:outline-none"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Duración de Sprint (semanas) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="4"
                  value={formData.sprintDuration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sprintDuration: parseInt(e.target.value),
                    })
                  }
                  className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-primary focus:outline-none"
                />
                <p className="mt-1 text-xs text-white/50">Entre 1 y 4 semanas</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Criterios de Calidad (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.qualityCriteria}
                  onChange={(e) =>
                    setFormData({ ...formData, qualityCriteria: e.target.value })
                  }
                  className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Fechas */}
          <div className="space-y-4 border-t border-white/10 pt-6">
            <h2 className="text-lg font-semibold text-white">Planificación Temporal</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Fecha de Inicio *
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Fecha de Fin (estimada)
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end gap-4 border-t border-white/10 pt-6">
            <Link
              href={`/projects/${id}`}
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50 shadow-lg shadow-emerald-500/30"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}



