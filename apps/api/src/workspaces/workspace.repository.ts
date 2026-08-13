import { Inject, Injectable } from "@nestjs/common";
import type { WorkspaceRole } from "@nexoflux/contracts";
import type { PoolClient } from "pg";

import { DatabaseService } from "../database/database.service";
import type {
  WorkspaceMember,
  WorkspaceMembership,
  WorkspaceSummary,
} from "./workspace.types";

export type CreateWorkspaceInput = {
  auditEventId: string;
  id: string;
  name: string;
  ownerId: string;
  slug: string;
};

export type MemberMutationInput = {
  actorUserId: string;
  auditEventId: string;
  role: WorkspaceRole;
  userId: string;
  workspaceId: string;
};

export type MemberMutationResult = "updated" | "not_found" | "last_owner";

export type RemoveMemberInput = {
  actorRole: WorkspaceRole;
  actorUserId: string;
  auditEventId: string;
  userId: string;
  workspaceId: string;
};

export type RemoveMemberResult =
  "removed" | "not_found" | "last_owner" | "owner_requires_owner";

@Injectable()
export class WorkspaceRepository {
  constructor(
    @Inject(DatabaseService) private readonly database: DatabaseService,
  ) {}

  async create(input: CreateWorkspaceInput): Promise<void> {
    await this.database.transaction(async (client) => {
      await client.query(
        "insert into workspaces (id, name, slug, created_by) values ($1, $2, $3, $4)",
        [input.id, input.name, input.slug, input.ownerId],
      );
      await client.query(
        "insert into workspace_members (workspace_id, user_id, role) values ($1, $2, 'OWNER')",
        [input.id, input.ownerId],
      );
      await this.insertAudit(client, {
        action: "workspace.created",
        actorUserId: input.ownerId,
        auditEventId: input.auditEventId,
        metadata: {},
        targetId: input.id,
        targetType: "workspace",
        workspaceId: input.id,
      });
    });
  }

  async listForUser(userId: string): Promise<WorkspaceSummary[]> {
    const result = await this.database.query<{
      created_at: Date;
      id: string;
      name: string;
      role: WorkspaceRole;
      slug: string;
    }>(
      [
        "select w.id, w.name, w.slug, w.created_at, wm.role",
        "from workspaces w",
        "join workspace_members wm on wm.workspace_id = w.id",
        "where wm.user_id = $1 order by w.created_at asc",
      ].join(" "),
      [userId],
    );

    return result.rows.map((row) => ({
      createdAt: row.created_at,
      id: row.id,
      name: row.name,
      role: row.role,
      slug: row.slug,
    }));
  }

  async findForUser(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceSummary | null> {
    const result = await this.database.query<{
      created_at: Date;
      id: string;
      name: string;
      role: WorkspaceRole;
      slug: string;
    }>(
      [
        "select w.id, w.name, w.slug, w.created_at, wm.role",
        "from workspaces w",
        "join workspace_members wm on wm.workspace_id = w.id",
        "where w.id = $1 and wm.user_id = $2",
      ].join(" "),
      [workspaceId, userId],
    );
    const row = result.rows[0];

    return row
      ? {
          createdAt: row.created_at,
          id: row.id,
          name: row.name,
          role: row.role,
          slug: row.slug,
        }
      : null;
  }

  async findMembership(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceMembership | null> {
    const result = await this.database.query<{
      role: WorkspaceRole;
      user_id: string;
      workspace_id: string;
    }>(
      [
        "select workspace_id, user_id, role from workspace_members",
        "where workspace_id = $1 and user_id = $2",
      ].join(" "),
      [workspaceId, userId],
    );
    const row = result.rows[0];

    return row
      ? {
          role: row.role,
          userId: row.user_id,
          workspaceId: row.workspace_id,
        }
      : null;
  }

  async listMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    const result = await this.database.query<{
      created_at: Date;
      email: string;
      name: string;
      role: WorkspaceRole;
      user_id: string;
    }>(
      [
        "select wm.user_id, wm.role, wm.created_at, u.email, u.name",
        "from workspace_members wm join users u on u.id = wm.user_id",
        "where wm.workspace_id = $1",
        "order by case wm.role when 'OWNER' then 1 when 'ADMIN' then 2",
        "when 'OPERATOR' then 3 else 4 end, u.name asc",
      ].join(" "),
      [workspaceId],
    );

    return result.rows.map((row) => ({
      createdAt: row.created_at,
      email: row.email,
      name: row.name,
      role: row.role,
      userId: row.user_id,
    }));
  }

  async findUserIdByEmail(email: string): Promise<string | null> {
    const result = await this.database.query<{ id: string }>(
      "select id from users where email = $1",
      [email],
    );

    return result.rows[0]?.id ?? null;
  }

  async addMember(input: MemberMutationInput): Promise<void> {
    await this.database.transaction(async (client) => {
      await client.query(
        [
          "insert into workspace_members",
          "(workspace_id, user_id, role, invited_by)",
          "values ($1, $2, $3, $4)",
        ].join(" "),
        [input.workspaceId, input.userId, input.role, input.actorUserId],
      );
      await this.insertAudit(client, {
        action: "workspace.member_added",
        actorUserId: input.actorUserId,
        auditEventId: input.auditEventId,
        metadata: { role: input.role },
        targetId: input.userId,
        targetType: "user",
        workspaceId: input.workspaceId,
      });
    });
  }

  async updateMemberRole(
    input: MemberMutationInput,
  ): Promise<MemberMutationResult> {
    return this.database.transaction(async (client) => {
      const target = await this.lockMember(
        client,
        input.workspaceId,
        input.userId,
      );
      if (!target) {
        return "not_found";
      }

      if (
        target.role === "OWNER" &&
        input.role !== "OWNER" &&
        (await this.countOwnersWithLock(client, input.workspaceId)) === 1
      ) {
        return "last_owner";
      }

      await client.query(
        [
          "update workspace_members set role = $3, updated_at = now()",
          "where workspace_id = $1 and user_id = $2",
        ].join(" "),
        [input.workspaceId, input.userId, input.role],
      );
      await this.insertAudit(client, {
        action: "workspace.member_role_changed",
        actorUserId: input.actorUserId,
        auditEventId: input.auditEventId,
        metadata: { from: target.role, to: input.role },
        targetId: input.userId,
        targetType: "user",
        workspaceId: input.workspaceId,
      });
      return "updated";
    });
  }

  async removeMember(input: RemoveMemberInput): Promise<RemoveMemberResult> {
    return this.database.transaction(async (client) => {
      const target = await this.lockMember(
        client,
        input.workspaceId,
        input.userId,
      );
      if (!target) {
        return "not_found";
      }
      if (target.role === "OWNER" && input.actorRole !== "OWNER") {
        return "owner_requires_owner";
      }
      if (
        target.role === "OWNER" &&
        (await this.countOwnersWithLock(client, input.workspaceId)) === 1
      ) {
        return "last_owner";
      }

      await client.query(
        "delete from workspace_members where workspace_id = $1 and user_id = $2",
        [input.workspaceId, input.userId],
      );
      await this.insertAudit(client, {
        action: "workspace.member_removed",
        actorUserId: input.actorUserId,
        auditEventId: input.auditEventId,
        metadata: { role: target.role },
        targetId: input.userId,
        targetType: "user",
        workspaceId: input.workspaceId,
      });
      return "removed";
    });
  }

  private async lockMember(
    client: PoolClient,
    workspaceId: string,
    userId: string,
  ): Promise<{ role: WorkspaceRole } | null> {
    const result = await client.query<{ role: WorkspaceRole }>(
      [
        "select role from workspace_members",
        "where workspace_id = $1 and user_id = $2 for update",
      ].join(" "),
      [workspaceId, userId],
    );

    return result.rows[0] ?? null;
  }

  private async countOwnersWithLock(
    client: PoolClient,
    workspaceId: string,
  ): Promise<number> {
    const result = await client.query(
      [
        "select user_id from workspace_members",
        "where workspace_id = $1 and role = 'OWNER' for update",
      ].join(" "),
      [workspaceId],
    );

    return result.rowCount ?? 0;
  }

  private async insertAudit(
    client: PoolClient,
    input: {
      action: string;
      actorUserId: string;
      auditEventId: string;
      metadata: Record<string, unknown>;
      targetId: string;
      targetType: string;
      workspaceId: string;
    },
  ): Promise<void> {
    await client.query(
      [
        "insert into audit_events",
        "(id, workspace_id, actor_user_id, action, target_type, target_id, metadata)",
        "values ($1, $2, $3, $4, $5, $6, $7::jsonb)",
      ].join(" "),
      [
        input.auditEventId,
        input.workspaceId,
        input.actorUserId,
        input.action,
        input.targetType,
        input.targetId,
        JSON.stringify(input.metadata),
      ],
    );
  }
}
