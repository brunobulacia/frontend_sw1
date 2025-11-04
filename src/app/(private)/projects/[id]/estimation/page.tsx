'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/axios/client';
import { useAuth } from '@/hooks/useAuth';

type ProjectMemberRole = 'PRODUCT_OWNER' | 'SCRUM_MASTER' | 'DEVELOPER';
type EstimationMethod = 'FIBONACCI' | 'TSHIRT' | 'POWERS_OF_TWO' | 'CUSTOM';
type SessionStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED';

type Project = {
  id: string;
  name: string;
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

type SessionListItem = {
  id: string;
  name: string;
  status: SessionStatus;
  method: EstimationMethod;
  finalEstimation: string | null;
  story: {
    id: string;
    code: string;
    title: string;
  } | null;
  moderator: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  } | null;
  totalVotes: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
};

const statusLabels: Record<SessionStatus, string> = {
  DRAFT: 'Borrador',
  ACTIVE: 'Activa',
  CLOSED: 'Finalizada',
};

const statusColors: Record<SessionStatus, string> = {
  DRAFT: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  ACTIVE: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  CLOSED: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
};

const methodLabels: Record<EstimationMethod, string> = {
  FIBONACCI: 'Fibonacci',
  TSHIRT: 'T-Shirt',
  POWERS_OF_TWO: 'Potencias de 2',
  CUSTOM: 'Personalizado',
};

export default function EstimationSessionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params);
  const { user, loading: authLoading } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    try {
      const response = await api.get(`/projects/${projectId}`);
      if (response.status >= 200 && response.status < 300) {
        setProject(response.data as Project);
      }
    } catch (err: any) {
      console.error('Error loading project:', err);
    }
  }, [projectId]);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/estimation/projects/${projectId}`);
      if (response.status >= 200 && response.status < 300) {
        setSessions(response.data as SessionListItem[]);
      } else {
        setError(
          response.data?.error ??
            response.data?.message ??
            'No se pudo obtener las sesiones de estimación'
        );
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          'Error al cargar sesiones'
      );
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchProject();
      fetchSessions();
    }
  }, [authLoading, user, fetchProject, fetchSessions]);

  // Determinar si el usuario puede crear sesiones (solo Product Owner y Scrum Master)
  const canCreateSession = () => {
    if (!user || !project) return false;
    
    // El owner siempre puede (es Product Owner)
    if (project.owner.id === user.id) return true;
    
    // Verificar si es miembro con rol de Scrum Master
    const member = project.members.find((m) => m.user.id === user.id);
    return member?.role === 'SCRUM_MASTER';
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-white/70">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-white/70">Debes iniciar sesión para ver las sesiones</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Planning Poker</h1>
          <p className="mt-2 text-sm text-white/70">
            Sesiones de estimación colaborativa del proyecto
          </p>
        </div>
        {canCreateSession() && (
          <Link
            href={`/projects/${projectId}/estimation/new`}
            className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 shadow-lg shadow-emerald-500/30"
          >
            + Nueva Sesión
          </Link>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-white/70">Cargando sesiones...</div>
        </div>
      ) : sessions.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center">
          <p className="text-lg text-white/70">No hay sesiones de estimación aún</p>
          {canCreateSession() ? (
            <>
              <p className="mt-2 text-sm text-white/50">
                Crea la primera sesión para comenzar con Planning Poker
              </p>
              <Link
                href={`/projects/${projectId}/estimation/new`}
                className="mt-6 inline-block rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
              >
                Crear Sesión
              </Link>
            </>
          ) : (
            <p className="mt-2 text-sm text-white/50">
              El Product Owner o Scrum Master creará sesiones de Planning Poker próximamente
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {sessions.map((session) => (
            <Link
              key={session.id}
              href={`/projects/${projectId}/estimation/${session.id}`}
              className="group rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 transition hover:border-white/20 hover:from-white/10 hover:to-white/5"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-white group-hover:text-emerald-400 transition">
                      {session.name}
                    </h2>
                    {session.story && (
                      <p className="mt-1 text-sm text-white/60">
                        {session.story.code} - {session.story.title}
                      </p>
                    )}
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                      statusColors[session.status]
                    }`}
                  >
                    {statusLabels[session.status]}
                  </span>
                </div>

                {/* Info */}
                <div className="flex items-center gap-4 text-xs text-white/60">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-white/40" />
                    {methodLabels[session.method]}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-white/40" />
                    {session.totalVotes} votos
                  </div>
                </div>

                {/* Moderador */}
                {session.moderator && (
                  <div className="border-t border-white/10 pt-3">
                    <p className="text-xs text-white/50">
                      Moderador: {session.moderator.firstName} {session.moderator.lastName}
                    </p>
                  </div>
                )}

                {/* Estimación final */}
                {session.finalEstimation && (
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
                    <p className="text-xs text-emerald-300">Estimación final:</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      {session.finalEstimation}
                    </p>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Botón volver */}
      <div className="pt-6">
        <Link
          href={`/projects/${projectId}`}
          className="text-sm text-white/60 hover:text-white transition"
        >
          ← Volver al proyecto
        </Link>
      </div>
    </div>
  );
}