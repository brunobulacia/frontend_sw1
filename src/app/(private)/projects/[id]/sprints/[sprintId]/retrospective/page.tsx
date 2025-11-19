'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function SprintRetrospectivePage() {
  const params = useParams();
  const router = useRouter();
  const sprintId = params.sprintId as string;

  const [formData, setFormData] = useState({
    whatWentWell: '',
    whatToImprove: '',
    whatToStopDoing: '',
    improvementActions: [{ description: '', responsible: '', dueDate: '' }],
  });
  const [existingRetro, setExistingRetro] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExistingRetrospective();
  }, [sprintId]);

  const fetchExistingRetrospective = async () => {
    try {
      const response = await fetch(`/api/sprints/${sprintId}/retrospective`);
      if (response.ok) {
        const data = await response.json();
        setExistingRetro(data);
        setFormData({
          whatWentWell: data.whatWentWell,
          whatToImprove: data.whatToImprove,
          whatToStopDoing: data.whatToStopDoing,
          improvementActions: data.improvementActions.length > 0
            ? data.improvementActions.map((a: any) => ({
                description: a.description,
                responsible: a.responsible || '',
                dueDate: a.dueDate ? a.dueDate.split('T')[0] : '',
              }))
            : [{ description: '', responsible: '', dueDate: '' }],
        });
      }
    } catch (err) {
      // No hay retrospective
    } finally {
      setLoading(false);
    }
  };

  const addAction = () => {
    setFormData({
      ...formData,
      improvementActions: [
        ...formData.improvementActions,
        { description: '', responsible: '', dueDate: '' },
      ],
    });
  };

  const removeAction = (index: number) => {
    setFormData({
      ...formData,
      improvementActions: formData.improvementActions.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // HU11 CRÍTICO: Validar que haya al menos una acción de mejora con descripción
    const hasValidAction = formData.improvementActions.some(
      (action) => action.description.trim() !== ''
    );

    if (!hasValidAction) {
      alert('Error: Es obligatorio registrar al menos una acción de mejora antes de guardar');
      return;
    }

    try {
      const method = existingRetro ? 'PUT' : 'POST';
      const response = await fetch(`/api/sprints/${sprintId}/retrospective`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al guardar');
      }

      alert('Sprint Retrospective guardada exitosamente');
      router.back();
    } catch (error: any) {
      alert(error.message || 'Error al guardar Retrospective');
    }
  };

  if (loading) return <div className="p-8">Cargando...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Sprint Retrospective</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium mb-2">¿Qué salió bien? *</label>
          <textarea
            required
            rows={4}
            value={formData.whatWentWell}
            onChange={(e) => setFormData({ ...formData, whatWentWell: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">¿Qué podemos mejorar? *</label>
          <textarea
            required
            rows={4}
            value={formData.whatToImprove}
            onChange={(e) => setFormData({ ...formData, whatToImprove: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">¿Qué dejar de hacer? *</label>
          <textarea
            required
            rows={4}
            value={formData.whatToStopDoing}
            onChange={(e) => setFormData({ ...formData, whatToStopDoing: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium">Acciones de Mejora</label>
            <button
              type="button"
              onClick={addAction}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
            >
              + Agregar Acción
            </button>
          </div>
          
          {formData.improvementActions.map((action, index) => (
            <div key={index} className="border p-4 rounded-md mb-3 space-y-2">
              <input
                type="text"
                value={action.description}
                onChange={(e) => {
                  const newActions = [...formData.improvementActions];
                  newActions[index].description = e.target.value;
                  setFormData({ ...formData, improvementActions: newActions });
                }}
                placeholder="Descripción de la acción"
                className="w-full px-3 py-2 border rounded-md"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={action.responsible}
                  onChange={(e) => {
                    const newActions = [...formData.improvementActions];
                    newActions[index].responsible = e.target.value;
                    setFormData({ ...formData, improvementActions: newActions });
                  }}
                  placeholder="Responsable"
                  className="px-3 py-2 border rounded-md"
                />
                <input
                  type="date"
                  value={action.dueDate}
                  onChange={(e) => {
                    const newActions = [...formData.improvementActions];
                    newActions[index].dueDate = e.target.value;
                    setFormData({ ...formData, improvementActions: newActions });
                  }}
                  className="px-3 py-2 border rounded-md"
                />
              </div>
              {formData.improvementActions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAction(index)}
                  className="text-red-600 text-sm hover:text-red-800"
                >
                  Eliminar
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-100 rounded-md"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {existingRetro ? 'Actualizar' : 'Crear Retrospective'}
          </button>
        </div>
      </form>
    </div>
  );
}

