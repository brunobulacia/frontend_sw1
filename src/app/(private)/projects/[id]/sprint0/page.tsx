"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/axios/client";
import { useAuth } from "@/hooks/useAuth";

type ProjectConfig = {
  id: string;
  projectId: string;
  key: string;
  value: string;
  type: string;
  category: string;
  description: string | null;
  isSystemSetting: boolean;
  createdAt: string;
  updatedAt: string;
};

type ConfigResponse = {
  all: ProjectConfig[];
  byCategory: Record<string, ProjectConfig[]>;
  categories: string[];
};

const categoryLabels: Record<string, string> = {
  definition_of_done: "Definition of Done (DoD)",
  development_patterns: "Patrones de Desarrollo",
  tech_infrastructure: "Infraestructura Tecnológica",
  initial_models: "Modelos Iniciales",
  scrum_team: "Equipo Scrum",
};

const categoryDescriptions: Record<string, string> = {
  definition_of_done: "Criterios que deben cumplirse para considerar una tarea como completada",
  development_patterns: "Estándares y patrones de arquitectura y código",
  tech_infrastructure: "Stack tecnológico y herramientas del proyecto",
  initial_models: "Diagramas y modelos del contexto, datos y arquitectura",
  scrum_team: "Definición del equipo multifuncional",
};

export default function Sprint0Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user, loading: authLoading } = useAuth();

  const [configs, setConfigs] = useState<ConfigResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingConfig, setEditingConfig] = useState<ProjectConfig | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [initializing, setInitializing] = useState(false);

  // New config modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newConfig, setNewConfig] = useState({
    key: "",
    value: "",
    type: "string",
    category: "definition_of_done",
    description: "",
  });

  const fetchConfigs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/project-config/${id}/configs`);
      setConfigs(response.data as ConfigResponse);
    } catch (error: any) {
      setError(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Error al cargar las configuraciones del proyecto.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleInitializeSprint0 = async () => {
    if (!confirm("¿Estás seguro de inicializar el Sprint 0? Esto creará configuraciones predeterminadas.")) {
      return;
    }

    setInitializing(true);
    try {
      await api.post(`/project-config/${id}/initialize-sprint0`);
      fetchConfigs();
      alert("Sprint 0 inicializado correctamente");
    } catch (error: any) {
      alert(
        error?.response?.data?.message || "Error al inicializar Sprint 0",
      );
    } finally {
      setInitializing(false);
    }
  };

  const handleCreateConfig = async () => {
    if (!newConfig.key || !newConfig.value) {
      alert("El key y el valor son obligatorios");
      return;
    }

    try {
      await api.post(`/project-config/${id}/configs`, newConfig);
      fetchConfigs();
      setShowCreateModal(false);
      setNewConfig({
        key: "",
        value: "",
        type: "string",
        category: "definition_of_done",
        description: "",
      });
      alert("Configuración creada correctamente");
    } catch (error: any) {
      alert(
        error?.response?.data?.message || "Error al crear la configuración",
      );
    }
  };

  const handleDeleteConfig = async (configId: string, configKey: string) => {
    if (!confirm(`¿Estás seguro de eliminar la configuración "${configKey}"?`)) {
      return;
    }

    try {
      await api.delete(`/project-config/${id}/configs/${configId}`);
      fetchConfigs();
      alert("Configuración eliminada correctamente");
    } catch (error: any) {
      alert(
        error?.response?.data?.message || "Error al eliminar la configuración",
      );
    }
  };

  const handleEdit = (config: ProjectConfig) => {
    setEditingConfig(config);
    setEditValue(config.value);
    setEditDescription(config.description || "");
  };

  const handleSaveEdit = async () => {
    if (!editingConfig) return;

    try {
      await api.patch(`/project-config/${id}/configs/${editingConfig.id}`, {
        value: editValue,
        description: editDescription || undefined,
      });
      fetchConfigs();
      setEditingConfig(null);
      setEditValue("");
      setEditDescription("");
    } catch (error: any) {
      alert(
        error?.response?.data?.message || "Error al actualizar la configuración",
      );
    }
  };

  const handleCancelEdit = () => {
    setEditingConfig(null);
    setEditValue("");
    setEditDescription("");
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchConfigs();
    }
  }, [authLoading, user, fetchConfigs]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="text-gray-400">Cargando configuraciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center">
          <p className="mb-4 text-red-400">{error}</p>
          <button
            onClick={fetchConfigs}
            className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/projects/${id}`}
          className="mb-2 inline-block text-sm text-blue-400 hover:text-blue-300"
        >
          ← Volver al proyecto
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Sprint 0 - Configuración del Proyecto
            </h1>
            <p className="mt-2 text-gray-400">
              Configura el equipo, Definition of Done, patrones de desarrollo e infraestructura tecnológica
            </p>
          </div>
          <div className="flex gap-3">
            {configs && configs.all.length > 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="rounded-md bg-green-500 px-6 py-3 font-semibold text-white hover:bg-green-600"
              >
                + Nueva Configuración
              </button>
            )}
            {(!configs || configs.all.length === 0) && (
              <button
                onClick={handleInitializeSprint0}
                disabled={initializing}
                className="rounded-md bg-blue-500 px-6 py-3 font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
              >
                {initializing ? "Inicializando..." : "Inicializar Sprint 0"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* No configs */}
      {configs && configs.all.length === 0 && (
        <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-8 text-center">
          <h3 className="mb-2 text-xl font-semibold text-white">
            No hay configuraciones aún
          </h3>
          <p className="mb-4 text-gray-400">
            Inicializa el Sprint 0 para crear las configuraciones predeterminadas del proyecto
          </p>
        </div>
      )}

      {/* Configs by Category */}
      {configs && configs.categories.length > 0 && (
        <div className="space-y-6">
          {configs.categories.map((category) => (
            <div
              key={category}
              className="rounded-lg border border-gray-700 bg-gray-800/50 p-6"
            >
              <div className="mb-4">
                <h2 className="text-xl font-bold text-white">
                  {categoryLabels[category] || category}
                </h2>
                <p className="text-sm text-gray-400">
                  {categoryDescriptions[category]}
                </p>
              </div>

              <div className="space-y-3">
                {configs.byCategory[category].map((config) => (
                  <div
                    key={config.id}
                    className="rounded-lg border border-gray-600 bg-gray-900/50 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <h3 className="font-semibold text-white">
                            {config.description || config.key}
                          </h3>
                          {config.isSystemSetting && (
                            <span className="rounded bg-purple-500/20 px-2 py-0.5 text-xs text-purple-300">
                              Sistema
                            </span>
                          )}
                          <span className="rounded bg-gray-700 px-2 py-0.5 text-xs text-gray-300">
                            {config.type}
                          </span>
                        </div>

                        {editingConfig?.id === config.id ? (
                          <div className="mt-3 space-y-2">
                            {config.type === "boolean" ? (
                              <select
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white"
                              >
                                <option value="true">Sí</option>
                                <option value="false">No</option>
                              </select>
                            ) : config.type === "text" ? (
                              <textarea
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                rows={3}
                                className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white"
                              />
                            ) : (
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white"
                              />
                            )}

                            <input
                              type="text"
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              placeholder="Descripción (opcional)"
                              className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white"
                            />

                            <div className="flex gap-2">
                              <button
                                onClick={handleSaveEdit}
                                className="rounded-md bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600"
                              >
                                Guardar
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="rounded-md bg-gray-600 px-4 py-2 text-sm text-white hover:bg-gray-700"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-1">
                            {config.type === "boolean" ? (
                              <span
                                className={`inline-block rounded px-2 py-1 text-sm font-semibold ${
                                  config.value === "true"
                                    ? "bg-green-500/20 text-green-300"
                                    : "bg-red-500/20 text-red-300"
                                }`}
                              >
                                {config.value === "true" ? "Sí" : "No"}
                              </span>
                            ) : (
                              <p className="text-gray-300">
                                {config.value || "(vacío)"}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {!config.isSystemSetting && editingConfig?.id !== config.id && (
                        <div className="ml-4 flex gap-2">
                          <button
                            onClick={() => handleEdit(config)}
                            className="rounded-md bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteConfig(config.id, config.key)}
                            className="rounded-md bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      Key: {config.key}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Config Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-2xl">
            <h2 className="mb-4 text-xl font-bold text-white">
              Nueva Configuración
            </h2>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-gray-400">
                Categoría *
              </label>
              <select
                value={newConfig.category}
                onChange={(e) =>
                  setNewConfig({ ...newConfig, category: e.target.value })
                }
                className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white"
              >
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-gray-400">
                Key (identificador único) *
              </label>
              <input
                type="text"
                value={newConfig.key}
                onChange={(e) =>
                  setNewConfig({ ...newConfig, key: e.target.value })
                }
                placeholder="ej: framework_frontend"
                className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white"
              />
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-gray-400">
                Tipo *
              </label>
              <select
                value={newConfig.type}
                onChange={(e) =>
                  setNewConfig({ ...newConfig, type: e.target.value })
                }
                className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white"
              >
                <option value="string">String</option>
                <option value="boolean">Boolean</option>
                <option value="text">Text (multilínea)</option>
                <option value="number">Number</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-gray-400">
                Valor *
              </label>
              {newConfig.type === "boolean" ? (
                <select
                  value={newConfig.value}
                  onChange={(e) =>
                    setNewConfig({ ...newConfig, value: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white"
                >
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              ) : newConfig.type === "text" ? (
                <textarea
                  value={newConfig.value}
                  onChange={(e) =>
                    setNewConfig({ ...newConfig, value: e.target.value })
                  }
                  rows={4}
                  className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white"
                />
              ) : (
                <input
                  type="text"
                  value={newConfig.value}
                  onChange={(e) =>
                    setNewConfig({ ...newConfig, value: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white"
                />
              )}
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-gray-400">
                Descripción
              </label>
              <input
                type="text"
                value={newConfig.description}
                onChange={(e) =>
                  setNewConfig({ ...newConfig, description: e.target.value })
                }
                placeholder="Descripción amigable"
                className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreateConfig}
                className="flex-1 rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600"
              >
                Crear
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewConfig({
                    key: "",
                    value: "",
                    type: "string",
                    category: "definition_of_done",
                    description: "",
                  });
                }}
                className="flex-1 rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
