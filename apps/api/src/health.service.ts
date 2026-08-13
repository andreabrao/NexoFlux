import { Inject, Injectable } from "@nestjs/common";
import type { ReadinessResponse } from "@nexoflux/contracts";

import { InfrastructureService } from "./infrastructure.service";

@Injectable()
export class HealthService {
  constructor(
    @Inject(InfrastructureService)
    private readonly infrastructure: InfrastructureService,
  ) {}

  liveness() {
    return {
      service: "nexoflux-api",
      status: "ok" as const,
      timestamp: new Date().toISOString(),
    };
  }

  async readiness(): Promise<ReadinessResponse> {
    const [postgres, redis] = await Promise.all([
      this.infrastructure.checkPostgres(),
      this.infrastructure.checkRedis(),
    ]);

    return {
      dependencies: { postgres, redis },
      service: "nexoflux-api",
      status:
        postgres.status === "up" && redis.status === "up" ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
    };
  }
}
