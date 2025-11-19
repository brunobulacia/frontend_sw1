"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/axios/client";
import { useAuth } from "@/hooks/useAuth";

type TaskStatus = "TODO" | "IN_PROGRESS" | "TESTING" | "DONE";

type ProjectMemberRole = "PRODUCT_OWNER" | "SCRUM_MASTER" | "DEVELOPER";

type UserSummary = {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
};

type Member = UserSummary & {
  role: ProjectMemberRole;
};

type Task = {
  id: string;
  sprintId: string;
  storyId: string;
  code: string;
  title: string;
  description: string | null;
  effort: number;
  status: TaskStatus;
  assignedTo: UserSummary | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  story: {
    id: string;
    code: string;
    title: string;
    priority: number;
    businessValue: number;
  };
};

type KanbanBoard = {
  project: {
    id: string;
    code: string;
    name: string;
    members: Member[];
  };
  sprint: {
    id: string;
    number: number;
    name: string;
    goal: string | null;
    startDate: string;
    endDate: string;
  };
  tasks: Record<TaskStatus, Task[]>;
};

type ActivityLog = {
  id: string;
  action: string;
  fromStatus: TaskStatus | null;
  toStatus: TaskStatus | null;
  description: string;
  createdAt: string;
  user: UserSummary;
};

const statusLabels: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  TESTING: "Testing",
  DONE: "Done",
};

const statusColors: Record<TaskStatus, string> = {
  TODO: "bg-blue-500/20 border-blue-500/30",
  IN_PROGRESS: "bg-yellow-500/20 border-yellow-500/30",
  TESTING: "bg-purple-500/20 border-purple-500/30",
  DONE: "bg-green-500/20 border-green-500/30",
};

const columnOrder: TaskStatus[] = ["TODO", "IN_PROGRESS", "TESTING", "DONE"];

function getInitials(user: UserSummary | null): string {
  if (!user) return "?";
  return `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();
}

function getPriorityLabel(priority: number): string {
  if (priority >= 8) return "Alta";
  if (priority >= 5) return "Media";
  return "Baja";
}

function getPriorityColor(priority: number): string {
  if (priority >= 8) return "text-red-400";
  if (priority >= 5) return "text-yellow-400";
  return "text-green-400";
}

type Sprint = {
  id: string;
  number: number;
  name: string;
  status: string;
};

type SprintStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export default function KanbanBoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user, loading: authLoading } = useAuth();

  const [board, setBoard] = useState<KanbanBoard | null>(null);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggingTask, setDraggingTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [statusChangeLoading, setStatusChangeLoading] = useState(false);

  const fetchSprints = useCallback(async () => {
    try {
      const response = await api.get(`/sprints/${id}`);
      setSprints(response.data);
      // Auto-select first sprint if none selected
      if (response.data.length > 0 && !selectedSprintId) {
        setSelectedSprintId(response.data[0].id);
      }
    } catch (error: any) {
      console.error("Error fetching sprints:", error);
    }
  }, [id, selectedSprintId]);

  const fetchBoard = useCallback(async () => {
    if (!selectedSprintId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/kanban/projects/${id}/sprints/${selectedSprintId}`);
      setBoard(response.data as KanbanBoard);
    } catch (error: any) {
      setError(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Error al cargar el tablero Kanban.",
      );
    } finally {
      setLoading(false);
    }
  }, [id, selectedSprintId]);

  const fetchActivityLogs = useCallback(
    async (taskId: string) => {
      setActivityLoading(true);
      try {
        const response = await api.get(
          `/kanban/projects/${id}/tasks/${taskId}/activity`,
        );
        setActivityLogs(response.data as ActivityLog[]);
      } catch (error: any) {
        console.error("Error fetching activity logs:", error);
        setActivityLogs([]);
      } finally {
        setActivityLoading(false);
      }
    },
    [id],
  );

  useEffect(() => {
    if (!authLoading && user) {
      fetchSprints();
    }
  }, [authLoading, user, fetchSprints]);

  useEffect(() => {
    if (selectedSprintId) {
      fetchBoard();
    }
  }, [selectedSprintId, fetchBoard]);

  const handleDragStart = (task: Task) => {
    setDraggingTask(task);
  };

  const handleDragEnd = () => {
    setDraggingTask(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (event: React.DragEvent, status: TaskStatus) => {
    event.preventDefault();
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (
    event: React.DragEvent,
    targetStatus: TaskStatus,
  ) => {
    event.preventDefault();
    setDragOverColumn(null);

    if (!draggingTask || draggingTask.status === targetStatus) {
      setDraggingTask(null);
      return;
    }

    // Optimistic update
    const oldStatus = draggingTask.status;
    const updatedTask = { ...draggingTask, status: targetStatus };

    setBoard((prev) => {
      if (!prev) return prev;

      const newTasks = { ...prev.tasks };
      // Remove from old column
      newTasks[oldStatus] = newTasks[oldStatus].filter(
        (t) => t.id !== draggingTask.id,
      );
      // Add to new column
      newTasks[targetStatus] = [...newTasks[targetStatus], updatedTask];

      return { ...prev, tasks: newTasks };
    });

    try {
      await api.patch(`/kanban/projects/${id}/tasks/${draggingTask.id}/status`, {
        status: targetStatus,
      });
      // Refresh board to get latest data
      fetchBoard();
    } catch (error: any) {
      console.error("Error updating task status:", error);
      // Rollback on error
      setBoard((prev) => {
        if (!prev) return prev;

        const newTasks = { ...prev.tasks };
        newTasks[targetStatus] = newTasks[targetStatus].filter(
          (t) => t.id !== draggingTask.id,
        );
        newTasks[oldStatus] = [...newTasks[oldStatus], draggingTask];

        return { ...prev, tasks: newTasks };
      });

      alert(
        error?.response?.data?.message ||
          "Error al actualizar el estado de la tarea",
      );
    } finally {
      setDraggingTask(null);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    fetchActivityLogs(task.id);
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
    setActivityLogs([]);
  };

  const handleAssignTask = async (taskId: string, userId: string | null) => {
    try {
      await api.post(`/kanban/projects/${id}/tasks/${taskId}/assign`, {
        assignedToId: userId,
      });
      fetchBoard();
      if (selectedTask && selectedTask.id === taskId) {
        fetchActivityLogs(taskId);
      }
    } catch (error: any) {
      console.error("Error assigning task:", error);
      alert(
        error?.response?.data?.message || "Error al asignar la tarea",
      );
    }
  };

  const handleChangeSprintStatus = async (newStatus: SprintStatus) => {
    if (!selectedSprintId) return;

    const selectedSprint = sprints.find(s => s.id === selectedSprintId);
    if (!selectedSprint) return;

    // Confirmación para completar sprint
    if (newStatus === "COMPLETED") {
      const allTasks = Object.values(board?.tasks || {}).flat();
      const incompleteTasks = allTasks.filter(t => t.status !== "DONE");

      if (incompleteTasks.length > 0) {
        alert(`No se puede completar el sprint. Hay ${incompleteTasks.length} tarea(s) sin completar. Todas las tareas deben estar en estado DONE.`);
        return;
      }

      if (!confirm(`¿Estás seguro de completar el Sprint ${selectedSprint.number}? Esta acción marcará todas las historias como completadas.`)) {
        return;
      }
    }

    // Confirmación para desactivar sprint
    if (newStatus === "PLANNED") {
      if (!confirm(`¿Estás seguro de desactivar el Sprint ${selectedSprint.number}? El sprint volverá a estado PLANNED.`)) {
        return;
      }
    }

    setStatusChangeLoading(true);
    try {
      await api.patch(`/sprints/${id}/${selectedSprintId}/status`, {
        status: newStatus,
      });

      // Actualizar la lista de sprints
      await fetchSprints();

      // Recargar el tablero
      await fetchBoard();

      alert(`Sprint ${newStatus === "COMPLETED" ? "completado" : "desactivado"} exitosamente`);
    } catch (error: any) {
      console.error("Error changing sprint status:", error);
      alert(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Error al cambiar el estado del sprint"
      );
    } finally {
      setStatusChangeLoading(false);
    }
  };

  // Obtener el sprint actualmente seleccionado
  const currentSprint = sprints.find(s => s.id === selectedSprintId);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="text-gray-400">Cargando tablero Kanban...</p>
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
            onClick={fetchBoard}
            className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-400">No se encontró el tablero Kanban</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Sidebar - Sprint Selector */}
      <div className="w-64 border-r border-gray-700 bg-gray-900/50 p-4">
        <Link
          href={`/projects/${id}`}
          className="mb-4 inline-block text-sm text-blue-400 hover:text-blue-300"
        >
          ← Volver al proyecto
        </Link>
        <h2 className="mb-4 text-lg font-semibold text-white">Sprints</h2>
        <div className="space-y-2">
          {sprints.map((sprint) => (
            <button
              key={sprint.id}
              onClick={() => setSelectedSprintId(sprint.id)}
              className={`w-full rounded-lg border p-3 text-left transition ${
                selectedSprintId === sprint.id
                  ? "border-blue-500 bg-blue-600/20"
                  : "border-gray-700 bg-gray-800/50 hover:border-blue-500/50"
              }`}
            >
              <div className="font-semibold text-white">
                Sprint {sprint.number}
              </div>
              <div className="mt-1 text-sm text-gray-300">{sprint.name}</div>
              <div className="mt-1">
                <span
                  className={`rounded px-2 py-1 text-xs font-medium ${
                    sprint.status === "PLANNED"
                      ? "bg-blue-500/20 text-blue-300"
                      : sprint.status === "IN_PROGRESS"
                        ? "bg-green-500/20 text-green-300"
                        : sprint.status === "COMPLETED"
                          ? "bg-gray-500/20 text-gray-300"
                          : "bg-red-500/20 text-red-300"
                  }`}
                >
                  {sprint.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                {board.project.code} - {board.project.name}
              </h1>
              <p className="mt-1 text-gray-400">
                Sprint #{board.sprint.number}: {board.sprint.name}
              </p>
              {board.sprint.goal && (
                <p className="mt-1 text-sm text-gray-500">
                  Objetivo: {board.sprint.goal}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Botón Desactivar Sprint (solo si está IN_PROGRESS) */}
              {currentSprint?.status === "IN_PROGRESS" && (
                <button
                  onClick={() => handleChangeSprintStatus("PLANNED")}
                  disabled={statusChangeLoading}
                  className="rounded-md border border-yellow-500 bg-yellow-500/10 px-4 py-2 text-yellow-400 hover:bg-yellow-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Desactivar el sprint y volver a estado PLANNED"
                >
                  {statusChangeLoading ? "..." : "Desactivar Sprint"}
                </button>
              )}

              {/* Botón Completar Sprint (solo si está IN_PROGRESS) */}
              {currentSprint?.status === "IN_PROGRESS" && (
                <button
                  onClick={() => handleChangeSprintStatus("COMPLETED")}
                  disabled={statusChangeLoading}
                  className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Completar el sprint (requiere que todas las tareas estén en DONE)"
                >
                  {statusChangeLoading ? "..." : "Completar Sprint"}
                </button>
              )}

              {/* Indicador de sprint completado */}
              {currentSprint?.status === "COMPLETED" && (
                <span className="rounded-md bg-gray-600 px-4 py-2 text-gray-300">
                  Sprint Completado
                </span>
              )}

              {/* Indicador de sprint planificado */}
              {currentSprint?.status === "PLANNED" && (
                <span className="rounded-md bg-blue-600/20 px-4 py-2 text-blue-300">
                  Sprint en Planificación
                </span>
              )}

              <button
                onClick={fetchBoard}
                className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {columnOrder.map((status) => (
          <div
            key={status}
            onDragOver={(e) => handleDragOver(e, status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status)}
            className={`flex min-h-[500px] flex-col rounded-lg border ${statusColors[status]} p-4 ${
              dragOverColumn === status ? "ring-2 ring-blue-400" : ""
            }`}
          >
            {/* Column Header */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                {statusLabels[status]}
              </h2>
              <span className="rounded-full bg-gray-700 px-2 py-1 text-xs text-gray-300">
                {board.tasks[status].length}
              </span>
            </div>

            {/* Task Cards */}
            <div className="flex-1 space-y-3">
              {board.tasks[status].map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task)}
                  onDragEnd={handleDragEnd}
                  onClick={() => handleTaskClick(task)}
                  className="cursor-pointer rounded-lg border border-gray-700 bg-gray-800/50 p-3 shadow-lg transition-all hover:border-blue-500 hover:shadow-xl"
                >
                  {/* Task Code */}
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-mono text-blue-400">
                      {task.code}
                    </span>
                    <span className="text-xs text-gray-500">
                      {task.effort} pts
                    </span>
                  </div>

                  {/* Task Title */}
                  <h3 className="mb-2 text-sm font-medium text-white">
                    {task.title}
                  </h3>

                  {/* Story Info */}
                  <div className="mb-2 rounded bg-gray-700/50 p-2">
                    <p className="text-xs text-gray-400">
                      Historia: {task.story.code}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {task.story.title}
                    </p>
                  </div>

                  {/* Task Meta */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Priority */}
                      <span
                        className={`text-xs font-semibold ${getPriorityColor(task.story.priority)}`}
                      >
                        {getPriorityLabel(task.story.priority)}
                      </span>
                    </div>

                    {/* Assigned User */}
                    {task.assignedTo ? (
                      <div
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-semibold text-white"
                        title={`${task.assignedTo.firstName} ${task.assignedTo.lastName}`}
                      >
                        {getInitials(task.assignedTo)}
                      </div>
                    ) : (
                      <div
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-600 text-xs font-semibold text-gray-400"
                        title="Sin asignar"
                      >
                        ?
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={handleCloseModal}
        >
          <div
            className="w-full max-w-2xl rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {selectedTask.code}
                </h2>
                <p className="text-gray-400">{selectedTask.title}</p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Task Details */}
            <div className="mb-4 space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-400">
                  Historia de Usuario
                </label>
                <p className="text-white">
                  {selectedTask.story.code} - {selectedTask.story.title}
                </p>
              </div>

              {selectedTask.description && (
                <div>
                  <label className="block text-sm font-semibold text-gray-400">
                    Descripción
                  </label>
                  <p className="text-white">{selectedTask.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-400">
                    Estado
                  </label>
                  <p className="text-white">{statusLabels[selectedTask.status]}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400">
                    Esfuerzo
                  </label>
                  <p className="text-white">{selectedTask.effort} puntos</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-400">
                    Prioridad
                  </label>
                  <p className={getPriorityColor(selectedTask.story.priority)}>
                    {getPriorityLabel(selectedTask.story.priority)} (
                    {selectedTask.story.priority})
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400">
                    Valor de Negocio
                  </label>
                  <p className="text-white">{selectedTask.story.businessValue}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400">
                  Responsable
                </label>
                <select
                  value={selectedTask.assignedTo?.id || ""}
                  onChange={(e) =>
                    handleAssignTask(
                      selectedTask.id,
                      e.target.value || null,
                    )
                  }
                  className="mt-1 w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white"
                >
                  <option value="">Sin asignar</option>
                  {board.project.members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.firstName} {member.lastName} ({member.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Activity Logs */}
            <div>
              <h3 className="mb-2 text-lg font-semibold text-white">
                Historial de Actividad
              </h3>
              {activityLoading ? (
                <p className="text-gray-400">Cargando...</p>
              ) : activityLogs.length === 0 ? (
                <p className="text-gray-400">No hay actividad registrada</p>
              ) : (
                <div className="max-h-60 space-y-2 overflow-y-auto">
                  {activityLogs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded border border-gray-700 bg-gray-900/50 p-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-white">
                            {log.user.firstName} {log.user.lastName}
                          </p>
                          <p className="text-xs text-gray-400">
                            {log.description}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
