import { Inject, Injectable } from "@nestjs/common";
import type { PoolClient } from "pg";

import { DatabaseService } from "../database/database.service";
import type { AuthContext, AuthenticatedUser } from "./auth.types";

export type UserWithPassword = AuthenticatedUser & {
  passwordHash: string;
};

export type CreateSessionInput = {
  expiresAt: Date;
  id: string;
  tokenHash: string;
  userId: string;
};

export type CreateRegistrationInput = {
  auditEventId: string;
  passwordHash: string;
  session: CreateSessionInput;
  user: AuthenticatedUser;
  workspace: {
    id: string;
    name: string;
    slug: string;
  };
};

@Injectable()
export class AuthRepository {
  constructor(
    @Inject(DatabaseService) private readonly database: DatabaseService,
  ) {}

  async createRegistration(input: CreateRegistrationInput): Promise<void> {
    await this.database.transaction(async (client) => {
      await client.query(
        "insert into users (id, email, name, password_hash) values ($1, $2, $3, $4)",
        [input.user.id, input.user.email, input.user.name, input.passwordHash],
      );
      await client.query(
        "insert into workspaces (id, name, slug, created_by) values ($1, $2, $3, $4)",
        [
          input.workspace.id,
          input.workspace.name,
          input.workspace.slug,
          input.user.id,
        ],
      );
      await client.query(
        "insert into workspace_members (workspace_id, user_id, role) values ($1, $2, 'OWNER')",
        [input.workspace.id, input.user.id],
      );
      await this.insertSession(client, input.session);
      await client.query(
        [
          "insert into audit_events",
          "(id, workspace_id, actor_user_id, action, target_type, target_id)",
          "values ($1, $2, $3, 'workspace.created', 'workspace', $2)",
        ].join(" "),
        [input.auditEventId, input.workspace.id, input.user.id],
      );
    });
  }

  async createSession(input: CreateSessionInput): Promise<void> {
    await this.database.transaction((client) =>
      this.insertSession(client, input),
    );
  }

  async findUserByEmail(email: string): Promise<UserWithPassword | null> {
    const result = await this.database.query<{
      email: string;
      id: string;
      name: string;
      password_hash: string;
    }>("select id, email, name, password_hash from users where email = $1", [
      email,
    ]);
    const row = result.rows[0];

    return row
      ? {
          email: row.email,
          id: row.id,
          name: row.name,
          passwordHash: row.password_hash,
        }
      : null;
  }

  async findActiveSessionByHash(
    tokenHash: string,
  ): Promise<AuthContext | null> {
    const result = await this.database.query<{
      email: string;
      expires_at: Date;
      name: string;
      session_id: string;
      user_id: string;
    }>(
      [
        "select s.id as session_id, s.expires_at,",
        "u.id as user_id, u.email, u.name",
        "from auth_sessions s",
        "join users u on u.id = s.user_id",
        "where s.token_hash = $1",
        "and s.revoked_at is null and s.expires_at > now()",
      ].join(" "),
      [tokenHash],
    );
    const row = result.rows[0];

    if (!row) {
      return null;
    }

    await this.database.query(
      "update auth_sessions set last_seen_at = now() where id = $1",
      [row.session_id],
    );

    return {
      expiresAt: row.expires_at,
      sessionId: row.session_id,
      user: {
        email: row.email,
        id: row.user_id,
        name: row.name,
      },
    };
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.database.query(
      "update auth_sessions set revoked_at = coalesce(revoked_at, now()) where id = $1",
      [sessionId],
    );
  }

  private async insertSession(
    client: PoolClient,
    input: CreateSessionInput,
  ): Promise<void> {
    await client.query(
      [
        "insert into auth_sessions",
        "(id, user_id, token_hash, expires_at)",
        "values ($1, $2, $3, $4)",
      ].join(" "),
      [input.id, input.userId, input.tokenHash, input.expiresAt],
    );
  }
}
