'use client';

import { use, useCallback, useEffect, useState } from 'react';
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
  createdAt: string;
  owner: {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  members: Array<{
    id: string;
    user: {
      id: string;
      email: string;
      username: string;
      firstName: string;
      lastName: string;
    };
  }>;
  _count?: {
    stories: number;
    estimationSessions: number;
  };
};

const statusLabels = {
  PLANNING: 'Planificación',
  ACTIVE: 'Activo',
  ON_HOLD: 'En Pausa',
  COMPLETED: 'Completado',
  ARCHIVED: 'Archivado',
};

const statusColors = {
  PLANNING: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  ACTIVE: 'bg-green-500/20 text-green-300 border-green-500/30',
  ON_HOLD: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  COMPLETED: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  ARCHIVED: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
};

const visibilityLabels = {
  PUBLIC: 'Público',
  PRIVATE: 'Privado',
};

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProject = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/projects/${id}`, {
        validateStatus: () => true,
      });
      if (response.status >= 200 && response.status < 300) {
        setProject(response.data as Project);
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

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas archivar este proyecto?')) {
      return;
    }

    setDeleteLoading(true);
    try {
      const response = await api.delete(`/projects/${id}`, {
        validateStatus: () => true,
      });
      if (response.status >= 200 && response.status < 300) {
        alert('Proyecto archivado exitosamente');
        router.push('/projects');
      } else {
        alert(
          response.data?.error ??
            response.data?.message ??
            'No se pudo archivar el proyecto.',
        );
      }
    } catch (err: any) {
      alert(
        err?.data?.error ||
          err?.data?.message ||
          'Error inesperado al archivar el proyecto.',
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <main className="p-6">
        <p className="text-white/70">Cargando...</p>
      </main>
    );
  }

  if (error) {
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

  const isOwner = user?.id === project.owner.id;
  const canEdit = isOwner || user?.isAdmin;

  return (
    <main className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
            {project.code}
          </p>
          <h1 className="text-3xl font-semibold text-white">{project.name}</h1>
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                statusColors[project.status]
              }`}
            >
              {statusLabels[project.status]}
            </span>
            <span className="text-xs text-white/60">
              {visibilityLabels[project.visibility]}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/projects"
            className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            ← Volver
          </Link>
          {canEdit && (
            <>
              <Link
                href={`/projects/${id}/edit`}
                className="rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-600 shadow-lg shadow-sky-500/30"
              >
                Editar
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="rounded-full border border-red-500/30 bg-red-500/10 px-6 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
              >
                {deleteLoading ? 'Archivando...' : 'Archivar'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Información principal */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Detalles */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
            <h2 className="text-lg font-semibold text-white mb-4">Descripción</h2>
            <p className="text-white/70">
              {project.description || 'Sin descripción'}
            </p>
          </div>

          {project.productObjective && (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
              <h2 className="text-lg font-semibold text-white mb-4">
                Objetivo del Producto
              </h2>
              <p className="text-white/70">{project.productObjective}</p>
            </div>
          )}

          {project.definitionOfDone && (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
              <h2 className="text-lg font-semibold text-white mb-4">
                Definition of Done
              </h2>
              <p className="whitespace-pre-wrap text-white/70">
                {project.definitionOfDone}
              </p>
            </div>
          )}

          {/* Miembros */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
            <h2 className="text-lg font-semibold text-white mb-4">
              Miembros del Equipo ({project.members.length})
            </h2>
            <div className="space-y-3">
              {project.members.length === 0 ? (
                <p className="text-sm text-white/50">
                  No hay miembros asignados aún
                </p>
              ) : (
                project.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
                      {member.user.firstName?.[0]}
                      {member.user.lastName?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {member.user.firstName} {member.user.lastName}
                      </p>
                      <p className="text-xs text-white/50">{member.user.email}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Información del Proyecto
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs uppercase text-white/50">Owner</p>
                <p className="mt-1 text-white">
                  {project.owner.firstName} {project.owner.lastName}
                </p>
                <p className="text-xs text-white/50">{project.owner.email}</p>
              </div>

              <div className="border-t border-white/10 pt-4">
                <p className="text-xs uppercase text-white/50">Sprint Duration</p>
                <p className="mt-1 text-white">{project.sprintDuration} semanas</p>
              </div>

              {project.qualityCriteria && (
                <div className="border-t border-white/10 pt-4">
                  <p className="text-xs uppercase text-white/50">
                    Criterios de Calidad
                  </p>
                  <p className="mt-1 text-white">{project.qualityCriteria}%</p>
                </div>
              )}

              <div className="border-t border-white/10 pt-4">
                <p className="text-xs uppercase text-white/50">Fecha de Inicio</p>
                <p className="mt-1 text-white">
                  {new Date(project.startDate).toLocaleDateString('es-ES')}
                </p>
              </div>

              {project.endDate && (
                <div className="border-t border-white/10 pt-4">
                  <p className="text-xs uppercase text-white/50">Fecha de Fin</p>
                  <p className="mt-1 text-white">
                    {new Date(project.endDate).toLocaleDateString('es-ES')}
                  </p>
                </div>
              )}

              <div className="border-t border-white/10 pt-4">
                <p className="text-xs uppercase text-white/50">Creado</p>
                <p className="mt-1 text-white">
                  {new Date(project.createdAt).toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>
          </div>

          {/* Métricas */}
          {project._count && (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
              <h3 className="mb-4 text-lg font-semibold text-white">Métricas</h3>
              <div className="space-y-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                  <p className="text-3xl font-semibold text-white">
                    {project._count.stories}
                  </p>
                  <p className="text-xs text-white/60">Historias de Usuario</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                  <p className="text-3xl font-semibold text-white">
                    {project._count.estimationSessions}
                  </p>
                  <p className="text-xs text-white/60">Sesiones de Estimación</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}



