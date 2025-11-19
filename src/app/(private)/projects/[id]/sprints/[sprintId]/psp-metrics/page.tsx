'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function PSPMetricsPage() {
  const params = useParams();
  const sprintId = params.sprintId as string;

  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, [sprintId]);

  const fetchMetrics = async () => {
    try {
      const response = await fetch(`/api/sprints/${sprintId}/psp-metrics`);
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Cargando métricas...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Métricas PSP - Personal Software Process</h1>
      
      {metrics.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <p className="text-gray-600">No hay métricas calculadas para este sprint</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metrics.map((metric) => (
            <div key={metric.id} className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-lg mb-4">
                {metric.user.firstName} {metric.user.lastName}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tareas completadas:</span>
                  <span className="font-semibold">{metric.tasksCompleted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tareas reabiertas:</span>
                  <span className="font-semibold text-orange-600">{metric.tasksReopened}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Defectos corregidos:</span>
                  <span className="font-semibold text-green-600">{metric.defectsFixed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Esfuerzo total:</span>
                  <span className="font-semibold">{metric.totalEffortHours}h</span>
                </div>
                {metric.avgTimePerTask && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tiempo promedio:</span>
                    <span className="font-semibold">{metric.avgTimePerTask.toFixed(1)}h/tarea</span>
                  </div>
                )}
              </div>
              <div className="mt-4 text-xs text-gray-500">
                Calculado: {new Date(metric.calculatedAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

