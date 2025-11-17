'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/axios/client';
import Link from 'next/link';

interface UserStory {
  id: string;
  code: string;
  title: string;
  description: string | null;
  asA: string;
  iWant: string;
  soThat: string;
  acceptanceCriteria: string;
  estimateHours: number;
  priority: number;
  businessValue: number;
  status: string;
  tags?: { value: string }[];
  sprint?: {
    id: string;
    number: number;
    name: string;
  } | null;
  tasks?: Task[];
}

interface Task {
  id: string;
  code: string;
  title: string;
  description: string | null;
  effort: number;
  status: string;
  storyId: string;
  assignedToId: string | null;
  assignedTo: {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
  } | null;
}

interface Sprint {
  id: string;
  number: number;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  duration: number;
  capacity: number;
  status: string;
  stories: UserStory[];
  tasks: Task[];
}

interface ProjectMember {
  id: string;
  userId: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function SprintPlanningPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [availableStories, setAvailableStories] = useState<UserStory[]>([]);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showAddStoriesModal, setShowAddStoriesModal] = useState(false);
  const [selectedStoryForTask, setSelectedStoryForTask] = useState<string>('');
  const [selectedStoriesForSprint, setSelectedStoriesForSprint] = useState<string[]>([]);

  const [newSprint, setNewSprint] = useState({
    number: 1,
    name: '',
    goal: '',
    startDate: '',
    endDate: '',
    duration: 2,
    capacity: '',
  });

  const [newTask, setNewTask] = useState({
    storyId: '',
    title: '',
    description: '',
    effort: 1,
    assignedToId: '',
  });

  const fetchSprints = useCallback(async () => {
    try {
      const response = await api.get(`/sprints/${id}`);
      setSprints(response.data);

      // Auto-select the first PLANNED sprint
      const plannedSprint = response.data.find((s: Sprint) => s.status === 'PLANNED');
      if (plannedSprint) {
        setSelectedSprint(plannedSprint);
      }
    } catch (error) {
      console.error('Error fetching sprints:', error);
    }
  }, [id]);

  const fetchAvailableStories = useCallback(async () => {
    try {
      const response = await api.get(`/sprints/${id}/available-stories`);
      setAvailableStories(response.data);
    } catch (error) {
      console.error('Error fetching available stories:', error);
    }
  }, [id]);

  const fetchProjectMembers = useCallback(async () => {
    try {
      const response = await api.get(`/projects/${id}/members`);
      setProjectMembers(response.data);
    } catch (error) {
      console.error('Error fetching project members:', error);
    }
  }, [id]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSprints(), fetchAvailableStories(), fetchProjectMembers()]);
      setLoading(false);
    };
    loadData();
  }, [fetchSprints, fetchAvailableStories, fetchProjectMembers]);

  const handleCreateSprint = async () => {
    try {
      const sprintData = {
        ...newSprint,
        capacity: newSprint.capacity ? parseInt(newSprint.capacity as string) : 0,
      };
      await api.post(`/sprints/${id}`, sprintData);
      setShowCreateModal(false);
      setNewSprint({
        number: newSprint.number + 1,
        name: '',
        goal: '',
        startDate: '',
        endDate: '',
        duration: 2,
        capacity: '',
      });
      await fetchSprints();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al crear sprint');
    }
  };

  const handleAddStoryToSprint = async (storyId: string) => {
    if (!selectedSprint) return;
    try {
      await api.post(`/sprints/${id}/${selectedSprint.id}/add-stories`, {
        storyIds: [storyId],
      });
      await Promise.all([fetchSprints(), fetchAvailableStories()]);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al agregar historia');
    }
  };

  const handleAddMultipleStoriesToSprint = async () => {
    if (!selectedSprint || selectedStoriesForSprint.length === 0) {
      alert('Selecciona al menos una historia');
      return;
    }
    try {
      await api.post(`/sprints/${id}/${selectedSprint.id}/add-stories`, {
        storyIds: selectedStoriesForSprint,
      });
      setShowAddStoriesModal(false);
      setSelectedStoriesForSprint([]);
      await Promise.all([fetchSprints(), fetchAvailableStories()]);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al agregar historias');
    }
  };

  const toggleStorySelection = (storyId: string) => {
    setSelectedStoriesForSprint(prev =>
      prev.includes(storyId)
        ? prev.filter(id => id !== storyId)
        : [...prev, storyId]
    );
  };

  const handleRemoveStoryFromSprint = async (storyId: string) => {
    if (!selectedSprint) return;
    if (!confirm('¿Eliminar historia del sprint? Esto eliminará todas sus tareas.')) return;
    try {
      await api.post(`/sprints/${id}/${selectedSprint.id}/remove-stories`, {
        storyIds: [storyId],
      });
      await Promise.all([fetchSprints(), fetchAvailableStories()]);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al remover historia');
    }
  };

  const handleCreateTask = async () => {
    if (!selectedSprint) return;
    try {
      // Preparar datos de la tarea, eliminando assignedToId si está vacío
      const taskData = {
        storyId: newTask.storyId,
        title: newTask.title,
        description: newTask.description,
        effort: newTask.effort,
        ...(newTask.assignedToId && { assignedToId: newTask.assignedToId }),
      };

      await api.post(`/sprints/${id}/${selectedSprint.id}/tasks`, taskData);
      setShowTaskModal(false);
      setNewTask({
        storyId: '',
        title: '',
        description: '',
        effort: 1,
        assignedToId: '',
      });
      await fetchSprints();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al crear tarea');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!selectedSprint) return;
    if (!confirm('¿Estás seguro de eliminar esta tarea?')) return;
    try {
      await api.delete(`/sprints/${id}/${selectedSprint.id}/tasks/${taskId}`);
      await fetchSprints();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al eliminar tarea');
    }
  };

  const handleStartSprint = async () => {
    if (!selectedSprint) return;
    if (!confirm('¿Iniciar este sprint? No podrás editarlo después.')) return;
    try {
      await api.post(`/sprints/${id}/${selectedSprint.id}/start`);
      await fetchSprints();
      router.push(`/projects/${id}/kanban`);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al iniciar sprint');
    }
  };

  const openTaskModal = (storyId: string) => {
    setSelectedStoryForTask(storyId);
    setNewTask({ ...newTask, storyId });
    setShowTaskModal(true);
  };

  const calculateTotalEffort = () => {
    if (!selectedSprint || !selectedSprint.stories) return 0;
    return selectedSprint.stories.reduce((sum, story) => {
      const storyEffort = story.tasks?.reduce((taskSum, task) => taskSum + task.effort, 0) || 0;
      return sum + storyEffort;
    }, 0);
  };

  const getTasksForStory = (storyId: string) => {
    if (!selectedSprint || !selectedSprint.stories) return [];
    const story = selectedSprint.stories.find(s => s.id === storyId);
    return story?.tasks || [];
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href={`/projects/${id}`}
              className="mb-2 inline-block text-purple-300 hover:text-purple-200"
            >
              ← Volver al proyecto
            </Link>
            <h1 className="text-4xl font-bold text-white">Sprint Planning</h1>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700"
          >
            + Nuevo Sprint
          </button>
        </div>

        {/* Sprint Selector */}
        <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h2 className="mb-4 text-xl font-semibold text-white">Sprints</h2>
          <div className="flex gap-4 overflow-x-auto">
            {sprints.map(sprint => (
              <button
                key={sprint.id}
                onClick={() => setSelectedSprint(sprint)}
                className={`rounded-lg border px-6 py-4 text-left transition ${
                  selectedSprint?.id === sprint.id
                    ? 'border-purple-500 bg-purple-600/20'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="font-semibold text-white">
                  Sprint {sprint.number} - {sprint.name}
                </div>
                <div className="mt-1 text-sm text-gray-300">{sprint.goal}</div>
                <div className="mt-2 flex gap-2">
                  <span
                    className={`rounded px-2 py-1 text-xs font-medium ${
                      sprint.status === 'PLANNED'
                        ? 'bg-blue-500/20 text-blue-300'
                        : sprint.status === 'IN_PROGRESS'
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-gray-500/20 text-gray-300'
                    }`}
                  >
                    {sprint.status}
                  </span>
                  <span className="rounded bg-white/10 px-2 py-1 text-xs text-white">
                    {sprint.duration} semanas
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedSprint && (
          <>
            {/* Add Stories Button */}
            <div className="mb-6 flex justify-end gap-4">
              <button
                onClick={() => setShowAddStoriesModal(true)}
                className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
              >
                + Agregar Historias al Sprint
              </button>
            </div>

            {/* Capacity vs Effort */}
            <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <h2 className="mb-4 text-xl font-semibold text-white">
                Capacidad vs Esfuerzo Comprometido
              </h2>
              <div className="flex gap-8">
                <div>
                  <div className="text-sm text-gray-300">Capacidad del equipo</div>
                  <div className="text-3xl font-bold text-white">
                    {selectedSprint.capacity || 0}h
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-300">Esfuerzo comprometido</div>
                  <div className="text-3xl font-bold text-white">
                    {calculateTotalEffort()}h
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-300">Diferencia</div>
                  <div
                    className={`text-3xl font-bold ${
                      (selectedSprint.capacity || 0) - calculateTotalEffort() >= 0
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}
                  >
                    {(selectedSprint.capacity || 0) - calculateTotalEffort()}h
                  </div>
                </div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Product Backlog */}
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <h2 className="mb-4 text-xl font-semibold text-white">
                  Product Backlog
                </h2>
                <div className="space-y-3">
                  {availableStories.map(story => (
                    <div
                      key={story.id}
                      className="rounded-lg border border-white/10 bg-white/5 p-4"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-white">{story.title}</div>
                          <div className="mt-1 text-sm text-gray-300">
                            {story.description}
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddStoryToSprint(story.id)}
                          className="ml-4 rounded bg-purple-600 px-3 py-1 text-sm text-white hover:bg-purple-700"
                        >
                          Agregar →
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <span className="rounded bg-blue-500/20 px-2 py-1 text-xs text-blue-300">
                          {story.estimateHours}h
                        </span>
                        <span className="rounded bg-orange-500/20 px-2 py-1 text-xs text-orange-300">
                          P{story.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                  {availableStories.length === 0 && (
                    <div className="py-8 text-center text-gray-400">
                      No hay historias disponibles
                    </div>
                  )}
                </div>
              </div>

              {/* Sprint Backlog */}
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Sprint Backlog</h2>
                  <div className="text-sm text-gray-400">
                    {selectedSprint.stories.length} historia(s) | {selectedSprint.stories.reduce((sum, story) => sum + (story.tasks?.length || 0), 0)} tarea(s)
                  </div>
                </div>
                <div className="space-y-4">
                  {selectedSprint.stories.map(story => (
                    <div
                      key={story.id}
                      className="rounded-lg border border-purple-500/30 bg-purple-600/10 p-4"
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-white">{story.title}</div>
                          <div className="mt-1 text-sm text-gray-300">
                            {story.description}
                          </div>
                          <div className="mt-2 flex gap-2">
                            <span className="rounded bg-blue-500/20 px-2 py-1 text-xs text-blue-300">
                              {story.estimateHours}h
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveStoryFromSprint(story.id)}
                          className="ml-4 rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                        >
                          Remover
                        </button>
                      </div>

                      {/* Tasks for this story */}
                      <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="text-sm font-medium text-gray-300">
                            Tareas ({getTasksForStory(story.id).length})
                          </div>
                          <button
                            onClick={() => openTaskModal(story.id)}
                            className="rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700"
                          >
                            + Nueva Tarea
                          </button>
                        </div>
                        {getTasksForStory(story.id).map(task => (
                          <div
                            key={task.id}
                            className="rounded border border-white/10 bg-white/5 p-3"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="text-sm font-medium text-white">
                                  {task.title}
                                </div>
                                <div className="mt-1 text-xs text-gray-400">
                                  {task.description}
                                </div>
                                <div className="mt-2 flex gap-2">
                                  <span className="rounded bg-purple-500/20 px-2 py-1 text-xs text-purple-300">
                                    {task.effort}h
                                  </span>
                                  {task.assignedTo && (
                                    <span className="rounded bg-indigo-500/20 px-2 py-1 text-xs text-indigo-300">
                                      {task.assignedTo.firstName} {task.assignedTo.lastName}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="ml-2 text-red-400 hover:text-red-300"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                        {getTasksForStory(story.id).length === 0 && (
                          <div className="rounded border border-yellow-500/30 bg-yellow-500/10 p-3 text-center">
                            <div className="text-xs text-yellow-300">
                              ⚠️ Esta historia no tiene tareas asignadas
                            </div>
                            <button
                              onClick={() => openTaskModal(story.id)}
                              className="mt-2 text-xs text-yellow-200 underline hover:text-yellow-100"
                            >
                              Crear primera tarea →
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {selectedSprint.stories.length === 0 && (
                    <div className="py-8 text-center text-gray-400">
                      No hay historias seleccionadas
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Start Sprint Button */}
            {selectedSprint.stories.length > 0 && (
              <div className="mt-6 text-center">
                <button
                  onClick={handleStartSprint}
                  className="rounded-lg bg-green-600 px-8 py-4 text-lg font-semibold text-white hover:bg-green-700"
                >
                  Iniciar Sprint
                </button>
              </div>
            )}
          </>
        )}

      </div>

      {/* Create Sprint Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-gray-900 p-8">
            <h2 className="mb-6 text-2xl font-bold text-white">Crear Nuevo Sprint</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Número
                  </label>
                  <input
                    type="number"
                    value={newSprint.number}
                    onChange={e =>
                      setNewSprint({ ...newSprint, number: parseInt(e.target.value) })
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Duración (semanas)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="4"
                    value={newSprint.duration}
                    onChange={e =>
                      setNewSprint({ ...newSprint, duration: parseInt(e.target.value) })
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Nombre
                </label>
                <input
                  type="text"
                  value={newSprint.name}
                  onChange={e => setNewSprint({ ...newSprint, name: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                  placeholder="Ej: Funcionalidades de autenticación"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Sprint Goal
                </label>
                <textarea
                  value={newSprint.goal}
                  onChange={e => setNewSprint({ ...newSprint, goal: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                  rows={3}
                  placeholder="¿Qué se espera lograr en este sprint?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Fecha Inicio
                  </label>
                  <input
                    type="date"
                    value={newSprint.startDate}
                    onChange={e =>
                      setNewSprint({ ...newSprint, startDate: e.target.value })
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Fecha Fin
                  </label>
                  <input
                    type="date"
                    value={newSprint.endDate}
                    onChange={e =>
                      setNewSprint({ ...newSprint, endDate: e.target.value })
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Capacidad del equipo (horas)
                </label>
                <input
                  type="number"
                  value={newSprint.capacity}
                  onChange={e =>
                    setNewSprint({ ...newSprint, capacity: e.target.value })
                  }
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                  placeholder="Ej: 160"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-4">
              <button
                onClick={handleCreateSprint}
                className="flex-1 rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700"
              >
                Crear Sprint
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white hover:bg-white/10"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-gray-900 p-8">
            <h2 className="mb-6 text-2xl font-bold text-white">Nueva Tarea</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Título
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                  placeholder="Ej: Implementar login form"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Descripción
                </label>
                <textarea
                  value={newTask.description}
                  onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                  rows={3}
                  placeholder="Detalles de la tarea..."
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Esfuerzo (horas)
                </label>
                <input
                  type="number"
                  min="1"
                  value={newTask.effort}
                  onChange={e =>
                    setNewTask({ ...newTask, effort: parseInt(e.target.value) })
                  }
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-4">
              <button
                onClick={handleCreateTask}
                className="flex-1 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
              >
                Crear Tarea
              </button>
              <button
                onClick={() => setShowTaskModal(false)}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white hover:bg-white/10"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Stories Modal */}
      {showAddStoriesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-4xl rounded-3xl border border-white/10 bg-gray-900 p-8">
            <h2 className="mb-6 text-2xl font-bold text-white">
              Agregar Historias al Sprint {selectedSprint?.number}
            </h2>
            <div className="mb-4 text-sm text-gray-400">
              Selecciona las historias que quieres agregar a este sprint. Haz clic en cada
              historia para seleccionarla.
            </div>
            <div className="mb-6 max-h-[500px] space-y-3 overflow-y-auto">
              {availableStories.map(story => (
                <div
                  key={story.id}
                  onClick={() => toggleStorySelection(story.id)}
                  className={`cursor-pointer rounded-lg border p-4 transition ${
                    selectedStoriesForSprint.includes(story.id)
                      ? 'border-indigo-500 bg-indigo-600/20'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedStoriesForSprint.includes(story.id)}
                          onChange={() => {}}
                          className="h-4 w-4 rounded"
                        />
                        <div className="font-semibold text-white">{story.title}</div>
                      </div>
                      <div className="mt-1 text-sm text-gray-300">
                        {story.description || `Como ${story.asA}, quiero ${story.iWant}`}
                      </div>
                      <div className="mt-2 flex gap-2">
                        <span className="rounded bg-blue-500/20 px-2 py-1 text-xs text-blue-300">
                          {story.estimateHours}h
                        </span>
                        <span className="rounded bg-orange-500/20 px-2 py-1 text-xs text-orange-300">
                          P{story.priority}
                        </span>
                        <span className="rounded bg-purple-500/20 px-2 py-1 text-xs text-purple-300">
                          BV: {story.businessValue}
                        </span>
                        {story.sprint && (
                          <span className="rounded bg-yellow-500/20 px-2 py-1 text-xs text-yellow-300">
                            Sprint {story.sprint.number}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {availableStories.length === 0 && (
                <div className="py-8 text-center text-gray-400">
                  No hay historias estimadas en el proyecto.
                </div>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <div className="text-sm text-gray-300">
                {selectedStoriesForSprint.length} historia(s) seleccionada(s)
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleAddMultipleStoriesToSprint}
                  disabled={selectedStoriesForSprint.length === 0}
                  className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  Agregar Historias
                </button>
                <button
                  onClick={() => {
                    setShowAddStoriesModal(false);
                    setSelectedStoriesForSprint([]);
                  }}
                  className="rounded-lg border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white hover:bg-white/10"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
