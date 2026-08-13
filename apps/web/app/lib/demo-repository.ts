import type { TaskStatus, WorkspaceRole } from "@nexoflux/contracts";

import { executeMockXTask } from "./demo-x-adapter";

export const DEMO_PASSWORD = "NexoFlux-demo-2026!";

export const demoAccounts = [
  {
    email: "ana.owner@nexoflux.demo",
    label: "Entrar como Owner",
    name: "Ana Martins",
    role: "OWNER" as const,
  },
  {
    email: "bruno.admin@nexoflux.demo",
    label: "Entrar como Admin",
    name: "Bruno Lima",
    role: "ADMIN" as const,
  },
  {
    email: "carla.operator@nexoflux.demo",
    label: "Entrar como Operator",
    name: "Carla Souza",
    role: "OPERATOR" as const,
  },
  {
    email: "diego.viewer@nexoflux.demo",
    label: "Entrar como Viewer",
    name: "Diego Alves",
    role: "VIEWER" as const,
  },
];

export type DemoUser = {
  email: string;
  id: string;
  name: string;
  password: string;
};

export type DemoWorkspace = {
  createdAt: string;
  id: string;
  name: string;
  slug: string;
};

export type DemoMember = {
  createdAt: string;
  role: WorkspaceRole;
  userId: string;
  workspaceId: string;
};

export type DemoTask = {
  content: string;
  createdAt: string;
  createdByUserId: string;
  id: string;
  scheduledAt: string;
  status: TaskStatus;
  workspaceId: string;
};

export type DemoTaskEvent = {
  createdAt: string;
  detail: string;
  id: string;
  status: TaskStatus;
  taskId: string;
  workspaceId: string;
};

export type DemoStore = {
  members: DemoMember[];
  taskEvents: DemoTaskEvent[];
  tasks: DemoTask[];
  users: DemoUser[];
  workspaces: DemoWorkspace[];
};

export type DemoSession = {
  expiresAt: string;
  userId: string;
};

export type DemoUserProfile = Omit<DemoUser, "password">;

export type DemoWorkspaceSummary = DemoWorkspace & {
  role: WorkspaceRole;
};

export type DemoWorkspaceMember = {
  createdAt: string;
  email: string;
  name: string;
  role: WorkspaceRole;
  userId: string;
};

export type DemoWorkspaceTask = DemoTask & {
  createdByName: string;
  events: DemoTaskEvent[];
};

export type DemoAuthResult = {
  session: DemoSession;
  user: DemoUserProfile;
  workspace: DemoWorkspaceSummary;
};

export type StorageLike = {
  getItem(key: string): string | null;
  removeItem(key: string): void;
  setItem(key: string, value: string): void;
};

const STORE_KEY = "nexoflux.demo.store.v1";
const WORKSPACE_ID = "e2fcb9d1-83ce-4e5d-bd4c-11c7af1a5001";
const CREATED_AT = "2026-08-13T12:00:00.000Z";

const seedStore: DemoStore = {
  members: [
    {
      createdAt: CREATED_AT,
      role: "OWNER",
      userId: "a32d281c-320f-4a5b-9063-7f3bf4ec1001",
      workspaceId: WORKSPACE_ID,
    },
    {
      createdAt: CREATED_AT,
      role: "ADMIN",
      userId: "b46c4e65-6f1c-4140-870f-e3f7db04c002",
      workspaceId: WORKSPACE_ID,
    },
    {
      createdAt: CREATED_AT,
      role: "OPERATOR",
      userId: "cd0f67a6-a3a9-4e0d-a52f-f3d959f54003",
      workspaceId: WORKSPACE_ID,
    },
    {
      createdAt: CREATED_AT,
      role: "VIEWER",
      userId: "d5abe1ef-9263-4f5a-8990-707d93708004",
      workspaceId: WORKSPACE_ID,
    },
  ],
  taskEvents: [
    {
      createdAt: "2026-08-13T12:34:00.000Z",
      detail: "A tarefa foi concluída pelo adaptador simulado do X.",
      id: "f7b1a55a-4235-42b1-84a1-789b9d801001",
      status: "SUCCEEDED",
      taskId: "7b9c46e9-2453-4b92-81cd-19a9d0239001",
      workspaceId: WORKSPACE_ID,
    },
    {
      createdAt: "2026-08-13T12:30:00.000Z",
      detail: "Tarefa criada na agenda local.",
      id: "e6a1b44a-3124-41a0-73a0-678a8c701001",
      status: "SCHEDULED",
      taskId: "7b9c46e9-2453-4b92-81cd-19a9d0239001",
      workspaceId: WORKSPACE_ID,
    },
  ],
  tasks: [
    {
      content:
        "A operação organizada começa com uma agenda clara. #NexoFluxDemo",
      createdAt: "2026-08-13T12:30:00.000Z",
      createdByUserId: "cd0f67a6-a3a9-4e0d-a52f-f3d959f54003",
      id: "7b9c46e9-2453-4b92-81cd-19a9d0239001",
      scheduledAt: "2026-08-13T12:30:00.000Z",
      status: "SUCCEEDED",
      workspaceId: WORKSPACE_ID,
    },
  ],
  users: [
    {
      email: "ana.owner@nexoflux.demo",
      id: "a32d281c-320f-4a5b-9063-7f3bf4ec1001",
      name: "Ana Martins",
      password: DEMO_PASSWORD,
    },
    {
      email: "bruno.admin@nexoflux.demo",
      id: "b46c4e65-6f1c-4140-870f-e3f7db04c002",
      name: "Bruno Lima",
      password: DEMO_PASSWORD,
    },
    {
      email: "carla.operator@nexoflux.demo",
      id: "cd0f67a6-a3a9-4e0d-a52f-f3d959f54003",
      name: "Carla Souza",
      password: DEMO_PASSWORD,
    },
    {
      email: "diego.viewer@nexoflux.demo",
      id: "d5abe1ef-9263-4f5a-8990-707d93708004",
      name: "Diego Alves",
      password: DEMO_PASSWORD,
    },
  ],
  workspaces: [
    {
      createdAt: CREATED_AT,
      id: WORKSPACE_ID,
      name: "NexoFlux Operações",
      slug: "nexoflux-operacoes",
    },
  ],
};

export class DemoRepositoryError extends Error {}

function cloneStore(store: DemoStore): DemoStore {
  return JSON.parse(JSON.stringify(store)) as DemoStore;
}

function newId(): string {
  return globalThis.crypto.randomUUID();
}

function makeSlug(name: string): string {
  const base =
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "workspace";

  return base + "-" + newId().slice(0, 6);
}

function removePassword(user: DemoUser): DemoUserProfile {
  const { password: _password, ...profile } = user;
  return profile;
}

function createSession(userId: string): DemoSession {
  return {
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    userId,
  };
}

export function createDemoRepository(storage: StorageLike) {
  const read = (): DemoStore => {
    const rawStore = storage.getItem(STORE_KEY);

    if (!rawStore) {
      return cloneStore(seedStore);
    }

    try {
      return JSON.parse(rawStore) as DemoStore;
    } catch {
      return cloneStore(seedStore);
    }
  };

  const write = (store: DemoStore): void => {
    storage.setItem(STORE_KEY, JSON.stringify(store));
  };

  const requireUser = (store: DemoStore, userId: string): DemoUser => {
    const user = store.users.find((candidate) => candidate.id === userId);
    if (!user) {
      throw new DemoRepositoryError("Usuário não encontrado no simulador.");
    }

    return user;
  };

  const requireMembership = (
    store: DemoStore,
    workspaceId: string,
    userId: string,
  ): DemoMember => {
    const membership = store.members.find(
      (candidate) =>
        candidate.workspaceId === workspaceId && candidate.userId === userId,
    );

    if (!membership) {
      throw new DemoRepositoryError("Você não participa deste workspace.");
    }

    return membership;
  };

  const canManageMembers = (role: WorkspaceRole): boolean =>
    role === "OWNER" || role === "ADMIN";

  const canOperateTasks = (role: WorkspaceRole): boolean =>
    role === "OWNER" || role === "ADMIN" || role === "OPERATOR";

  const addTaskEvent = (
    store: DemoStore,
    task: DemoTask,
    status: TaskStatus,
    detail: string,
  ): DemoTaskEvent => {
    const event: DemoTaskEvent = {
      createdAt: new Date().toISOString(),
      detail,
      id: newId(),
      status,
      taskId: task.id,
      workspaceId: task.workspaceId,
    };
    store.taskEvents.push(event);
    return event;
  };

  const taskView = (store: DemoStore, task: DemoTask): DemoWorkspaceTask => ({
    ...task,
    createdByName: requireUser(store, task.createdByUserId).name,
    events: store.taskEvents
      .filter((event) => event.taskId === task.id)
      .reverse()
      .sort((first, second) => second.createdAt.localeCompare(first.createdAt)),
  });

  const listWorkspaces = (userId: string): DemoWorkspaceSummary[] => {
    const store = read();

    return store.members
      .filter((member) => member.userId === userId)
      .map((member) => {
        const workspace = store.workspaces.find(
          (candidate) => candidate.id === member.workspaceId,
        );
        if (!workspace) {
          throw new DemoRepositoryError(
            "Workspace inválido na base do simulador.",
          );
        }

        return { ...workspace, role: member.role };
      })
      .sort((first, second) => first.createdAt.localeCompare(second.createdAt));
  };

  return {
    cancelTask(actorUserId: string, workspaceId: string, taskId: string): void {
      const store = read();
      const membership = requireMembership(store, workspaceId, actorUserId);
      if (!canOperateTasks(membership.role)) {
        throw new DemoRepositoryError(
          "Sua função permite visualizar tarefas, mas não cancelá-las.",
        );
      }

      const task = store.tasks.find(
        (candidate) =>
          candidate.id === taskId && candidate.workspaceId === workspaceId,
      );
      if (!task) {
        throw new DemoRepositoryError("Tarefa não encontrada na agenda.");
      }
      if (task.status !== "SCHEDULED") {
        throw new DemoRepositoryError(
          "Somente tarefas agendadas podem ser canceladas.",
        );
      }

      task.status = "CANCELED";
      addTaskEvent(store, task, "CANCELED", "Tarefa cancelada no simulador.");
      write(store);
    },

    createTask(
      actorUserId: string,
      input: { content: string; scheduledAt: string; workspaceId: string },
    ): DemoWorkspaceTask {
      const store = read();
      const membership = requireMembership(
        store,
        input.workspaceId,
        actorUserId,
      );
      if (!canOperateTasks(membership.role)) {
        throw new DemoRepositoryError(
          "Sua função permite visualizar tarefas, mas não criá-las.",
        );
      }

      const content = input.content.trim();
      if (content.length < 3 || content.length > 280) {
        throw new DemoRepositoryError(
          "A tarefa deve ter entre 3 e 280 caracteres.",
        );
      }
      const scheduledAt = new Date(input.scheduledAt);
      if (Number.isNaN(scheduledAt.getTime())) {
        throw new DemoRepositoryError("Informe uma data e hora válidas.");
      }

      const task: DemoTask = {
        content,
        createdAt: new Date().toISOString(),
        createdByUserId: actorUserId,
        id: newId(),
        scheduledAt: scheduledAt.toISOString(),
        status: "SCHEDULED",
        workspaceId: input.workspaceId,
      };
      store.tasks.push(task);
      addTaskEvent(store, task, "SCHEDULED", "Tarefa criada na agenda local.");
      write(store);

      return taskView(store, task);
    },

    addMember(
      actorUserId: string,
      input: { email: string; role: WorkspaceRole; workspaceId: string },
    ): DemoWorkspaceMember {
      const store = read();
      const actorMembership = requireMembership(
        store,
        input.workspaceId,
        actorUserId,
      );
      if (!canManageMembers(actorMembership.role)) {
        throw new DemoRepositoryError(
          "Sua função não permite adicionar pessoas.",
        );
      }
      if (input.role === "OWNER" && actorMembership.role !== "OWNER") {
        throw new DemoRepositoryError(
          "Somente Owners podem adicionar outro Owner.",
        );
      }

      const target = store.users.find(
        (candidate) =>
          candidate.email.toLowerCase() === input.email.trim().toLowerCase(),
      );
      if (!target) {
        throw new DemoRepositoryError(
          "Crie uma conta para a pessoa antes de adicioná-la ao workspace.",
        );
      }
      if (
        store.members.some(
          (candidate) =>
            candidate.workspaceId === input.workspaceId &&
            candidate.userId === target.id,
        )
      ) {
        throw new DemoRepositoryError(
          "Esta pessoa já participa deste workspace.",
        );
      }

      const member: DemoMember = {
        createdAt: new Date().toISOString(),
        role: input.role,
        userId: target.id,
        workspaceId: input.workspaceId,
      };
      store.members.push(member);
      write(store);

      return {
        createdAt: member.createdAt,
        email: target.email,
        name: target.name,
        role: member.role,
        userId: target.id,
      };
    },

    authenticate(email: string, password: string): DemoAuthResult {
      const store = read();
      const user = store.users.find(
        (candidate) =>
          candidate.email.toLowerCase() === email.trim().toLowerCase() &&
          candidate.password === password,
      );

      if (!user) {
        throw new DemoRepositoryError("E-mail ou senha inválidos.");
      }

      const workspace = listWorkspaces(user.id)[0];
      if (!workspace) {
        throw new DemoRepositoryError(
          "Nenhum workspace foi encontrado para esta conta.",
        );
      }

      return {
        session: createSession(user.id),
        user: removePassword(user),
        workspace,
      };
    },

    createWorkspace(userId: string, name: string): DemoWorkspaceSummary {
      const store = read();
      requireUser(store, userId);
      const workspace: DemoWorkspace = {
        createdAt: new Date().toISOString(),
        id: newId(),
        name: name.trim(),
        slug: makeSlug(name),
      };
      store.workspaces.push(workspace);
      store.members.push({
        createdAt: workspace.createdAt,
        role: "OWNER",
        userId,
        workspaceId: workspace.id,
      });
      write(store);

      return { ...workspace, role: "OWNER" };
    },

    getUser(userId: string): DemoUserProfile {
      return removePassword(requireUser(read(), userId));
    },

    listTasks(workspaceId: string, actorUserId: string): DemoWorkspaceTask[] {
      const store = read();
      requireMembership(store, workspaceId, actorUserId);

      return store.tasks
        .filter((task) => task.workspaceId === workspaceId)
        .map((task) => taskView(store, task))
        .sort((first, second) => {
          const activeFirst =
            first.status === "SCHEDULED" || first.status === "RUNNING";
          const activeSecond =
            second.status === "SCHEDULED" || second.status === "RUNNING";
          if (activeFirst !== activeSecond) {
            return activeFirst ? -1 : 1;
          }
          return first.scheduledAt.localeCompare(second.scheduledAt);
        });
    },

    listMembers(
      workspaceId: string,
      actorUserId: string,
    ): DemoWorkspaceMember[] {
      const store = read();
      requireMembership(store, workspaceId, actorUserId);

      const rolePriority: Record<WorkspaceRole, number> = {
        ADMIN: 2,
        OPERATOR: 3,
        OWNER: 1,
        VIEWER: 4,
      };

      return store.members
        .filter((member) => member.workspaceId === workspaceId)
        .map((member) => {
          const user = requireUser(store, member.userId);
          return {
            createdAt: member.createdAt,
            email: user.email,
            name: user.name,
            role: member.role,
            userId: member.userId,
          };
        })
        .sort(
          (first, second) =>
            rolePriority[first.role] - rolePriority[second.role] ||
            first.name.localeCompare(second.name, "pt-BR"),
        );
    },

    listWorkspaces,

    register(input: {
      email: string;
      name: string;
      password: string;
      workspaceName: string;
    }): DemoAuthResult {
      const store = read();
      const email = input.email.trim().toLowerCase();
      if (
        store.users.some((candidate) => candidate.email.toLowerCase() === email)
      ) {
        throw new DemoRepositoryError("Já existe uma conta com este e-mail.");
      }

      const user: DemoUser = {
        email,
        id: newId(),
        name: input.name.trim(),
        password: input.password,
      };
      const workspace: DemoWorkspace = {
        createdAt: new Date().toISOString(),
        id: newId(),
        name: input.workspaceName.trim(),
        slug: makeSlug(input.workspaceName),
      };
      store.users.push(user);
      store.workspaces.push(workspace);
      store.members.push({
        createdAt: workspace.createdAt,
        role: "OWNER",
        userId: user.id,
        workspaceId: workspace.id,
      });
      write(store);

      return {
        session: createSession(user.id),
        user: removePassword(user),
        workspace: { ...workspace, role: "OWNER" },
      };
    },

    removeMember(
      actorUserId: string,
      workspaceId: string,
      targetUserId: string,
    ): void {
      const store = read();
      const actorMembership = requireMembership(
        store,
        workspaceId,
        actorUserId,
      );
      if (!canManageMembers(actorMembership.role)) {
        throw new DemoRepositoryError(
          "Sua função não permite remover pessoas.",
        );
      }

      const targetMembership = requireMembership(
        store,
        workspaceId,
        targetUserId,
      );
      if (
        targetMembership.role === "OWNER" &&
        actorMembership.role !== "OWNER"
      ) {
        throw new DemoRepositoryError(
          "Somente Owners podem remover outro Owner.",
        );
      }
      if (
        targetMembership.role === "OWNER" &&
        store.members.filter(
          (member) =>
            member.workspaceId === workspaceId && member.role === "OWNER",
        ).length === 1
      ) {
        throw new DemoRepositoryError(
          "O workspace precisa manter pelo menos um Owner.",
        );
      }

      store.members = store.members.filter(
        (member) =>
          member.workspaceId !== workspaceId || member.userId !== targetUserId,
      );
      write(store);
    },

    runTask(actorUserId: string, workspaceId: string, taskId: string): void {
      const store = read();
      const membership = requireMembership(store, workspaceId, actorUserId);
      if (!canOperateTasks(membership.role)) {
        throw new DemoRepositoryError(
          "Sua função permite visualizar tarefas, mas não executá-las.",
        );
      }
      const task = store.tasks.find(
        (candidate) =>
          candidate.id === taskId && candidate.workspaceId === workspaceId,
      );
      if (!task) {
        throw new DemoRepositoryError("Tarefa não encontrada na agenda.");
      }
      if (task.status !== "SCHEDULED") {
        throw new DemoRepositoryError(
          "Somente tarefas agendadas podem ser executadas.",
        );
      }

      task.status = "RUNNING";
      addTaskEvent(
        store,
        task,
        "RUNNING",
        "Execução iniciada pelo adaptador simulado.",
      );
      const execution = executeMockXTask(task);
      task.status = "SUCCEEDED";
      addTaskEvent(store, task, "SUCCEEDED", execution.message);
      write(store);
    },

    reset(): void {
      storage.removeItem(STORE_KEY);
    },

    updateMemberRole(
      actorUserId: string,
      workspaceId: string,
      targetUserId: string,
      role: WorkspaceRole,
    ): DemoWorkspaceMember {
      const store = read();
      const actorMembership = requireMembership(
        store,
        workspaceId,
        actorUserId,
      );
      if (actorMembership.role !== "OWNER") {
        throw new DemoRepositoryError("Somente Owners podem alterar funções.");
      }

      const targetMembership = requireMembership(
        store,
        workspaceId,
        targetUserId,
      );
      if (
        targetMembership.role === "OWNER" &&
        role !== "OWNER" &&
        store.members.filter(
          (member) =>
            member.workspaceId === workspaceId && member.role === "OWNER",
        ).length === 1
      ) {
        throw new DemoRepositoryError(
          "O workspace precisa manter pelo menos um Owner.",
        );
      }

      targetMembership.role = role;
      write(store);
      const user = requireUser(store, targetUserId);

      return {
        createdAt: targetMembership.createdAt,
        email: user.email,
        name: user.name,
        role: targetMembership.role,
        userId: targetUserId,
      };
    },
  };
}
