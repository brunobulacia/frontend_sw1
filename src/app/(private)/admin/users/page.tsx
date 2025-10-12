'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/axios/client';
import { useAuth } from '@/hooks/useAuth';

type ManagedUser = {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  isAdmin: boolean;
  isActive: boolean;
  failedAttempts?: number;
  lockedUntil?: string | null;
};

export default function UsersAdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [requestBusy, setRequestBusy] = useState(false);

  const fetchUsers = useCallback(async () => {
    if (!user?.isAdmin) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/users', { validateStatus: () => true });
      if (response.status >= 200 && response.status < 300) {
        setUsers(response.data as ManagedUser[]);
      } else {
        setError(
          response.data?.error ??
            response.data?.message ??
            'No se pudo obtener la lista de usuarios.',
        );
      }
    } catch (err: any) {
      setError(
        err?.data?.error || err?.data?.message || 'Error inesperado al cargar usuarios.',
      );
    } finally {
      setLoading(false);
    }
  }, [user?.isAdmin]);

  useEffect(() => {
    if (!authLoading && user?.isAdmin) {
      fetchUsers();
    }
  }, [authLoading, user?.isAdmin, fetchUsers]);

  const handleUpdate = async (target: ManagedUser, data: Partial<ManagedUser>) => {
    setBusyId(target.id);
    setError(null);
    setInfo(null);
    try {
      const response = await api.patch(`/users/${target.id}`, data, {
        validateStatus: () => true,
      });
      if (response.status >= 200 && response.status < 300) {
        const updated = response.data as ManagedUser;
        setUsers((previous) =>
          previous.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)),
        );
        setInfo('Usuario actualizado correctamente.');
      } else {
        setError(
          response.data?.error ??
            response.data?.message ??
            'No fue posible actualizar al usuario.',
        );
      }
    } catch (err: any) {
      setError(
        err?.data?.error || err?.data?.message || 'Error inesperado al actualizar.',
      );
    } finally {
      setBusyId(null);
    }
  };

  const toggleActive = (target: ManagedUser) =>
    handleUpdate(target, { isActive: !target.isActive });

  const toggleAdmin = (target: ManagedUser) =>
    handleUpdate(target, { isAdmin: !target.isAdmin });

  const requestReset = async (target: ManagedUser) => {
    setRequestBusy(true);
    setError(null);
    setInfo(null);
    try {
      const response = await api.post(
        `/users/${target.id}/send-reset-link`,
        {},
        { validateStatus: () => true },
      );
      if (response.status >= 200 && response.status < 300) {
        setInfo(
          response.data?.message ??
            'Si el correo existe se enviaron instrucciones de recuperacion.',
        );
      } else {
        setError(
          response.data?.error ??
            response.data?.message ??
            'No se pudo iniciar el reset de contrasena.',
        );
      }
    } catch (err: any) {
      setError(err?.data?.error || err?.data?.message || 'Error inesperado.');
    } finally {
      setRequestBusy(false);
    }
  };

  const formattedUsers = useMemo(() => {
    return users.map((item) => ({
      ...item,
      lockedUntilLabel: item.lockedUntil
        ? new Date(item.lockedUntil).toLocaleString()
        : null,
    }));
  }, [users]);

  if (authLoading) {
    return (
      <main className="p-6">
        <p>Cargando...</p>
      </main>
    );
  }

  if (!user?.isAdmin) {
    return (
      <main className="p-6">
        <p>No tienes permisos para ver esta pagina.</p>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Gestion de usuarios</h1>
        <button
          className="border px-3 py-1.5 rounded"
          onClick={fetchUsers}
          disabled={loading}
        >
          Actualizar
        </button>
      </div>

      {info && <p className="text-green-600 text-sm">{info}</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {loading ? (
        <p>Obteniendo usuarios...</p>
      ) : formattedUsers.length === 0 ? (
        <p>No hay usuarios registrados.</p>
      ) : (
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-left">
              <tr>
                <th className="px-3 py-2">Nombre</th>
                <th className="px-3 py-2">Correo</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2">Admin</th>
                <th className="px-3 py-2">Intentos</th>
                <th className="px-3 py-2">Bloqueado hasta</th>
                <th className="px-3 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {formattedUsers.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-3 py-2">
                    {item.firstName || item.lastName
                      ? `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim()
                      : item.username ?? '-'}
                  </td>
                  <td className="px-3 py-2">{item.email}</td>
                  <td className="px-3 py-2">
                    <span
                      className={item.isActive ? 'text-green-600' : 'text-red-600'}
                    >
                      {item.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-3 py-2">{item.isAdmin ? 'Si' : 'No'}</td>
                  <td className="px-3 py-2">{item.failedAttempts ?? 0}</td>
                  <td className="px-3 py-2">
                    {item.lockedUntilLabel ?? 'Sin bloqueo'}
                  </td>
                  <td className="px-3 py-2 space-x-2 whitespace-nowrap">
                    <button
                      className="border px-2 py-1 rounded"
                      disabled={busyId === item.id}
                      onClick={() => toggleActive(item)}
                    >
                      {item.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      className="border px-2 py-1 rounded"
                      disabled={busyId === item.id}
                      onClick={() => toggleAdmin(item)}
                    >
                      {item.isAdmin ? 'Quitar admin' : 'Dar admin'}
                    </button>
                    <button
                      className="border px-2 py-1 rounded"
                      disabled={requestBusy}
                      onClick={() => requestReset(item)}
                    >
                      Reset contrasena
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
