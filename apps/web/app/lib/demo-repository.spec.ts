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
});
