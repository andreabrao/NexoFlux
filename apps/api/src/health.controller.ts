import { Controller, Get, Inject } from "@nestjs/common";

import { Public } from "./common/public.decorator";
import { HealthService } from "./health.service";

@Public()
@Controller("health")
export class HealthController {
  constructor(@Inject(HealthService) private readonly health: HealthService) {}

  @Get("live")
  liveness() {
    return this.health.liveness();
  }

  @Get("ready")
  readiness() {
    return this.health.readiness();
  }
}
