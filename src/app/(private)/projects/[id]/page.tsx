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

  useEffect(() => {
    if (!authLoading && user) {
      fetchProject();
      fetchStories();
    }
  }, [authLoading, user, fetchProject, fetchStories]);

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
    href={`/projects/${project.id}/estimation`}
    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:from-emerald-600 hover:to-teal-600"
  >
    <span></span>
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
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
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
    </main>
  );
}
