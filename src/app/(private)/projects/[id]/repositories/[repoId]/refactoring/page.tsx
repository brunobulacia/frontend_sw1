'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function RefactoringPage() {
  const params = useParams();
  const repositoryId = params.repoId as string;

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    fetchSuggestions();
  }, [repositoryId]);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/repositories/${repositoryId}/refactoring`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * HU14 CRÍTICO: Importar archivo JSON de herramienta externa
   * Formato esperado: { suggestions: [...] }
   */
  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      const text = await file.text();
      const jsonData = JSON.parse(text);

      // Enviar al backend
      const response = await fetch(
        `/api/repositories/${repositoryId}/refactoring/import`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jsonData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const result = await response.json();
      alert(
        `✅ ${result.imported} sugerencias importadas exitosamente\n` +
        `${result.duplicates > 0 ? `⚠️ ${result.duplicates} duplicados omitidos` : ''}`
      );

      // Recargar lista
      fetchSuggestions();
    } catch (error: any) {
      alert(`Error al importar: ${error.message}`);
    } finally {
      setImporting(false);
      e.target.value = ''; // Reset input
    }
  };

  const updateStatus = async (suggestionId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/refactoring/${suggestionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Error al actualizar');

      alert('Estado actualizado');
      fetchSuggestions();
    } catch (error) {
      alert('Error al actualizar estado');
    }
  };

  if (loading) return <div className="p-8">Cargando...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Sugerencias de Refactoring</h1>
        
        <div className="flex items-center space-x-4">
          {/* HU14: Botón de importar JSON */}
          <label className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer">
            {importing ? 'Importando...' : '📁 Importar JSON'}
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
              disabled={importing}
            />
          </label>
        </div>
      </div>

      {/* Formato esperado */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
        <p className="text-sm font-medium text-blue-800 mb-2">
          📄 Formato JSON esperado (SonarQube, ESLint, etc.):
        </p>
        <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
{`{
  "suggestions": [
    {
      "filePath": "src/services/user.ts",
      "description": "Método muy largo",
      "severity": "MEDIUM",
      "lineNumber": 45,
      "tool": "SonarQube",
      "category": "complexity"
    }
  ]
}`}
        </pre>
      </div>

      {/* Lista de sugerencias */}
      {suggestions.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <p className="text-gray-600">No hay sugerencias de refactoring</p>
          <p className="text-sm text-gray-500 mt-2">
            Importa un archivo JSON de tu herramienta de análisis
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className={`bg-white rounded-lg shadow p-4 border-l-4 ${
                suggestion.severity === 'HIGH'
                  ? 'border-red-500'
                  : suggestion.severity === 'MEDIUM'
                  ? 'border-yellow-500'
                  : 'border-green-500'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        suggestion.severity === 'HIGH'
                          ? 'bg-red-100 text-red-800'
                          : suggestion.severity === 'MEDIUM'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {suggestion.severity}
                    </span>
                    <span className="text-sm text-gray-600">{suggestion.tool}</span>
                  </div>
                  <p className="font-medium text-gray-800 mb-1">
                    {suggestion.filePath}
                    {suggestion.lineNumber && `:${suggestion.lineNumber}`}
                  </p>
                  <p className="text-sm text-gray-700">{suggestion.description}</p>
                </div>

                {suggestion.status === 'PENDING' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => updateStatus(suggestion.id, 'RESOLVED')}
                      className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      ✓ Resolver
                    </button>
                    <button
                      onClick={() => updateStatus(suggestion.id, 'IGNORED')}
                      className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      ✗ Ignorar
                    </button>
                  </div>
                )}
                {suggestion.status === 'RESOLVED' && (
                  <span className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded">
                    ✓ Resuelto
                  </span>
                )}
                {suggestion.status === 'IGNORED' && (
                  <span className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                    Ignorado
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

