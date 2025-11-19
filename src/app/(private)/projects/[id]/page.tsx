"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { api } from "@/lib/axios/client";
import { useAuth } from "@/hooks/useAuth";

type ProjectMemberRole = "PRODUCT_OWNER" | "SCRUM_MASTER" | "DEVELOPER";

type StoryStatus =
  | "BACKLOG"
  | "SELECTED"
  | "IN_PROGRESS"
  | "TESTING"
  | "DONE"
  | "CANCELLED";

type UserSummary = {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
};

type ProjectMember = {
  id: string;
  role: ProjectMemberRole;
  user: UserSummary;
};

type TaskStatus = "TODO" | "IN_PROGRESS" | "TESTING" | "DONE" | "BLOCKED";

type Task = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  effort: number;
  status: TaskStatus;
  storyId: string;
  assignedToId: string | null;
  createdAt: string;
  updatedAt: string;
  assignedTo?: {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
  };
};

type Story = {
  id: string;
  projectId: string;
  code: string;
  title: string;
  asA: string;
  iWant: string;
  soThat: string;
  acceptanceCriteria: string[];
  description: string | null;
  priority: number;
  businessValue: number;
  orderRank: number;
  estimateHours: number;
  status: StoryStatus;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

type Project = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  visibility: "PUBLIC" | "PRIVATE";
  productObjective: string | null;
  definitionOfDone: string | null;
  sprintDuration: number;
  qualityCriteria: string | null;
  status: "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "ARCHIVED";
  startDate: string;
  endDate: string | null;
  createdAt: string;
  owner: UserSummary;
  members: ProjectMember[];
  _count?: {
    stories: number;
    estimationSessions: number;
  };
};

const projectStatusLabels: Record<Project["status"], string> = {
  PLANNING: "Planificacion",
  ACTIVE: "Activo",
  ON_HOLD: "En pausa",
  COMPLETED: "Completado",
  ARCHIVED: "Archivado",
};

const projectStatusStyles: Record<Project["status"], string> = {
  PLANNING: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  ACTIVE: "bg-green-500/20 text-green-300 border-green-500/30",
  ON_HOLD: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  COMPLETED: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  ARCHIVED: "bg-gray-500/20 text-gray-300 border-gray-500/30",
};

const visibilityLabels: Record<Project["visibility"], string> = {
  PUBLIC: "Publico",
  PRIVATE: "Privado",
};

const roleLabels: Record<ProjectMemberRole, string> = {
  PRODUCT_OWNER: "Product Owner",
  SCRUM_MASTER: "Scrum Master",
  DEVELOPER: "Developer",
};

const roleOptions: { value: ProjectMemberRole; label: string }[] = [
  { value: "PRODUCT_OWNER", label: "Product Owner" },
  { value: "SCRUM_MASTER", label: "Scrum Master" },
  { value: "DEVELOPER", label: "Developer" },
];

const storyStatusOptions: { value: StoryStatus; label: string }[] = [
  { value: "BACKLOG", label: "Backlog" },
  { value: "SELECTED", label: "Selected" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "TESTING", label: "Testing" },
  { value: "DONE", label: "Done" },
  { value: "CANCELLED", label: "Cancelled" },
];

const taskStatusOptions: { value: TaskStatus; label: string }[] = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "TESTING", label: "Testing" },
  { value: "DONE", label: "Done" },
  { value: "BLOCKED", label: "Blocked" },
];

const taskStatusColors: Record<TaskStatus, string> = {
  TODO: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  IN_PROGRESS: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  TESTING: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  DONE: "bg-green-500/20 text-green-300 border-green-500/30",
  BLOCKED: "bg-red-500/20 text-red-300 border-red-500/30",
};

const emptyStoryForm = {
  title: "",
  asA: "",
  iWant: "",
  soThat: "",
  acceptanceCriteria: "",
  description: "",
  priority: 1,
  tags: "",
  status: "BACKLOG" as StoryStatus,
};

function parseAcceptanceInput(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function formatAcceptanceInput(list: string[]) {
  return list.join("\n");
}

function parseTagsInput(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function formatTagsInput(list: string[]) {
  return list.join(", ");
}

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [teamRoles, setTeamRoles] = useState<Record<string, ProjectMemberRole>>(
    {},
  );
  const [teamSaving, setTeamSaving] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [inviteForm, setInviteForm] = useState<{
    email: string;
    role: ProjectMemberRole;
  }>({ email: "", role: "DEVELOPER" });

  const [stories, setStories] = useState<Story[]>([]);
  const [storiesLoading, setStoriesLoading] = useState(true);
  const [storyError, setStoryError] = useState<string | null>(null);
  const [storySuccess, setStorySuccess] = useState<string | null>(null);
  const [storyForm, setStoryForm] = useState(emptyStoryForm);
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null);
  const [storySaving, setStorySaving] = useState(false);
  const [draggingStoryId, setDraggingStoryId] = useState<string | null>(null);

  const [configs, setConfigs] = useState<any>(null);
  const [configsLoading, setConfigsLoading] = useState(true);

  // Task management state
  const [tasks, setTasks] = useState<Record<string, Task[]>>({});
  const [tasksLoading, setTasksLoading] = useState<Record<string, boolean>>({});
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [currentStoryId, setCurrentStoryId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    effort: 1,
  });
  const [taskError, setTaskError] = useState<string | null>(null);
  const [taskSuccess, setTaskSuccess] = useState<string | null>(null);
  const [taskSaving, setTaskSaving] = useState(false);
  const [expandedStories, setExpandedStories] = useState<Set<string>>(new Set());

  // Sprint modal state
  const [showSprintsModal, setShowSprintsModal] = useState(false);
  const [sprints, setSprints] = useState<any[]>([]);
  const [sprintsLoading, setSprintsLoading] = useState(false);

  const canManageTeam = useMemo(() => {
    if (!project || !user) return false;
    return project.owner.id === user.id && project.status !== "ARCHIVED";
  }, [project, user]);

  const canManageStories = canManageTeam;

  const fetchProject = useCallback(async () => {
    setProjectLoading(true);
    setProjectError(null);
    try {
      const response = await api.get(`/projects/${id}`);
      const projectData = response.data as Project;
      setProject(projectData);
      const roles: Record<string, ProjectMemberRole> = {};
      projectData.members.forEach((member) => {
        roles[member.user.id] = member.role;
      });
      roles[projectData.owner.id] = "PRODUCT_OWNER";
      setTeamRoles(roles);
    } catch (error: any) {
      setProjectError(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Error al cargar el proyecto.",
      );
    } finally {
      setProjectLoading(false);
    }
  }, [id]);

  const fetchStories = useCallback(async () => {
    setStoriesLoading(true);
    setStoryError(null);
    try {
      const response = await api.get(`/projects/${id}/stories`);
      setStories(response.data as Story[]);
    } catch (error: any) {
      setStoryError(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Error al cargar el backlog.",
      );
    } finally {
      setStoriesLoading(false);
    }
  }, [id]);

  const fetchConfigs = useCallback(async () => {
    setConfigsLoading(true);
    try {
      const response = await api.get(`/project-config/${id}/configs`);
      setConfigs(response.data);
    } catch (error: any) {
      console.error("Error loading configs:", error);
      setConfigs(null);
    } finally {
      setConfigsLoading(false);
    }
  }, [id]);

  const fetchSprints = useCallback(async () => {
    setSprintsLoading(true);
    try {
      const response = await api.get(`/sprints/${id}`);
      setSprints(response.data);
    } catch (error: any) {
      console.error("Error loading sprints:", error);
      setSprints([]);
    } finally {
      setSprintsLoading(false);
    }
  }, [id]);

  const handleOpenSprintsModal = async () => {
    setShowSprintsModal(true);
    await fetchSprints();
  };


  const fetchTasksForStory = useCallback(async (storyId: string) => {
    setTasksLoading((prev) => ({ ...prev, [storyId]: true }));
    try {
      const response = await api.get(`/projects/${id}/stories/${storyId}/tasks`);
      setTasks((prev) => ({ ...prev, [storyId]: response.data as Task[] }));
    } catch (error: any) {
      console.error("Error loading tasks:", error);
      setTasks((prev) => ({ ...prev, [storyId]: [] }));
    } finally {
      setTasksLoading((prev) => ({ ...prev, [storyId]: false }));
    }
  }, [id]);

  const handleOpenTaskModal = (storyId: string, task?: Task) => {
    setCurrentStoryId(storyId);
    setEditingTask(task || null);
    if (task) {
      setTaskForm({
        title: task.title,
        description: task.description || "",
        effort: task.effort,
      });
    } else {
      setTaskForm({
        title: "",
        description: "",
        effort: 1,
      });
    }
    setTaskError(null);
    setTaskSuccess(null);
    setShowTaskModal(true);
  };

  const handleCloseTaskModal = () => {
    setShowTaskModal(false);
    setCurrentStoryId(null);
    setEditingTask(null);
    setTaskForm({
      title: "",
      description: "",
      effort: 1,
    });
    setTaskError(null);
    setTaskSuccess(null);
  };

  const handleSubmitTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentStoryId) return;

    setTaskError(null);
    setTaskSuccess(null);

    const payload = {
      title: taskForm.title.trim(),
      description: taskForm.description.trim() || undefined,
      effort: taskForm.effort,
    };

    if (!payload.title) {
      setTaskError("El título es requerido");
      return;
    }

    setTaskSaving(true);
    try {
      if (editingTask) {
        // Update task
        await api.patch(
          `/projects/${id}/stories/${currentStoryId}/tasks/${editingTask.id}`,
          payload
        );
        setTaskSuccess("Tarea actualizada");
      } else {
        // Create task
        await api.post(
          `/projects/${id}/stories/${currentStoryId}/tasks`,
          payload
        );
        setTaskSuccess("Tarea creada");
      }

      await fetchTasksForStory(currentStoryId);
      setTimeout(() => {
        handleCloseTaskModal();
      }, 500);
    } catch (error: any) {
      setTaskError(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Error al guardar la tarea"
      );
    } finally {
      setTaskSaving(false);
    }
  };

  const handleDeleteTask = async (storyId: string, taskId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta tarea?")) return;

    try {
      await api.delete(`/projects/${id}/stories/${storyId}/tasks/${taskId}`);
      await fetchTasksForStory(storyId);
      setTaskSuccess("Tarea eliminada");
      setTimeout(() => setTaskSuccess(null), 3000);
    } catch (error: any) {
      setTaskError(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Error al eliminar la tarea"
      );
      setTimeout(() => setTaskError(null), 3000);
    }
  };

  const toggleStoryExpanded = (storyId: string) => {
    setExpandedStories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(storyId)) {
        newSet.delete(storyId);
      } else {
        newSet.add(storyId);
        // Load tasks when expanding
        if (!tasks[storyId]) {
          fetchTasksForStory(storyId);
        }
      }
      return newSet;
    });
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchProject();
      fetchStories();
      fetchConfigs();
      fetchSprints();
    }
  }, [authLoading, user, fetchProject, fetchStories, fetchConfigs, fetchSprints]);

  const handleDelete = async () => {
    if (!project) return;
    if (!confirm("Estas seguro de archivar este proyecto?")) {
      return;
    }

    setDeleteLoading(true);
    try {
      const response = await api.delete(`/projects/${id}`);
      if (response.status >= 200 && response.status < 300) {
        router.push("/projects");
      } else {
        alert(
          response.data?.error ||
            response.data?.message ||
            "No se pudo archivar el proyecto.",
        );
      }
    } catch (error: any) {
      alert(error?.message || "Error inesperado al archivar el proyecto.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const membersWithOwner = useMemo(() => {
    if (!project) {
      return [] as {
        user: UserSummary;
        role: ProjectMemberRole;
        isOwner: boolean;
      }[];
    }

    const collector = new Map<
      string,
      { user: UserSummary; role: ProjectMemberRole; isOwner: boolean }
    >();

    collector.set(project.owner.id, {
      user: project.owner,
      role: teamRoles[project.owner.id] ?? "PRODUCT_OWNER",
      isOwner: true,
    });

    project.members.forEach((member) => {
      collector.set(member.user.id, {
        user: member.user,
        role: teamRoles[member.user.id] ?? member.role,
        isOwner: member.user.id === project.owner.id,
      });
    });

    return Array.from(collector.values());
  }, [project, teamRoles]);

  const handleRoleChange = (userId: string, role: ProjectMemberRole) => {
    setTeamRoles((prev) => ({ ...prev, [userId]: role }));
  };

  const handleSaveRoles = async () => {
    if (!project) return;
    setActionError(null);
    setActionSuccess(null);

    const assignments: { userId: string; role: ProjectMemberRole }[] = [];
    const seen = new Set<string>();

    const pushAssignment = (userId: string, role: ProjectMemberRole) => {
      if (seen.has(userId)) return;
      seen.add(userId);
      assignments.push({ userId, role });
    };

    pushAssignment(
      project.owner.id,
      teamRoles[project.owner.id] ?? "PRODUCT_OWNER",
    );
    project.members.forEach((member) => {
      pushAssignment(member.user.id, teamRoles[member.user.id] ?? member.role);
    });

    const productOwners = assignments.filter(
      (member) => member.role === "PRODUCT_OWNER",
    );
    if (productOwners.length !== 1) {
      setActionError("Debe existir exactamente un Product Owner.");
      return;
    }

    const scrumMasters = assignments.filter(
      (member) => member.role === "SCRUM_MASTER",
    );
    if (scrumMasters.length > 1) {
      setActionError("Solo puede existir un Scrum Master activo.");
      return;
    }

    setTeamSaving(true);
    try {
      const response = await api.patch(`/projects/${id}`, {
        teamMembers: assignments,
      });
      if (response.status >= 200 && response.status < 300) {
        setActionSuccess("Roles actualizados.");
        await fetchProject();
      } else {
        setActionError(
          response.data?.message ||
            response.data?.error ||
            "No se pudieron guardar los cambios.",
        );
      }
    } catch (error: any) {
      setActionError(error?.message || "Error inesperado al actualizar roles.");
    } finally {
      setTeamSaving(false);
    }
  };

  const handleInvite = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!project) return;

    setInviteLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const response = await api.post(`/projects/${id}/invite`, {
        email: inviteForm.email.trim(),
        role: inviteForm.role,
      });

      if (response.status >= 200 && response.status < 300) {
        const message =
          typeof response.data?.message === "string"
            ? response.data.message
            : "Invitacion enviada.";
        setActionSuccess(message);
        setInviteForm({ email: "", role: "DEVELOPER" });
        await fetchProject();
      } else {
        setActionError(
          response.data?.message ||
            response.data?.error ||
            "No se pudo enviar la invitacion.",
        );
      }
    } catch (error: any) {
      setActionError(
        error?.message || "Error inesperado al enviar la invitacion.",
      );
    } finally {
      setInviteLoading(false);
    }
  };

  const resetStoryForm = () => {
    setStoryForm({ ...emptyStoryForm, priority: stories.length + 1 });
    setEditingStoryId(null);
  };

  useEffect(() => {
    resetStoryForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stories.length]);

  const handleStorySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!project) return;
    setStoryError(null);
    setStorySuccess(null);

    const acceptance = parseAcceptanceInput(storyForm.acceptanceCriteria);
    if (acceptance.length === 0) {
      setStoryError("Agrega al menos un criterio de aceptacion.");
      return;
    }

    const tags = parseTagsInput(storyForm.tags);
    const payload = {
      title: storyForm.title.trim(),
      asA: storyForm.asA.trim(),
      iWant: storyForm.iWant.trim(),
      soThat: storyForm.soThat.trim(),
      acceptanceCriteria: acceptance,
      priority: Number.isFinite(storyForm.priority)
        ? storyForm.priority
        : stories.length + 1,
      description: storyForm.description.trim() || undefined,
      tags,
      status: storyForm.status,
    };

    if (!payload.title || !payload.asA || !payload.iWant || !payload.soThat) {
      setStoryError("Completa los campos de la historia.");
      return;
    }

    setStorySaving(true);
    try {
      let response;
      if (editingStoryId) {
        response = await api.patch(
          `/projects/${project.id}/stories/${editingStoryId}`,
          payload,
        );
      } else {
        response = await api.post(`/projects/${project.id}/stories`, payload);
      }

      if (response.status >= 200 && response.status < 300) {
        setStorySuccess(
          editingStoryId ? "Historia actualizada." : "Historia creada.",
        );
        await fetchStories();
        resetStoryForm();
      } else {
        setStoryError(
          response.data?.message ||
            response.data?.error ||
            "No se pudo guardar la historia.",
        );
      }
    } catch (error: any) {
      setStoryError(
        error?.message || "Error inesperado al guardar la historia.",
      );
    } finally {
      setStorySaving(false);
    }
  };

  const handleEditStory = (story: Story) => {
    setStoryForm({
      title: story.title,
      asA: story.asA,
      iWant: story.iWant,
      soThat: story.soThat,
      acceptanceCriteria: formatAcceptanceInput(story.acceptanceCriteria),
      description: story.description ?? "",
      priority: story.priority,
      tags: formatTagsInput(story.tags),
      status: story.status,
    });
    setEditingStoryId(story.id);
    setStoryError(null);
    setStorySuccess(null);
  };

  const handleCancelStoryEdit = () => {
    resetStoryForm();
    setStoryError(null);
    setStorySuccess(null);
  };

  const applyLocalReorder = (ordered: Story[]) => {
    setStories(
      ordered.map((story, index) => ({
        ...story,
        priority: index + 1,
        orderRank: index + 1,
      })),
    );
  };

  const persistReorder = async (ordered: Story[]) => {
    try {
      await api.patch(`/projects/${id}/stories/reorder`, {
        storyIds: ordered.map((story) => story.id),
      });
      await fetchStories();
    } catch (error: any) {
      setStoryError(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "No se pudo guardar el orden.",
      );
      await fetchStories();
    }
  };

  const handleDropStory = async (targetId: string) => {
    if (!draggingStoryId || draggingStoryId === targetId) {
      setDraggingStoryId(null);
      return;
    }

    const current = [...stories];
    const fromIndex = current.findIndex(
      (story) => story.id === draggingStoryId,
    );
    const toIndex = current.findIndex((story) => story.id === targetId);
    if (fromIndex === -1 || toIndex === -1) {
      setDraggingStoryId(null);
      return;
    }

    const updated = [...current];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    applyLocalReorder(updated);
    setDraggingStoryId(null);
    await persistReorder(updated);
  };

  if (authLoading || projectLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-white/60">Cargando proyecto...</p>
      </main>
    );
  }

  if (projectError || !project) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-8 text-center text-red-200">
          <p className="text-lg font-semibold">
            {projectError ?? "Proyecto no encontrado"}
          </p>
          <Link
            href="/projects"
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Volver a proyectos
          </Link>
        </div>
      </main>
    );
  }

  const membersCount = membersWithOwner.length;

  return (
    <main className="space-y-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold text-white/60">
            <span>ID: {project.code}</span>
            <span className="h-1 w-1 rounded-full bg-white/20" />
            <span>{visibilityLabels[project.visibility]}</span>
          </div>
          <h1 className="text-3xl font-semibold text-white">{project.name}</h1>
          {project.description && (
            <p className="text-sm text-white/60">{project.description}</p>
          )}
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${projectStatusStyles[project.status]}`}
          >
            {projectStatusLabels[project.status]}
          </span>
        </div>

       <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
  <Link
    href={`/projects/${project.id}/sprint0`}
    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:from-purple-600 hover:to-pink-600"
  >
    <span>🚀</span>
    Sprint 0
  </Link>
  <Link
    href={`/projects/${project.id}/sprint-planning`}
    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:from-violet-600 hover:to-purple-600"
  >
    <span>📅</span>
    Sprint Planning
  </Link>
  <Link
    href={`/projects/${project.id}/kanban`}
    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-600 hover:to-indigo-600"
  >
    <span>📋</span>
    Tablero Kanban
  </Link>
  <Link
    href={`/projects/${project.id}/estimation`}
    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:from-emerald-600 hover:to-teal-600"
  >
    <span>🃏</span>
    Planning Poker
  </Link>
  <Link
    href={`/projects/${project.id}/edit`}
    className="inline-flex items-center justify-center rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
  >
    Editar proyecto
  </Link>
  <button
    onClick={handleDelete}
    disabled={deleteLoading}
    className="inline-flex items-center justify-center rounded-full border border-red-500/40 bg-red-500/10 px-6 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
  >
    {deleteLoading ? "Archivando..." : "Archivar"}
  </button>
</div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
            <h2 className="text-lg font-semibold text-white">
              Objetivo del producto
            </h2>
            <p className="mt-2 text-sm text-white/70">
              {project.productObjective ?? "Sin objetivo definido."}
            </p>
          </div>

          {project.definitionOfDone && (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
              <h2 className="text-lg font-semibold text-white mb-4">
                Definition of Done
              </h2>
              <p className="whitespace-pre-wrap text-white/70">
                {project.definitionOfDone}
              </p>
            </div>
          )}

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-white">
                Product backlog
              </h2>
              {storySuccess && (
                <span className="text-xs font-medium text-green-300">
                  {storySuccess}
                </span>
              )}
              {storyError && (
                <span className="text-xs font-medium text-red-300">
                  {storyError}
                </span>
              )}
            </div>

            {canManageStories ? (
              <form onSubmit={handleStorySubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-white/60">
                      Titulo
                    </label>
                    <input
                      type="text"
                      value={storyForm.title}
                      onChange={(event) =>
                        setStoryForm((prev) => ({
                          ...prev,
                          title: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-primary focus:outline-none"
                      placeholder="Historia breve"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-white/60">
                      Prioridad
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={storyForm.priority}
                      onChange={(event) =>
                        setStoryForm((prev) => ({
                          ...prev,
                          priority: Number(event.target.value) || 1,
                        }))
                      }
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-primary focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-white/60">
                      Como
                    </label>
                    <input
                      type="text"
                      value={storyForm.asA}
                      onChange={(event) =>
                        setStoryForm((prev) => ({
                          ...prev,
                          asA: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-primary focus:outline-none"
                      placeholder="Perfil del usuario"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-white/60">
                      Quiero
                    </label>
                    <input
                      type="text"
                      value={storyForm.iWant}
                      onChange={(event) =>
                        setStoryForm((prev) => ({
                          ...prev,
                          iWant: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-primary focus:outline-none"
                      placeholder="Objetivo"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-white/60">
                      Para
                    </label>
                    <input
                      type="text"
                      value={storyForm.soThat}
                      onChange={(event) =>
                        setStoryForm((prev) => ({
                          ...prev,
                          soThat: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-primary focus:outline-none"
                      placeholder="Beneficio"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-white/60">
                    Criterios de aceptacion
                  </label>
                  <textarea
                    rows={4}
                    value={storyForm.acceptanceCriteria}
                    onChange={(event) =>
                      setStoryForm((prev) => ({
                        ...prev,
                        acceptanceCriteria: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-primary focus:outline-none"
                    placeholder="Un criterio por linea"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-white/60">
                    Descripcion
                  </label>
                  <textarea
                    rows={3}
                    value={storyForm.description}
                    onChange={(event) =>
                      setStoryForm((prev) => ({
                        ...prev,
                        description: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-primary focus:outline-none"
                    placeholder="Detalle opcional"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-white/60">
                      Etiquetas
                    </label>
                    <input
                      type="text"
                      value={storyForm.tags}
                      onChange={(event) =>
                        setStoryForm((prev) => ({
                          ...prev,
                          tags: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-primary focus:outline-none"
                      placeholder="UX, API, Reportes"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-white/60">
                      Estado
                    </label>
                    <select
                      value={storyForm.status}
                      onChange={(event) =>
                        setStoryForm((prev) => ({
                          ...prev,
                          status: event.target.value as StoryStatus,
                        }))
                      }
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-primary focus:outline-none"
                    >
                      {storyStatusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={storySaving}
                    className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
                  >
                    {storySaving
                      ? "Guardando..."
                      : editingStoryId
                        ? "Actualizar historia"
                        : "Crear historia"}
                  </button>
                  {editingStoryId && (
                    <button
                      type="button"
                      onClick={handleCancelStoryEdit}
                      className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                      Cancelar
                    </button>
                  )}
                  <p className="text-xs text-white/50">
                    El backlog se ordena por prioridad ascendente.
                  </p>
                </div>
              </form>
            ) : (
              <p className="text-sm text-white/50">
                Solo el Product Owner puede crear o editar historias.
              </p>
            )}

            <div className="mt-6 space-y-3">
              {storiesLoading ? (
                <p className="text-sm text-white/50">Cargando backlog...</p>
              ) : stories.length === 0 ? (
                <p className="text-sm text-white/50">
                  No hay historias registradas.
                </p>
              ) : (
                <ul className="space-y-3">
                  {stories.map((story) => (
                    <li
                      key={story.id}
                      draggable={canManageStories}
                      onDragStart={() => setDraggingStoryId(story.id)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => handleDropStory(story.id)}
                      onDragEnd={() => setDraggingStoryId(null)}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm"
                    >
                      <div className="space-y-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-semibold text-white/60">
                                {story.code}
                              </span>
                              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                                Prioridad {story.priority}
                              </span>
                              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                                {storyStatusOptions.find(
                                  (option) => option.value === story.status,
                                )?.label ?? story.status}
                              </span>
                            </div>
                            <h3 className="mt-2 text-base font-semibold text-white">
                              {story.title}
                            </h3>
                            <p className="mt-1 text-sm text-white/60">
                              Como {story.asA}, quiero {story.iWant} para{" "}
                              {story.soThat}.
                            </p>
                            {story.description && (
                              <p className="mt-2 text-sm text-white/60">
                                {story.description}
                              </p>
                            )}
                            <div className="mt-3 space-y-1">
                              <p className="text-xs font-semibold uppercase text-white/50">
                                Criterios de aceptacion
                              </p>
                              <ul className="list-disc space-y-1 pl-5 text-sm text-white/70">
                                {story.acceptanceCriteria.map(
                                  (criterion, index) => (
                                    <li key={index}>{criterion}</li>
                                  ),
                                )}
                              </ul>
                            </div>
                            {story.tags.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {story.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          {canManageStories && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditStory(story)}
                                className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
                              >
                                Editar
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Tasks section */}
                        <div className="border-t border-white/10 pt-3">
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => toggleStoryExpanded(story.id)}
                              className="flex items-center gap-2 text-xs font-semibold text-white/60 transition hover:text-white"
                            >
                              <span>{expandedStories.has(story.id) ? "▼" : "▶"}</span>
                              <span>
                                Tareas ({tasks[story.id]?.length ?? 0})
                              </span>
                            </button>
                            {canManageStories && (
                              <button
                                onClick={() => handleOpenTaskModal(story.id)}
                                className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                              >
                                + Añadir tarea
                              </button>
                            )}
                          </div>

                          {expandedStories.has(story.id) && (
                            <div className="mt-3 space-y-2">
                              {tasksLoading[story.id] ? (
                                <p className="text-xs text-white/50">Cargando tareas...</p>
                              ) : !tasks[story.id] || tasks[story.id].length === 0 ? (
                                <p className="text-xs text-white/50">
                                  No hay tareas para esta historia. Agrega una tarea para asignarla a un sprint.
                                </p>
                              ) : (
                                <div className="space-y-2">
                                  {tasks[story.id].map((task) => (
                                    <div
                                      key={task.id}
                                      className="rounded-lg border border-white/10 bg-white/5 p-3"
                                    >
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono text-white/60">
                                              {task.code}
                                            </span>
                                            <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${taskStatusColors[task.status]}`}>
                                              {taskStatusOptions.find(opt => opt.value === task.status)?.label}
                                            </span>
                                          </div>
                                          <p className="mt-1 text-sm font-medium text-white">
                                            {task.title}
                                          </p>
                                          {task.description && (
                                            <p className="mt-1 text-xs text-white/60">
                                              {task.description}
                                            </p>
                                          )}
                                          <div className="mt-2 flex items-center gap-3 text-xs text-white/50">
                                            <span>Esfuerzo: {task.effort}h</span>
                                            {task.assignedTo && (
                                              <span>
                                                Asignado a: {task.assignedTo.firstName} {task.assignedTo.lastName}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        {canManageStories && (
                                          <div className="flex gap-1">
                                            <button
                                              onClick={() => handleOpenTaskModal(story.id, task)}
                                              className="rounded border border-white/20 px-2 py-1 text-xs font-semibold text-white transition hover:bg-white/10"
                                            >
                                              Editar
                                            </button>
                                            <button
                                              onClick={() => handleDeleteTask(story.id, task.id)}
                                              className="rounded border border-red-500/40 bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-300 transition hover:bg-red-500/20"
                                            >
                                              Eliminar
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                Miembros del equipo ({membersCount})
              </h2>
              {actionSuccess && (
                <span className="text-xs font-medium text-green-300">
                  {actionSuccess}
                </span>
              )}
              {actionError && (
                <span className="text-xs font-medium text-red-300">
                  {actionError}
                </span>
              )}
            </div>

            <div className="space-y-3">
              {membersWithOwner.length === 0 ? (
                <p className="text-sm text-white/50">
                  No hay miembros asignados aun.
                </p>
              ) : (
                membersWithOwner.map(({ user: memberUser, role, isOwner }) => (
                  <div
                    key={memberUser.id}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
                      {memberUser.firstName?.[0] ?? "M"}
                      {memberUser.lastName?.[0] ?? ""}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        {memberUser.firstName} {memberUser.lastName}
                      </p>
                      <p className="text-xs text-white/50">
                        {memberUser.email}
                      </p>
                    </div>
                    {canManageTeam ? (
                      <select
                        value={teamRoles[memberUser.id] ?? role}
                        onChange={(event) =>
                          handleRoleChange(
                            memberUser.id,
                            event.target.value as ProjectMemberRole,
                          )
                        }
                        className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                      >
                        {roleOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                        {roleLabels[teamRoles[memberUser.id] ?? role]}
                        {isOwner ? " (Owner)" : ""}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>

            {canManageTeam && (
              <div className="mt-6 space-y-6">
                <form
                  onSubmit={handleInvite}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <h3 className="text-sm font-semibold text-white">
                    Invitar nuevo miembro
                  </h3>
                  <p className="mt-1 text-xs text-white/50">
                    Solo usuarios activos podran unirse al proyecto.
                  </p>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <input
                      type="email"
                      required
                      value={inviteForm.email}
                      onChange={(event) =>
                        setInviteForm((prev) => ({
                          ...prev,
                          email: event.target.value,
                        }))
                      }
                      placeholder="correo@empresa.com"
                      className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-primary focus:outline-none placeholder:text-white/40"
                    />
                    <select
                      value={inviteForm.role}
                      onChange={(event) =>
                        setInviteForm((prev) => ({
                          ...prev,
                          role: event.target.value as ProjectMemberRole,
                        }))
                      }
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                    >
                      {roleOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      disabled={inviteLoading}
                      className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
                    >
                      {inviteLoading ? "Enviando..." : "Invitar"}
                    </button>
                  </div>
                </form>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">
                      Asignar roles
                    </h3>
                    <button
                      onClick={handleSaveRoles}
                      disabled={teamSaving}
                      className="inline-flex items-center justify-center rounded-full bg-primary/20 px-4 py-2 text-xs font-semibold text-primary transition hover:bg-primary/30 disabled:opacity-50"
                    >
                      {teamSaving ? "Guardando..." : "Guardar cambios"}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-white/50">
                    Debe existir exactamente un Product Owner y como maximo un
                    Scrum Master.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Informacion del proyecto
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs uppercase text-white/50">
                  Product Owner actual
                </p>
                <p className="mt-1 text-white">
                  {project.owner.firstName} {project.owner.lastName}
                </p>
                <p className="text-xs text-white/50">{project.owner.email}</p>
              </div>

              <div className="border-t border-white/10 pt-4">
                <p className="text-xs uppercase text-white/50">
                  Duracion del sprint
                </p>
                <p className="mt-1 text-white">
                  {project.sprintDuration} semanas
                </p>
              </div>

              {project.qualityCriteria && (
                <div className="border-t border-white/10 pt-4">
                  <p className="text-xs uppercase text-white/50">
                    Criterios de calidad
                  </p>
                  <p className="mt-1 text-white">{project.qualityCriteria}</p>
                </div>
              )}

              <div className="border-t border-white/10 pt-4">
                <p className="text-xs uppercase text-white/50">
                  Fecha de inicio
                </p>
                <p className="mt-1 text-white">
                  {new Date(project.startDate).toLocaleDateString("es-ES")}
                </p>
              </div>

              {project.endDate && (
                <div className="border-t border-white/10 pt-4">
                  <p className="text-xs uppercase text-white/50">
                    Fecha de fin estimada
                  </p>
                  <p className="mt-1 text-white">
                    {new Date(project.endDate).toLocaleDateString("es-ES")}
                  </p>
                </div>
              )}

              <div className="border-t border-white/10 pt-4">
                <p className="text-xs uppercase text-white/50">Creado</p>
                <p className="mt-1 text-white">
                  {new Date(project.createdAt).toLocaleDateString("es-ES")}
                </p>
              </div>
            </div>
          </div>

          {/* Sprints Overview */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Sprints del Proyecto
              </h3>
              {sprints.length > 0 && (
                <button
                  onClick={handleOpenSprintsModal}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Ver en modal →
                </button>
              )}
            </div>

            {sprintsLoading ? (
              <div className="py-4 text-center text-sm text-gray-400">
                Cargando sprints...
              </div>
            ) : sprints.length === 0 ? (
              <div className="py-4 text-center">
                <p className="mb-3 text-sm text-gray-400">
                  No hay sprints creados aún
                </p>
                <Link
                  href={`/projects/${id}/sprint-planning`}
                  className="inline-block rounded-md bg-violet-500 px-4 py-2 text-sm text-white hover:bg-violet-600"
                >
                  Crear Sprint
                </Link>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {sprints.map((sprint) => {
                  const statusColors: Record<string, string> = {
                    PLANNED: "bg-blue-500/20 text-blue-300 border-blue-500/30",
                    IN_PROGRESS: "bg-green-500/20 text-green-300 border-green-500/30",
                    COMPLETED: "bg-purple-500/20 text-purple-300 border-purple-500/30",
                    CANCELLED: "bg-red-500/20 text-red-300 border-red-500/30",
                  };

                  const statusLabels: Record<string, string> = {
                    PLANNED: "Planificado",
                    IN_PROGRESS: "En Progreso",
                    COMPLETED: "Completado",
                    CANCELLED: "Cancelado",
                  };

                  return (
                    <div
                      key={sprint.id}
                      className="rounded-xl border border-white/10 bg-white/5 p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">
                            Sprint {sprint.number}
                          </span>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${statusColors[sprint.status] || statusColors.PLANNED}`}
                          >
                            {statusLabels[sprint.status] || sprint.status}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-white/50 mb-2">
                        {new Date(sprint.startDate).toLocaleDateString("es-ES")} - {new Date(sprint.endDate).toLocaleDateString("es-ES")}
                      </p>

                      <div className="flex flex-wrap gap-1">
                        <Link
                          href={`/projects/${id}/kanban`}
                          className="rounded border border-blue-500/40 bg-blue-500/10 px-2 py-1 text-xs font-semibold text-blue-300 transition hover:bg-blue-500/20"
                        >
                          Kanban
                        </Link>

                        {(sprint.status === "COMPLETED" || sprint.status === "IN_PROGRESS") && (
                          <Link
                            href={`/projects/${id}/sprints/${sprint.id}/review`}
                            className="rounded border border-purple-500/40 bg-purple-500/10 px-2 py-1 text-xs font-semibold text-purple-300 transition hover:bg-purple-500/20"
                          >
                            Review
                          </Link>
                        )}

                        {sprint.status === "COMPLETED" && (
                          <Link
                            href={`/projects/${id}/sprints/${sprint.id}/retrospective`}
                            className="rounded border border-pink-500/40 bg-pink-500/10 px-2 py-1 text-xs font-semibold text-pink-300 transition hover:bg-pink-500/20"
                          >
                            Retro
                          </Link>
                        )}

                        {(sprint.status === "COMPLETED" || sprint.status === "IN_PROGRESS") && (
                          <Link
                            href={`/projects/${id}/sprints/${sprint.id}/metrics`}
                            className="rounded border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                          >
                            Métricas
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Project Configurations */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Configuraciones del Proyecto
              </h3>
              <Link
                href={`/projects/${id}/sprint0`}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Ver todas →
              </Link>
            </div>

            {configsLoading ? (
              <div className="text-center text-sm text-gray-400">
                Cargando configuraciones...
              </div>
            ) : !configs || configs.all?.length === 0 ? (
              <div className="text-center">
                <p className="mb-3 text-sm text-gray-400">
                  No hay configuraciones aún
                </p>
                <Link
                  href={`/projects/${id}/sprint0`}
                  className="inline-block rounded-md bg-purple-500 px-4 py-2 text-sm text-white hover:bg-purple-600"
                >
                  Inicializar Sprint 0
                </Link>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                {/* DoD Summary */}
                {configs.byCategory?.definition_of_done && (
                  <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <p className="mb-2 text-xs font-semibold uppercase text-purple-400">
                      Definition of Done
                    </p>
                    <div className="space-y-1">
                      {configs.byCategory.definition_of_done.slice(0, 3).map((config: any) => (
                        <div key={config.id} className="flex items-center gap-2 text-xs">
                          <span className={config.value === "true" ? "text-green-400" : "text-gray-500"}>
                            {config.value === "true" ? "✓" : "✗"}
                          </span>
                          <span className="text-white/70">
                            {config.description || config.key}
                          </span>
                        </div>
                      ))}
                      {configs.byCategory.definition_of_done.length > 3 && (
                        <p className="text-xs text-gray-500">
                          +{configs.byCategory.definition_of_done.length - 3} más
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Tech Stack Summary */}
                {configs.byCategory?.tech_infrastructure && (
                  <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <p className="mb-2 text-xs font-semibold uppercase text-blue-400">
                      Infraestructura Tecnológica
                    </p>
                    <div className="space-y-1">
                      {configs.byCategory.tech_infrastructure.slice(0, 3).map((config: any) => (
                        <div key={config.id} className="flex justify-between text-xs">
                          <span className="text-white/50">
                            {config.description || config.key}:
                          </span>
                          <span className="font-medium text-white">
                            {config.value}
                          </span>
                        </div>
                      ))}
                      {configs.byCategory.tech_infrastructure.length > 3 && (
                        <p className="text-xs text-gray-500">
                          +{configs.byCategory.tech_infrastructure.length - 3} más
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Development Patterns Summary */}
                {configs.byCategory?.development_patterns && (
                  <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <p className="mb-2 text-xs font-semibold uppercase text-emerald-400">
                      Patrones de Desarrollo
                    </p>
                    <div className="space-y-1">
                      {configs.byCategory.development_patterns.slice(0, 2).map((config: any) => (
                        <div key={config.id} className="text-xs">
                          <span className="text-white/50">
                            {config.description || config.key}:
                          </span>
                          <span className="ml-1 font-medium text-white">
                            {config.value}
                          </span>
                        </div>
                      ))}
                      {configs.byCategory.development_patterns.length > 2 && (
                        <p className="text-xs text-gray-500">
                          +{configs.byCategory.development_patterns.length - 2} más
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="border-t border-white/10 pt-3 text-center">
                  <p className="text-xs text-gray-500">
                    Total: {configs.all.length} configuraciones
                  </p>
                </div>
              </div>
            )}
          </div>

          {project._count && (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
              <h3 className="mb-4 text-lg font-semibold text-white">
                Metricas
              </h3>
              <div className="space-y-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                  <p className="text-3xl font-semibold text-white">
                    {project._count.stories}
                  </p>
                  <p className="text-xs text-white/60">Historias de usuario</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                  <p className="text-3xl font-semibold text-white">
                    {project._count.estimationSessions}
                  </p>
                  <p className="text-xs text-white/60">
                    Sesiones de estimacion
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-gray-900 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {editingTask ? "Editar tarea" : "Nueva tarea"}
              </h3>
              <button
                onClick={handleCloseTaskModal}
                className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>

            {taskSuccess && (
              <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-300">
                {taskSuccess}
              </div>
            )}

            {taskError && (
              <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                {taskError}
              </div>
            )}

            <form onSubmit={handleSubmitTask} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-white/60">
                  Título *
                </label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) =>
                    setTaskForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-primary focus:outline-none"
                  placeholder="Nombre de la tarea"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-white/60">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  value={taskForm.description}
                  onChange={(e) =>
                    setTaskForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-primary focus:outline-none"
                  placeholder="Descripción de la tarea (opcional)"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-white/60">
                  Esfuerzo (horas) *
                </label>
                <input
                  type="number"
                  min={1}
                  value={taskForm.effort}
                  onChange={(e) =>
                    setTaskForm((prev) => ({
                      ...prev,
                      effort: parseInt(e.target.value) || 1,
                    }))
                  }
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-primary focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseTaskModal}
                  className="rounded-full border border-white/20 px-6 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={taskSaving}
                  className="rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
                >
                  {taskSaving
                    ? "Guardando..."
                    : editingTask
                      ? "Actualizar tarea"
                      : "Crear tarea"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sprints Modal */}
      {showSprintsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-gray-900 p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">
                Sprints del Proyecto
              </h3>
              <button
                onClick={() => setShowSprintsModal(false)}
                className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>

            {sprintsLoading ? (
              <div className="py-8 text-center text-sm text-gray-400">
                Cargando sprints...
              </div>
            ) : sprints.length === 0 ? (
              <div className="py-8 text-center">
                <p className="mb-4 text-sm text-gray-400">
                  No hay sprints creados aún
                </p>
                <Link
                  href={`/projects/${id}/sprint-planning`}
                  className="inline-block rounded-lg bg-violet-500 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-600"
                >
                  Crear Sprint
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {sprints.map((sprint) => {
                  const statusColors: Record<string, string> = {
                    PLANNED: "bg-blue-500/20 text-blue-300 border-blue-500/30",
                    IN_PROGRESS: "bg-green-500/20 text-green-300 border-green-500/30",
                    COMPLETED: "bg-purple-500/20 text-purple-300 border-purple-500/30",
                    CANCELLED: "bg-red-500/20 text-red-300 border-red-500/30",
                  };

                  const statusLabels: Record<string, string> = {
                    PLANNED: "Planificado",
                    IN_PROGRESS: "En Progreso",
                    COMPLETED: "Completado",
                    CANCELLED: "Cancelado",
                  };

                  return (
                    <div
                      key={sprint.id}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h4 className="text-lg font-semibold text-white">
                              Sprint {sprint.number}
                            </h4>
                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusColors[sprint.status] || statusColors.PLANNED}`}
                            >
                              {statusLabels[sprint.status] || sprint.status}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-white/60">
                            {sprint.name}
                          </p>
                          {sprint.goal && (
                            <p className="mt-2 text-sm text-white/50">
                              Objetivo: {sprint.goal}
                            </p>
                          )}

                          {/* Sprint dates */}
                          <div className="mt-3 flex flex-wrap gap-4 text-xs text-white/50">
                            <span>
                              Inicio: {new Date(sprint.startDate).toLocaleDateString("es-ES")}
                            </span>
                            <span>
                              Fin: {new Date(sprint.endDate).toLocaleDateString("es-ES")}
                            </span>
                          </div>

                          {/* Sprint stats */}
                          <div className="mt-3 flex flex-wrap gap-4 text-xs">
                            <span className="rounded-full bg-white/10 px-3 py-1 text-white/70">
                              {sprint._count?.stories ?? 0} Historias
                            </span>
                            {sprint.plannedVelocity && (
                              <span className="rounded-full bg-white/10 px-3 py-1 text-white/70">
                                Velocidad planificada: {sprint.plannedVelocity}
                              </span>
                            )}
                            {sprint.actualVelocity && (
                              <span className="rounded-full bg-green-500/20 px-3 py-1 text-green-300">
                                Velocidad real: {sprint.actualVelocity}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col gap-2">
                          <Link
                            href={`/projects/${id}/kanban`}
                            className="rounded-lg border border-blue-500/40 bg-blue-500/10 px-4 py-2 text-center text-xs font-semibold text-blue-300 transition hover:bg-blue-500/20"
                          >
                            Ver Kanban
                          </Link>

                          {(sprint.status === "COMPLETED" || sprint.status === "IN_PROGRESS") && (
                            <Link
                              href={`/projects/${id}/sprints/${sprint.id}/review`}
                              className="rounded-lg border border-purple-500/40 bg-purple-500/10 px-4 py-2 text-center text-xs font-semibold text-purple-300 transition hover:bg-purple-500/20"
                            >
                              Sprint Review
                            </Link>
                          )}

                          {sprint.status === "COMPLETED" && (
                            <Link
                              href={`/projects/${id}/sprints/${sprint.id}/retrospective`}
                              className="rounded-lg border border-pink-500/40 bg-pink-500/10 px-4 py-2 text-center text-xs font-semibold text-pink-300 transition hover:bg-pink-500/20"
                            >
                              Retrospective
                            </Link>
                          )}

                          {(sprint.status === "COMPLETED" || sprint.status === "IN_PROGRESS") && (
                            <Link
                              href={`/projects/${id}/sprints/${sprint.id}/metrics`}
                              className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-center text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                            >
                              Métricas
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="mt-6 border-t border-white/10 pt-4 text-center">
                  <Link
                    href={`/projects/${id}/sprint-planning`}
                    className="inline-block rounded-lg bg-violet-500 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-600"
                  >
                    Ir a Sprint Planning
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
