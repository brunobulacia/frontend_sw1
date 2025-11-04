'use client';

import { use, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/axios/client';
import { useAuth } from '@/hooks/useAuth';
import PokerDeck from '@/components/estimation/PokerDeck';
import VotingResults from '@/components/estimation/VotingResults';
import SessionHistory from '@/components/estimation/SessionHistory';

type EstimationMethod = 'FIBONACCI' | 'TSHIRT' | 'POWERS_OF_TWO' | 'CUSTOM';
type SessionStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED';

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

type SessionDetail = {
  id: string;
  name: string;
  status: SessionStatus;
  method: EstimationMethod;
  sequence: string[];
  isRevealed: boolean;
  finalEstimation: string | null;
  currentRound: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  moderator: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  } | null;
  project: {
    id: string;
    name: string;
    code: string;
  };
  story: {
    id: string;
    code: string;
    title: string;
    asA: string;
    iWant: string;
    soThat: string;
    acceptanceCriteria: string[];
    description: string | null;
    priority: number;
    businessValue: number;
    estimateHours: number;
  } | null;
  votes: Vote[];
  userHasVoted: boolean;
  userVote: {
    voteValue: string;
    justification: string | null;
  } | null;
  isModerator: boolean;
};

type VotingHistory = {
  sessionId: string;
  status: SessionStatus;
  totalRounds: number;
  rounds: {
    roundNumber: number;
    votes: Vote[];
    statistics: {
      totalVotes: number;
      uniqueValues: number;
      hasConsensus: boolean;
      distribution: Record<string, number>;
    };
  }[];
};

const statusLabels: Record<SessionStatus, string> = {
  DRAFT: 'Borrador',
  ACTIVE: 'Activa',
  CLOSED: 'Finalizada',
};

const statusColors: Record<SessionStatus, string> = {
  DRAFT: 'bg-gray-500/20 text-gray-300',
  ACTIVE: 'bg-emerald-500/20 text-emerald-300',
  CLOSED: 'bg-blue-500/20 text-blue-300',
};

export default function EstimationSessionPage({
  params,
}: {
  params: Promise<{ id: string; sessionId: string }>;
}) {
  const { id: projectId, sessionId } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [session, setSession] = useState<SessionDetail | null>(null);
  const [history, setHistory] = useState<VotingHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [justification, setJustification] = useState('');
  const [voting, setVoting] = useState(false);

  const [revealing, setRevealing] = useState(false);
  const [startingNewRound, setStartingNewRound] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  const [showHistory, setShowHistory] = useState(false);
  const [finalEstimate, setFinalEstimate] = useState('');
  const [estimateHours, setEstimateHours] = useState('');
  const [notes, setNotes] = useState('');

  const fetchSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/estimation/sessions/${sessionId}`);
      if (response.status >= 200 && response.status < 300) {
        setSession(response.data as SessionDetail);
      } else {
        setError(
          response.data?.error ??
            response.data?.message ??
            'No se pudo cargar la sesión'
        );
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          'Error al cargar la sesión'
      );
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const fetchHistory = useCallback(async () => {
    try {
      const response = await api.get(`/estimation/sessions/${sessionId}/history`);
      if (response.status >= 200 && response.status < 300) {
        setHistory(response.data as VotingHistory);
      }
    } catch (err) {
      console.error('Error loading history:', err);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchSession();
      fetchHistory();
    }
  }, [authLoading, user, fetchSession, fetchHistory]);

  const handleVote = async () => {
    if (!selectedCard || !session) return;

    setVoting(true);
    setError(null);

    try {
      const response = await api.post(`/estimation/sessions/${sessionId}/vote`, {
        voteValue: selectedCard,
        roundNumber: session.currentRound,
        justification: justification.trim() || null,
      });

      if (response.status >= 200 && response.status < 300) {
        // Recargar sesión
        await fetchSession();
        setSelectedCard(null);
        setJustification('');
      } else {
        setError(
          response.data?.error ??
            response.data?.message ??
            'No se pudo enviar el voto'
        );
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          'Error al enviar el voto'
      );
    } finally {
      setVoting(false);
    }
  };

  const handleReveal = async () => {
    if (!session) return;

    setRevealing(true);
    setError(null);

    try {
      const response = await api.post(`/estimation/sessions/${sessionId}/reveal`, {
        roundNumber: session.currentRound,
      });

      if (response.status >= 200 && response.status < 300) {
        await fetchSession();
        await fetchHistory();
      } else {
        setError(
          response.data?.error ??
            response.data?.message ??
            'No se pudo revelar los votos'
        );
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          'Error al revelar votos'
      );
    } finally {
      setRevealing(false);
    }
  };

  const handleNewRound = async () => {
    if (!session) return;

    const reason = prompt('¿Por qué se necesita una nueva ronda?');
    if (!reason) return;

    setStartingNewRound(true);
    setError(null);

    try {
      const response = await api.post(`/estimation/sessions/${sessionId}/new-round`, {
        newRoundNumber: session.currentRound + 1,
        reason,
      });

      if (response.status >= 200 && response.status < 300) {
        // Actualizar el estado local para reflejar la nueva ronda inmediatamente
        const newRoundNumber = response.data.newRoundNumber || (session.currentRound + 1);
        
        setSession((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            currentRound: newRoundNumber,
            isRevealed: false,
            votes: [],
            userHasVoted: false,
            userVote: null,
          };
        });
        
        // Limpiar selección de carta anterior
        setSelectedCard(null);
        setJustification('');
        
        // Mostrar mensaje de éxito
        setSuccessMessage(`¡Nueva ronda ${newRoundNumber} iniciada! Todos pueden votar nuevamente.`);
        setTimeout(() => setSuccessMessage(null), 5000);
        
        // Luego recargar desde el servidor
        await fetchSession();
        await fetchHistory();
      } else {
        setError(
          response.data?.error ??
            response.data?.message ??
            'No se pudo iniciar nueva ronda'
        );
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          'Error al iniciar nueva ronda'
      );
    } finally {
      setStartingNewRound(false);
    }
  };

  const handleFinalize = async () => {
    if (!session || !finalEstimate) return;

    if (!estimateHours || isNaN(parseFloat(estimateHours))) {
      setError('Debes ingresar una estimación válida en horas');
      return;
    }

    if (!confirm('¿Estás seguro de finalizar esta sesión? Esta acción no se puede deshacer.')) {
      return;
    }

    setFinalizing(true);
    setError(null);

    try {
      const response = await api.post(`/estimation/sessions/${sessionId}/finalize`, {
        finalEstimation: finalEstimate,
        estimateHours: parseFloat(estimateHours),
        notes: notes.trim() || null,
      });

      if (response.status >= 200 && response.status < 300) {
        await fetchSession();
        alert('Sesión finalizada con éxito. Los story points se actualizaron en la historia.');
      } else {
        setError(
          response.data?.error ??
            response.data?.message ??
            'No se pudo finalizar la sesión'
        );
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          'Error al finalizar sesión'
      );
    } finally {
      setFinalizing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-white/70">Cargando sesión...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-white/70">Debes iniciar sesión</p>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">
          {error}
        </div>
        <Link
          href={`/projects/${projectId}/estimation`}
          className="text-sm text-white/60 hover:text-white"
        >
          ← Volver a sesiones
        </Link>
      </div>
    );
  }

  if (!session) return null;

  const canVote = session.status !== 'CLOSED' && !session.userHasVoted;
  const canReveal = session.isModerator && !session.isRevealed && session.status === 'ACTIVE';
  const canStartNewRound = session.isModerator && session.isRevealed && session.status === 'ACTIVE';
  const canFinalize = session.isModerator && session.status === 'ACTIVE';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold text-white">{session.name}</h1>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${statusColors[session.status]}`}>
              {statusLabels[session.status]}
            </span>
          </div>
          <p className="mt-2 text-sm text-white/70">
            Ronda {session.currentRound} • Moderador: {session.moderator?.firstName} {session.moderator?.lastName}
          </p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:bg-white/5"
        >
          {showHistory ? 'Ocultar' : 'Ver'} Histórico
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-300">
          ✓ {successMessage}
        </div>
      )}

      {/* Historia de usuario */}
      {session.story && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
              {session.story.code}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">{session.story.title}</h2>
          </div>
          <div className="space-y-2 text-sm text-white/80">
            <p><strong>Como:</strong> {session.story.asA}</p>
            <p><strong>Quiero:</strong> {session.story.iWant}</p>
            <p><strong>Para:</strong> {session.story.soThat}</p>
          </div>
          {session.story.acceptanceCriteria.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-white mb-2">Criterios de aceptación:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-white/70">
                {session.story.acceptanceCriteria.map((criteria, idx) => (
                  <li key={idx}>{criteria}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Histórico */}
      {showHistory && history && (
        <div>
          <h2 className="mb-4 text-xl font-semibold text-white">Histórico de Votaciones</h2>
          <SessionHistory rounds={history.rounds} />
        </div>
      )}

      {/* Contenido principal según estado */}
      {session.status === 'CLOSED' ? (
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-8 text-center">
          <p className="text-lg text-blue-300">Sesión finalizada</p>
          <p className="mt-2 text-3xl font-bold text-blue-400">{session.finalEstimation}</p>
          <p className="mt-4 text-sm text-white/70">
            Esta sesión ha sido completada. La estimación final ha sido registrada.
          </p>
        </div>
      ) : (
        <>
          {/* Votación */}
          {canVote ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-6">
              <PokerDeck
                sequence={session.sequence}
                selectedValue={selectedCard}
                onSelectCard={setSelectedCard}
                disabled={voting}
              />

              {/* Justificación opcional */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white">
                  Justificación (opcional)
                </label>
                <textarea
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="¿Por qué elegiste esta estimación?"
                  rows={3}
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  disabled={voting}
                />
              </div>

              <button
                onClick={handleVote}
                disabled={!selectedCard || voting}
                className="w-full rounded-full bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {voting ? 'Enviando voto...' : 'Confirmar voto'}
              </button>
            </div>
          ) : session.userHasVoted && session.userVote ? (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6">
              <p className="text-emerald-300 font-semibold mb-2">✓ Ya votaste en esta ronda</p>
              <p className="text-white">Tu voto: <span className="text-2xl font-bold text-emerald-400">{session.userVote.voteValue}</span></p>
              {session.userVote.justification && (
                <p className="mt-2 text-sm text-white/70 italic">"{session.userVote.justification}"</p>
              )}
            </div>
          ) : null}

          {/* Resultados */}
          <VotingResults votes={session.votes} isRevealed={session.isRevealed} />

          {/* Controles del moderador */}
          {session.isModerator && (
            <div className="space-y-4">
              {canReveal && (
                <button
                  onClick={handleReveal}
                  disabled={revealing}
                  className="w-full rounded-full bg-blue-500 px-6 py-3 font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
                >
                  {revealing ? 'Revelando...' : '🎴 Revelar todos los votos'}
                </button>
              )}

              {canStartNewRound && (
                <button
                  onClick={handleNewRound}
                  disabled={startingNewRound}
                  className="w-full rounded-full bg-yellow-500 px-6 py-3 font-semibold text-white transition hover:bg-yellow-600 disabled:opacity-50"
                >
                  {startingNewRound ? 'Iniciando...' : '🔄 Iniciar nueva ronda'}
                </button>
              )}

              {canFinalize && session.isRevealed && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-white">Finalizar sesión</h3>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">
                      Estimación final *
                    </label>
                    <select
                      value={finalEstimate}
                      onChange={(e) => setFinalEstimate(e.target.value)}
                      className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="">Selecciona un valor...</option>
                      {session.sequence.map((val) => (
                        <option key={val} value={val}>{val}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">
                      Horas estimadas *
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={estimateHours}
                      onChange={(e) => setEstimateHours(e.target.value)}
                      placeholder="Ej: 8"
                      className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">
                      Notas (opcional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={handleFinalize}
                    disabled={!finalEstimate || !estimateHours || finalizing}
                    className="w-full rounded-full bg-purple-500 px-6 py-3 font-semibold text-white transition hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {finalizing ? 'Finalizando...' : '✓ Finalizar sesión'}
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Botón volver */}
      <div className="pt-6">
        <Link
          href={`/projects/${projectId}/estimation`}
          className="text-sm text-white/60 hover:text-white transition"
        >
          ← Volver a sesiones
        </Link>
      </div>
    </div>
  );
}