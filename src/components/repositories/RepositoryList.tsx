'use client';

import RepositoryCard from './RepositoryCard';

interface Repository {
  id: string;
  name: string;
  url: string;
  mainBranch: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RepositoryListProps {
  repositories: Repository[];
  canEdit: boolean;
  onEdit: (repository: Repository) => void;
  onDelete: (repositoryId: string) => void;
  onSetPrimary: (repositoryId: string) => void;
}

export default function RepositoryList({
  repositories,
  canEdit,
  onEdit,
  onDelete,
  onSetPrimary,
}: RepositoryListProps) {
  if (repositories.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
        <p className="mt-2 text-gray-600">No hay repositorios registrados</p>
        {canEdit && (
          <p className="text-sm text-gray-500 mt-1">
            Haz clic en "Agregar Repositorio" para comenzar
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {repositories.map((repository) => (
        <RepositoryCard
          key={repository.id}
          repository={repository}
          canEdit={canEdit}
          onEdit={() => onEdit(repository)}
          onDelete={() => onDelete(repository.id)}
          onSetPrimary={() => onSetPrimary(repository.id)}
        />
      ))}
    </div>
  );
}

