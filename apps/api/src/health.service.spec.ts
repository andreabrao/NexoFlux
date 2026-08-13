import { describe, expect, it, vi } from "vitest";

import { HealthService } from "./health.service";
import type { InfrastructureService } from "./infrastructure.service";

describe("HealthService", () => {
  it("reports degraded readiness when one dependency is unavailable", async () => {
    const infrastructure = {
      checkPostgres: vi.fn().mockResolvedValue({ latencyMs: 4, status: "up" }),
      checkRedis: vi.fn().mockResolvedValue({ latencyMs: 7, status: "down" }),
    } as unknown as InfrastructureService;
    const service = new HealthService(infrastructure);

    const result = await service.readiness();

    expect(result.status).toBe("degraded");
    expect(result.dependencies.redis.status).toBe("down");
  });
});
