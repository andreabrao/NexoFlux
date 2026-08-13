import { z } from "zod";

export const workspaceRoleSchema = z.enum([
  "OWNER",
  "ADMIN",
  "OPERATOR",
  "VIEWER",
]);

export type WorkspaceRole = z.infer<typeof workspaceRoleSchema>;

export const emailSchema = z
  .string()
  .trim()
  .email("Informe um e-mail válido.")
  .max(320)
  .transform((email) => email.toLowerCase());

export const passwordSchema = z
  .string()
  .min(12, "A senha deve ter pelo menos 12 caracteres.")
  .max(128, "A senha deve ter no máximo 128 caracteres.");

export const personNameSchema = z.string().trim().min(2).max(120);
export const workspaceNameSchema = z.string().trim().min(2).max(120);

export const registerRequestSchema = z.object({
  email: emailSchema,
  name: personNameSchema,
  password: passwordSchema,
  workspaceName: workspaceNameSchema,
});

export type RegisterRequest = z.infer<typeof registerRequestSchema>;

export const loginRequestSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const createWorkspaceRequestSchema = z.object({
  name: workspaceNameSchema,
});

export type CreateWorkspaceRequest = z.infer<
  typeof createWorkspaceRequestSchema
>;

export const addWorkspaceMemberRequestSchema = z.object({
  email: emailSchema,
  role: workspaceRoleSchema.default("VIEWER"),
});

export type AddWorkspaceMemberRequest = z.infer<
  typeof addWorkspaceMemberRequestSchema
>;

export const updateWorkspaceMemberRequestSchema = z.object({
  role: workspaceRoleSchema,
});

export type UpdateWorkspaceMemberRequest = z.infer<
  typeof updateWorkspaceMemberRequestSchema
>;

export const taskTypeSchema = z.enum(["PUBLISH_POST", "SYNC_METRICS"]);

export type TaskType = z.infer<typeof taskTypeSchema>;

export const taskPayloadSchema = z.object({
  accountId: z.string().uuid(),
  id: z.string().uuid(),
  scheduledAt: z.iso.datetime(),
  type: taskTypeSchema,
  workspaceId: z.string().uuid(),
});

export type TaskPayload = z.infer<typeof taskPayloadSchema>;

export const TASK_QUEUE_NAME = "nexoflux.tasks";

export const dependencyStatusSchema = z.object({
  latencyMs: z.number().nonnegative(),
  status: z.enum(["up", "down"]),
});

export const readinessResponseSchema = z.object({
  dependencies: z.object({
    postgres: dependencyStatusSchema,
    redis: dependencyStatusSchema,
  }),
  service: z.string(),
  status: z.enum(["ok", "degraded"]),
  timestamp: z.iso.datetime(),
});

export type ReadinessResponse = z.infer<typeof readinessResponseSchema>;
