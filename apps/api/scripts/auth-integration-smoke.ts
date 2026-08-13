import "dotenv/config";

import { randomBytes } from "node:crypto";

import { Pool } from "pg";

import { environment } from "../src/environment";

type RegistrationResponse = {
  accessToken: string;
  user: { id: string };
  workspace: { id: string };
};

type MemberResponse = {
  role: string;
  userId: string;
};

type SmokeSummary = {
  checks: number;
  workspaceId: string;
};

const defaultBaseUrl = process.env.API_URL ?? "http://127.0.0.1:3333/api/v1";

async function apiRequest<ResponseBody>(input: {
  body?: unknown;
  expectedStatus: number;
  method?: string;
  path: string;
  token?: string;
}): Promise<ResponseBody> {
  const headers = new Headers();
  if (input.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (input.token) {
    headers.set("Authorization", "Bearer " + input.token);
  }

  const response = await fetch(defaultBaseUrl + input.path, {
    body: input.body === undefined ? undefined : JSON.stringify(input.body),
    headers,
    method: input.method ?? "GET",
  });
  const text = await response.text();

  if (response.status !== input.expectedStatus) {
    throw new Error(
      input.method +
        " " +
        input.path +
        " retornou " +
        response.status +
        ", esperado " +
        input.expectedStatus +
        ". Corpo: " +
        text,
    );
  }

  return (text ? JSON.parse(text) : undefined) as ResponseBody;
}

async function register(
  suffix: string,
  label: string,
): Promise<RegistrationResponse> {
  return apiRequest<RegistrationResponse>({
    body: {
      email: label.toLowerCase() + "." + suffix + "@smoke.nexoflux.test",
      name: "Smoke " + label,
      password: "NexoFlux-smoke-2026!",
      workspaceName: "Smoke " + label + " " + suffix,
    },
    expectedStatus: 201,
    method: "POST",
    path: "/auth/register",
  });
}

async function cleanup(
  userIds: string[],
  workspaceIds: string[],
): Promise<void> {
  if (userIds.length === 0 && workspaceIds.length === 0) {
    return;
  }

  const pool = new Pool({ connectionString: environment.DATABASE_URL });
  const client = await pool.connect();

  try {
    await client.query("begin");
    await client.query(
      [
        "delete from audit_events",
        "where actor_user_id = any($1::uuid[])",
        "or workspace_id = any($2::uuid[])",
      ].join(" "),
      [userIds, workspaceIds],
    );
    await client.query("delete from workspaces where id = any($1::uuid[])", [
      workspaceIds,
    ]);
    await client.query("delete from users where id = any($1::uuid[])", [
      userIds,
    ]);
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

export async function runAuthIntegrationSmoke(): Promise<SmokeSummary> {
  const target = new URL(defaultBaseUrl);
  if (
    !["127.0.0.1", "localhost", "::1"].includes(target.hostname) &&
    process.env.ALLOW_REMOTE_INTEGRATION_SMOKE !== "true"
  ) {
    throw new Error(
      "O smoke test só executa contra localhost. Defina ALLOW_REMOTE_INTEGRATION_SMOKE=true para liberar outro host conscientemente.",
    );
  }

  const suffix = Date.now() + "-" + randomBytes(3).toString("hex");
  const createdUserIds: string[] = [];
  const createdWorkspaceIds: string[] = [];
  let checks = 0;
  let primaryWorkspaceId: string;

  try {
    const registerTracked = async (label: string) => {
      const result = await register(suffix, label);
      createdUserIds.push(result.user.id);
      createdWorkspaceIds.push(result.workspace.id);
      checks += 1;
      return result;
    };
    const owner = await registerTracked("Owner");
    const admin = await registerTracked("Admin");
    const viewer = await registerTracked("Viewer");
    const outsider = await registerTracked("Outsider");
    primaryWorkspaceId = owner.workspace.id;

    await apiRequest({
      expectedStatus: 200,
      path: "/auth/me",
      token: owner.accessToken,
    });
    checks += 1;

    await apiRequest<MemberResponse>({
      body: {
        email: "admin." + suffix + "@smoke.nexoflux.test",
        role: "ADMIN",
      },
      expectedStatus: 201,
      method: "POST",
      path: "/workspaces/" + primaryWorkspaceId + "/members",
      token: owner.accessToken,
    });
    await apiRequest<MemberResponse>({
      body: {
        email: "viewer." + suffix + "@smoke.nexoflux.test",
        role: "VIEWER",
      },
      expectedStatus: 201,
      method: "POST",
      path: "/workspaces/" + primaryWorkspaceId + "/members",
      token: owner.accessToken,
    });
    checks += 2;

    const members = await apiRequest<MemberResponse[]>({
      expectedStatus: 200,
      path: "/workspaces/" + primaryWorkspaceId + "/members",
      token: admin.accessToken,
    });
    if (members.length !== 3) {
      throw new Error("A lista deveria conter exatamente três membros.");
    }
    checks += 1;

    await apiRequest({
      expectedStatus: 403,
      path: "/workspaces/" + primaryWorkspaceId,
      token: outsider.accessToken,
    });
    await apiRequest({
      body: {
        email: "viewer." + suffix + "@smoke.nexoflux.test",
        role: "OWNER",
      },
      expectedStatus: 403,
      method: "POST",
      path: "/workspaces/" + primaryWorkspaceId + "/members",
      token: admin.accessToken,
    });
    await apiRequest({
      body: { role: "OPERATOR" },
      expectedStatus: 403,
      method: "PATCH",
      path: "/workspaces/" + primaryWorkspaceId + "/members/" + viewer.user.id,
      token: admin.accessToken,
    });
    checks += 3;

    await apiRequest<MemberResponse>({
      body: { role: "OWNER" },
      expectedStatus: 200,
      method: "PATCH",
      path: "/workspaces/" + primaryWorkspaceId + "/members/" + admin.user.id,
      token: owner.accessToken,
    });
    checks += 1;

    await apiRequest({
      expectedStatus: 204,
      method: "DELETE",
      path: "/workspaces/" + primaryWorkspaceId + "/members/" + owner.user.id,
      token: owner.accessToken,
    });
    await apiRequest({
      expectedStatus: 403,
      path: "/workspaces/" + primaryWorkspaceId,
      token: owner.accessToken,
    });
    await apiRequest({
      expectedStatus: 409,
      method: "DELETE",
      path: "/workspaces/" + primaryWorkspaceId + "/members/" + admin.user.id,
      token: admin.accessToken,
    });
    checks += 3;

    await apiRequest({
      expectedStatus: 204,
      method: "POST",
      path: "/auth/logout",
      token: admin.accessToken,
    });
    await apiRequest({
      expectedStatus: 401,
      path: "/auth/me",
      token: admin.accessToken,
    });
    checks += 2;

    return { checks, workspaceId: primaryWorkspaceId };
  } finally {
    if (process.env.SMOKE_KEEP_DATA !== "true") {
      await cleanup(createdUserIds, createdWorkspaceIds);
    }
  }
}

if (require.main === module) {
  void runAuthIntegrationSmoke()
    .then((summary) => {
      console.info(
        "Smoke de autenticação aprovado com " +
          summary.checks +
          " verificações.",
      );
    })
    .catch((error: unknown) => {
      console.error(error);
      process.exitCode = 1;
    });
}
