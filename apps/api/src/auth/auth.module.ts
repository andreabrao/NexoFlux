import { Module } from "@nestjs/common";

import { AuthController } from "./auth.controller";
import { AuthRepository } from "./auth.repository";
import { AuthService } from "./auth.service";
import { PasswordHasher } from "./password-hasher";
import { SessionTokenService } from "./session-token.service";

@Module({
  controllers: [AuthController],
  exports: [AuthService],
  providers: [AuthRepository, AuthService, PasswordHasher, SessionTokenService],
})
export class AuthModule {}
