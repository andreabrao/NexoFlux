import { taskPayloadSchema, type TaskPayload } from "@nexoflux/contracts";

export type TaskResult = {
  id: string;
  status: "accepted";
  workspaceId: string;
};

export async function processTask(payload: unknown): Promise<TaskResult> {
  const task: TaskPayload = taskPayloadSchema.parse(payload);

  // Os adaptadores externos serão adicionados atrás de feature flags.
  return {
    id: task.id,
    status: "accepted",
    workspaceId: task.workspaceId,
  };
}
