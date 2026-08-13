import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";

import type { AuthRepository } from "./auth.repository";
import { AuthService } from "./auth.service";
import type { PasswordHasher } from "./password-hasher";
import type { SessionTokenService } from "./session-token.service";

function createService(overrides?: {
  repository?: Partial<AuthRepository>;
  passwordValid?: boolean;
}) {
  const repository = {
    createRegistration: vi.fn().mockResolvedValue(undefined),
    createSession: vi.fn().mockResolvedValue(undefined),
    findUserByEmail: vi.fn().mockResolvedValue({
      email: "ana@nexoflux.test",
      id: "80c990c8-da68-4474-a085-373277881c86",
      name: "Ana",
      passwordHash: "stored-hash",
    }),
    ...overrides?.repository,
  } as unknown as AuthRepository;
  const passwords = {
    hash: vi.fn().mockResolvedValue("stored-hash"),
    verify: vi.fn().mockResolvedValue(overrides?.passwordValid ?? true),
  } as unknown as PasswordHasher;
  const tokens = {
    hash: vi.fn().mockReturnValue("token-hash"),
    issue: vi.fn().mockReturnValue({
      hash: "token-hash",
      plainText: "plain-session-token",
    }),
  } as unknown as SessionTokenService;

  return {
    repository,
    service: new AuthService(repository, passwords, tokens),
  };
}

describe("AuthService", () => {
  it("registers user, owner workspace and session atomically", async () => {
    const { repository, service } = createService();

    const result = await service.register({
      email: "ana@nexoflux.test",
      name: "Ana",
      password: "uma-senha-segura-123",
      workspaceName: "Operação Ana",
    });

    expect(repository.createRegistration).toHaveBeenCalledOnce();
    expect(repository.createRegistration).toHaveBeenCalledWith(
      expect.objectContaining({
        passwordHash: "stored-hash",
        user: expect.objectContaining({ email: "ana@nexoflux.test" }),
        workspace: expect.objectContaining({ name: "Operação Ana" }),
      }),
    );
    expect(result.accessToken).toBe("plain-session-token");
    expect(result.workspace.role).toBe("OWNER");
    expect(result.workspace.slug).toMatch(/^operacao-ana-[a-f0-9]{6}$/);
  });

  it("maps unique e-mail conflicts to an explicit domain response", async () => {
    const { service } = createService({
      repository: {
        createRegistration: vi.fn().mockRejectedValue({ code: "23505" }),
      },
    });

    await expect(
      service.register({
        email: "ana@nexoflux.test",
        name: "Ana",
        password: "uma-senha-segura-123",
        workspaceName: "Operação Ana",
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("does not reveal whether the e-mail or password was invalid", async () => {
    const { service } = createService({ passwordValid: false });

    await expect(
      service.login({
        email: "ana@nexoflux.test",
        password: "senha-errada",
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
