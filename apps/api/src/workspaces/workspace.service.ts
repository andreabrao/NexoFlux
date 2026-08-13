import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type {
  AddWorkspaceMemberRequest,
  CreateWorkspaceRequest,
  UpdateWorkspaceMemberRequest,
  WorkspaceRole,
} from "@nexoflux/contracts";
import { randomBytes, randomUUID } from "node:crypto";

import { WorkspaceRepository } from "./workspace.repository";

@Injectable()
export class WorkspaceService {
  constructor(
    @Inject(WorkspaceRepository)
    private readonly repository: WorkspaceRepository,
  ) {}

  async create(input: CreateWorkspaceRequest, ownerId: string) {
    const workspace = {
      id: randomUUID(),
      name: input.name,
      role: "OWNER" as const,
      slug: this.createSlug(input.name),
    };

    await this.repository.create({
      auditEventId: randomUUID(),
      id: workspace.id,
      name: workspace.name,
      ownerId,
      slug: workspace.slug,
    });

    return workspace;
  }

  list(userId: string) {
    return this.repository.listForUser(userId);
  }

  async get(workspaceId: string, userId: string) {
    const workspace = await this.repository.findForUser(workspaceId, userId);
    if (!workspace) {
      throw new NotFoundException("Workspace não encontrado.");
    }

    return workspace;
  }

  listMembers(workspaceId: string) {
    return this.repository.listMembers(workspaceId);
  }

  async addMember(
    workspaceId: string,
    input: AddWorkspaceMemberRequest,
    actorUserId: string,
    actorRole: WorkspaceRole,
  ) {
    if (input.role === "OWNER" && actorRole !== "OWNER") {
      throw new ForbiddenException(
        "Somente Owners podem adicionar outro Owner.",
      );
    }

    const userId = await this.repository.findUserIdByEmail(input.email);
    if (!userId) {
      throw new NotFoundException(
        "O usuário precisa possuir uma conta antes de entrar no workspace.",
      );
    }

    try {
      await this.repository.addMember({
        actorUserId,
        auditEventId: randomUUID(),
        role: input.role,
        userId,
        workspaceId,
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException("Este usuário já participa do workspace.");
      }

      throw error;
    }

    return { role: input.role, userId, workspaceId };
  }

  async updateMemberRole(
    workspaceId: string,
    userId: string,
    input: UpdateWorkspaceMemberRequest,
    actorUserId: string,
  ) {
    const result = await this.repository.updateMemberRole({
      actorUserId,
      auditEventId: randomUUID(),
      role: input.role,
      userId,
      workspaceId,
    });

    if (result === "not_found") {
      throw new NotFoundException("Membro não encontrado.");
    }
    if (result === "last_owner") {
      throw new ConflictException(
        "O workspace precisa manter pelo menos um Owner.",
      );
    }

    return { role: input.role, userId, workspaceId };
  }

  async removeMember(
    workspaceId: string,
    userId: string,
    actorUserId: string,
    actorRole: WorkspaceRole,
  ): Promise<void> {
    const result = await this.repository.removeMember({
      actorRole,
      actorUserId,
      auditEventId: randomUUID(),
      userId,
      workspaceId,
    });

    if (result === "not_found") {
      throw new NotFoundException("Membro não encontrado.");
    }
    if (result === "last_owner") {
      throw new ConflictException(
        "O workspace precisa manter pelo menos um Owner.",
      );
    }
    if (result === "owner_requires_owner") {
      throw new ForbiddenException("Somente Owners podem remover outro Owner.");
    }
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
