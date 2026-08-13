import { createParamDecorator, type ExecutionContext } from "@nestjs/common";

import type { AuthenticatedRequest } from "../auth/auth.types";
import type { WorkspaceMembership } from "./workspace.types";

export type WorkspaceRequest = AuthenticatedRequest & {
  membership?: WorkspaceMembership;
  params: Record<string, string | undefined>;
};

export const CurrentMembership = createParamDecorator(
  (_data: unknown, context: ExecutionContext): WorkspaceMembership => {
    const request = context.switchToHttp().getRequest<WorkspaceRequest>();

    if (!request.membership) {
      throw new Error("Contexto do workspace ausente.");
    }

    return request.membership;
  },
);
