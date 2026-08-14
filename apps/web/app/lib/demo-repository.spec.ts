import { describe, expect, it } from "vitest";

import {
  createDemoRepository,
  DEMO_PASSWORD,
  DemoRepositoryError,
  type StorageLike,
} from "./demo-repository";

class MemoryStorage implements StorageLike {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

const OWNER_EMAIL = "ana.owner@nexoflux.demo";
const ADMIN_EMAIL = "bruno.admin@nexoflux.demo";
const OPERATOR_EMAIL = "carla.operator@nexoflux.demo";
const VIEWER_EMAIL = "diego.viewer@nexoflux.demo";

function authenticate(repository: ReturnType<typeof createDemoRepository>) {
  return repository.authenticate(OWNER_EMAIL, DEMO_PASSWORD);
}

describe("demo repository", () => {
  it("loads the four demonstration roles into the initial workspace", () => {
    const repository = createDemoRepository(new MemoryStorage());
    const owner = authenticate(repository);

    const members = repository.listMembers(owner.workspace.id, owner.user.id);

    expect(members.map((member) => member.role)).toEqual([
      "OWNER",
      "ADMIN",
      "OPERATOR",
      "VIEWER",
    ]);
  });

  it("creates an isolated workspace when a local account is registered", () => {
    const repository = createDemoRepository(new MemoryStorage());

    const registration = repository.register({
      email: "nova@nexoflux.demo",
      name: "Nova Pessoa",
      password: DEMO_PASSWORD,
      workspaceName: "Operação Nova",
    });

    expect(registration.workspace.role).toBe("OWNER");
    expect(repository.listWorkspaces(registration.user.id)).toHaveLength(1);
    expect(() =>
      repository.authenticate("nova@nexoflux.demo", DEMO_PASSWORD),
    ).not.toThrow();
  });

  it("redefines a local password and records the recovery in the audit trail", () => {
    const repository = createDemoRepository(new MemoryStorage());
    const newPassword = "Nova-senha-local-2026!";

    repository.recoverPassword(OWNER_EMAIL, newPassword);

    expect(() => repository.authenticate(OWNER_EMAIL, DEMO_PASSWORD)).toThrow(
      "E-mail ou senha inválidos",
    );
    const owner = repository.authenticate(OWNER_EMAIL, newPassword);
    expect(
      repository
        .getAdminOverview(owner.user.id)
        .auditEvents.some(
          (event) => event.action === "PASSWORD_RECOVERED_LOCAL",
        ),
    ).toBe(true);
  });

  it("updates the local display name and records the profile change", () => {
    const repository = createDemoRepository(new MemoryStorage());
    const owner = authenticate(repository);

    const profile = repository.updateProfile(owner.user.id, {
      name: "Ana Martins Revisão",
    });

    expect(profile.name).toBe("Ana Martins Revisão");
    expect(repository.getUser(owner.user.id).name).toBe("Ana Martins Revisão");
    expect(
      repository
        .getAdminOverview(owner.user.id)
        .auditEvents.some((event) => event.action === "PROFILE_UPDATED_LOCAL"),
    ).toBe(true);
  });

  it("blocks an Admin from adding an Owner", () => {
    const repository = createDemoRepository(new MemoryStorage());
    const owner = authenticate(repository);
    const admin = repository.authenticate(ADMIN_EMAIL, DEMO_PASSWORD);

    expect(() =>
      repository.addMember(admin.user.id, {
        email: "diego.viewer@nexoflux.demo",
        role: "OWNER",
        workspaceId: owner.workspace.id,
      }),
    ).toThrow(DemoRepositoryError);
  });

  it("protects the last Owner from being removed or demoted", () => {
    const repository = createDemoRepository(new MemoryStorage());
    const owner = authenticate(repository);

    expect(() =>
      repository.updateMemberRole(
        owner.user.id,
        owner.workspace.id,
        owner.user.id,
        "ADMIN",
      ),
    ).toThrow("pelo menos um Owner");
    expect(() =>
      repository.removeMember(owner.user.id, owner.workspace.id, owner.user.id),
    ).toThrow("pelo menos um Owner");
  });

  it("resets mutations back to the versioned seed data", () => {
    const storage = new MemoryStorage();
    const repository = createDemoRepository(storage);
    const owner = authenticate(repository);

    repository.createWorkspace(owner.user.id, "Workspace temporário");
    expect(repository.listWorkspaces(owner.user.id)).toHaveLength(2);

    repository.reset();
    expect(repository.listWorkspaces(owner.user.id)).toHaveLength(1);
  });

  it("creates and runs an allowed task with an auditable simulated result", () => {
    const repository = createDemoRepository(new MemoryStorage());
    const owner = authenticate(repository);
    const operator = repository.authenticate(OPERATOR_EMAIL, DEMO_PASSWORD);

    const task = repository.createTask(operator.user.id, {
      content: "Publicar atualização da demonstração.",
      scheduledAt: "2026-08-14T14:00:00.000Z",
      workspaceId: owner.workspace.id,
    });
    repository.runTask(operator.user.id, owner.workspace.id, task.id);

    const executedTask = repository
      .listTasks(owner.workspace.id, owner.user.id)
      .find((candidate) => candidate.id === task.id);
    expect(executedTask?.status).toBe("SUCCEEDED");
    expect(executedTask?.events.map((event) => event.status)).toEqual([
      "SUCCEEDED",
      "RUNNING",
      "SCHEDULED",
    ]);
  });

  it("accepts the raw datetime-local value used by the scheduling form", () => {
    const repository = createDemoRepository(new MemoryStorage());
    const owner = authenticate(repository);

    const task = repository.createTask(owner.user.id, {
      content: "Agendamento vindo do formulário local.",
      scheduledAt: "2026-09-03T10:00",
      workspaceId: owner.workspace.id,
    });

    expect(task.status).toBe("SCHEDULED");
    expect(
      repository.listTasks(owner.workspace.id, owner.user.id),
    ).toContainEqual(expect.objectContaining({ id: task.id }));
  });

  it("allows Viewer to inspect tasks but not create or execute them", () => {
    const repository = createDemoRepository(new MemoryStorage());
    const owner = authenticate(repository);
    const viewer = repository.authenticate(VIEWER_EMAIL, DEMO_PASSWORD);

    expect(
      repository.listTasks(owner.workspace.id, viewer.user.id),
    ).toHaveLength(1);
    expect(() =>
      repository.createTask(viewer.user.id, {
        content: "Esta tarefa não deve ser criada.",
        scheduledAt: "2026-08-14T14:00:00.000Z",
        workspaceId: owner.workspace.id,
      }),
    ).toThrow("visualizar tarefas");
  });

  it("cancels an scheduled task and prevents it from running afterwards", () => {
    const repository = createDemoRepository(new MemoryStorage());
    const owner = authenticate(repository);
    const task = repository.createTask(owner.user.id, {
      content: "Cancelar antes da execução.",
      scheduledAt: "2026-08-14T14:00:00.000Z",
      workspaceId: owner.workspace.id,
    });

    repository.cancelTask(owner.user.id, owner.workspace.id, task.id);
    expect(() =>
      repository.runTask(owner.user.id, owner.workspace.id, task.id),
    ).toThrow("Somente tarefas agendadas");
  });

  it("exposes seeded consumption and lets only Owner simulate a plan change", () => {
    const repository = createDemoRepository(new MemoryStorage());
    const owner = authenticate(repository);
    const admin = repository.authenticate(ADMIN_EMAIL, DEMO_PASSWORD);

    expect(
      repository.getConsumption(owner.workspace.id, owner.user.id),
    ).toMatchObject({
      executionLimit: 500,
      plan: "STARTER",
      remaining: 499,
      used: 1,
    });
    expect(() =>
      repository.changePlan(admin.user.id, owner.workspace.id, "PRO"),
    ).toThrow("Somente Owners");

    repository.changePlan(owner.user.id, owner.workspace.id, "PRO");
    expect(
      repository.getConsumption(owner.workspace.id, owner.user.id),
    ).toMatchObject({
      executionLimit: 3000,
      plan: "PRO",
      used: 1,
    });
  });

  it("blocks a new execution after the plan quota is consumed", () => {
    const repository = createDemoRepository(new MemoryStorage());
    const owner = authenticate(repository);

    for (let index = 0; index < 499; index += 1) {
      const task = repository.createTask(owner.user.id, {
        content: "Tarefa de consumo " + index,
        scheduledAt: "2026-08-14T14:00:00.000Z",
        workspaceId: owner.workspace.id,
      });
      repository.runTask(owner.user.id, owner.workspace.id, task.id);
    }

    expect(
      repository.getConsumption(owner.workspace.id, owner.user.id),
    ).toMatchObject({
      remaining: 0,
      used: 500,
    });
    const blockedTask = repository.createTask(owner.user.id, {
      content: "Tarefa que excede a cota.",
      scheduledAt: "2026-08-14T14:00:00.000Z",
      workspaceId: owner.workspace.id,
    });
    expect(() =>
      repository.runTask(owner.user.id, owner.workspace.id, blockedTask.id),
    ).toThrow("limite de execuções");
  });

  it("reconciles simulated billing events and pauses execution while past due", () => {
    const repository = createDemoRepository(new MemoryStorage());
    const owner = authenticate(repository);

    repository.simulateBillingWebhook(
      owner.user.id,
      owner.workspace.id,
      "PAYMENT_FAILED",
    );
    expect(
      repository.getBilling(owner.workspace.id, owner.user.id).subscription
        .status,
    ).toBe("PAST_DUE");

    const task = repository.createTask(owner.user.id, {
      content: "Não deve executar enquanto a cobrança está pendente.",
      scheduledAt: "2026-08-14T14:00:00.000Z",
      workspaceId: owner.workspace.id,
    });
    expect(() =>
      repository.runTask(owner.user.id, owner.workspace.id, task.id),
    ).toThrow("assinatura não está ativa");

    repository.simulateBillingWebhook(
      owner.user.id,
      owner.workspace.id,
      "PAYMENT_SUCCEEDED",
    );
    repository.runTask(owner.user.id, owner.workspace.id, task.id);
    expect(
      repository.getBilling(owner.workspace.id, owner.user.id).subscription
        .status,
    ).toBe("ACTIVE");
  });

  it("allows only Owner to simulate a billing webhook", () => {
    const repository = createDemoRepository(new MemoryStorage());
    const owner = authenticate(repository);
    const admin = repository.authenticate(ADMIN_EMAIL, DEMO_PASSWORD);

    expect(() =>
      repository.simulateBillingWebhook(
        admin.user.id,
        owner.workspace.id,
        "PAYMENT_FAILED",
      ),
    ).toThrow("Somente Owners");
  });

  it("exposes administration only to an Owner and records sensitive actions", () => {
    const repository = createDemoRepository(new MemoryStorage());
    const owner = authenticate(repository);
    const admin = repository.authenticate(ADMIN_EMAIL, DEMO_PASSWORD);

    repository.createTask(owner.user.id, {
      content: "Registrar uma ação auditável.",
      scheduledAt: "2026-08-14T14:00:00.000Z",
      workspaceId: owner.workspace.id,
    });
    const overview = repository.getAdminOverview(owner.user.id);

    expect(overview.totalUsers).toBe(4);
    expect(overview.totalWorkspaces).toBe(1);
    expect(
      overview.auditEvents.some((event) => event.action === "TASK_SCHEDULED"),
    ).toBe(true);
    expect(() => repository.getAdminOverview(admin.user.id)).toThrow(
      "Somente Owners",
    );
  });

  it("lets only Owner control the local X adapter and blocks execution when disabled", () => {
    const repository = createDemoRepository(new MemoryStorage());
    const owner = authenticate(repository);
    const admin = repository.authenticate(ADMIN_EMAIL, DEMO_PASSWORD);
    const task = repository.createTask(owner.user.id, {
      content: "Confirmar bloqueio do adaptador local.",
      scheduledAt: "2026-08-14T14:00:00.000Z",
      workspaceId: owner.workspace.id,
    });

    expect(
      repository.getIntegrationReadiness(owner.workspace.id, owner.user.id)
        .xMockExecutionEnabled,
    ).toBe(true);
    expect(() =>
      repository.setXMockExecutionEnabled(
        admin.user.id,
        owner.workspace.id,
        false,
      ),
    ).toThrow("Somente Owners");

    repository.setXMockExecutionEnabled(
      owner.user.id,
      owner.workspace.id,
      false,
    );
    expect(() =>
      repository.runTask(owner.user.id, owner.workspace.id, task.id),
    ).toThrow("adaptador local do X está desativado");
    expect(
      repository
        .getAdminOverview(owner.user.id)
        .auditEvents.some((event) => event.action === "X_MOCK_ADAPTER_UPDATED"),
    ).toBe(true);

    repository.setXMockExecutionEnabled(
      owner.user.id,
      owner.workspace.id,
      true,
    );
    repository.runTask(owner.user.id, owner.workspace.id, task.id);
  });
});
