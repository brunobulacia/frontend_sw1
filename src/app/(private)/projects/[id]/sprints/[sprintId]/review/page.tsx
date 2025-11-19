'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function SprintReviewPage() {
  const params = useParams();
  const router = useRouter();
  const sprintId = params.sprintId as string;

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    participants: '',
    summary: '',
    feedbackGeneral: '',
  });
  const [existingReview, setExistingReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchExistingReview();
  }, [sprintId]);

  const fetchExistingReview = async () => {
    try {
      const response = await fetch(`/api/sprints/${sprintId}/review`);
      if (response.ok) {
        const data = await response.json();
        setExistingReview(data);
        setFormData({
          date: data.date.split('T')[0],
          participants: data.participants,
          summary: data.summary,
          feedbackGeneral: data.feedbackGeneral || '',
        });
      }
    } catch (err) {
      // No hay review aún
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const method = existingReview ? 'PUT' : 'POST';
      const response = await fetch(`/api/sprints/${sprintId}/review`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Error al guardar');

      alert('Sprint Review guardado exitosamente');
      router.back();
    } catch (error) {
      alert('Error al guardar Sprint Review');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-8">Cargando...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Sprint Review</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium mb-2">Fecha *</label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Participantes *</label>
          <input
            type="text"
            required
            value={formData.participants}
            onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
            placeholder="Scrum Master, Product Owner, Developers"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Resumen de lo completado *</label>
          <textarea
            required
            rows={5}
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            placeholder="Describe qué se logró completar en el sprint..."
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Feedback General</label>
          <textarea
            rows={3}
            value={formData.feedbackGeneral}
            onChange={(e) => setFormData({ ...formData, feedbackGeneral: e.target.value })}
            placeholder="Feedback del Product Owner y stakeholders..."
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isSubmitting ? 'Guardando...' : existingReview ? 'Actualizar' : 'Crear Review'}
          </button>
        </div>
      </form>
    </div>
  );
}

