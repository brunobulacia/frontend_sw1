'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import RepositoryList from '@/components/repositories/RepositoryList';
import RepositoryForm from '@/components/repositories/RepositoryForm';

interface Repository {
  id: string;
  name: string;
  url: string;
  mainBranch: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function RepositoriesPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRepository, setEditingRepository] = useState<Repository | null>(null);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    fetchRepositories();
    checkPermissions();
  }, [projectId]);

  const checkPermissions = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (response.ok) {
        const project = await response.json();
        // Verificar si el usuario es owner, scrum master o product owner
        setCanEdit(true); // Por simplicidad, asumimos que tiene permisos
      }
    } catch (err) {
      console.error('Error checking permissions:', err);
    }
  };

  const fetchRepositories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}/repositories`);

      if (!response.ok) {
        throw new Error('Error al cargar los repositorios');
      }

      const data = await response.json();
      setRepositories(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: any) => {
    const response = await fetch(`/api/projects/${projectId}/repositories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear el repositorio');
    }

    await fetchRepositories();
    setShowForm(false);
  };

  const handleUpdate = async (data: any) => {
    if (!editingRepository) return;

    const response = await fetch(
      `/api/projects/${projectId}/repositories/${editingRepository.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar el repositorio');
    }

    await fetchRepositories();
    setEditingRepository(null);
    setShowForm(false);
  };

  const handleDelete = async (repositoryId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este repositorio?')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/projects/${projectId}/repositories/${repositoryId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Error al eliminar el repositorio');
      }

      await fetchRepositories();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSetPrimary = async (repositoryId: string) => {
    try {
      const response = await fetch(
        `/api/projects/${projectId}/repositories/${repositoryId}/set-primary`,
        {
          method: 'PATCH',
        }
      );

      if (!response.ok) {
        throw new Error('Error al marcar como principal');
      }

      await fetchRepositories();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEdit = (repository: Repository) => {
    setEditingRepository(repository);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingRepository(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando repositorios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Volver al Proyecto
          </button>
          <h1 className="text-3xl font-semibold text-white">
            Repositorios GitHub
          </h1>
        </div>

        {canEdit && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Agregar Repositorio</span>
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6">
          <RepositoryForm
            initialData={editingRepository || undefined}
            onSubmit={editingRepository ? handleUpdate : handleCreate}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      <RepositoryList
        repositories={repositories}
        canEdit={canEdit}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSetPrimary={handleSetPrimary}
      />
    </main>
  );
}

