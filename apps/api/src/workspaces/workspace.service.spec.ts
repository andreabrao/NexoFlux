import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";

import type { WorkspaceRepository } from "./workspace.repository";
import { WorkspaceService } from "./workspace.service";

function createService(overrides?: Partial<WorkspaceRepository>) {
  const repository = {
    addMember: vi.fn().mockResolvedValue(undefined),
    create: vi.fn().mockResolvedValue(undefined),
    findUserIdByEmail: vi.fn().mockResolvedValue("target-user"),
    removeMember: vi.fn().mockResolvedValue("removed"),
    updateMemberRole: vi.fn().mockResolvedValue("updated"),
    ...overrides,
  } as unknown as WorkspaceRepository;

  return {
    repository,
    service: new WorkspaceService(repository),
  };
}

describe("WorkspaceService", () => {
  it("prevents an Admin from granting the Owner role", async () => {
    const { repository, service } = createService();

    await expect(
      service.addMember(
        "workspace-id",
        { email: "novo@nexoflux.test", role: "OWNER" },
        "admin-id",
        "ADMIN",
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repository.addMember).not.toHaveBeenCalled();
  });

  it("requires an existing account before membership is created", async () => {
    const { service } = createService({
      findUserIdByEmail: vi.fn().mockResolvedValue(null),
    });

    await expect(
      service.addMember(
        "workspace-id",
        { email: "inexistente@nexoflux.test", role: "VIEWER" },
        "owner-id",
        "OWNER",
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("preserves the last Owner when changing roles", async () => {
    const { service } = createService({
      updateMemberRole: vi.fn().mockResolvedValue("last_owner"),
    });

    await expect(
      service.updateMemberRole(
        "workspace-id",
        "owner-id",
        { role: "ADMIN" },
        "owner-id",
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("prevents an Admin from removing an Owner", async () => {
    const { service } = createService({
      removeMember: vi.fn().mockResolvedValue("owner_requires_owner"),
    });

    await expect(
      service.removeMember("workspace-id", "owner-id", "admin-id", "ADMIN"),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
