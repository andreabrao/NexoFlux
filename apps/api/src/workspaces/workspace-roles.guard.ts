import type { CanActivate, ExecutionContext } from "@nestjs/common";
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { WorkspaceRole } from "@nexoflux/contracts";
import { z } from "zod";

import type { WorkspaceRequest } from "./current-membership.decorator";
import { WorkspaceRepository } from "./workspace.repository";
import { WORKSPACE_ROLES_KEY } from "./workspace-roles.decorator";

@Injectable()
export class WorkspaceRolesGuard implements CanActivate {
  constructor(
    @Inject(Reflector) private readonly reflector: Reflector,
    @Inject(WorkspaceRepository)
    private readonly workspaces: WorkspaceRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const allowedRoles = this.reflector.getAllAndOverride<WorkspaceRole[]>(
      WORKSPACE_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!allowedRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<WorkspaceRequest>();
    const workspaceId = request.params.workspaceId;
    if (!workspaceId || !z.string().uuid().safeParse(workspaceId).success) {
      throw new BadRequestException("Identificador de workspace inválido.");
    }
    if (!request.auth) {
      throw new ForbiddenException("Contexto de autenticação ausente.");
    }

    const membership = await this.workspaces.findMembership(
      workspaceId,
      request.auth.user.id,
    );
    if (!membership || !allowedRoles.includes(membership.role)) {
      throw new ForbiddenException("Acesso insuficiente para este workspace.");
    }

    request.membership = membership;
    return true;
  }
}
