"use client";

import { useState, FormEvent } from "react";

import { api } from "@/lib/axios/client";

import { useRouter } from "next/navigation";

import Link from "next/link";

import { useAuth } from "@/hooks/useAuth";

export default function NewProjectPage() {
  const router = useRouter();

  const { user } = useAuth();

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [success, setSuccess] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  type ProjectVisibility = "PUBLIC" | "PRIVATE";

  type ProjectStatus = "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED";

  interface CreateProjectPayload {
    name: string;

    visibility: ProjectVisibility;

    sprintDuration: number;

    status: ProjectStatus;

    startDate: string;

    description?: string;

    productObjective: string;

    definitionOfDone?: string;

    qualityCriteria: string;

    endDate?: string;

    teamMembers: {
      userId: string;

      role: "PRODUCT_OWNER" | "SCRUM_MASTER" | "DEVELOPER";
    }[];
  }

  const [formData, setFormData] = useState({
    name: "",

    description: "",

    visibility: "PRIVATE" as ProjectVisibility,

    productObjective: "",

    definitionOfDone: "",

    sprintDuration: 2,

    qualityCriteria: "",

    status: "PLANNING" as ProjectStatus,

    startDate: today,

    endDate: "",
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setLoading(true);

    setError(null);

    setSuccess(null);

    try {
      if (!user?.id) {
        setError("No hay sesion activa. Vuelve a iniciar sesion.");

        setLoading(false);

        return;
      }

      if (!formData.startDate) {
        setError("Debes seleccionar una fecha de inicio.");

        setLoading(false);

        return;
      }

      if (formData.startDate < today) {
        setError("La fecha de inicio no puede ser anterior a la fecha actual.");

        setLoading(false);

        return;
      }

      // Preparar datos para enviar

      const payload: CreateProjectPayload = {
        name: formData.name,

        visibility: formData.visibility,

        sprintDuration: formData.sprintDuration,

        status: formData.status,

        startDate: formData.startDate,

        productObjective: formData.productObjective,

        qualityCriteria: formData.qualityCriteria,

        teamMembers: [{ userId: user.id, role: "PRODUCT_OWNER" }],
      };

      if (formData.description) payload.description = formData.description;

      if (formData.definitionOfDone)
        payload.definitionOfDone = formData.definitionOfDone;

      if (formData.endDate) payload.endDate = formData.endDate;

      const response = await api.post("/projects", payload, {
        validateStatus: () => true,
      });

      if (response.status >= 200 && response.status < 300) {
        setSuccess("Proyecto creado exitosamente.");

        setTimeout(() => {
          const projectId =
            response.data?.project?.id ?? response.data?.id ?? null;

          if (projectId) {
            router.push(`/projects/${projectId}`);
          }
        }, 1500);
      } else {
        const message = Array.isArray(response.data?.message)
          ? response.data.message.join(" | ")
          : response.data?.message || response.data?.error;

        setError(message || "No se pudo crear el proyecto.");
      }
    } catch (error: unknown) {
      const responseData = (
        error as {
          response?: { data?: { message?: unknown } };
        }
      )?.response?.data;

      const aggregated = Array.isArray(responseData?.message)
        ? responseData.message

            .filter((item): item is string => typeof item === "string")

            .join(" | ")
        : undefined;

      const message =
        aggregated ??
        (typeof responseData?.message === "string"
          ? responseData.message
          : typeof (error as { message?: unknown })?.message === "string"
            ? (error as { message: string }).message
            : undefined);

      setError(message ?? "Error inesperado al crear el proyecto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">
            Nuevo Proyecto Scrum
          </h1>

          <p className="mt-2 text-sm text-white/70">
            Configura un nuevo proyecto para tu equipo
          </p>
        </div>

        <Link
          href="/projects"
          className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Volver
        </Link>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-green-300">
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg backdrop-blur"
      >
        <div className="space-y-6">
          {/* Informacin bsica */}

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">
              Informacin Bsica
            </h2>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Nombre del Proyecto *
              </label>

              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-primary focus:outline-none"
                placeholder="Ej: Sistema de Gestin de Proyectos"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Descripcin
              </label>

              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-primary focus:outline-none"
                placeholder="Describe brevemente el proyecto..."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Visibilidad *
                </label>

                <select
                  value={formData.visibility}
                  onChange={(e) =>
                    setFormData({
                      ...formData,

                      visibility: e.target.value as "PUBLIC" | "PRIVATE",
                    })
                  }
                  className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-primary focus:outline-none"
                >
                  <option value="PRIVATE">Privado</option>

                  <option value="PUBLIC">Pblico</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Estado *
                </label>

                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,

                      status: e.target.value as ProjectStatus,
                    })
                  }
                  className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-primary focus:outline-none"
                >
                  <option value="PLANNING">Planificacion</option>

                  <option value="ACTIVE">Activo</option>

                  <option value="ON_HOLD">En Pausa</option>

                  <option value="COMPLETED">Completado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Configuracin Scrum */}

          <div className="space-y-4 border-t border-white/10 pt-6">
            <h2 className="text-lg font-semibold text-white">
              Configuracin Scrum
            </h2>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Objetivo del Producto
              </label>

              <textarea
                value={formData.productObjective}
                onChange={(e) =>
                  setFormData({ ...formData, productObjective: e.target.value })
                }
                rows={2}
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-primary focus:outline-none"
                placeholder="Que problema resuelve este producto?"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Definition of Done (DoD)
              </label>

              <textarea
                value={formData.definitionOfDone}
                onChange={(e) =>
                  setFormData({ ...formData, definitionOfDone: e.target.value })
                }
                rows={3}
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-primary focus:outline-none"
                placeholder="Define los criterios para considerar una tarea como terminada..."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Duracion de Sprint (semanas) *
                </label>

                <input
                  type="number"
                  required
                  min="1"
                  max="4"
                  value={formData.sprintDuration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,

                      sprintDuration: parseInt(e.target.value),
                    })
                  }
                  className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-primary focus:outline-none"
                />

                <p className="mt-1 text-xs text-white/50">
                  Entre 1 y 4 semanas
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Criterios de Calidad *
                </label>

                <textarea
                  required
                  rows={3}
                  value={formData.qualityCriteria}
                  onChange={(e) =>
                    setFormData({
                      ...formData,

                      qualityCriteria: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-primary focus:outline-none"
                  placeholder="Ej.: Cobertura de tests >= 80%, 0 bugs criticos, revision por pares obligatoria."
                />

                <p className="mt-1 text-xs text-white/50">
                  Minimo 5 caracteres.
                </p>
              </div>
            </div>
          </div>

          {/* Fechas */}

          <div className="space-y-4 border-t border-white/10 pt-6">
            <h2 className="text-lg font-semibold text-white">
              Planificacion Temporal
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Fecha de Inicio *
                </label>

                <input
                  type="date"
                  required
                  value={formData.startDate}
                  min={today}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Fecha de Fin (estimada)
                </label>

                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Botones */}

          <div className="flex items-center justify-end gap-4 border-t border-white/10 pt-6">
            <Link
              href="/projects"
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50 shadow-lg shadow-emerald-500/30"
            >
              {loading ? "Creando..." : "Crear Proyecto"}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
