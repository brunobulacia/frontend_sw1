'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/axios/client';

export default function RefactorCodePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [inputCode, setInputCode] = useState('');
  const [outputCode, setOutputCode] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRefactor = async () => {
    if (!inputCode.trim()) {
      setError('Por favor ingresa código para refactorizar');
      return;
    }

    setLoading(true);
    setError('');
    setOutputCode('');
    setSuggestions('');

    try {
      const response = await api.post('/refactor-code', {
        code: inputCode,
        language: language || undefined,
        instructions: instructions || undefined,
      });

      if (response.data) {
        setOutputCode(response.data.refactoredCode || '');
        setSuggestions(response.data.suggestions || '');
      }
    } catch (err: any) {
      console.error('Error refactoring code:', err);
      setError(
        err.response?.data?.message ||
        'Error al refactorizar el código. Intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyOutput = () => {
    if (outputCode) {
      navigator.clipboard.writeText(outputCode);
      alert('Código copiado al portapapeles');
    }
  };

  const handleClear = () => {
    setInputCode('');
    setOutputCode('');
    setSuggestions('');
    setInstructions('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-2"
            >
              ← Volver
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Refactorizar Código con IA
            </h1>
            <p className="text-gray-600 mt-2">
              Mejora tu código usando Claude AI - Obtén sugerencias de refactorización inteligentes
            </p>
          </div>
        </div>

        {/* Configuration Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lenguaje
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="typescript">TypeScript</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="csharp">C#</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
                <option value="php">PHP</option>
                <option value="ruby">Ruby</option>
                <option value="cpp">C++</option>
                <option value="">Otro</option>
              </select>
            </div>

            <div className="flex-[2] min-w-[300px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instrucciones adicionales (opcional)
              </label>
              <input
                type="text"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Ej: Usar async/await, aplicar patrón repository..."
                className="w-full px-3 py-2 text-gray-900 placeholder:text-gray-400 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleRefactor}
                disabled={loading || !inputCode.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Refactorizando...
                  </span>
                ) : (
                  '✨ Refactorizar Código'
                )}
              </button>

              <button
                onClick={handleClear}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium transition-colors"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Main Content - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Input Column */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                📝 Código de Entrada
              </h2>
              <span className="text-sm text-gray-500">
                {inputCode.split('\n').length} líneas
              </span>
            </div>
            <textarea
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Pega aquí tu código para refactorizar...&#10;&#10;Ejemplo:&#10;function getUserData(id) {&#10;  const user = users.find(u => u.id == id);&#10;  if (user) {&#10;    return user;&#10;  } else {&#10;    return null;&#10;  }&#10;}"
              className="w-full h-[600px] p-4 font-mono text-sm text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-gray-50"
              spellCheck={false}
            />
          </div>

          {/* Output Column */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                ✅ Código Refactorizado
              </h2>
              {outputCode && (
                <button
                  onClick={handleCopyOutput}
                  className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                >
                  📋 Copiar
                </button>
              )}
            </div>
            <textarea
              value={outputCode}
              readOnly
              placeholder="El código refactorizado aparecerá aquí..."
              className="w-full h-[600px] p-4 font-mono text-sm text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-md bg-gray-50 resize-none"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Suggestions Section */}
        {suggestions && (
          <div className="mt-4 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              💡 Sugerencias y Mejoras Aplicadas
            </h2>
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {suggestions}
              </div>
            </div>
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>💡 Consejo:</strong> Esta herramienta utiliza Claude AI (Haiku) para analizar y mejorar tu código.
            Considera las sugerencias cuidadosamente y verifica que mantengan la funcionalidad original.
          </p>
        </div>
      </div>
    </div>
  );
}
