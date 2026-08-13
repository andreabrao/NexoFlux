import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";

import { AuthGuard } from "./auth/auth.guard";
import { AuthModule } from "./auth/auth.module";
import { DatabaseModule } from "./database/database.module";
import { HealthController } from "./health.controller";
import { HealthService } from "./health.service";
import { InfrastructureService } from "./infrastructure.service";
import { WorkspaceModule } from "./workspaces/workspace.module";
import { WorkspaceRolesGuard } from "./workspaces/workspace-roles.guard";

@Module({
  controllers: [HealthController],
  imports: [DatabaseModule, AuthModule, WorkspaceModule],
  providers: [
    HealthService,
    InfrastructureService,
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: WorkspaceRolesGuard },
  ],
})
export class AppModule {}
