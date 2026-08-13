import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { LoginRequest, RegisterRequest } from "@nexoflux/contracts";
import { randomBytes, randomUUID } from "node:crypto";

import { environment } from "../environment";
import { AuthRepository } from "./auth.repository";
import type { AuthContext, AuthenticatedUser } from "./auth.types";
import { PasswordHasher } from "./password-hasher";
import { SessionTokenService } from "./session-token.service";

export type AuthenticationResponse = {
  accessToken: string;
  expiresAt: string;
  user: AuthenticatedUser;
};

export type RegistrationResponse = AuthenticationResponse & {
  workspace: {
    id: string;
    name: string;
    role: "OWNER";
    slug: string;
  };
};

@Injectable()
export class AuthService {
  constructor(
    @Inject(AuthRepository) private readonly repository: AuthRepository,
    @Inject(PasswordHasher) private readonly passwords: PasswordHasher,
    @Inject(SessionTokenService)
    private readonly sessionTokens: SessionTokenService,
  ) {}

  async register(input: RegisterRequest): Promise<RegistrationResponse> {
    const user: AuthenticatedUser = {
      email: input.email,
      id: randomUUID(),
      name: input.name,
    };
    const workspace = {
      id: randomUUID(),
      name: input.workspaceName,
      slug: this.createSlug(input.workspaceName),
    };
    const token = this.sessionTokens.issue();
    const expiresAt = this.createSessionExpiry();

    try {
      await this.repository.createRegistration({
        auditEventId: randomUUID(),
        passwordHash: await this.passwords.hash(input.password),
        session: {
          expiresAt,
          id: randomUUID(),
          tokenHash: token.hash,
          userId: user.id,
        },
        user,
        workspace,
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException("Já existe uma conta com este e-mail.");
      }

      throw error;
    }

    return {
      accessToken: token.plainText,
      expiresAt: expiresAt.toISOString(),
      user,
      workspace: { ...workspace, role: "OWNER" },
    };
  }

  async login(input: LoginRequest): Promise<AuthenticationResponse> {
    const user = await this.repository.findUserByEmail(input.email);

    if (
      !user ||
      !(await this.passwords.verify(input.password, user.passwordHash))
    ) {
      throw new UnauthorizedException("E-mail ou senha inválidos.");
    }

    const token = this.sessionTokens.issue();
    const expiresAt = this.createSessionExpiry();
    await this.repository.createSession({
      expiresAt,
      id: randomUUID(),
      tokenHash: token.hash,
      userId: user.id,
    });

    return {
      accessToken: token.plainText,
      expiresAt: expiresAt.toISOString(),
      user: { email: user.email, id: user.id, name: user.name },
    };
  }

  authenticate(accessToken: string): Promise<AuthContext | null> {
    return this.repository.findActiveSessionByHash(
      this.sessionTokens.hash(accessToken),
    );
  }

  logout(sessionId: string): Promise<void> {
    return this.repository.revokeSession(sessionId);
  }

  private createSessionExpiry(): Date {
    return new Date(Date.now() + environment.SESSION_TTL_DAYS * 86_400_000);
  }

  private createSlug(name: string): string {
    const base =
      name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || "workspace";

    return base + "-" + randomBytes(3).toString("hex");
  }
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}
