import { describe, expect, it } from "vitest";

import {
  registerRequestSchema,
  taskPayloadSchema,
  workspaceRoleSchema,
} from "./index";

describe("shared contracts", () => {
  it("accepts the four roles from the project baseline", () => {
    expect(workspaceRoleSchema.options).toEqual([
      "OWNER",
      "ADMIN",
      "OPERATOR",
      "VIEWER",
    ]);
  });

  it("normalizes identity input and enforces the password baseline", () => {
    const result = registerRequestSchema.parse({
      email: "  ANA@NEXOFLUX.TEST ",
      name: "Ana",
      password: "uma-senha-segura-123",
      workspaceName: "Operação Ana",
    });

    expect(result.email).toBe("ana@nexoflux.test");
    expect(
      registerRequestSchema.safeParse({ ...result, password: "curta" }).success,
    ).toBe(false);
  });

  it("rejects a task without tenant isolation", () => {
    const result = taskPayloadSchema.safeParse({
      accountId: "61accc21-aad3-45cb-86c8-185178d35722",
      id: "95c4b1f1-ecaa-4b60-a308-d8e8dd3eb455",
      scheduledAt: "2026-08-13T15:00:00.000Z",
      type: "PUBLISH_POST",
    });

    expect(result.success).toBe(false);
  });
});
