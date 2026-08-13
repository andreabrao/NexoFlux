import { createParamDecorator, type ExecutionContext } from "@nestjs/common";

import type { AuthenticatedRequest, AuthContext } from "./auth.types";

export const CurrentAuth = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthContext => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.auth) {
      throw new Error("Contexto de autenticação ausente.");
    }

    return request.auth;
  },
);
