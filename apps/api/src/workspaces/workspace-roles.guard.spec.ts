import { ForbiddenException, type ExecutionContext } from "@nestjs/common";
import type { Reflector } from "@nestjs/core";
import { describe, expect, it, vi } from "vitest";

import type { WorkspaceRequest } from "./current-membership.decorator";
import type { WorkspaceRepository } from "./workspace.repository";
import { WorkspaceRolesGuard } from "./workspace-roles.guard";

const WORKSPACE_ID = "a96ebf8c-f868-4384-8dfe-e4186df904f6";

function createContext(request: WorkspaceRequest): ExecutionContext {
  return {
    getClass: vi.fn(),
    getHandler: vi.fn(),
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe("WorkspaceRolesGuard", () => {
  it("skips routes without workspace role metadata", async () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(undefined),
    } as unknown as Reflector;
    const repository = {
      findMembership: vi.fn(),
    } as unknown as WorkspaceRepository;
    const guard = new WorkspaceRolesGuard(reflector, repository);

    await expect(
      guard.canActivate(createContext({ headers: {}, params: {} })),
    ).resolves.toBe(true);
    expect(repository.findMembership).not.toHaveBeenCalled();
  });

  it("attaches an allowed membership", async () => {
    const membership = {
      role: "OWNER" as const,
      userId: "user-id",
      workspaceId: WORKSPACE_ID,
    };
    const request: WorkspaceRequest = {
      auth: {
        expiresAt: new Date("2026-09-12T00:00:00.000Z"),
        sessionId: "session-id",
        user: { email: "ana@nexoflux.test", id: "user-id", name: "Ana" },
      },
      headers: {},
      params: { workspaceId: WORKSPACE_ID },
    };
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(["OWNER", "ADMIN"]),
    } as unknown as Reflector;
    const repository = {
      findMembership: vi.fn().mockResolvedValue(membership),
    } as unknown as WorkspaceRepository;
    const guard = new WorkspaceRolesGuard(reflector, repository);

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);
    expect(request.membership).toEqual(membership);
  });

  it("rejects a membership without an allowed role", async () => {
    const request: WorkspaceRequest = {
      auth: {
        expiresAt: new Date("2026-09-12T00:00:00.000Z"),
        sessionId: "session-id",
        user: { email: "ana@nexoflux.test", id: "user-id", name: "Ana" },
      },
      headers: {},
      params: { workspaceId: WORKSPACE_ID },
    };
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(["OWNER", "ADMIN"]),
    } as unknown as Reflector;
    const repository = {
      findMembership: vi.fn().mockResolvedValue({
        role: "VIEWER",
        userId: "user-id",
        workspaceId: WORKSPACE_ID,
      }),
    } as unknown as WorkspaceRepository;
    const guard = new WorkspaceRolesGuard(reflector, repository);

    await expect(
      guard.canActivate(createContext(request)),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
