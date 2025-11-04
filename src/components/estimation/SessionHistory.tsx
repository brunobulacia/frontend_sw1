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
  votedAt: string;
};

type Round = {
  roundNumber: number;
  votes: Vote[];
  statistics: {
    totalVotes: number;
    uniqueValues: number;
    hasConsensus: boolean;
    distribution: Record<string, number>;
  };
};

interface SessionHistoryProps {
  rounds: Round[];
}

export default function SessionHistory({ rounds }: SessionHistoryProps) {
  if (rounds.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-white/70">No hay histórico de votaciones aún</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {rounds.map((round) => (
        <div
          key={round.roundNumber}
          className="rounded-2xl border border-white/10 bg-white/5 p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">
              Ronda {round.roundNumber}
            </h3>
            {round.statistics.hasConsensus && (
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-semibold text-emerald-300">
                ✓ Consenso
              </span>
            )}
          </div>

          {/* Estadísticas de la ronda */}
          <div className="mb-4 grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-white/60">Votos</p>
              <p className="text-lg font-bold text-white">{round.statistics.totalVotes}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-white/60">Valores únicos</p>
              <p className="text-lg font-bold text-white">{round.statistics.uniqueValues}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-white/60">Distribución</p>
              <div className="flex gap-1 flex-wrap">
                {Object.entries(round.statistics.distribution).map(([value, count]) => (
                  <span key={value} className="text-xs text-white/70">
                    {value}×{count}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Votos de la ronda */}
          <div className="space-y-2">
            {round.votes.map((vote) => (
              <div
                key={vote.id}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-white/10 font-bold text-white">
                    {vote.voteValue}
                  </div>
                  <span className="text-sm text-white">
                    {vote.user.firstName} {vote.user.lastName}
                  </span>
                </div>
                {vote.justification && (
                  <span className="text-xs text-white/50 italic max-w-xs truncate">
                    {vote.justification}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}