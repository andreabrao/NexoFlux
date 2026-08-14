import type { TaskStatus, WorkspaceRole } from "@nexoflux/contracts";

import { executeMockXTask } from "./demo-x-adapter";
import {
  createMockStripeWebhook,
  type DemoStripeWebhookKind,
} from "./demo-stripe-adapter";

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
  plan: DemoPlan;
  slug: string;
};

export type DemoPlan = "STARTER" | "PRO" | "AGENCY";

export type DemoPlanDefinition = {
  executionLimit: number;
  label: string;
  monthlyPrice: number;
  retentionDays: number;
};

export const demoPlans: Record<DemoPlan, DemoPlanDefinition> = {
  AGENCY: {
    executionLimit: 20000,
    label: "Agência",
    monthlyPrice: 299,
    retentionDays: 180,
  },
  PRO: {
    executionLimit: 3000,
    label: "Pro",
    monthlyPrice: 129,
    retentionDays: 90,
  },
  STARTER: {
    executionLimit: 500,
    label: "Starter",
    monthlyPrice: 49,
    retentionDays: 30,
  },
};

export type DemoConsumption = {
  executionLimit: number;
  percentage: number;
  plan: DemoPlan;
  remaining: number;
  used: number;
};

export type DemoBillingCycle = "MONTHLY" | "ANNUAL";

export type DemoBillingStatus = "ACTIVE" | "PAST_DUE" | "CANCELED";

export type DemoSubscription = {
  billingCycle: DemoBillingCycle;
  createdAt: string;
  currentPeriodEnd: string;
  id: string;
  plan: DemoPlan;
  status: DemoBillingStatus;
  updatedAt: string;
  workspaceId: string;
};

export type DemoBillingEvent = {
  createdAt: string;
  detail: string;
  id: string;
  providerEventId: string;
  status: DemoBillingStatus;
  subscriptionId: string;
  type: string;
  workspaceId: string;
};

export type DemoAuditEvent = {
  action: string;
  actorName: string;
  actorUserId: string;
  createdAt: string;
  detail: string;
  id: string;
  target: string;
  workspaceId: string;
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
  auditEvents: DemoAuditEvent[];
  billingEvents: DemoBillingEvent[];
  integrationSettings: DemoIntegrationSettings;
  members: DemoMember[];
  subscriptions: DemoSubscription[];
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

export type DemoBillingOverview = {
  events: DemoBillingEvent[];
  subscription: DemoSubscription;
};

export type DemoAdminWorkspace = {
  memberCount: number;
  name: string;
  plan: DemoPlan;
  slug: string;
  subscriptionStatus: DemoBillingStatus;
  workspaceId: string;
};

export type DemoAdminOverview = {
  auditEvents: DemoAuditEvent[];
  subscriptions: DemoSubscription[];
  totalUsers: number;
  totalWorkspaces: number;
  users: DemoUserProfile[];
  workspaces: DemoAdminWorkspace[];
};

export type DemoIntegrationStatus =
  "SIMULATED" | "PENDING" | "NOT_CONFIGURED" | "DISABLED";

export type DemoIntegrationReadiness = {
  integrations: Array<{
    detail: string;
    name: string;
    status: DemoIntegrationStatus;
  }>;
  xMockExecutionEnabled: boolean;
};

export type DemoIntegrationSettings = {
  xMockExecutionEnabled: boolean;
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
  auditEvents: [
    {
      action: "WORKSPACE_CREATED",
      actorName: "Ana Martins",
      actorUserId: "a32d281c-320f-4a5b-9063-7f3bf4ec1001",
      createdAt: CREATED_AT,
      detail: "Workspace inicial criado para a demonstração.",
      id: "aa0c1001-1001-4001-8001-000000000001",
      target: "NexoFlux Operações",
      workspaceId: WORKSPACE_ID,
    },
  ],
  billingEvents: [
    {
      createdAt: "2026-08-13T12:00:00.000Z",
      detail: "Assinatura Starter mensal criada e reconciliada no simulador.",
      id: "9fca5375-1c6f-4e2e-9951-d9c582540001",
      providerEventId: "evt_mock_invoice_paid_seed",
      status: "ACTIVE",
      subscriptionId: "cfbd4264-0b5e-4d1d-8840-c8b471430001",
      type: "invoice.paid.monthly",
      workspaceId: WORKSPACE_ID,
    },
  ],
  integrationSettings: {
    xMockExecutionEnabled: true,
  },
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
  subscriptions: [
    {
      billingCycle: "MONTHLY",
      createdAt: CREATED_AT,
      currentPeriodEnd: "2026-09-13T12:00:00.000Z",
      id: "cfbd4264-0b5e-4d1d-8840-c8b471430001",
      plan: "STARTER",
      status: "ACTIVE",
      updatedAt: CREATED_AT,
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
      plan: "STARTER",
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
      const stored = JSON.parse(rawStore) as Partial<DemoStore>;
      const store: DemoStore = {
        ...stored,
        auditEvents: stored.auditEvents ?? [],
        billingEvents: stored.billingEvents ?? [],
        integrationSettings: stored.integrationSettings ?? {
          xMockExecutionEnabled: true,
        },
        subscriptions: stored.subscriptions ?? [],
        taskEvents: stored.taskEvents ?? [],
        tasks: stored.tasks ?? [],
      } as DemoStore;

      for (const workspace of store.workspaces) {
        if (!workspace.plan) {
          workspace.plan = "STARTER";
        }
        if (
          !store.subscriptions.some(
            (subscription) => subscription.workspaceId === workspace.id,
          )
        ) {
          const subscription: DemoSubscription = {
            billingCycle: "MONTHLY",
            createdAt: workspace.createdAt,
            currentPeriodEnd: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            id: newId(),
            plan: workspace.plan,
            status: "ACTIVE",
            updatedAt: new Date().toISOString(),
            workspaceId: workspace.id,
          };
          store.subscriptions.push(subscription);
          store.billingEvents.push({
            createdAt: subscription.updatedAt,
            detail:
              "Assinatura inicial criada automaticamente para compatibilidade do simulador.",
            id: newId(),
            providerEventId:
              "evt_mock_migration_" + subscription.id.slice(0, 8),
            status: "ACTIVE",
            subscriptionId: subscription.id,
            type: "invoice.paid.monthly",
            workspaceId: workspace.id,
          });
        }
      }

      return store;
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

  const consumptionFor = (
    store: DemoStore,
    workspaceId: string,
  ): DemoConsumption => {
    const workspace = store.workspaces.find(
      (candidate) => candidate.id === workspaceId,
    );
    if (!workspace) {
      throw new DemoRepositoryError("Workspace não encontrado no simulador.");
    }

    const used = store.tasks.filter(
      (task) => task.workspaceId === workspaceId && task.status === "SUCCEEDED",
    ).length;
    const executionLimit = demoPlans[workspace.plan].executionLimit;

    return {
      executionLimit,
      percentage: Math.min(100, Math.round((used / executionLimit) * 100)),
      plan: workspace.plan,
      remaining: Math.max(0, executionLimit - used),
      used,
    };
  };

  const requireSubscription = (
    store: DemoStore,
    workspaceId: string,
  ): DemoSubscription => {
    const subscription = store.subscriptions.find(
      (candidate) => candidate.workspaceId === workspaceId,
    );
    if (!subscription) {
      throw new DemoRepositoryError("Assinatura não encontrada no simulador.");
    }
    return subscription;
  };

  const recordBillingEvent = (
    store: DemoStore,
    subscription: DemoSubscription,
    input: { detail: string; kind: DemoStripeWebhookKind },
  ): DemoBillingEvent => {
    const webhook = createMockStripeWebhook({
      billingCycle: subscription.billingCycle,
      plan: subscription.plan,
      subscriptionId: subscription.id,
      type: input.kind,
    });
    subscription.status = webhook.status;
    subscription.updatedAt = new Date().toISOString();

    const event: DemoBillingEvent = {
      createdAt: subscription.updatedAt,
      detail: input.detail,
      id: newId(),
      providerEventId: webhook.id,
      status: webhook.status,
      subscriptionId: subscription.id,
      type: webhook.type,
      workspaceId: subscription.workspaceId,
    };
    store.billingEvents.push(event);
    return event;
  };

  const recordAuditEvent = (
    store: DemoStore,
    input: {
      action: string;
      actorUserId: string;
      detail: string;
      target: string;
      workspaceId: string;
    },
  ): DemoAuditEvent => {
    const actor = requireUser(store, input.actorUserId);
    const event: DemoAuditEvent = {
      action: input.action,
      actorName: actor.name,
      actorUserId: actor.id,
      createdAt: new Date().toISOString(),
      detail: input.detail,
      id: newId(),
      target: input.target,
      workspaceId: input.workspaceId,
    };
    store.auditEvents.push(event);
    return event;
  };

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
      recordAuditEvent(store, {
        action: "TASK_CANCELED",
        actorUserId,
        detail: "Tarefa cancelada antes da execução.",
        target: task.content,
        workspaceId,
      });
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
      recordAuditEvent(store, {
        action: "TASK_SCHEDULED",
        actorUserId,
        detail: "Tarefa adicionada à agenda local.",
        target: task.content,
        workspaceId: input.workspaceId,
      });
      write(store);

      return taskView(store, task);
    },

    changePlan(
      actorUserId: string,
      workspaceId: string,
      plan: DemoPlan,
    ): DemoWorkspaceSummary {
      const store = read();
      const membership = requireMembership(store, workspaceId, actorUserId);
      if (membership.role !== "OWNER") {
        throw new DemoRepositoryError(
          "Somente Owners podem simular uma mudança de plano.",
        );
      }
      const workspace = store.workspaces.find(
        (candidate) => candidate.id === workspaceId,
      );
      if (!workspace) {
        throw new DemoRepositoryError("Workspace não encontrado no simulador.");
      }

      workspace.plan = plan;
      const subscription = requireSubscription(store, workspaceId);
      subscription.plan = plan;
      recordBillingEvent(store, subscription, {
        detail:
          "Plano alterado para " +
          demoPlans[plan].label +
          " e reconciliado no adaptador Stripe simulado.",
        kind: "PAYMENT_SUCCEEDED",
      });
      recordAuditEvent(store, {
        action: "PLAN_CHANGED",
        actorUserId,
        detail: "Plano alterado para " + demoPlans[plan].label + ".",
        target: workspace.name,
        workspaceId,
      });
      write(store);
      return { ...workspace, role: membership.role };
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
      recordAuditEvent(store, {
        action: "MEMBER_ADDED",
        actorUserId,
        detail: "Membro adicionado com a função " + member.role + ".",
        target: target.name,
        workspaceId: input.workspaceId,
      });
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
        plan: "STARTER",
        slug: makeSlug(name),
      };
      store.workspaces.push(workspace);
      store.members.push({
        createdAt: workspace.createdAt,
        role: "OWNER",
        userId,
        workspaceId: workspace.id,
      });
      recordAuditEvent(store, {
        action: "WORKSPACE_CREATED",
        actorUserId: userId,
        detail: "Novo workspace criado com plano Starter.",
        target: workspace.name,
        workspaceId: workspace.id,
      });
      write(store);

      return { ...workspace, role: "OWNER" };
    },

    getUser(userId: string): DemoUserProfile {
      return removePassword(requireUser(read(), userId));
    },

    getConsumption(workspaceId: string, actorUserId: string): DemoConsumption {
      const store = read();
      requireMembership(store, workspaceId, actorUserId);
      return consumptionFor(store, workspaceId);
    },

    getBilling(workspaceId: string, actorUserId: string): DemoBillingOverview {
      const store = read();
      requireMembership(store, workspaceId, actorUserId);
      const subscription = requireSubscription(store, workspaceId);

      return {
        events: store.billingEvents
          .filter((event) => event.workspaceId === workspaceId)
          .sort((first, second) =>
            second.createdAt.localeCompare(first.createdAt),
          ),
        subscription: { ...subscription },
      };
    },

    getIntegrationReadiness(
      workspaceId: string,
      actorUserId: string,
    ): DemoIntegrationReadiness {
      const store = read();
      requireMembership(store, workspaceId, actorUserId);
      const xMockExecutionEnabled =
        store.integrationSettings.xMockExecutionEnabled;

      return {
        integrations: [
          {
            detail: xMockExecutionEnabled
              ? "Adaptador local ativo; nenhuma conta, token ou publicação real é usada."
              : "Adaptador local desativado por um Owner; execuções simuladas ficam bloqueadas.",
            name: "Adaptador X",
            status: xMockExecutionEnabled ? "SIMULATED" : "DISABLED",
          },
          {
            detail:
              "OAuth, escopos e aprovação da API oficial ainda não foram configurados.",
            name: "API oficial do X",
            status: "PENDING",
          },
          {
            detail:
              "Eventos de cobrança são gerados pelo adaptador sandbox local.",
            name: "Cobrança",
            status: "SIMULATED",
          },
          {
            detail:
              "Sem API, banco de dados ou fila nesta demonstração publicada.",
            name: "API, banco e fila",
            status: "NOT_CONFIGURED",
          },
        ],
        xMockExecutionEnabled,
      };
    },

    getAdminOverview(actorUserId: string): DemoAdminOverview {
      const store = read();
      const ownerMembership = store.members.find(
        (member) => member.userId === actorUserId && member.role === "OWNER",
      );
      if (!ownerMembership) {
        throw new DemoRepositoryError(
          "Somente Owners podem consultar a administração simulada.",
        );
      }

      return {
        auditEvents: [...store.auditEvents].sort((first, second) =>
          second.createdAt.localeCompare(first.createdAt),
        ),
        subscriptions: [...store.subscriptions].sort((first, second) =>
          second.updatedAt.localeCompare(first.updatedAt),
        ),
        totalUsers: store.users.length,
        totalWorkspaces: store.workspaces.length,
        users: store.users
          .map(removePassword)
          .sort((first, second) =>
            first.name.localeCompare(second.name, "pt-BR"),
          ),
        workspaces: store.workspaces
          .map((workspace) => ({
            memberCount: store.members.filter(
              (member) => member.workspaceId === workspace.id,
            ).length,
            name: workspace.name,
            plan: workspace.plan,
            slug: workspace.slug,
            subscriptionStatus: requireSubscription(store, workspace.id).status,
            workspaceId: workspace.id,
          }))
          .sort((first, second) =>
            first.name.localeCompare(second.name, "pt-BR"),
          ),
      };
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
        plan: "STARTER",
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
      recordAuditEvent(store, {
        action: "WORKSPACE_REGISTERED",
        actorUserId: user.id,
        detail: "Conta local registrada com workspace Starter.",
        target: workspace.name,
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
      recordAuditEvent(store, {
        action: "MEMBER_REMOVED",
        actorUserId,
        detail: "Membro removido do workspace.",
        target: requireUser(store, targetUserId).name,
        workspaceId,
      });
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
      const consumption = consumptionFor(store, workspaceId);
      if (consumption.remaining === 0) {
        throw new DemoRepositoryError(
          "O limite de execuções deste plano foi atingido. Simule um upgrade para continuar.",
        );
      }
      const subscription = requireSubscription(store, workspaceId);
      if (subscription.status !== "ACTIVE") {
        throw new DemoRepositoryError(
          "A assinatura não está ativa. Regularize a cobrança simulada antes de executar novas tarefas.",
        );
      }
      if (!store.integrationSettings.xMockExecutionEnabled) {
        throw new DemoRepositoryError(
          "O adaptador local do X está desativado. Um Owner deve reativá-lo para executar tarefas simuladas.",
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
      recordAuditEvent(store, {
        action: "TASK_EXECUTED",
        actorUserId,
        detail: "Tarefa concluída pelo adaptador local do X.",
        target: task.content,
        workspaceId,
      });
      write(store);
    },

    setXMockExecutionEnabled(
      actorUserId: string,
      workspaceId: string,
      enabled: boolean,
    ): void {
      const store = read();
      const membership = requireMembership(store, workspaceId, actorUserId);
      if (membership.role !== "OWNER") {
        throw new DemoRepositoryError(
          "Somente Owners podem configurar o adaptador de integração simulado.",
        );
      }

      store.integrationSettings.xMockExecutionEnabled = enabled;
      recordAuditEvent(store, {
        action: "X_MOCK_ADAPTER_UPDATED",
        actorUserId,
        detail: enabled
          ? "Adaptador local do X reativado para a demonstração."
          : "Adaptador local do X desativado; novas execuções simuladas foram bloqueadas.",
        target: "Adaptador X local",
        workspaceId,
      });
      write(store);
    },

    simulateBillingWebhook(
      actorUserId: string,
      workspaceId: string,
      kind: DemoStripeWebhookKind,
    ): DemoBillingOverview {
      const store = read();
      const membership = requireMembership(store, workspaceId, actorUserId);
      if (membership.role !== "OWNER") {
        throw new DemoRepositoryError(
          "Somente Owners podem simular eventos de cobrança.",
        );
      }
      const subscription = requireSubscription(store, workspaceId);
      const details: Record<DemoStripeWebhookKind, string> = {
        PAYMENT_FAILED:
          "Falha de cobrança simulada; novas execuções serão bloqueadas até a regularização.",
        PAYMENT_SUCCEEDED:
          "Pagamento simulado recebido e assinatura reconciliada como ativa.",
        SUBSCRIPTION_CANCELED:
          "Cancelamento simulado recebido; a assinatura foi marcada como encerrada.",
      };
      recordBillingEvent(store, subscription, {
        detail: details[kind],
        kind,
      });
      recordAuditEvent(store, {
        action: "BILLING_WEBHOOK_SIMULATED",
        actorUserId,
        detail: "Evento de cobrança " + kind + " reconciliado localmente.",
        target: subscription.id,
        workspaceId,
      });
      write(store);

      return {
        events: store.billingEvents
          .filter((event) => event.workspaceId === workspaceId)
          .sort((first, second) =>
            second.createdAt.localeCompare(first.createdAt),
          ),
        subscription: { ...subscription },
      };
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
      recordAuditEvent(store, {
        action: "MEMBER_ROLE_UPDATED",
        actorUserId,
        detail: "Função atualizada para " + role + ".",
        target: requireUser(store, targetUserId).name,
        workspaceId,
      });
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
