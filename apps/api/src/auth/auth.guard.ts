import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { IS_PUBLIC_KEY } from "../common/public.decorator";
import { AuthService } from "./auth.service";
import type { AuthenticatedRequest } from "./auth.types";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(Reflector) private readonly reflector: Reflector,
    @Inject(AuthService) private readonly auth: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = request.headers.authorization;
    const authorization = Array.isArray(header) ? header[0] : header;
    const [scheme, accessToken] = authorization?.split(" ") ?? [];

    if (scheme?.toLowerCase() !== "bearer" || !accessToken) {
      throw new UnauthorizedException("Token de acesso ausente.");
    }

    const authContext = await this.auth.authenticate(accessToken);
    if (!authContext) {
      throw new UnauthorizedException("Token de acesso inválido ou expirado.");
    }

    request.auth = authContext;
    return true;
  }
}
