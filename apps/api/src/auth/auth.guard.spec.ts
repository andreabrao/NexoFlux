import { UnauthorizedException, type ExecutionContext } from "@nestjs/common";
import type { Reflector } from "@nestjs/core";
import { describe, expect, it, vi } from "vitest";

import type { AuthService } from "./auth.service";
import { AuthGuard } from "./auth.guard";
import type { AuthenticatedRequest } from "./auth.types";

function createContext(request: AuthenticatedRequest): ExecutionContext {
  return {
    getClass: vi.fn(),
    getHandler: vi.fn(),
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe("AuthGuard", () => {
  it("allows routes explicitly marked as public", async () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(true),
    } as unknown as Reflector;
    const auth = { authenticate: vi.fn() } as unknown as AuthService;
    const guard = new AuthGuard(reflector, auth);

    await expect(
      guard.canActivate(createContext({ headers: {} })),
    ).resolves.toBe(true);
    expect(auth.authenticate).not.toHaveBeenCalled();
  });

  it("attaches a valid bearer session to the request", async () => {
    const request: AuthenticatedRequest = {
      headers: { authorization: "Bearer session-token" },
    };
    const context = {
      expiresAt: new Date("2026-09-12T00:00:00.000Z"),
      sessionId: "session-id",
      user: { email: "ana@nexoflux.test", id: "user-id", name: "Ana" },
    };
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(false),
    } as unknown as Reflector;
    const auth = {
      authenticate: vi.fn().mockResolvedValue(context),
    } as unknown as AuthService;
    const guard = new AuthGuard(reflector, auth);

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);
    expect(request.auth).toEqual(context);
  });

  it("rejects missing bearer credentials", async () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(false),
    } as unknown as Reflector;
    const auth = { authenticate: vi.fn() } as unknown as AuthService;
    const guard = new AuthGuard(reflector, auth);

    await expect(
      guard.canActivate(createContext({ headers: {} })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
