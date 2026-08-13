import { Module } from "@nestjs/common";

import { WorkspaceController } from "./workspace.controller";
import { WorkspaceRepository } from "./workspace.repository";
import { WorkspaceService } from "./workspace.service";

@Module({
  controllers: [WorkspaceController],
  exports: [WorkspaceRepository],
  providers: [WorkspaceRepository, WorkspaceService],
})
export class WorkspaceModule {}
