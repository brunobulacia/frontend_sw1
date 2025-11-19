'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/axios/client';
import BurndownChart from '@/components/burndown/BurndownChart';
import MetricsCards from '@/components/burndown/MetricsCards';

interface BurndownPoint {
  date: string;
  idealEffort: number;
  actualEffort: number;
}

interface BurndownData {
  sprintId?: string;
  sprintName?: string;
  sprintNumber?: number;
  startDate?: string;
  endDate?: string;
  chartData?: BurndownPoint[];
  name?: string;
  number?: number;
  sprint?: {
    id?: string;
    number?: number;
    name?: string;
    startDate?: string;
    endDate?: string;
  };
}

interface SprintMetrics {
  effortCompleted: number;
  effortRemaining: number;
  totalEffort: number;
  storiesCompleted: number;
  storiesInProgress: number;
  storiesTotal: number;
  velocity: number;
  daysElapsed: number;
  daysRemaining: number;
  totalDays: number;
  onTrack: boolean;
}

interface Snapshot {
  id: string;
  date: string;
  effortRemaining: number;
  storiesCompleted: number;
  createdBy: string;
}

export default function SprintMetricsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const sprintId = params.sprintId as string;

  const [burndownData, setBurndownData] = useState<BurndownData | null>(null);
  const [metrics, setMetrics] = useState<SprintMetrics | null>(null);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, [projectId, sprintId]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [burndownRes, metricsRes, snapshotsRes] = await Promise.all([
        api.get(`/burndown/projects/${projectId}/sprints/${sprintId}`),
        api.get(
          `/burndown/projects/${projectId}/sprints/${sprintId}/metrics`
        ),
        api.get(
          `/burndown/projects/${projectId}/sprints/${sprintId}/snapshots`
        ),
      ]);

      const burndownRawData = burndownRes.data;
      const sprintInfo = burndownRawData.sprintInfo || burndownRawData.sprint || {};
      const chartData = burndownRawData.chartData || {};
      
      const burndownPoints: BurndownPoint[] = [];
      if (chartData.dates && chartData.idealLine && chartData.actualLine) {
        for (let i = 0; i < chartData.dates.length; i++) {
          burndownPoints.push({
            date: chartData.dates[i],
            idealEffort: chartData.idealLine[i],
            actualEffort: chartData.actualLine[i],
          });
        }
      }
      
      const normalizedBurndown: BurndownData = {
        sprintId: sprintInfo.id || sprintId,
        sprintName: sprintInfo.name || 'Sprint sin nombre',
        sprintNumber: sprintInfo.number,
        startDate: sprintInfo.startDate,
        endDate: sprintInfo.endDate,
        chartData: burndownPoints,
      };

      const metricsRawData = metricsRes.data;
      const effortData = metricsRawData.effort;

      const sprintStartStr = metricsRawData.timeline?.startDate || normalizedBurndown.startDate;
      const sprintEndStr = metricsRawData.timeline?.endDate || normalizedBurndown.endDate;
      
      const sprintStart = new Date(sprintStartStr.split('T')[0] + 'T00:00:00Z');
      const sprintEnd = new Date(sprintEndStr.split('T')[0] + 'T00:00:00Z');
      const today = new Date(new Date().toISOString().split('T')[0] + 'T00:00:00Z');
      
      const effectiveEndDate = today > sprintEnd ? sprintEnd : today;
      
      const msPerDay = 1000 * 60 * 60 * 24;
      const daysElapsedCalculated = Math.floor((effectiveEndDate.getTime() - sprintStart.getTime()) / msPerDay);
      const totalDaysCalculated = Math.round((sprintEnd.getTime() - sprintStart.getTime()) / msPerDay) + 1;
      const daysRemainingCalculated = Math.max(0, totalDaysCalculated - daysElapsedCalculated);
      
      const effortCompleted = effortData?.completedHours || effortData?.effortCompleted || effortData?.completed || 0;
      const effortRemaining = effortData?.remainingHours || effortData?.effortRemaining || effortData?.remaining || 0;
      const effortCommitted = effortData?.effortCommitted || effortData?.committed || (effortCompleted + effortRemaining) || 0;
      
      const velocityCalculated = daysElapsedCalculated > 0 
        ? effortCompleted / daysElapsedCalculated 
        : 0;
      
      const isSprintCompleted = effortRemaining === 0 && effortCompleted > 0;
      const progressPercentage = effortCommitted > 0 ? (effortCompleted / effortCommitted) * 100 : 0;
      const timePercentage = totalDaysCalculated > 0 ? (daysElapsedCalculated / totalDaysCalculated) * 100 : 0;
      const isAheadOfSchedule = progressPercentage >= timePercentage;
      
      const onTrackCalculated = isSprintCompleted || isAheadOfSchedule || (metricsRawData.onTrack || false);
      
      const normalizedMetrics: SprintMetrics = {
        effortCompleted: effortCompleted,
        effortRemaining: effortRemaining,
        totalEffort: effortCommitted,
        storiesCompleted: metricsRawData.stories?.done || 0,
        storiesInProgress: metricsRawData.stories?.inProgress || 0,
        storiesTotal: metricsRawData.stories?.total || 0,
        velocity: velocityCalculated,
        daysElapsed: daysElapsedCalculated,
        daysRemaining: daysRemainingCalculated,
        totalDays: totalDaysCalculated,
        onTrack: onTrackCalculated,
      };

      setBurndownData(normalizedBurndown);
      setMetrics(normalizedMetrics);
      setSnapshots(Array.isArray(snapshotsRes.data) ? snapshotsRes.data : []);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(
        err.response?.data?.error || 'Error al cargar los datos del sprint'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSnapshot = async () => {
    try {
      await api.post(
        `/burndown/projects/${projectId}/sprints/${sprintId}/snapshots`
      );
      await fetchAllData();
      alert('Snapshot creado exitosamente');
    } catch (err: any) {
      console.error('Error creating snapshot:', err);
      alert(
        err.response?.data?.error || 'Error al crear el snapshot'
      );
    }
  };

  const handleExport = async (format: 'png' | 'pdf' | 'svg') => {
    try {
      setExporting(true);

      const response = await api.get(
        `/burndown/projects/${projectId}/sprints/${sprintId}/export?format=${format}`,
        {
          responseType: 'blob',
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `burndown-chart-sprint-${sprintId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Error exporting chart:', err);
      alert('Error al exportar el gráfico');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Cargando métricas...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            ← Volver
          </button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {burndownData?.sprintName || 'Sprint sin nombre'}
              </h1>
              <p className="text-gray-600 mt-2">
                Sprint #{burndownData?.sprintNumber || burndownData?.sprintId || 'N/A'} • {burndownData?.startDate || 'N/A'}{' '}
                - {burndownData?.endDate || 'N/A'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCreateSnapshot}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 shadow-md transition-all duration-200"
              >
                📸 Crear Snapshot
              </button>
              <div className="relative group">
                <button
                  disabled={exporting}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-md transition-all duration-200 disabled:opacity-50"
                >
                  {exporting ? 'Exportando...' : '⬇️ Exportar'}
                </button>
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <button
                    onClick={() => handleExport('png')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-t-lg"
                  >
                    PNG
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => handleExport('svg')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-b-lg"
                  >
                    SVG
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {metrics && <MetricsCards metrics={metrics} />}

        {burndownData && (
          <div className="mb-6">
            <BurndownChart data={burndownData.chartData || []} />
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Historial de Snapshots
          </h2>
          {snapshots.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No hay snapshots registrados
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Esfuerzo Restante
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Historias Completadas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Creado Por
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {snapshots.map((snapshot) => (
                    <tr key={snapshot.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(snapshot.date).toLocaleString('es-ES')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {snapshot.effortRemaining} hrs
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {snapshot.storiesCompleted}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {snapshot.createdBy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
