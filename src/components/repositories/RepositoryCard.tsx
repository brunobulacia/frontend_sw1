'use client';

interface Repository {
  id: string;
  name: string;
  url: string;
  mainBranch: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RepositoryCardProps {
  repository: Repository;
  canEdit: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onSetPrimary?: () => void;
}

export default function RepositoryCard({
  repository,
  canEdit,
  onEdit,
  onDelete,
  onSetPrimary,
}: RepositoryCardProps) {
  const openInGitHub = () => {
    window.open(repository.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`rounded-2xl border p-6 shadow-sm backdrop-blur ${repository.isPrimary ? 'border-emerald-500/50 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5' : 'border-white/10 bg-white/5'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-white">
              {repository.name}
            </h3>
            {repository.isPrimary && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ★ Principal
              </span>
            )}
          </div>
          
          <button
            onClick={openInGitHub}
            className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1 group transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span className="group-hover:underline truncate">{repository.url}</span>
            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>

          <p className="text-sm text-white/60 mt-2">
            <span className="font-medium">Rama principal:</span> {repository.mainBranch}
          </p>
        </div>

        {canEdit && (
          <div className="flex flex-col space-y-2">
            {!repository.isPrimary && onSetPrimary && (
              <button
                onClick={onSetPrimary}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Marcar como principal
              </button>
            )}
            {onEdit && (
              <button
                onClick={onEdit}
                className="text-xs text-white/70 hover:text-white font-medium transition-colors"
              >
                Editar
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
              >
                Eliminar
              </button>
            )}
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500 pt-3 border-t">
        Agregado el {new Date(repository.createdAt).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </div>
    </div>
  );
}

