import { Body, Controller, Get, HttpCode, Inject, Post } from "@nestjs/common";
import { loginRequestSchema, registerRequestSchema } from "@nexoflux/contracts";

import { Public } from "../common/public.decorator";
import { parseRequest } from "../common/request-validation";
import { AuthService } from "./auth.service";
import type { AuthContext } from "./auth.types";
import { CurrentAuth } from "./current-auth.decorator";

@Controller("auth")
export class AuthController {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}

  @Public()
  @Post("register")
  register(@Body() body: unknown) {
    return this.auth.register(parseRequest(registerRequestSchema, body));
  }

  @Public()
  @HttpCode(200)
  @Post("login")
  login(@Body() body: unknown) {
    return this.auth.login(parseRequest(loginRequestSchema, body));
  }

  @HttpCode(204)
  @Post("logout")
  async logout(@CurrentAuth() context: AuthContext): Promise<void> {
    await this.auth.logout(context.sessionId);
  }

  @Get("me")
  me(@CurrentAuth() context: AuthContext) {
    return {
      expiresAt: context.expiresAt.toISOString(),
      user: context.user,
    };
  }
}
