'use client';

type Vote = {
  id: string;
  voteValue: string;
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  justification: string | null;
};

interface VotingResultsProps {
  votes: Vote[];
  isRevealed: boolean;
}

export default function VotingResults({ votes, isRevealed }: VotingResultsProps) {
  if (!isRevealed) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="text-center text-white/70">
          <div className="inline-flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></div>
            <span>Esperando que el moderador revele los votos...</span>
          </div>
          <p className="mt-2 text-sm text-white/50">
            {votes.length} {votes.length === 1 ? 'persona ha votado' : 'personas han votado'}
          </p>
        </div>
      </div>
    );
  }

  // Calcular distribución de votos
  const distribution = votes.reduce((acc, vote) => {
    acc[vote.voteValue] = (acc[vote.voteValue] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const uniqueValues = Object.keys(distribution);
  const hasConsensus = uniqueValues.length === 1;

  // Votos numéricos (excluyendo "?")
  const numericVotes = votes.filter((v) => v.voteValue !== '?');
  const numericValues = numericVotes.map((v) => parseFloat(v.voteValue)).filter((v) => !isNaN(v));
  const average = numericValues.length > 0
    ? (numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length).toFixed(1)
    : 'N/A';

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-white/60">Total de votos</p>
          <p className="text-3xl font-bold text-white">{votes.length}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-white/60">Promedio</p>
          <p className="text-3xl font-bold text-white">{average}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-white/60">Consenso</p>
          <p className={`text-3xl font-bold ${hasConsensus ? 'text-emerald-400' : 'text-yellow-400'}`}>
            {hasConsensus ? 'Sí' : 'No'}
          </p>
        </div>
      </div>

      {/* Distribución de votos */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Distribución de votos</h3>
        <div className="flex flex-wrap gap-3">
          {Object.entries(distribution)
            .sort(([a], [b]) => {
              if (a === '?') return 1;
              if (b === '?') return -1;
              return parseFloat(a) - parseFloat(b);
            })
            .map(([value, count]) => (
              <div
                key={value}
                className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2"
              >
                <span className="text-2xl font-bold text-white">{value}</span>
                <span className="text-sm text-white/60">×{count}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Lista de votos individuales */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Votos individuales</h3>
        <div className="space-y-3">
          {votes.map((vote) => (
            <div
              key={vote.id}
              className="flex items-start justify-between rounded-lg border border-white/10 bg-white/5 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 text-lg font-bold text-emerald-300">
                  {vote.voteValue}
                </div>
                <div>
                  <p className="font-medium text-white">
                    {vote.user.firstName} {vote.user.lastName}
                  </p>
                  <p className="text-sm text-white/50">@{vote.user.username}</p>
                </div>
              </div>
              {vote.justification && (
                <div className="max-w-xs text-sm text-white/70 italic">
                  "{vote.justification}"
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}