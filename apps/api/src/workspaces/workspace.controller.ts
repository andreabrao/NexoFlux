import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from "@nestjs/common";
import {
  addWorkspaceMemberRequestSchema,
  createWorkspaceRequestSchema,
  updateWorkspaceMemberRequestSchema,
} from "@nexoflux/contracts";

import type { AuthContext } from "../auth/auth.types";
import { CurrentAuth } from "../auth/current-auth.decorator";
import { parseRequest } from "../common/request-validation";
import { CurrentMembership } from "./current-membership.decorator";
import { WorkspaceRoles } from "./workspace-roles.decorator";
import { WorkspaceService } from "./workspace.service";
import type { WorkspaceMembership } from "./workspace.types";

const ALL_ROLES = ["OWNER", "ADMIN", "OPERATOR", "VIEWER"] as const;

@Controller("workspaces")
export class WorkspaceController {
  constructor(
    @Inject(WorkspaceService) private readonly workspaces: WorkspaceService,
  ) {}

  @Post()
  create(@Body() body: unknown, @CurrentAuth() auth: AuthContext) {
    return this.workspaces.create(
      parseRequest(createWorkspaceRequestSchema, body),
      auth.user.id,
    );
  }

  @Get()
  list(@CurrentAuth() auth: AuthContext) {
    return this.workspaces.list(auth.user.id);
  }

  @WorkspaceRoles(...ALL_ROLES)
  @Get(":workspaceId")
  get(
    @Param("workspaceId", new ParseUUIDPipe()) workspaceId: string,
    @CurrentAuth() auth: AuthContext,
  ) {
    return this.workspaces.get(workspaceId, auth.user.id);
  }

  @WorkspaceRoles(...ALL_ROLES)
  @Get(":workspaceId/members")
  listMembers(@Param("workspaceId", new ParseUUIDPipe()) workspaceId: string) {
    return this.workspaces.listMembers(workspaceId);
  }

  @WorkspaceRoles("OWNER", "ADMIN")
  @Post(":workspaceId/members")
  addMember(
    @Param("workspaceId", new ParseUUIDPipe()) workspaceId: string,
    @Body() body: unknown,
    @CurrentAuth() auth: AuthContext,
    @CurrentMembership() membership: WorkspaceMembership,
  ) {
    return this.workspaces.addMember(
      workspaceId,
      parseRequest(addWorkspaceMemberRequestSchema, body),
      auth.user.id,
      membership.role,
    );
  }

  @WorkspaceRoles("OWNER")
  @Patch(":workspaceId/members/:userId")
  updateMemberRole(
    @Param("workspaceId", new ParseUUIDPipe()) workspaceId: string,
    @Param("userId", new ParseUUIDPipe()) userId: string,
    @Body() body: unknown,
    @CurrentAuth() auth: AuthContext,
  ) {
    return this.workspaces.updateMemberRole(
      workspaceId,
      userId,
      parseRequest(updateWorkspaceMemberRequestSchema, body),
      auth.user.id,
    );
  }

  @WorkspaceRoles("OWNER", "ADMIN")
  @HttpCode(204)
  @Delete(":workspaceId/members/:userId")
  async removeMember(
    @Param("workspaceId", new ParseUUIDPipe()) workspaceId: string,
    @Param("userId", new ParseUUIDPipe()) userId: string,
    @CurrentAuth() auth: AuthContext,
    @CurrentMembership() membership: WorkspaceMembership,
  ): Promise<void> {
    await this.workspaces.removeMember(
      workspaceId,
      userId,
      auth.user.id,
      membership.role,
    );
  }
}
