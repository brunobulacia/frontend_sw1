'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/axios/client';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

type Project = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  visibility: 'PUBLIC' | 'PRIVATE';
  status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';
  sprintDuration: number;
  startDate: string;
  endDate: string | null;
  owner: {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  _count?: {
    members: number;
    stories: number;
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
  PLANNING: 'bg-blue-500/20 text-blue-300',
  ACTIVE: 'bg-green-500/20 text-green-300',
  ON_HOLD: 'bg-yellow-500/20 text-yellow-300',
  COMPLETED: 'bg-purple-500/20 text-purple-300',
  ARCHIVED: 'bg-gray-500/20 text-gray-300',
};

const visibilityLabels = {
  PUBLIC: 'Público',
  PRIVATE: 'Privado',
};

export default function ProjectsPage() {
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/projects', { validateStatus: () => true });
      if (response.status >= 200 && response.status < 300) {
        setProjects(response.data as Project[]);
      } else {
        setError(
          response.data?.error ??
            response.data?.message ??
            'No se pudo obtener la lista de proyectos.',
        );
      }
    } catch (err: any) {
      setError(
        err?.data?.error ||
          err?.data?.message ||
          'Error inesperado al cargar proyectos.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      fetchProjects();
    }
  }, [authLoading, user, fetchProjects]);

  if (authLoading) {
    return (
      <main className="p-6">
        <p>Cargando...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="p-6">
        <p>Debes iniciar sesión para ver los proyectos.</p>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Proyectos Scrum</h1>
          <p className="mt-2 text-sm text-white/70">
            Gestiona tus proyectos, sprints y backlog
          </p>
        </div>
        <Link
          href="/projects/new"
          className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 shadow-lg shadow-emerald-500/30"
        >
          + Nuevo Proyecto
        </Link>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-white/70">Cargando proyectos...</div>
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center">
          <p className="text-lg text-white/70">No hay proyectos disponibles</p>
          <p className="mt-2 text-sm text-white/50">
            Crea tu primer proyecto para comenzar
          </p>
          <Link
            href="/projects/new"
            className="mt-6 inline-block rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 shadow-lg shadow-emerald-500/30"
          >
            Crear Proyecto
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 shadow-lg backdrop-blur transition hover:border-white/20 hover:from-white/10 hover:to-white/5"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
                      {project.code}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-white group-hover:text-primary transition">
                      {project.name}
                    </h2>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                      statusColors[project.status]
                    }`}
                  >
                    {statusLabels[project.status]}
                  </span>
                </div>

                {project.description && (
                  <p className="line-clamp-2 text-sm text-white/70">
                    {project.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-white/60">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-white/40" />
                    {visibilityLabels[project.visibility]}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-white/40" />
                    Sprint {project.sprintDuration} sem
                  </div>
                </div>

                {project._count && (
                  <div className="flex items-center gap-4 pt-2 text-xs text-white/50">
                    <span>{project._count.members} miembros</span>
                    <span>{project._count.stories} historias</span>
                  </div>
                )}

                <div className="border-t border-white/10 pt-4">
                  <p className="text-xs text-white/50">
                    Owner: {project.owner.firstName} {project.owner.lastName}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}



