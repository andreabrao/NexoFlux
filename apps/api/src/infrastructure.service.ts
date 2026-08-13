import { Inject, Injectable, type OnApplicationShutdown } from "@nestjs/common";
import Redis from "ioredis";

import { DatabaseService } from "./database/database.service";
import { environment } from "./environment";

export type DependencyCheck = {
  latencyMs: number;
  status: "up" | "down";
};

@Injectable()
export class InfrastructureService implements OnApplicationShutdown {
  private readonly redis = new Redis(environment.REDIS_URL, {
    connectTimeout: 1_500,
    enableOfflineQueue: false,
    lazyConnect: true,
    maxRetriesPerRequest: 0,
  });

  constructor(
    @Inject(DatabaseService) private readonly database: DatabaseService,
  ) {}

  async checkPostgres(): Promise<DependencyCheck> {
    return this.measure(async () => {
      await this.database.checkConnection();
    });
  }

  async checkRedis(): Promise<DependencyCheck> {
    return this.measure(async () => {
      if (this.redis.status === "wait") {
        await this.redis.connect();
      }

      await this.redis.ping();
    });
  }

  async onApplicationShutdown(): Promise<void> {
    await this.redis.quit();
  }

  private async measure(action: () => Promise<void>): Promise<DependencyCheck> {
    const startedAt = performance.now();

    try {
      await action();
      return {
        latencyMs: Math.round(performance.now() - startedAt),
        status: "up",
      };
    } catch {
      return {
        latencyMs: Math.round(performance.now() - startedAt),
        status: "down",
      };
    }
  }
}
